const router = require('express').Router();
const { body } = require('express-validator');
const { getOptions, getProfile, updateProfile } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { DEPARTMENTS } = require('../utils/constants');
const { ACADEMIC_PERFORMANCE, isValidGoalPair, isValidCareerPath } = require('../utils/careerData');

// Every route here is for students only.
router.use(protect, authorize('student'));

const profileRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name is too long'),
  body('phone')
    .customSanitizer((v) => String(v ?? '').replace(/[\s-]/g, ''))
    .matches(/^\+?\d{10,13}$/)
    .withMessage('Enter a valid phone number (10 to 13 digits)'),
  body('department').isIn(DEPARTMENTS).withMessage('Choose a department from the list'),
  body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8').toInt(),
  body('section')
    .trim()
    .matches(/^[A-Za-z0-9]{1,3}$/)
    .withMessage('Section should be 1 to 3 letters or digits (for example A)')
    .customSanitizer((v) => v.toUpperCase()),
  body('cgpa').isFloat({ min: 0, max: 10 }).withMessage('CGPA must be between 0 and 10').toFloat(),
  body('previousCgpa')
    .customSanitizer((v) => (v === '' ? null : v))
    .optional({ values: 'null' })
    .isFloat({ min: 0, max: 10 })
    .withMessage('Previous CGPA must be between 0 and 10')
    .toFloat(),
  body('academicPerformance').isIn(ACADEMIC_PERFORMANCE).withMessage('Choose your academic performance'),
  body('backlogs').isInt({ min: 0, max: 50 }).withMessage('Backlogs must be a whole number from 0 to 50').toInt(),
  body('attendance').isFloat({ min: 0, max: 100 }).withMessage('Attendance must be between 0 and 100').toFloat(),
  body('shortTermGoal').notEmpty().withMessage('Choose a short-term goal'),
  body('longTermGoal')
    .notEmpty()
    .withMessage('Choose a long-term goal')
    .custom((v, { req }) => isValidGoalPair(req.body.shortTermGoal, v))
    .withMessage('This long-term goal does not match the short-term goal'),
  body('targetIndustry').notEmpty().withMessage('Choose a target industry'),
  body('targetDomain').notEmpty().withMessage('Choose a target domain'),
  body('targetJobRole')
    .notEmpty()
    .withMessage('Choose a target job role')
    .custom((v, { req }) => isValidCareerPath(req.body.targetIndustry, req.body.targetDomain, v))
    .withMessage('Industry, domain and job role do not match'),
];

router.get('/options', getOptions);
router.get('/profile', getProfile);
router.put('/profile', profileRules, validate, updateProfile);

module.exports = router;
