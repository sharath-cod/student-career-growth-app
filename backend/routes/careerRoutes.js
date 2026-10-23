const router = require('express').Router();
const { body } = require('express-validator');
const RequirementStatus = require('../models/RequirementStatus');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { studentOf } = require('../utils/crud');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { REQ_STATUSES } = require('../utils/techCatalog');
const { loadBundle, requirementsOf } = require('../services/dashboardService');
const { nextSteps } = require('../services/careerService');

router.use(protect, authorize('student'));

// Career gap analysis for the student's target job role.
router.get('/', asyncHandler(async (req, res) => {
  const bundle = await loadBundle(studentOf(req));
  const reqs = requirementsOf(bundle);
  res.json({ success: true, jobRole: bundle.student.targetJobRole, ...reqs, nextSteps: nextSteps(reqs.items, 6) });
}));

// Student marks one requirement: Not Started / Learning / Completed
router.put('/requirements', [
  body('skillName').trim().notEmpty().withMessage('Skill is required'),
  body('status').isIn(REQ_STATUSES).withMessage('Choose a status'),
], validate, asyncHandler(async (req, res) => {
  const id = studentOf(req);
  const bundle = await loadBundle(id);
  const role = bundle.jobRole;
  if (!role || !role.requiredSkills.some((r) => r.name === req.body.skillName)) throw new AppError('This skill is not a requirement for your target job role.', 400);
  await RequirementStatus.findOneAndUpdate(
    { student: id, jobRole: role.name, skillName: req.body.skillName },
    { status: req.body.status },
    { upsert: true, new: true }
  );
  const fresh = await loadBundle(id);
  const reqs = requirementsOf(fresh);
  res.json({ success: true, jobRole: role.name, ...reqs, nextSteps: nextSteps(reqs.items, 6) });
}));

module.exports = router;
