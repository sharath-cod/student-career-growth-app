# Student Career Growth Tracker

Student Progress, Skills & Career Development Monitoring System. See ARCHITECTURE.md for the design.
Status: **Phase 2 complete** (auth + student profile with linked career dropdowns).

## Prerequisites
- Node.js 18 or newer
- MongoDB Community Server running locally (default port 27017), or a free MongoDB Atlas cluster URI

## Run it
```bash
# 1. Backend
cd backend
cp .env.example .env        # Windows: copy .env.example .env
# edit .env: set JWT_SECRET (long random string) and ADMIN_PASSWORD
npm install
npm run seed:admin          # creates the first admin from the ADMIN_* values
npm run dev                 # API on http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev                 # App on http://localhost:5173
```
Generate a JWT secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

## Deploy live
See DEPLOYMENT.md (Atlas + Render + Vercel, all free).

## Test Phase 1
- Student: open http://localhost:5173/register, create an account, you land on the student dashboard. Log out and log back in at /login.
- Admin: open http://localhost:5173/admin/login and use ADMIN_EMAIL / ADMIN_PASSWORD from backend/.env.
- Access control: while logged in as a student, visit /admin/dashboard (you are sent back to your own dashboard). Logging in as a student on /admin/login is refused by the API.
- API health: http://localhost:5000/api/health
