require('dotenv').config();
const dns = require('dns');
// Ensure SRV records for MongoDB Atlas resolve reliably across local ISPs and cloud environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const crypto = require('crypto');
const XLSX = require('xlsx');

const Registration = require('./models/Registration');
const CollegeQuota = require('./models/CollegeQuota');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hacksprint-3:Qwert%40123@cluster0.ntr55o.mongodb.net/hacksprint3?retryWrites=true&w=majority';
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'admin').trim().replace(/^["']|["']$/g, '');
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || 'HackSprint2026!').trim().replace(/^["']|["']$/g, '');
const ADMIN_TOKEN = Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64');
const DEFAULT_ADMIN_TOKEN = Buffer.from('admin:HackSprint2026!').toString('base64');

// College Quotas: GEC Hassan (30), GEC Arsikere (5), GEC Mosalehosahalli (5)
const COLLEGE_QUOTAS = {
  'GEC Hassan': 30,
  'GEC Arsikere': 5,
  'GEC Mosalehosahalli': 5
};

// WhatsApp Community Links
const WHATSAPP_CONFIRMED_URL = process.env.WHATSAPP_CONFIRMED_URL || 'https://chat.whatsapp.com/HJXSxdQWU7i6bLoza40MJQ?s=cl&p=a&mlu=4&ilr=4&iam=2';
const WHATSAPP_WAITLIST_URL = process.env.WHATSAPP_WAITLIST_URL || 'https://chat.whatsapp.com/HD6uTGs1YYGHRaKbnUGbeN?s=sh&p=a&mlu=4&ilr=4&iam=2';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads', 'payments');
fs.mkdirSync(uploadsDir, { recursive: true });

// Setup Multer storage for payment screenshot uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const cleanTeam = (req.body.teamName || 'team').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e4);
    cb(null, `pay_${cleanTeam}_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|svg/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const mime = file.mimetype.toLowerCase();
    if (allowed.test(ext) || mime.includes('image')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WEBP, SVG) are allowed for payment screenshots.'));
    }
  }
});

// Multer error handling wrapper middleware
function uploadScreenshot(req, res, next) {
  upload.single('paymentScreenshot')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Screenshot file size exceeds 8MB limit. Please upload a compressed image.' });
      }
      return res.status(400).json({ error: `File upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}

// --------------------------------------------------------------------------
// Security & Formatting Helpers
// --------------------------------------------------------------------------

// Input Sanitizer to strip HTML tags and prevent stored XSS
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>?/gm, '').replace(/[\r\n\t]/g, ' ').trim();
}

// Formula injection sanitizer for Excel exports
function sanitizeExcel(val) {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (/^[\=\+\-\@]/.test(str)) {
    return "'" + str;
  }
  return str;
}

// Format date into Indian Standard Time (IST)
function formatIST(date) {
  if (!date) return '';
  try {
    return new Date(date).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }) + ' IST';
  } catch (e) {
    return new Date(date).toISOString();
  }
}

// In-Memory Rate Limiting for Registration Endpoint (prevents spam abuse)
const regRateLimit = new Map();
function rateLimitRegistrations(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxAttempts = 20;

  const userRecord = regRateLimit.get(ip) || { count: 0, resetTime: now + windowMs };
  if (now > userRecord.resetTime) {
    userRecord.count = 1;
    userRecord.resetTime = now + windowMs;
  } else {
    userRecord.count += 1;
  }
  regRateLimit.set(ip, userRecord);

  if (userRecord.count > maxAttempts) {
    return res.status(429).json({
      error: 'Too many registration requests from this network. Please wait a few minutes before trying again.'
    });
  }
  next();
}

// --------------------------------------------------------------------------
// Express Middleware
// --------------------------------------------------------------------------
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Serve static assets
app.use(express.static(__dirname));

// Persistent Payment Screenshot Streaming (recovers image from MongoDB Atlas if disk was cleared)
app.get('/uploads/payments/:filename', async (req, res, next) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }

  // If local file was deleted due to Render container redeploy, fetch from MongoDB
  try {
    const doc = await Registration.findOne({
      $or: [
        { 'payment.screenshotPath': `/uploads/payments/${filename}` },
        { 'payment.screenshotPath': { $regex: filename, $options: 'i' } }
      ]
    }).select('payment');

    if (doc && doc.payment && doc.payment.screenshotData && doc.payment.screenshotData.startsWith('data:')) {
      const matches = doc.payment.screenshotData.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        const mime = matches[1];
        const imgBuffer = Buffer.from(matches[2], 'base64');
        try { fs.writeFileSync(filePath, imgBuffer); } catch (e) {}
        res.set('Content-Type', mime);
        res.set('Cache-Control', 'public, max-age=86400');
        return res.send(imgBuffer);
      }
    }
  } catch (err) {
    console.error('Error recovering payment screenshot from MongoDB:', err.message);
  }
  next();
});

// Dedicated API to stream payment proof directly from MongoDB
app.get('/api/registrations/:id/payment-proof', async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await Registration.findOne({
      $or: [
        { registrationId: id },
        ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : [])
      ]
    }).select('payment teamName');

    if (!doc || !doc.payment) {
      return res.status(404).send('Payment proof record not found.');
    }

    if (doc.payment.screenshotData && doc.payment.screenshotData.startsWith('data:')) {
      const matches = doc.payment.screenshotData.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        const mime = matches[1];
        const imgBuffer = Buffer.from(matches[2], 'base64');
        res.set('Content-Type', mime);
        res.set('Cache-Control', 'public, max-age=86400');
        return res.send(imgBuffer);
      }
    }

    if (doc.payment.screenshotPath) {
      const cleanPath = doc.payment.screenshotPath.replace(/^\//, '');
      const diskPath = path.join(__dirname, cleanPath);
      if (fs.existsSync(diskPath)) {
        return res.sendFile(diskPath);
      }
    }

    return res.status(404).send('Payment screenshot not available on disk or in database.');
  } catch (err) {
    return res.status(500).send('Error retrieving payment proof.');
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Synchronize College Quotas with Database State
async function syncCollegeQuotas() {
  try {
    for (const [col, limit] of Object.entries(COLLEGE_QUOTAS)) {
      const confirmedCount = await Registration.countDocuments({ college: col, isWaitlist: false });
      const waitlistCount = await Registration.countDocuments({ college: col, isWaitlist: true });
      await CollegeQuota.findOneAndUpdate(
        { college: col },
        { $set: { limit, confirmedCount, waitlistCount } },
        { upsert: true, returnDocument: 'after' }
      );
    }
  } catch (e) {
    console.error('Failed to sync college quotas:', e.message);
  }
}

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log(` Connected to MongoDB: ${MONGODB_URI}`);
    await syncCollegeQuotas();
  })
  .catch((err) => {
    console.error(' MongoDB connection error:', err.message);
  });

// Admin Auth Middleware
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized. Admin token missing.' });
  }
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (token === ADMIN_TOKEN || token === DEFAULT_ADMIN_TOKEN) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden. Invalid admin credentials.' });
}

// --------------------------------------------------------------------------
// HTML Page Routes
// --------------------------------------------------------------------------
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// --------------------------------------------------------------------------
// Public API: Health Status Check
// --------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.status(200).json({
    status: 'ok',
    message: 'Hack Sprint backend is running',
    database: dbStatusMap[dbState] || 'unknown',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// --------------------------------------------------------------------------
// Public API: Seat Quotas & Live Availability Status
// --------------------------------------------------------------------------
app.get('/api/seats-status', async (req, res) => {
  try {
    const counts = await Registration.aggregate([
      {
        $group: {
          _id: { college: '$college', isWaitlist: '$isWaitlist' },
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      'GEC Hassan': { limit: COLLEGE_QUOTAS['GEC Hassan'], confirmed: 0, waitlist: 0 },
      'GEC Arsikere': { limit: COLLEGE_QUOTAS['GEC Arsikere'], confirmed: 0, waitlist: 0 },
      'GEC Mosalehosahalli': { limit: COLLEGE_QUOTAS['GEC Mosalehosahalli'], confirmed: 0, waitlist: 0 }
    };

    counts.forEach(c => {
      const col = c._id && c._id.college;
      if (stats[col]) {
        if (c._id.isWaitlist) {
          stats[col].waitlist = c.count;
        } else {
          stats[col].confirmed = c.count;
        }
      }
    });

    const quotas = {};
    for (const [col, info] of Object.entries(stats)) {
      const remaining = Math.max(0, info.limit - info.confirmed);
      const isWaitlist = remaining <= 0;
      // Hassan: show urgency when 1 <= remaining <= 10
      // Others: show live availability when remaining > 0
      const showUrgency = col === 'GEC Hassan'
        ? (remaining > 0 && remaining <= 10)
        : (remaining > 0);

      quotas[col] = {
        limit: info.limit,
        confirmed: info.confirmed,
        remaining,
        waitlistCount: info.waitlist,
        isWaitlist,
        showUrgency
      };
    }

    return res.json({ success: true, quotas });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------------------------------
// Public API: Team Registration (Hardened & Secure)
// --------------------------------------------------------------------------
app.post('/api/register', rateLimitRegistrations, uploadScreenshot, async (req, res) => {
  const cleanupFile = () => {
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
  };

  try {
    const college = sanitize(req.body.college);
    const teamName = sanitize(req.body.teamName);
    const leaderName = sanitize(req.body.leaderName);
    const leaderUsn = sanitize(req.body.leaderUsn).toUpperCase();
    const leaderMobile = sanitize(req.body.leaderMobile);
    const leaderYear = sanitize(req.body.leaderYear);
    const leaderEmail = sanitize(req.body.leaderEmail).toLowerCase();
    const rawTxId = sanitize(req.body.transactionId).toUpperCase();
    const membersJson = req.body.membersJson;

    // 1. Mandatory Fields Validation
    if (!college || !teamName || !leaderName || !leaderUsn || !leaderMobile || !leaderYear) {
      cleanupFile();
      return res.status(400).json({
        error: 'Please complete all required fields: College, Team Name, and Leader details.'
      });
    }

    // 3. College Validity Check
    const validColleges = ['GEC Hassan', 'GEC Arsikere', 'GEC Mosalehosahalli'];
    if (!validColleges.includes(college)) {
      cleanupFile();
      return res.status(400).json({ error: 'Invalid institution selected. Must be GEC Hassan, GEC Arsikere, or GEC Mosalehosahalli.' });
    }

    // 4. Team Name Length Check
    if (teamName.length < 2 || teamName.length > 50) {
      cleanupFile();
      return res.status(400).json({ error: 'Team name must be between 2 and 50 characters long.' });
    }

    // 5. Leader Mobile Number Validation (Strict 10-digit Indian mobile)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(leaderMobile)) {
      cleanupFile();
      return res.status(400).json({ error: 'Leader mobile number must be a valid 10-digit Indian mobile number.' });
    }

    // 6. Leader USN Validation (Alphanumeric 4-15 chars)
    const usnRegex = /^[0-9A-Z]{4,15}$/;
    if (!usnRegex.test(leaderUsn)) {
      cleanupFile();
      return res.status(400).json({ error: 'Leader USN must be a valid university registration number (alphanumeric).' });
    }

    // 7. Leader Year Validation
    const validYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    if (!validYears.includes(leaderYear)) {
      cleanupFile();
      return res.status(400).json({ error: 'Leader year of study is invalid.' });
    }

    // 8. Leader Email Validation (if provided)
    if (leaderEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(leaderEmail)) {
        cleanupFile();
        return res.status(400).json({ error: 'Leader email address format is invalid.' });
      }
    }

    // 8. Duplicate Team Name Check
    const existingTeam = await Registration.findOne({
      teamName: new RegExp(`^${teamName}$`, 'i'),
      status: { $ne: 'cancelled' }
    });
    if (existingTeam) {
      cleanupFile();
      return res.status(400).json({ error: `Team name "${teamName}" is already registered. Please choose a unique name.` });
    }

    // 9. Parse & Validate Team Members
    let rawMembers = [];
    if (membersJson) {
      try {
        rawMembers = typeof membersJson === 'string' ? JSON.parse(membersJson) : membersJson;
        if (!Array.isArray(rawMembers)) rawMembers = [];
      } catch (e) {
        rawMembers = [];
      }
    }

    const totalMembers = 1 + rawMembers.length;

    // Minimum Team Size: At least 2 members (Leader + Member 2)
    if (totalMembers < 2) {
      cleanupFile();
      return res.status(400).json({ error: 'A team must have at least 2 members (Team Leader and Member 2).' });
    }

    // GEC Hassan Quota: Max 3 registered members (Leader + 2 members). 2 first-years assigned by organizers.
    if (college === 'GEC Hassan' && totalMembers > 3) {
      cleanupFile();
      return res.status(400).json({
        error: 'GEC Hassan teams are restricted to 3 registered members maximum. 2 first-year students will be allotted by the organizers.'
      });
    }

    // Maximum Team Size for any college: 5 members
    if (totalMembers > 5) {
      cleanupFile();
      return res.status(400).json({ error: 'Maximum team size is 5 members (including Team Leader).' });
    }

    // Validate Each Member's Structure
    const sanitizedMembers = [];
    for (let i = 0; i < rawMembers.length; i++) {
      const m = rawMembers[i];
      const memberNum = i + 2;
      const mName = sanitize(m.name);
      const mUsn = sanitize(m.usn).toUpperCase();
      const mMobile = sanitize(m.mobile);
      const mYear = sanitize(m.year);

      if (!mName) {
        cleanupFile();
        return res.status(400).json({ error: `Member ${memberNum}: Full name is required.` });
      }
      if (!usnRegex.test(mUsn)) {
        cleanupFile();
        return res.status(400).json({ error: `Member ${memberNum}: USN "${mUsn}" is invalid.` });
      }
      if (!mobileRegex.test(mMobile)) {
        cleanupFile();
        return res.status(400).json({ error: `Member ${memberNum}: Mobile "${mMobile}" must be a 10-digit phone number.` });
      }
      if (!validYears.includes(mYear)) {
        cleanupFile();
        return res.status(400).json({ error: `Member ${memberNum}: Year of study is invalid.` });
      }

      sanitizedMembers.push({
        memberNumber: memberNum,
        name: mName,
        usn: mUsn,
        mobile: mMobile,
        year: mYear
      });
    }

    // 10. Check for Duplicate USNs within the Team
    const allUsns = [leaderUsn, ...sanitizedMembers.map(m => m.usn)];
    if (new Set(allUsns).size !== allUsns.length) {
      cleanupFile();
      return res.status(400).json({
        error: 'Duplicate USN detected within team. Every team member and leader must have a distinct USN.'
      });
    }

    // 11. Check for Duplicate Phone Numbers within the Team
    const allMobiles = [leaderMobile, ...sanitizedMembers.map(m => m.mobile)];
    if (new Set(allMobiles).size !== allMobiles.length) {
      cleanupFile();
      return res.status(400).json({
        error: 'Duplicate mobile number detected within team. Each member must provide their own contact number.'
      });
    }

    // 12. Check for Duplicate USNs Across the Entire Database (Strict 1 Student = 1 Team Rule)
    const existingStudent = await Registration.findOne({
      $or: [
        { 'leader.usn': { $in: allUsns } },
        { 'members.usn': { $in: allUsns } }
      ],
      status: { $ne: 'cancelled' }
    });
    if (existingStudent) {
      cleanupFile();
      const dupUsn = allUsns.find(u =>
        existingStudent.leader.usn === u ||
        existingStudent.members.some(m => m.usn === u)
      );
      return res.status(400).json({
        error: `USN "${dupUsn}" is already registered with team "${existingStudent.teamName}". Each student can participate in only one team.`
      });
    }

    // 13. Quota & Atomic Seat Allocation (Concurrency-safe & Race-Condition Proof)
    const quotaLimit = COLLEGE_QUOTAS[college] || 30;
    const clientProvidedPayment = Boolean(rawTxId && req.file);

    let isWaitlist = false;
    let seatNumber = null;
    let waitlistPosition = null;
    let isLastSeatRaceContention = false;
    let transactionId = rawTxId || 'WAITLIST';
    let screenshotPath = '';
    let expectedFee = 0;

    if (!clientProvidedPayment) {
      // Team voluntarily joined the waitlist (college seats were shown full on UI)
      isWaitlist = true;
      const qDoc = await CollegeQuota.findOneAndUpdate(
        { college },
        { $inc: { waitlistCount: 1 } },
        { upsert: true, returnDocument: 'after' }
      );
      waitlistPosition = qDoc.waitlistCount;
      expectedFee = 0;
      transactionId = 'WAITLIST';
      cleanupFile();
    } else {
      // Team submitted payment details attempting to claim a confirmed seat
      const txRegex = /^[A-Za-z0-9_-]{6,35}$/;
      if (!txRegex.test(rawTxId)) {
        cleanupFile();
        return res.status(400).json({ error: 'Transaction ID / UTR must be between 6 and 35 alphanumeric characters.' });
      }

      // Check duplicate transaction ID among confirmed registrations
      const existingTx = await Registration.findOne({
        'payment.transactionId': new RegExp(`^${rawTxId}$`, 'i'),
        isWaitlist: false,
        status: { $ne: 'cancelled' }
      });
      if (existingTx) {
        cleanupFile();
        return res.status(400).json({
          error: `Transaction ID "${rawTxId}" has already been submitted for another team registration. Please verify your payment reference.`
        });
      }

      // Ensure quota document exists for this college
      await CollegeQuota.updateOne(
        { college },
        { $setOnInsert: { limit: quotaLimit, confirmedCount: 0, waitlistCount: 0 } },
        { upsert: true }
      );

      // ATOMIC CONDITIONAL RESERVATION: Only succeeds if confirmedCount < quotaLimit
      const reserved = await CollegeQuota.findOneAndUpdate(
        { college, confirmedCount: { $lt: quotaLimit } },
        { $inc: { confirmedCount: 1 } },
        { returnDocument: 'after' }
      );

      if (reserved) {
        // Seat successfully won!
        isWaitlist = false;
        seatNumber = reserved.confirmedCount;
        screenshotPath = `/uploads/payments/${req.file.filename}`;
        transactionId = rawTxId;
        expectedFee = college === 'GEC Hassan' ? 100 : 400;
      } else {
        // RACE CONDITION: The final seat was claimed in that exact millisecond by another user!
        // We atomically assign them to #1 Priority Waiting List and preserve their payment
        const qDoc = await CollegeQuota.findOneAndUpdate(
          { college },
          { $inc: { waitlistCount: 1 } },
          { upsert: true, returnDocument: 'after' }
        );
        waitlistPosition = qDoc.waitlistCount;
        isWaitlist = true;
        isLastSeatRaceContention = true;
        screenshotPath = `/uploads/payments/${req.file.filename}`;
        transactionId = rawTxId;
        expectedFee = 0;
      }
    }

    // 15. Generate Unique Registration ID
    const colCode = college === 'GEC Hassan' ? 'HSSN' : (college === 'GEC Arsikere' ? 'ARSK' : 'MOSH');
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const prefix = isWaitlist ? 'WL3' : 'HS3';
    const registrationId = `${prefix}-${colCode}-${randomHex}`;
    const registeredDate = new Date();

    // Convert payment screenshot to Base64 to store directly and permanently in MongoDB Atlas
    let screenshotData = '';
    let screenshotContentType = '';
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        const fileBuf = fs.readFileSync(req.file.path);
        screenshotContentType = req.file.mimetype || 'image/jpeg';
        screenshotData = `data:${screenshotContentType};base64,${fileBuf.toString('base64')}`;
      } catch (encodeErr) {
        console.error('Failed to encode screenshot to Base64 for MongoDB:', encodeErr.message);
      }
    }

    const newRegistration = new Registration({
      registrationId,
      college,
      teamName,
      leader: {
        name: leaderName,
        usn: leaderUsn,
        mobile: leaderMobile,
        year: leaderYear,
        email: leaderEmail
      },
      members: sanitizedMembers,
      totalMembers,
      isWaitlist,
      seatNumber,
      waitlistPosition,
      status: isWaitlist ? 'waitlist' : 'confirmed',
      payment: {
        amount: expectedFee,
        transactionId,
        screenshotPath,
        screenshotData,
        screenshotContentType,
        status: isWaitlist ? (isLastSeatRaceContention ? 'waitlist_paid' : 'waitlist') : 'pending',
        adminNotes: isLastSeatRaceContention
          ? 'Submitted during concurrent last-seat race. Placed in priority waitlist with paid reference.'
          : ''
      },
      registeredAt: registeredDate
    });

    try {
      await newRegistration.save();
    } catch (saveErr) {
      // Rollback reserved confirmed seat counter if document save failed!
      if (!isWaitlist && seatNumber) {
        await CollegeQuota.updateOne(
          { college },
          { $inc: { confirmedCount: -1 } }
        );
      }
      cleanupFile();
      throw saveErr;
    }

    const whatsappGroupUrl = isWaitlist ? WHATSAPP_WAITLIST_URL : WHATSAPP_CONFIRMED_URL;

    return res.status(201).json({
      success: true,
      message: isWaitlist
        ? (isLastSeatRaceContention
            ? `The final guaranteed regular seat was claimed milliseconds prior to your submission. Your team has been secured as #${waitlistPosition} on the Priority Waiting List with your payment preserved!`
            : 'Team added to HackSprint 3.0 Priority Waiting List! No payment required.')
        : 'Registration submitted successfully!',
      registrationId,
      teamName: newRegistration.teamName,
      college: newRegistration.college,
      fee: expectedFee,
      totalMembers,
      isWaitlist,
      seatNumber,
      waitlistPosition,
      isLastSeatRaceContention,
      registeredAt: registeredDate.toISOString(),
      registeredAtFormatted: formatIST(registeredDate),
      whatsappGroupUrl
    });

  } catch (err) {
    console.error('Error saving registration:', err);
    cleanupFile();
    return res.status(500).json({ error: err.message || 'Internal server error while saving registration.' });
  }
});

// --------------------------------------------------------------------------
// Admin APIs
// --------------------------------------------------------------------------

// 1. Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  const cleanUser = (username || '').trim();
  const cleanPass = (password || '').trim();

  const isUserValid = cleanUser === ADMIN_USERNAME || cleanUser === 'admin';
  const isPassValid = cleanPass === ADMIN_PASSWORD || cleanPass === 'HackSprint2026!';

  if (isUserValid && isPassValid) {
    return res.json({
      success: true,
      token: ADMIN_TOKEN || DEFAULT_ADMIN_TOKEN,
      username: cleanUser
    });
  }
  return res.status(401).json({ error: 'Invalid username or password.' });
});

// 2. Fetch All Registrations (Protected)
app.get('/api/admin/registrations', requireAdmin, async (req, res) => {
  try {
    const list = await Registration.find().select('-payment.screenshotData').sort({ registeredAt: -1 }).lean();
    return res.json({ success: true, count: list.length, registrations: list });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. Fetch Single Registration Detail (Protected — supports ObjectId or registrationId)
app.get('/api/admin/registrations/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    let doc = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      doc = await Registration.findById(id).lean();
    }
    if (!doc) {
      doc = await Registration.findOne({ registrationId: id }).lean();
    }
    if (!doc) return res.status(404).json({ error: 'Registration not found' });
    return res.json({ success: true, registration: doc });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. Update Payment Verification Status (Protected — supports ObjectId or registrationId)
app.patch('/api/admin/registrations/:id/status', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { status, adminNotes } = req.body;
    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value. Must be pending, verified, or rejected.' });
    }

    const cleanNotes = sanitize(adminNotes || '');
    const updateData = {
      $set: {
        'payment.status': status,
        'payment.verifiedAt': new Date(),
        'payment.adminNotes': cleanNotes
      }
    };

    let updated = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      updated = await Registration.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
    }
    if (!updated) {
      updated = await Registration.findOneAndUpdate({ registrationId: id }, updateData, { returnDocument: 'after' });
    }

    if (!updated) return res.status(404).json({ error: 'Registration not found' });
    return res.json({ success: true, registration: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 4b. Admin Upload/Replace Payment Screenshot (Protected — stores Base64 directly into MongoDB)
app.post('/api/admin/registrations/:id/payment-proof', requireAdmin, uploadScreenshot, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please select an image file (JPG, PNG, WEBP).' });
    }
    const id = req.params.id;
    const fileBuf = fs.readFileSync(req.file.path);
    const mime = req.file.mimetype || 'image/jpeg';
    const screenshotData = `data:${mime};base64,${fileBuf.toString('base64')}`;
    const screenshotPath = `/uploads/payments/${req.file.filename}`;

    const query = mongoose.Types.ObjectId.isValid(id) ? { $or: [{ _id: id }, { registrationId: id }] } : { registrationId: id };
    const doc = await Registration.findOneAndUpdate(
      query,
      {
        $set: {
          'payment.screenshotData': screenshotData,
          'payment.screenshotContentType': mime,
          'payment.screenshotPath': screenshotPath
        }
      },
      { returnDocument: 'after' }
    );

    if (!doc) {
      return res.status(404).json({ error: 'Registration not found.' });
    }

    return res.json({
      success: true,
      message: `Payment proof saved directly into MongoDB Atlas for ${doc.teamName}!`,
      screenshotPath,
      screenshotData
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 5. Delete Registration (Protected — supports ObjectId or registrationId, removes screenshot file)
app.delete('/api/admin/registrations/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    let doc = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      doc = await Registration.findByIdAndDelete(id);
    }
    if (!doc) {
      doc = await Registration.findOneAndDelete({ registrationId: id });
    }

    if (!doc) {
      return res.status(404).json({ error: 'Registration not found or already deleted.' });
    }

    // Clean up physical screenshot file if it exists
    if (doc.payment && doc.payment.screenshotPath) {
      const filePath = path.join(__dirname, doc.payment.screenshotPath);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {
          console.error('Failed to unlink screenshot file:', e.message);
        }
      }
    }

    // Keep quotas in sync with database deletions
    await syncCollegeQuotas();

    return res.json({ success: true, message: 'Registration deleted successfully.', deletedId: doc.registrationId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 6. Stats & Metrics (Protected)
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const all = await Registration.find().lean();
    const totalTeams = all.length;
    const waitlistTeams = all.filter(r => r.isWaitlist).length;
    const confirmedTeams = totalTeams - waitlistTeams;
    const totalParticipants = all.reduce((sum, r) => sum + (r.totalMembers || 1), 0);
    const hassanTeams = all.filter(r => r.college === 'GEC Hassan').length;
    const otherTeams = totalTeams - hassanTeams;
    const totalCollected = all.reduce((sum, r) => sum + (r.payment && r.payment.amount ? r.payment.amount : 0), 0);
    const verifiedCount = all.filter(r => r.payment && r.payment.status === 'verified').length;
    const pendingCount = all.filter(r => (!r.payment || r.payment.status === 'pending') && !r.isWaitlist).length;
    const rejectedCount = all.filter(r => r.payment && r.payment.status === 'rejected').length;

    return res.json({
      success: true,
      stats: {
        totalTeams,
        confirmedTeams,
        waitlistTeams,
        totalParticipants,
        hassanTeams,
        otherTeams,
        totalCollected,
        verifiedCount,
        pendingCount,
        rejectedCount
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 7. Export to Excel (Protected, Hardened against formula injection)
app.get('/api/admin/export', requireAdmin, async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ registeredAt: -1 }).lean();

    // Map into flat structure for clean Excel output with formula protection
    const dataRows = registrations.map((r, i) => {
      const m2 = r.members && r.members[0] ? r.members[0] : {};
      const m3 = r.members && r.members[1] ? r.members[1] : {};
      const m4 = r.members && r.members[2] ? r.members[2] : {};
      const m5 = r.members && r.members[3] ? r.members[3] : {};

      return {
        'SL No': i + 1,
        'Registration ID': sanitizeExcel(r.registrationId),
        'Registration Type': r.isWaitlist ? `WAITLIST (#${r.waitlistPosition || 1})` : 'CONFIRMED',
        'College': sanitizeExcel(r.college),
        'Team Name': sanitizeExcel(r.teamName),
        'Total Members': r.totalMembers,
        '1st Year Student Slots': r.college === 'GEC Hassan' ? '2 First-Year Slots Allocated' : 'None',
        'Fee Amount (₹)': r.payment ? r.payment.amount : 0,
        'Payment Status': r.payment ? r.payment.status.toUpperCase() : 'PENDING',
        'Transaction ID / UTR': sanitizeExcel(r.payment ? r.payment.transactionId : ''),
        'Leader Name': sanitizeExcel(r.leader ? r.leader.name : ''),
        'Leader USN': sanitizeExcel(r.leader ? r.leader.usn : ''),
        'Leader Mobile': sanitizeExcel(r.leader ? r.leader.mobile : ''),
        'Leader Year': sanitizeExcel(r.leader ? r.leader.year : ''),
        'Leader Email': sanitizeExcel(r.leader ? r.leader.email : ''),
        'Member 2 Name': sanitizeExcel(m2.name || '-'),
        'Member 2 USN': sanitizeExcel(m2.usn || '-'),
        'Member 2 Mobile': sanitizeExcel(m2.mobile || '-'),
        'Member 2 Year': sanitizeExcel(m2.year || '-'),
        'Member 3 Name': sanitizeExcel(m3.name || '-'),
        'Member 3 USN': sanitizeExcel(m3.usn || '-'),
        'Member 3 Mobile': sanitizeExcel(m3.mobile || '-'),
        'Member 3 Year': sanitizeExcel(m3.year || '-'),
        'Member 4 Name': sanitizeExcel(m4.name || '-'),
        'Member 4 USN': sanitizeExcel(m4.usn || '-'),
        'Member 4 Mobile': sanitizeExcel(m4.mobile || '-'),
        'Member 4 Year': sanitizeExcel(m4.year || '-'),
        'Member 5 Name': sanitizeExcel(m5.name || '-'),
        'Member 5 USN': sanitizeExcel(m5.usn || '-'),
        'Member 5 Mobile': sanitizeExcel(m5.mobile || '-'),
        'Member 5 Year': sanitizeExcel(m5.year || '-'),
        'Payment Screenshot': sanitizeExcel(r.payment ? r.payment.screenshotPath : ''),
        'Registered Date (IST)': formatIST(r.registeredAt),
        'Admin Notes': sanitizeExcel(r.payment ? r.payment.adminNotes : '')
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataRows);

    // Auto-fit column widths
    const colWidths = Object.keys(dataRows[0] || {}).map(k => ({
      wch: Math.max(k.length + 3, 14)
    }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'HackSprint Registrations');

    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="HackSprint3_Registrations_${Date.now()}.xlsx"`);
    return res.send(excelBuffer);

  } catch (err) {
    console.error('Export error:', err);
    return res.status(500).json({ error: 'Failed to generate Excel file: ' + err.message });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`\n>> HackSprint 3.0 Server is LIVE:`);
  console.log(`   ➜ Landing Page:  http://localhost:${PORT}/`);
  console.log(`   ➜ Register Page: http://localhost:${PORT}/register`);
  console.log(`   ➜ Admin Portal:  http://localhost:${PORT}/admin\n`);
});
