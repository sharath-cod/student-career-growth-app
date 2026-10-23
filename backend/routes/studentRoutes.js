const router = require('express').Router();
const { getOptions, getProfile, updateProfile } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { profileRules } = require('../validators/profileRules');

router.use(protect, authorize('student'));
router.get('/options', getOptions);
router.get('/profile', getProfile);
router.put('/profile', profileRules, validate, updateProfile);

module.exports = router;
