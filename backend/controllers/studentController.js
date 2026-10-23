const Student = require('../models/Student');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { DEPARTMENTS } = require('../utils/constants');
const { GOALS, INDUSTRIES, ACADEMIC_PERFORMANCE } = require('../utils/careerData');
const { applyProfile } = require('../services/profileService');

async function findOwnStudent(user) {
  // Always resolved from the logged-in user, never from an id in the URL.
  const student = await Student.findOne({ user: user._id });
  if (!student) throw new AppError('Student profile not found.', 404);
  return student;
}

exports.getOptions = (req, res) => {
  res.json({ success: true, departments: DEPARTMENTS, goals: GOALS, industries: INDUSTRIES, academicPerformance: ACADEMIC_PERFORMANCE });
};

exports.getProfile = asyncHandler(async (req, res) => {
  const student = await findOwnStudent(req.user);
  res.json({ success: true, profile: student, profileCompleted: student.profileCompleted });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const student = await findOwnStudent(req.user);
  applyProfile(student, req.body);
  await student.save();
  if (req.body.name && req.user.name !== req.body.name) {
    req.user.name = req.body.name;
    await req.user.save({ validateModifiedOnly: true });
  }
  res.json({ success: true, profile: student, profileCompleted: student.profileCompleted });
});

