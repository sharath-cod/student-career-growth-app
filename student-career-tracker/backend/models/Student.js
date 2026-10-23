const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    // Basic information
    name: { type: String, required: true, trim: true, maxlength: 100 },
    usn: { type: String, required: true, unique: true, uppercase: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    department: { type: String, trim: true, default: '' },
    semester: { type: Number, min: 1, max: 8 },
    section: { type: String, trim: true, uppercase: true, default: '' },

    // Academic information
    cgpa: { type: Number, min: 0, max: 10 },
    previousCgpa: { type: Number, min: 0, max: 10 },
    academicPerformance: {
      type: String,
      enum: ['', 'Excellent', 'Good', 'Average', 'Needs Improvement'],
      default: '',
    },
    backlogs: { type: Number, min: 0, default: 0 },
    attendance: { type: Number, min: 0, max: 100 },

    // Career goals (nested dropdown chain, built in Phase 2)
    shortTermGoal: { type: String, trim: true, default: '' },
    longTermGoal: { type: String, trim: true, default: '' },
    targetIndustry: { type: String, trim: true, default: '' },
    targetDomain: { type: String, trim: true, default: '' },
    targetJobRole: { type: String, trim: true, default: '' },

    profileCompleted: { type: Boolean, default: false },
    lastWeeklyUpdateAt: { type: Date },
  },
  { timestamps: true }
);

studentSchema.index({ name: 1 });
studentSchema.index({ department: 1 });
studentSchema.index({ targetDomain: 1 });
studentSchema.index({ targetJobRole: 1 });
studentSchema.index({ semester: 1, department: 1 });

module.exports = mongoose.model('Student', studentSchema);
