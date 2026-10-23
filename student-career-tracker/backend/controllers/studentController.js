const Student = require('../models/Student');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { DEPARTMENTS } = require('../utils/constants');
const { GOALS, INDUSTRIES, ACADEMIC_PERFORMANCE } = require('../utils/careerData');

const EDITABLE = [
  'phone', 'department', 'semester', 'section',
  'cgpa', 'previousCgpa', 'academicPerformance', 'backlogs', 'attendance',
  'shortTermGoal', 'longTermGoal', 'targetIndustry', 'targetDomain', 'targetJobRole',
];

const REQUIRED_FOR_COMPLETE = [
  'phone', 'department', 'semester', 'section', 'cgpa', 'academicPerformance', 'attendance',
  'shortTermGoal', 'longTermGoal', 'targetIndustry', 'targetDomain', 'targetJobRole',
];

const isComplete = (s) => REQUIRED_FOR_COMPLETE.every((k) => s[k] !== undefined && s[k] !== null && s[k] !== '');

async function findOwnStudent(user) {
  // Always resolved from the logged-in user, never from an id in the URL.
  const student = await Student.findOne({ user: user._id });
  if (!student) throw new AppError('Student profile not found.', 404);
  return student;
}

// GET /api/students/options
exports.getOptions = (req, res) => {
  res.json({ success: true, departments: DEPARTMENTS, goals: GOALS, industries: INDUSTRIES, academicPerformance: ACADEMIC_PERFORMANCE });
};

// GET /api/students/profile
exports.getProfile = asyncHandler(async (req, res) => {
  const student = await findOwnStudent(req.user);
  res.json({ success: true, profile: student, profileCompleted: student.profileCompleted });
});

// PUT /api/students/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const student = await findOwnStudent(req.user);

  if (req.body.name) {
    student.name = req.body.name;
    req.user.name = req.body.name;
  }
  EDITABLE.forEach((key) => {
    if (req.body[key] !== undefined) student[key] = req.body[key];
  });
  if (req.body.previousCgpa === null) student.previousCgpa = undefined;

  student.profileCompleted = isComplete(student);
  await student.save();
  if (req.user.isModified('name')) await req.user.save({ validateModifiedOnly: true });

  res.json({ success: true, profile: student, profileCompleted: student.profileCompleted });
});
