const mongoose = require('mongoose');
const { PROJECT_STATUSES } = require('../utils/techCatalog');

const schema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    domain: { type: String, trim: true, default: '' },
    technologies: { type: [String], default: [] },
    githubUrl: { type: String, trim: true, default: '' },
    liveUrl: { type: String, trim: true, default: '' },
    role: { type: String, trim: true, maxlength: 100, default: '' },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    status: { type: String, enum: PROJECT_STATUSES, default: 'Planned' },
  },
  { timestamps: true }
);
module.exports = mongoose.model('Project', schema);
