const router = require('express').Router();
const { body } = require('express-validator');
const WeeklyProgress = require('../models/WeeklyProgress');
const Student = require('../models/Student');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { studentOf } = require('../utils/crud');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { reqDate, optText, stringList, idParam } = require('../validators/common');
const { currentReadiness } = require('../services/dashboardService');

router.use(protect, authorize('student'));

const FIELDS = ['date', 'cgpa', 'newSkills', 'technologiesLearned', 'projectsCompleted', 'certificationsCompleted', 'clubActivities', 'problemsFaced', 'learned', 'nextGoal', 'overallProgress'];

const rules = [
  body('weekNumber').isInt({ min: 1, max: 104 }).withMessage('Week number must be between 1 and 104').toInt(),
  reqDate('date', 'Date'),
  body('cgpa').customSanitizer((v) => (v === '' ? null : v)).optional({ values: 'null' }).isFloat({ min: 0, max: 10 }).withMessage('CGPA must be between 0 and 10').toFloat(),
  ...stringList('newSkills'), ...stringList('technologiesLearned'),
  body('projectsCompleted').optional().isInt({ min: 0, max: 100 }).withMessage('Enter a whole number').toInt(),
  body('certificationsCompleted').optional().isInt({ min: 0, max: 100 }).withMessage('Enter a whole number').toInt(),
  optText('clubActivities', 500), optText('problemsFaced', 2000),
  body('learned').trim().notEmpty().withMessage('Tell us what you learned this week').isLength({ max: 2000 }).withMessage('Too long'),
  body('nextGoal').trim().notEmpty().withMessage("Next week's goal is required").isLength({ max: 1000 }).withMessage('Too long'),
  body('overallProgress').isFloat({ min: 0, max: 100 }).withMessage('Overall progress must be between 0 and 100').toFloat(),
];

const pick = (body) => Object.fromEntries(FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));
const snapshotOf = (skills) => skills.map((s) => ({ name: s.name, level: s.level, percentage: s.percentage }));

router.get('/', asyncHandler(async (req, res) => {
  const items = await WeeklyProgress.find({ student: studentOf(req) }).sort({ weekNumber: 1 });
  res.json({ success: true, items });
}));

// Suggestions for the form: next week number and the average skill percentage.
router.get('/next', asyncHandler(async (req, res) => {
  const student = studentOf(req);
  const last = await WeeklyProgress.findOne({ student }).sort({ weekNumber: -1 }).select('weekNumber');
  const now = await currentReadiness(student);
  res.json({ success: true, nextWeek: last ? last.weekNumber + 1 : 1, suggestedProgress: now.avgSkill, careerReadiness: now.readiness });
}));

router.post('/', rules, validate, asyncHandler(async (req, res) => {
  const student = studentOf(req);
  if (await WeeklyProgress.exists({ student, weekNumber: req.body.weekNumber })) {
    throw new AppError(`Week ${req.body.weekNumber} is already logged. Edit that week instead.`, 409, { weekNumber: 'This week is already logged' });
  }
  const now = await currentReadiness(student);
  const doc = await WeeklyProgress.create({
    ...pick(req.body), student, weekNumber: req.body.weekNumber,
    careerReadiness: now.readiness, avgSkill: now.avgSkill, skillCount: now.skills.length, skillSnapshot: snapshotOf(now.skills),
  });
  await Student.updateOne({ _id: student }, { lastWeeklyUpdateAt: new Date() });
  res.status(201).json({ success: true, item: doc });
}));

// Editing a week keeps its old skill snapshot, except for the latest week (which is refreshed).
router.put('/:id', idParam, rules, validate, asyncHandler(async (req, res) => {
  const student = studentOf(req);
  const doc = await WeeklyProgress.findOne({ _id: req.params.id, student });
  if (!doc) throw new AppError('Week not found.', 404);
  Object.assign(doc, pick(req.body)); // weekNumber is never changed
  const latest = await WeeklyProgress.findOne({ student }).sort({ weekNumber: -1 }).select('_id');
  if (String(latest._id) === String(doc._id)) {
    const now = await currentReadiness(student);
    Object.assign(doc, { careerReadiness: now.readiness, avgSkill: now.avgSkill, skillCount: now.skills.length, skillSnapshot: snapshotOf(now.skills) });
  }
  await doc.save();
  await Student.updateOne({ _id: student }, { lastWeeklyUpdateAt: new Date() });
  res.json({ success: true, item: doc });
}));

module.exports = router;
