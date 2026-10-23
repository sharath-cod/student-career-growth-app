// Usage: npm run seed:admin   (reads ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD from backend/.env)
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const { ROLES, PASSWORD_REGEX } = require('./constants');

(async () => {
  try {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env first.');
    }
    if (!PASSWORD_REGEX.test(ADMIN_PASSWORD)) {
      throw new Error('ADMIN_PASSWORD needs 8+ characters with at least one letter and one number.');
    }
    await connectDB();

    const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (existing) {
      console.log(`An account for ${ADMIN_EMAIL} already exists (role: ${existing.role}). Nothing changed.`);
    } else {
      await User.create({ name: ADMIN_NAME || 'College Admin', email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: ROLES.ADMIN });
      console.log(`Admin created: ${ADMIN_EMAIL}`);
    }
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
