const User = require('../models/User');
const Student = require('../models/Student');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/token');
const { ROLES } = require('../utils/constants');

async function isProfileCompleted(user) {
  if (user.role !== ROLES.STUDENT) return true;
  const student = await Student.findOne({ user: user._id }).select('profileCompleted');
  return Boolean(student && student.profileCompleted);
}

// POST /api/auth/register  (students only; admins are created by the seed script)
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, usn, department } = req.body;

  if (await Student.exists({ usn })) {
    throw new AppError('This USN is already registered.', 409, { usn: 'This USN is already registered.' });
  }
  if (await User.exists({ email: email.toLowerCase() })) {
    throw new AppError('This email is already registered.', 409, { email: 'This email is already registered.' });
  }

  // role is forced to "student": it is never read from the request body.
  const user = await User.create({ name, email, password, role: ROLES.STUDENT });

  try {
    const student = await Student.create({ user: user._id, name, email, usn, department: department || '' });
    user.studentId = student._id;
    await user.save();
  } catch (err) {
    await User.findByIdAndDelete(user._id); // manual rollback (standalone MongoDB has no transactions)
    throw err;
  }

  res.status(201).json({ success: true, token: signToken(user), user: user.toSafeJSON(), profileCompleted: false });
});

// POST /api/auth/login
// Optional body.expectedRole lets the /admin/login page refuse student accounts.
exports.login = asyncHandler(async (req, res) => {
  const { email, password, expectedRole } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  const valid = user && user.isActive && (await user.comparePassword(password));
  if (!valid) throw new AppError('Incorrect email or password.', 401);

  if (expectedRole && user.role !== expectedRole) {
    throw new AppError(
      expectedRole === ROLES.ADMIN ? 'This portal is for teachers and admins only.' : 'Please use the admin login page.',
      403
    );
  }

  user.lastLoginAt = new Date();
  await user.save({ validateModifiedOnly: true });

  res.json({ success: true, token: signToken(user), user: user.toSafeJSON(), profileCompleted: await isProfileCompleted(user) });
});

// GET /api/auth/me
exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeJSON(), profileCompleted: await isProfileCompleted(req.user) });
});
