const Student = require('../models/Student');
const Skill = require('../models/Skill');
const Technology = require('../models/Technology');
const Certificate = require('../models/Certificate');
const Project = require('../models/Project');
const ClubActivity = require('../models/ClubActivity');
const WeeklyProgress = require('../models/WeeklyProgress');
const RequirementStatus = require('../models/RequirementStatus');
const JobRole = require('../models/JobRole');
const { computeRequirements, nextSteps } = require('./careerService');

// Loads everything about one student (raw data). Files are NOT loaded.
async function loadBundle(studentId) {
  const student = await Student.findById(studentId).lean();
  if (!student) return null;
  const q = { student: studentId };
  const [skills, technologies, certificates, projects, activities, progress, statuses, jobRole] = await Promise.all([
    Skill.find(q).sort({ percentage: -1 }).lean(),
    Technology.find(q).sort({ updatedAt: -1 }).lean(),
    Certificate.find(q).sort({ issueDate: -1 }).lean(),
    Project.find(q).sort({ updatedAt: -1 }).lean(),
    ClubActivity.find(q).sort({ date: -1 }).lean(),
    WeeklyProgress.find(q).sort({ weekNumber: 1 }).lean(),
    RequirementStatus.find({ ...q, jobRole: student.targetJobRole || '' }).lean(),
    student.targetJobRole ? JobRole.findOne({ name: student.targetJobRole }).lean() : null,
  ]);
  return { student, skills, technologies, certificates, projects, activities, progress, statuses, jobRole };
}

const requirementsOf = (b) =>
  computeRequirements({
    requiredSkills: (b.jobRole && b.jobRole.requiredSkills) || [],
    skills: b.skills,
    technologies: b.technologies,
    statuses: b.statuses,
  });

// Pure function: raw bundle -> everything the dashboard needs.
function buildDashboardData(b, now = new Date()) {
  const { student, skills, technologies, certificates, projects, activities, progress } = b;
  const reqs = requirementsOf(b);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const last = progress[progress.length - 1];
  const prev = progress[progress.length - 2];
  const current = last ? last.careerReadiness : reqs.readiness;
  const previous = prev ? prev.careerReadiness : null;

  const cgpaTrend = [];
  if (student.previousCgpa !== undefined && student.previousCgpa !== null) cgpaTrend.push({ label: 'Previous sem', cgpa: student.previousCgpa });
  progress.filter((p) => p.cgpa !== null && p.cgpa !== undefined).forEach((p) => cgpaTrend.push({ label: `Week ${p.weekNumber}`, cgpa: p.cgpa }));
  if (!progress.some((p) => p.cgpa !== null && p.cgpa !== undefined) && student.cgpa !== undefined) cgpaTrend.push({ label: 'Current', cgpa: student.cgpa });

  return {
    profile: student,
    readiness: reqs.readiness,
    requirements: reqs,
    nextSteps: nextSteps(reqs.items, 5),
    skills: skills.map((s) => ({ _id: s._id, name: s.name, level: s.level, percentage: s.percentage, updatedAt: s.updatedAt })),
    technologiesCount: technologies.length,
    certificates: {
      total: certificates.length,
      thisMonth: certificates.filter((c) => new Date(c.issueDate) >= monthStart).length,
    },
    projects: {
      total: projects.length,
      completed: projects.filter((p) => p.status === 'Completed').length,
      inProgress: projects.filter((p) => p.status === 'In Progress').length,
      planned: projects.filter((p) => p.status === 'Planned').length,
    },
    activities: { total: activities.length },
    weekly: {
      previous,
      current,
      growth: previous === null ? null : current - previous,
      previousWeek: prev ? prev.weekNumber : null,
      currentWeek: last ? last.weekNumber : null,
      nextWeekGoal: last ? last.nextGoal : '',
    },
    readinessTrend: progress.map((p) => ({ week: `Week ${p.weekNumber}`, careerReadiness: p.careerReadiness, overallProgress: p.overallProgress })),
    skillGrowth: progress.map((p) => ({ week: `Week ${p.weekNumber}`, avgSkill: p.avgSkill, skills: p.skillCount })),
    cgpaTrend,
    lastUpdate: student.lastWeeklyUpdateAt || null,
  };
}

// Readiness (and a few counts) for many students at once. Used by the admin table and dashboard.
async function loadBulkMetrics(students) {
  const ids = students.map((s) => s._id);
  const [skills, techs, statuses, roles, certAgg] = await Promise.all([
    Skill.find({ student: { $in: ids } }).select('student name percentage level').lean(),
    Technology.find({ student: { $in: ids } }).select('student name level').lean(),
    RequirementStatus.find({ student: { $in: ids } }).lean(),
    JobRole.find().lean(),
    Certificate.aggregate([{ $match: { student: { $in: ids } } }, { $group: { _id: '$student', n: { $sum: 1 } } }]),
  ]);
  const group = (arr) => arr.reduce((m, x) => m.set(String(x.student), [...(m.get(String(x.student)) || []), x]), new Map());
  const sk = group(skills);
  const tc = group(techs);
  const st = group(statuses);
  const roleMap = new Map(roles.map((r) => [r.name, r]));
  const certMap = new Map(certAgg.map((c) => [String(c._id), c.n]));

  const out = new Map();
  students.forEach((s) => {
    const id = String(s._id);
    const role = roleMap.get(s.targetJobRole);
    const reqs = computeRequirements({
      requiredSkills: role ? role.requiredSkills : [],
      skills: sk.get(id) || [],
      technologies: tc.get(id) || [],
      statuses: (st.get(id) || []).filter((x) => x.jobRole === s.targetJobRole),
    });
    out.set(id, { readiness: reqs.readiness, skills: (sk.get(id) || []).length, certificates: certMap.get(id) || 0 });
  });
  return out;
}

// Readiness right now (used when a week is saved).
async function currentReadiness(studentId) {
  const b = await loadBundle(studentId);
  const reqs = requirementsOf(b);
  const avg = b.skills.length ? Math.round(b.skills.reduce((a, s) => a + s.percentage, 0) / b.skills.length) : 0;
  return { readiness: reqs.readiness, avgSkill: avg, skills: b.skills };
}

module.exports = { loadBundle, requirementsOf, buildDashboardData, loadBulkMetrics, currentReadiness };
