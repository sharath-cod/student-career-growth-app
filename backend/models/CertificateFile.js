const mongoose = require('mongoose');

// Files live in MongoDB (not on disk) so they survive restarts on free hosting.
const schema = new mongoose.Schema(
  {
    certificate: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate', required: true, unique: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    filename: String,
    contentType: String,
    size: Number,
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model('CertificateFile', schema);
