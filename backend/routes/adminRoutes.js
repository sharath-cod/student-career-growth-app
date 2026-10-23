const router = require('express').Router();
const { param } = require('express-validator');
const ctrl = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { adminProfileRules } = require('../validators/profileRules');
const { sendCertificateFile } = require('./studentData');
const asyncHandler = require('../utils/asyncHandler');

// Everything under /api/admin is admin-only, enforced here on the server.
router.use(protect, authorize('admin'));

const id = param('id').isMongoId().withMessage('Invalid id');

router.get('/dashboard', ctrl.dashboard);
router.get('/students', ctrl.listStudents);
router.get('/students/:id', id, validate, ctrl.getStudent);
router.put('/students/:id', id, adminProfileRules, validate, ctrl.updateStudent);
router.get('/students/:id/export/excel', id, validate, ctrl.exportExcel);
router.get('/students/:id/export/pdf', id, validate, ctrl.exportPdf);
router.get('/certificates/:id/file', id, validate, asyncHandler(async (req, res) => sendCertificateFile(res, req.params.id)));

module.exports = router;
