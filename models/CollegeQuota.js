const mongoose = require('mongoose');

const CollegeQuotaSchema = new mongoose.Schema({
  college: {
    type: String,
    required: true,
    unique: true,
    enum: ['GEC Hassan', 'GEC Arsikere', 'GEC Mosalehosahalli']
  },
  limit: {
    type: Number,
    required: true
  },
  confirmedCount: {
    type: Number,
    default: 0
  },
  waitlistCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('CollegeQuota', CollegeQuotaSchema);
