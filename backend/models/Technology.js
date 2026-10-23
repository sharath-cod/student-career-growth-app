const mongoose = require('mongoose');
const { LEVELS } = require('../utils/techCatalog');

const schema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    key: { type: String, required: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    domain: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, enum: LEVELS, required: true },
    experienceMonths: { type: Number, min: 0, max: 600, default: 0 },
    projects: { type: [String], default: [] },
  },
  { timestamps: true }
);
schema.index({ student: 1, key: 1 }, { unique: true });
module.exports = mongoose.model('Technology', schema);
