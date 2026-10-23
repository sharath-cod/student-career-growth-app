// Skills, technologies, certificates, projects, club activities (student-owned data).
const express = require('express');
const multer = require('multer');
const { body } = require('express-validator');
const Skill = require('../models/Skill');
const Technology = require('../models/Technology');
const Certificate = require('../models/Certificate');
const CertificateFile = require('../models/CertificateFile');
const Project = require('../models/Project');
const ClubActivity = require('../models/ClubActivity');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { crud, studentOf } = require('../utils/crud');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { optDate, reqDate, optUrl, optText, stringList, idParam } = require('../validators/common');
const T = require('../utils/techCatalog');

const guard = [protect, authorize('student')];
const lower = (s) => String(s || '').trim().toLowerCase();

function makeRouter(ctrl, rules) {
  const r = express.Router();
  r.use(...guard);
  r.get('/', ctrl.list);
  r.post('/', rules, validate, ctrl.create);
  r.put('/:id', idParam, rules, validate, ctrl.update);
  r.delete('/:id', idParam, validate, ctrl.remove);
  return r;
}

const pickerRules = [
  body('domain').isIn(Object.keys(T.CATALOG)).withMessage('Choose a domain'),
  body('category').trim().notEmpty().withMessage('Choose a category'),
  body('name').trim().notEmpty().withMessage('Choose a skill').isLength({ max: 80 }).withMessage('Name is too long')
    .custom((v, { req }) => T.isValidSkill(req.body.domain, req.body.category, v)).withMessage('This item does not belong to the selected domain and category'),
  body('level').isIn(T.LEVELS).withMessage('Choose a level'),
];

// ---- Skills
const skills = crud(Skill, {
  fields: ['name', 'domain', 'category', 'level', 'percentage', 'dateLearned', 'evidence', 'notes'],
  dateFields: ['dateLearned'],
  keyOf: (d) => lower(d.name),
  duplicateMessage: (d) => `You have already added "${d.name}". Edit that skill instead.`,
});
const skillRules = [...pickerRules, body('percentage').isFloat({ min: 0, max: 100 }).withMessage('Percentage must be between 0 and 100').toFloat(), optDate('dateLearned', 'Date learned'), optText('evidence', 300), optText('notes', 500)];

// ---- Technologies
const technologies = crud(Technology, {
  fields: ['name', 'domain', 'category', 'level', 'experienceMonths', 'projects'],
  keyOf: (d) => lower(d.name),
  duplicateMessage: (d) => `"${d.name}" is already in your technology list. Edit it instead.`,
});
const techRules = [...pickerRules, body('experienceMonths').isInt({ min: 0, max: 600 }).withMessage('Experience must be 0 to 600 months').toInt(), ...stringList('projects', 20)];

// ---- Certificates (file stored in MongoDB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (['application/pdf', 'image/png', 'image/jpeg'].includes(file.mimetype)) return cb(null, true);
    return cb(new AppError('Only PDF, PNG or JPG files are allowed.', 415));
  },
});

const certificates = crud(Certificate, {
  fields: ['name', 'organization', 'category', 'issueDate', 'expiryDate', 'credentialId', 'url', 'description'],
  dateFields: ['issueDate', 'expiryDate'],
  keyOf: (d) => `${lower(d.name)}|${lower(d.organization)}`,
  duplicateMessage: (d) => `You have already added "${d.name}" from ${d.organization}.`,
  afterSave: async (doc, req) => {
    if (!req.file) return;
    await CertificateFile.findOneAndUpdate(
      { certificate: doc._id },
      { certificate: doc._id, student: doc.student, filename: req.file.originalname, contentType: req.file.mimetype, size: req.file.size, data: req.file.buffer },
      { upsert: true, new: true }
    );
    doc.hasFile = true;
    doc.fileName = req.file.originalname;
    await doc.save();
  },
  onDelete: (doc) => CertificateFile.deleteOne({ certificate: doc._id }),
});
const certRules = [
  body('name').trim().notEmpty().withMessage('Certificate name is required').isLength({ max: 150 }).withMessage('Name is too long'),
  body('organization').trim().notEmpty().withMessage('Issuing organization is required').isLength({ max: 150 }).withMessage('Name is too long'),
  body('category').isIn(T.CERT_CATEGORIES).withMessage('Choose a category'),
  reqDate('issueDate', 'Issue date'),
  optDate('expiryDate', 'Expiry date').custom((v, { req }) => !v || new Date(v) >= new Date(req.body.issueDate)).withMessage('Expiry date cannot be before the issue date'),
  optText('credentialId', 100),
  optUrl('url', 'Certificate URL'),
  optText('description', 500),
];
const certRouter = express.Router();
certRouter.use(...guard);
certRouter.get('/', certificates.list);
certRouter.post('/', upload.single('file'), certRules, validate, certificates.create);
certRouter.put('/:id', idParam, upload.single('file'), certRules, validate, certificates.update);
certRouter.delete('/:id', idParam, validate, certificates.remove);

async function sendCertificateFile(res, certId, studentId) {
  const q = { certificate: certId };
  if (studentId) q.student = studentId;
  const f = await CertificateFile.findOne(q);
  if (!f) throw new AppError('No file was uploaded for this certificate.', 404);
  res.set({ 'Content-Type': f.contentType, 'Content-Disposition': `inline; filename="${encodeURIComponent(f.filename || 'certificate')}"`, 'Cache-Control': 'private, max-age=0' });
  res.send(f.data);
}
certRouter.get('/:id/file', idParam, validate, asyncHandler(async (req, res) => sendCertificateFile(res, req.params.id, studentOf(req))));

// ---- Projects
const projects = crud(Project, {
  fields: ['name', 'description', 'domain', 'technologies', 'githubUrl', 'liveUrl', 'role', 'startDate', 'endDate', 'status'],
  dateFields: ['startDate', 'endDate'],
});
const projectRules = [
  body('name').trim().notEmpty().withMessage('Project name is required').isLength({ max: 150 }).withMessage('Name is too long'),
  optText('description', 1000), optText('domain', 80), ...stringList('technologies', 30), optUrl('githubUrl', 'GitHub URL'), optUrl('liveUrl', 'Live URL'), optText('role', 100),
  optDate('startDate', 'Start date'),
  optDate('endDate', 'End date').custom((v, { req }) => !v || !req.body.startDate || new Date(v) >= new Date(req.body.startDate)).withMessage('End date cannot be before the start date'),
  body('status').isIn(T.PROJECT_STATUSES).withMessage('Choose a status'),
];

// ---- Club activities
const activities = crud(ClubActivity, {
  fields: ['clubName', 'activityName', 'role', 'participationType', 'date', 'description', 'achievement'],
  dateFields: ['date'],
});
const activityRules = [
  body('clubName').trim().notEmpty().withMessage('Club name is required').isLength({ max: 120 }).withMessage('Too long'),
  body('activityName').trim().notEmpty().withMessage('Activity name is required').isLength({ max: 150 }).withMessage('Too long'),
  optText('role', 100),
  body('participationType').isIn(T.PARTICIPATION_TYPES).withMessage('Choose a participation type'),
  reqDate('date', 'Date'), optText('description', 600), optText('achievement', 300),
];

module.exports = {
  skillsRouter: makeRouter(skills, skillRules),
  technologiesRouter: makeRouter(technologies, techRules),
  certificatesRouter: certRouter,
  projectsRouter: makeRouter(projects, projectRules),
  activitiesRouter: makeRouter(activities, activityRules),
  sendCertificateFile,
};
