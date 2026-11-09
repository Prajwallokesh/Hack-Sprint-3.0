const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  memberNumber: { type: Number, required: true },
  name: { type: String, required: true, trim: true },
  usn: { type: String, required: true, trim: true, uppercase: true },
  mobile: { type: String, required: true, trim: true },
  year: { type: String, required: true, enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'] },
  email: { type: String, trim: true, lowercase: true, default: '' }
});

const RegistrationSchema = new mongoose.Schema({
  registrationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  college: {
    type: String,
    required: true,
    enum: [
      'GEC Hassan',
      'GEC Arsikere',
      'GEC Mosalehosahalli'
    ]
  },
  teamName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  leader: {
    name: { type: String, required: true, trim: true },
    usn: { type: String, required: true, trim: true, uppercase: true },
    mobile: { type: String, required: true, trim: true },
    year: { type: String, required: true, enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'] },
    email: { type: String, trim: true, lowercase: true }
  },
  members: [MemberSchema],
  totalMembers: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  // Waitlist Status
  isWaitlist: {
    type: Boolean,
    default: false,
    index: true
  },
  seatNumber: {
    type: Number,
    default: null
  },
  waitlistPosition: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    enum: ['confirmed', 'waitlist', 'promoted', 'cancelled'],
    default: 'confirmed'
  },
  payment: {
    amount: { type: Number, default: 0 },
    transactionId: { type: String, default: '', trim: true },
    screenshotPath: { type: String, default: '' },
    screenshotData: { type: String, default: '' },
    screenshotContentType: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'waitlist', 'waitlist_paid', 'waived'],
      default: 'pending'
    },
    verifiedAt: { type: Date },
    adminNotes: { type: String, default: '' }
  },
  // 1st Year Builders assigned by Admin
  assignedFirstYears: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'FirstYearStudent' },
      name: { type: String, trim: true },
      usn: { type: String, uppercase: true, trim: true },
      mobile: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      branch: { type: String, default: 'CSE' },
      assignedAt: { type: Date, default: Date.now }
    }
  ],
  // Team Branding & Customization
  teamBranding: {
    tagline: { type: String, default: '', trim: true },
    githubUrl: { type: String, default: '', trim: true }
  },
  // Gate Check-in verification
  checkIn: {
    isCheckedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date, default: null },
    passToken: { type: String, default: '' },
    allocatedSeat: { type: String, default: '' }
  },
  // Final Project Submission (Title, GitHub Repo & ZIP Archive)
  projectSubmission: {
    title: { type: String, default: '', trim: true },
    githubUrl: { type: String, default: '', trim: true },
    zipFileName: { type: String, default: '' },
    zipFilePath: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    submittedAt: { type: Date, default: null }
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

// Guarantee at database engine level: No 2 confirmed teams can ever hold the same seat number in a college
RegistrationSchema.index({ college: 1, seatNumber: 1 }, { unique: true, sparse: true });
// Fast lookup indexes to prevent duplicate USN registrations across teams
RegistrationSchema.index({ 'leader.usn': 1 });
RegistrationSchema.index({ 'members.usn': 1 });

module.exports = mongoose.model('Registration', RegistrationSchema);
