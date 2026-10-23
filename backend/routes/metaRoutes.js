const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { DEPARTMENTS } = require('../utils/constants');
const { GOALS, INDUSTRIES, ACADEMIC_PERFORMANCE } = require('../utils/careerData');
const T = require('../utils/techCatalog');

// Dropdown data for both roles (read-only).
router.get('/catalog', protect, (req, res) => {
  res.json({
    success: true,
    departments: DEPARTMENTS, goals: GOALS, industries: INDUSTRIES, academicPerformance: ACADEMIC_PERFORMANCE,
    techCatalog: T.CATALOG, levels: T.LEVELS, levelPercent: T.LEVEL_PERCENT, certCategories: T.CERT_CATEGORIES,
    participationTypes: T.PARTICIPATION_TYPES, projectStatuses: T.PROJECT_STATUSES, reqStatuses: T.REQ_STATUSES,
  });
});

module.exports = router;
