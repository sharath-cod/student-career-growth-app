const mongoose = require('mongoose');
const { REQ_STATUSES } = require('../utils/techCatalog');

// A student's own marking of a job-role requirement (Not Started / Learning / Completed).
const schema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    jobRole: { type: String, required: true },
    skillName: { type: String, required: true },
    status: { type: String, enum: REQ_STATUSES, required: true },
  },
  { timestamps: true }
);
schema.index({ student: 1, jobRole: 1, skillName: 1 }, { unique: true });
module.exports = mongoose.model('RequirementStatus', schema);
