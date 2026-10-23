const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    industry: String,
    domain: { type: String, index: true },
    requiredSkills: { type: [{ _id: false, name: String, category: String }], default: [] },
  },
  { timestamps: true }
);
module.exports = mongoose.model('JobRole', schema);
