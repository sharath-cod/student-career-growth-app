const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { studentOf } = require('../utils/crud');
const { protect, authorize } = require('../middleware/auth');
const { loadBundle, buildDashboardData } = require('../services/dashboardService');

router.get('/', protect, authorize('student'), asyncHandler(async (req, res) => {
  const bundle = await loadBundle(studentOf(req));
  if (!bundle) throw new AppError('Student not found.', 404);
  res.json({ success: true, dashboard: buildDashboardData(bundle) });
}));

module.exports = router;
