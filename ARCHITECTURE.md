# Student Career Growth Tracker: Architecture

## 1. Architecture
Browser (React SPA, Vite) -> REST/JSON over HTTP -> Express API -> MongoDB (Mongoose).
- Auth: JWT (Bearer header). Passwords hashed with bcrypt (bcryptjs, pure JS, no native build).
- Authorization is enforced in Express middleware (`protect`, then `authorize('admin')`); the React route guards only change what is shown.
- Student routes always resolve the student from the token (`req.user`), never from an id in the URL. Admin routes live under `/api/admin/*` behind `authorize('admin')`, including Excel/PDF export.
- Career readiness and gap analysis are rule-based (job role -> required skills table in `jobRoles`). No AI API is needed.

## 2. Technology stack (all free / open source)
React 18, Vite, React Router, Axios, Tailwind CSS 3, Recharts | Node.js, Express, Mongoose, express-validator, helmet, cors, express-rate-limit | MongoDB | jsonwebtoken, bcryptjs | SheetJS (xlsx) for Excel, PDFKit for PDF (Phases 9-10) | multer for certificate uploads (Phase 4).

## 3. Database schema (MongoDB collections)
- users: name, email (unique), password (hash, select:false), role [student|admin], studentId -> students, isActive, lastLoginAt, timestamps
- students: user -> users (unique), name, usn (unique), email, phone, department, semester, section, cgpa, previousCgpa, academicPerformance, backlogs, attendance, shortTermGoal, longTermGoal, targetIndustry, targetDomain, targetJobRole, profileCompleted, lastWeeklyUpdateAt
- skills: student -> students, name, category, domain, level, percentage, dateLearned, evidence, notes
- technologies: student, name, category, level, experienceMonths, projects[] (unique per student+name)
- certificates: student, name, organization, category, issueDate, expiryDate, credentialId, url, filePath, description (unique per student+name+organization)
- projects: student, name, description, domain, technologies[], githubUrl, liveUrl, role, startDate, endDate, status
- clubActivities: student, clubName, activityName, role, participationType, date, description, achievement
- weeklyProgress: student, weekNumber, date, cgpa, newSkills[], technologies[], skillSnapshot[{name, level, percentage}], projectsCompleted, certificatesCompleted, clubActivities, problemsFaced, learned, nextGoal, overallProgress, careerReadiness (unique per student+weekNumber; edits allowed, records never deleted)
- jobRoles: name, domain, requiredSkills[{name, category, recommendedLevel}], nextSteps[]

Indexes: users.email, students.usn, students.name, students.department, students.targetDomain, students.targetJobRole, (semester, department), plus student+week on weeklyProgress.

## 4. API architecture
Auth: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
Student (token-scoped): /api/students/profile, /api/skills, /api/technologies, /api/certificates, /api/projects, /api/activities, /api/progress, /api/career/gap
Admin only: GET /api/admin/dashboard, GET /api/admin/students, GET /api/admin/students/:id, PUT /api/admin/students/:id, GET /api/admin/students/:id/export/excel, GET /api/admin/students/:id/export/pdf
Errors: `{ success:false, message, errors:{field:msg} }`.

## 5. Folder structure
student-career-tracker/
  backend/ { config/, controllers/, middleware/, models/, routes/, services/, utils/, uploads/, server.js, .env.example }
  frontend/ { src/{components,pages,layouts,services,hooks,context,utils}, index.html, vite/tailwind config }
  ARCHITECTURE.md, README.md
