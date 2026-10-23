const Student = require('../models/Student');
const User = require('../models/User');
const WeeklyProgress = require('../models/WeeklyProgress');
const Certificate = require('../models/Certificate');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { startOfWeek, daysAgo } = require('../utils/dates');
const { applyProfile } = require('../services/profileService');
const { loadBundle, buildDashboardData, loadBulkMetrics } = require('../services/dashboardService');
const { buildWorkbook } = require('../services/excelService');
const { buildPdf } = require('../services/pdfService');

const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const avg = (arr) => (arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100 : 0);
const num = (v) => (v === undefined || v === '' ? undefined : Number(v));

// GET /api/admin/dashboard
exports.dashboard = asyncHandler(async (req, res) => {
  const students = await Student.find().lean();
  const metrics = await loadBulkMetrics(students);
  const weekStart = startOfWeek();
  const total = students.length;
  const updatedThisWeek = students.filter((s) => s.lastWeeklyUpdateAt && new Date(s.lastWeeklyUpdateAt) >= weekStart).length;
  const active = students.filter((s) => s.lastWeeklyUpdateAt && new Date(s.lastWeeklyUpdateAt) >= daysAgo(30)).length;
  const readiness = students.map((s) => metrics.get(String(s._id)).readiness);

  const bySem = {};
  students.filter((s) => s.semester && s.cgpa !== undefined && s.cgpa !== null).forEach((s) => (bySem[s.semester] = [...(bySem[s.semester] || []), s.cgpa]));

  const buckets = [['0-25%', 0, 25], ['26-50%', 26, 50], ['51-75%', 51, 75], ['76-100%', 76, 100]];
  const [weekly, certs] = await Promise.all([
    WeeklyProgress.aggregate([
      { $group: { _id: '$weekNumber', students: { $sum: 1 }, avgSkill: { $avg: '$avgSkill' }, avgReadiness: { $avg: '$careerReadiness' }, avgProgress: { $avg: '$overallProgress' } } },
      { $sort: { _id: 1 } },
    ]),
    Certificate.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
  ]);
  const weeks = weekly.slice(-12).map((w) => ({
    week: `Week ${w._id}`, students: w.students, avgSkill: Math.round(w.avgSkill), avgReadiness: Math.round(w.avgReadiness), avgProgress: Math.round(w.avgProgress),
  }));

  res.json({
    success: true,
    cards: {
      totalStudents: total,
      activeStudents: active,
      averageCgpa: avg(students.filter((s) => s.cgpa !== undefined && s.cgpa !== null).map((s) => s.cgpa)),
      averageReadiness: Math.round(avg(readiness)),
      updatedThisWeek,
      missingWeeklyUpdate: total - updatedThisWeek,
    },
    cgpaBySemester: Object.keys(bySem).sort((a, b) => a - b).map((k) => ({ semester: `Sem ${k}`, cgpa: avg(bySem[k]), students: bySem[k].length })),
    readinessDistribution: buckets.map(([label, lo, hi]) => ({ range: label, students: readiness.filter((r) => r >= lo && r <= hi).length })),
    skillGrowth: weeks,
    certificationCount: certs.map((c) => ({ category: c._id, count: c.count })),
    weeklyParticipation: weeks.map((w) => ({ week: w.week, students: w.students })),
  });
});

// GET /api/admin/students?q=&department=&domain=&jobRole=&semester=&cgpaMin=&cgpaMax=&readinessMin=&readinessMax=&lastUpdate=&sort=&order=&page=&limit=
exports.listStudents = asyncHandler(async (req, res) => {
  const { q, department, domain, jobRole, semester, lastUpdate, sort = 'name', order = 'asc' } = req.query;
  const filter = {};
  if (q && q.trim()) {
    const rx = new RegExp(esc(q.trim()), 'i');
    filter.$or = [{ name: rx }, { usn: rx }, { targetDomain: rx }, { targetJobRole: rx }, { department: rx }];
    if (/^[1-8]$/.test(q.trim())) filter.$or.push({ semester: Number(q.trim()) });
  }
  if (department) filter.department = department;
  if (domain) filter.targetDomain = domain;
  if (jobRole) filter.targetJobRole = jobRole;
  if (semester) filter.semester = Number(semester);
  if (num(req.query.cgpaMin) !== undefined || num(req.query.cgpaMax) !== undefined) {
    filter.cgpa = {};
    if (num(req.query.cgpaMin) !== undefined) filter.cgpa.$gte = num(req.query.cgpaMin);
    if (num(req.query.cgpaMax) !== undefined) filter.cgpa.$lte = num(req.query.cgpaMax);
  }
  const ws = startOfWeek();
  if (lastUpdate === 'this_week') filter.lastWeeklyUpdateAt = { $gte: ws };
  if (lastUpdate === 'last_30_days') filter.lastWeeklyUpdateAt = { $gte: daysAgo(30) };
  if (lastUpdate === 'not_this_week') filter.$and = [{ $or: [{ lastWeeklyUpdateAt: { $lt: ws } }, { lastWeeklyUpdateAt: { $exists: false } }, { lastWeeklyUpdateAt: null }] }];
  if (lastUpdate === 'never') filter.$and = [{ $or: [{ lastWeeklyUpdateAt: { $exists: false } }, { lastWeeklyUpdateAt: null }] }];

  const students = await Student.find(filter).lean();
  const metrics = await loadBulkMetrics(students);
  const rMin = num(req.query.readinessMin);
  const rMax = num(req.query.readinessMax);

  let rows = students
    .map((s) => ({
      _id: s._id, name: s.name, usn: s.usn, department: s.department, semester: s.semester, cgpa: s.cgpa,
      domain: s.targetDomain, jobRole: s.targetJobRole, readiness: metrics.get(String(s._id)).readiness,
      lastUpdate: s.lastWeeklyUpdateAt || null, profileCompleted: s.profileCompleted,
    }))
    .filter((r) => (rMin === undefined || r.readiness >= rMin) && (rMax === undefined || r.readiness <= rMax));

  const dir = order === 'desc' ? -1 : 1;
  const keyMap = { name: 'name', usn: 'usn', cgpa: 'cgpa', readiness: 'readiness', lastUpdate: 'lastUpdate' };
  const k = keyMap[sort] || 'name';
  rows.sort((a, b) => {
    const x = a[k] === null || a[k] === undefined ? (typeof b[k] === 'string' ? '' : -1) : a[k];
    const y = b[k] === null || b[k] === undefined ? (typeof a[k] === 'string' ? '' : -1) : b[k];
    return (x > y ? 1 : x < y ? -1 : 0) * dir;
  });

  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const pages = Math.max(Math.ceil(rows.length / limit), 1);
  const page = Math.min(Math.max(parseInt(req.query.page, 10) || 1, 1), pages);
  res.json({ success: true, total: rows.length, page, pages, items: rows.slice((page - 1) * limit, page * limit) });
});

// GET /api/admin/students/:id
exports.getStudent = asyncHandler(async (req, res) => {
  const bundle = await loadBundle(req.params.id);
  if (!bundle) throw new AppError('Student not found.', 404);
  const { skills, technologies, certificates, projects, activities, progress } = bundle;
  res.json({ success: true, dashboard: buildDashboardData(bundle), lists: { skills, technologies, certificates, projects, activities, progress } });
});

// PUT /api/admin/students/:id
exports.updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw new AppError('Student not found.', 404);
  if (req.body.usn && req.body.usn !== student.usn && (await Student.exists({ usn: req.body.usn, _id: { $ne: student._id } }))) {
    throw new AppError('This USN is already registered.', 409, { usn: 'This USN is already registered.' });
  }
  applyProfile(student, req.body, { allowUsn: true });
  await student.save();
  if (req.body.name) await User.updateOne({ _id: student.user }, { name: req.body.name });
  res.json({ success: true, profile: student });
});

const fileSafe = (s) => String(s).replace(/[^A-Za-z0-9_-]/g, '_');

// GET /api/admin/students/:id/export/excel
exports.exportExcel = asyncHandler(async (req, res) => {
  const bundle = await loadBundle(req.params.id);
  if (!bundle) throw new AppError('Student not found.', 404);
  const buf = buildWorkbook(bundle);
  res.set({
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': `attachment; filename="Student_Career_Growth_${fileSafe(bundle.student.usn)}.xlsx"`,
  });
  res.send(buf);
});

// GET /api/admin/students/:id/export/pdf   (?inline=1 shows it in the browser instead of downloading)
exports.exportPdf = asyncHandler(async (req, res) => {
  const bundle = await loadBundle(req.params.id);
  if (!bundle) throw new AppError('Student not found.', 404);
  const buf = await buildPdf(bundle, { collegeName: process.env.COLLEGE_NAME || 'Engineering College' });
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `${req.query.inline ? 'inline' : 'attachment'}; filename="Student_Career_Report_${fileSafe(bundle.student.usn)}.pdf"`,
  });
  res.send(buf);
});
