const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  memberNumber: { type: Number, required: true },
  name: { type: String, required: true, trim: true },
  usn: { type: String, required: true, trim: true, uppercase: true },
  mobile: { type: String, required: true, trim: true },
  year: { type: String, required: true, enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'] }
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
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'waitlist', 'waitlist_paid', 'waived'],
      default: 'pending'
    },
    verifiedAt: { type: Date },
    adminNotes: { type: String, default: '' }
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
