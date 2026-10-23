const mongoose = require('mongoose');
const { LEVELS } = require('../utils/techCatalog');

const schema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    key: { type: String, required: true }, // lowercase name, used to prevent duplicates
    name: { type: String, required: true, trim: true, maxlength: 80 },
    domain: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, enum: LEVELS, required: true },
    percentage: { type: Number, min: 0, max: 100, required: true },
    dateLearned: { type: Date, default: null },
    evidence: { type: String, trim: true, maxlength: 300, default: '' },
    notes: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { timestamps: true }
);
schema.index({ student: 1, key: 1 }, { unique: true });
module.exports = mongoose.model('Skill', schema);
