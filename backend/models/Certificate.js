const mongoose = require('mongoose');
const { CERT_CATEGORIES } = require('../utils/techCatalog');

const schema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    key: { type: String, required: true }, // name|organization, lowercase
    name: { type: String, required: true, trim: true, maxlength: 150 },
    organization: { type: String, required: true, trim: true, maxlength: 150 },
    category: { type: String, enum: CERT_CATEGORIES, required: true },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date, default: null },
    credentialId: { type: String, trim: true, maxlength: 100, default: '' },
    url: { type: String, trim: true, maxlength: 500, default: '' },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    hasFile: { type: Boolean, default: false },
    fileName: { type: String, default: '' },
  },
  { timestamps: true }
);
schema.index({ student: 1, key: 1 }, { unique: true });
module.exports = mongoose.model('Certificate', schema);
