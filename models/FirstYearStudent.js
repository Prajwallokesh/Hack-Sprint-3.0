const mongoose = require('mongoose');

const FirstYearStudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  usn: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  branch: {
    type: String,
    default: 'CSE',
    trim: true
  },
  section: {
    type: String,
    default: 'A',
    trim: true
  },
  isAssigned: {
    type: Boolean,
    default: false,
    index: true
  },
  assignedTeamId: {
    type: String,
    default: null,
    index: true
  },
  assignedTeamName: {
    type: String,
    default: null
  },
  assignedAt: {
    type: Date,
    default: null
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FirstYearStudent', FirstYearStudentSchema);
