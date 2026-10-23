const mongoose = require('mongoose');

// One document per student per week. Weeks are never deleted, so history is preserved.
const schema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    weekNumber: { type: Number, required: true, min: 1, max: 104 },
    date: { type: Date, required: true },
    cgpa: { type: Number, min: 0, max: 10, default: null },
    newSkills: { type: [String], default: [] },
    technologiesLearned: { type: [String], default: [] },
    projectsCompleted: { type: Number, min: 0, default: 0 },
    certificationsCompleted: { type: Number, min: 0, default: 0 },
    clubActivities: { type: String, trim: true, maxlength: 500, default: '' },
    problemsFaced: { type: String, trim: true, maxlength: 2000, default: '' },
    learned: { type: String, required: true, trim: true, maxlength: 2000 },
    nextGoal: { type: String, required: true, trim: true, maxlength: 1000 },
    overallProgress: { type: Number, required: true, min: 0, max: 100 },
    // Calculated by the server when the week is saved:
    careerReadiness: { type: Number, min: 0, max: 100, default: 0 },
    avgSkill: { type: Number, min: 0, max: 100, default: 0 },
    skillCount: { type: Number, min: 0, default: 0 },
    skillSnapshot: {
      type: [{ _id: false, name: String, level: String, percentage: Number }],
      default: [],
    },
  },
  { timestamps: true }
);
schema.index({ student: 1, weekNumber: 1 }, { unique: true });
module.exports = mongoose.model('WeeklyProgress', schema);
