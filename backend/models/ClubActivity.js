const mongoose = require('mongoose');
const { PARTICIPATION_TYPES } = require('../utils/techCatalog');

const schema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    clubName: { type: String, required: true, trim: true, maxlength: 120 },
    activityName: { type: String, required: true, trim: true, maxlength: 150 },
    role: { type: String, trim: true, maxlength: 100, default: '' },
    participationType: { type: String, enum: PARTICIPATION_TYPES, required: true },
    date: { type: Date, required: true },
    description: { type: String, trim: true, maxlength: 600, default: '' },
    achievement: { type: String, trim: true, maxlength: 300, default: '' },
  },
  { timestamps: true }
);
module.exports = mongoose.model('ClubActivity', schema);
