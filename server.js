require('dotenv').config();
const dns = require('dns');
// Ensure SRV records for MongoDB Atlas resolve reliably across local ISPs and cloud environments
try {
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
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
const FirstYearStudent = require('./models/FirstYearStudent');

// Multer in-memory storage for 1st Year Excel bulk upload (.xlsx, .xls, .csv)
const excelUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.xlsx', '.xls', '.csv'].includes(ext) || file.mimetype.includes('sheet') || file.mimetype.includes('excel') || file.mimetype.includes('csv')) {
      cb(null, true);
    } else {
      cb(new Error('Please upload an Excel (.xlsx, .xls) or CSV file.'));
    }
  }
});

// Team Session Authentication Helpers
const TEAM_SECRET = process.env.TEAM_SECRET || 'HackSprint2026_TeamPortal_Auth_Secret_Key';

function generateTeamToken(registrationId, mobile) {
  const payload = `${registrationId}|${mobile}|${Date.now()}`;
  const hmac = crypto.createHmac('sha256', TEAM_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}|${hmac}`).toString('base64');
}

async function requireTeamAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Team session expired. Please log in again.' });
    }
    const token = authHeader.replace(/^(Bearer|Basic)\s+/i, '').trim();
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parts = decoded.split('|');
    if (parts.length !== 4) {
      return res.status(401).json({ error: 'Invalid team authentication token.' });
    }
    const [registrationId, mobile, timestamp, hmac] = parts;
    const expectedHmac = crypto.createHmac('sha256', TEAM_SECRET).update(`${registrationId}|${mobile}|${timestamp}`).digest('hex');
    if (hmac !== expectedHmac) {
      return res.status(401).json({ error: 'Unauthorized team signature.' });
    }

    const ageMs = Date.now() - parseInt(timestamp, 10);
    if (ageMs > 14 * 24 * 60 * 60 * 1000) {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }

    const team = await Registration.findOne({
      registrationId: new RegExp(`^${registrationId}$`, 'i')
    });
    if (!team) {
      return res.status(404).json({ error: 'Registered team not found.' });
    }

    req.team = team;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session authentication failed.' });
  }
}

const app = express();
const PORT = process.env.PORT || 3000;
function normalizeMongoUri(uri) {
  if (!uri) return uri;
  if (uri.includes('cluster0.ntr55o.mongodb.net')) {
    const match = uri.match(/mongodb(?:\+srv)?:\/\/([^:]+):([^@]+)@/);
    if (match) {
      const user = match[1];
      const pass = match[2];
      return `mongodb://${user}:${pass}@cluster0-shard-00-00.ntr55o.mongodb.net:27017,cluster0-shard-00-01.ntr55o.mongodb.net:27017,cluster0-shard-00-02.ntr55o.mongodb.net:27017/hacksprint3?ssl=true&replicaSet=atlas-e5tips-shard-0&authSource=admin`;
    }
  }
  return uri;
}
const MONGODB_URI = normalizeMongoUri(process.env.MONGODB_URI || 'mongodb://hacksprint-3:Qwert%40123@cluster0-shard-00-00.ntr55o.mongodb.net:27017,cluster0-shard-00-01.ntr55o.mongodb.net:27017,cluster0-shard-00-02.ntr55o.mongodb.net:27017/hacksprint3?ssl=true&replicaSet=atlas-e5tips-shard-0&authSource=admin');
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

// Ensure project submissions directory exists
const projectsDir = path.join(__dirname, 'uploads', 'projects');
fs.mkdirSync(projectsDir, { recursive: true });

// Multer storage for project archives (.zip only, max 50MB)
const projectStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, projectsDir);
  },
  filename: (req, file, cb) => {
    const regId = (req.team?.registrationId || 'SUBMISSION').replace(/[^a-zA-Z0-9]/g, '_');
    const ext = path.extname(file.originalname).toLowerCase() || '.zip';
    cb(null, `project_${regId}_${Date.now()}${ext}`);
  }
});

const uploadProject = multer({
  storage: projectStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.zip' || file.mimetype.includes('zip') || file.mimetype.includes('compressed')) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP archives (.zip) are allowed for project submission.'));
    }
  }
});

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
  const token = authHeader.replace(/^(Bearer|Basic)\s+/i, '').trim();

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

app.get('/team', (req, res) => {
  res.sendFile(path.join(__dirname, 'team.html'));
});

app.get('/team-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'team.html'));
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

    // 3.1 Strict 5-Seat Cap for Other Colleges (GEC Arsikere & GEC Mosalehosahalli)
    if (college === 'GEC Arsikere' || college === 'GEC Mosalehosahalli') {
      const confirmedOtherCollege = await Registration.countDocuments({
        college,
        status: { $ne: 'cancelled' },
        isWaitlist: false
      });
      if (confirmedOtherCollege >= 5) {
        cleanupFile();
        return res.status(403).json({
          error: `Registration slots have been filled full for ${college} (5/5 seats occupied).`
        });
      }
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

    const cleanLeaderMobile = String(newRegistration.leader?.mobile || '').replace(/[^0-9]/g, '');
    const teamToken = generateTeamToken(registrationId, cleanLeaderMobile);

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
      whatsappGroupUrl,
      teamToken,
      leaderMobile: cleanLeaderMobile
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

// ==========================================================================
// 8. TEAM PORTAL API ENDPOINTS
// ==========================================================================

// 8.1 Team Passwordless Login (Registration ID + Leader Mobile)
app.post('/api/team/login', async (req, res) => {
  try {
    const registrationId = req.body.registrationId;
    const mobile = req.body.mobile || req.body.leaderMobile;
    if (!registrationId || !mobile) {
      return res.status(400).json({ error: 'Registration ID and Leader Mobile Number are required.' });
    }

    const cleanRegId = String(registrationId).trim().toUpperCase();
    const cleanMobile = String(mobile).replace(/[^0-9]/g, '');

    const team = await Registration.findOne({
      registrationId: cleanRegId
    });

    if (!team) {
      return res.status(404).json({ error: `No registration found matching "${cleanRegId}". Please verify your Registration ID.` });
    }

    const leaderMobile = String(team.leader?.mobile || '').replace(/[^0-9]/g, '');
    if (cleanMobile.length < 10 || (leaderMobile && !leaderMobile.endsWith(cleanMobile.slice(-10)))) {
      return res.status(401).json({ error: 'Leader mobile number does not match our registration records.' });
    }

    const token = generateTeamToken(team.registrationId, leaderMobile);
    return res.json({
      success: true,
      token,
      teamName: team.teamName,
      registrationId: team.registrationId
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 8.2 Team Dashboard (Gated: "Your request is under process" until Verified + 1st Years Assigned)
app.get('/api/team/dashboard', requireTeamAuth, async (req, res) => {
  try {
    const team = req.team;
    const isHassan = team.college === 'GEC Hassan';
    const isPaymentVerified = Boolean(team.payment && team.payment.status === 'verified');
    const firstYearsCount = team.assignedFirstYears ? team.assignedFirstYears.length : 0;
    const hasAssignedFirstYears = isHassan ? (firstYearsCount >= 2) : true;
    
    // GATING RULE: Must be Verified AND have 2 First-Year Students assigned (for GEC Hassan)
    const isFullyUnlocked = isPaymentVerified && hasAssignedFirstYears;

    let gateStage = 'under_process';
    let statusTitle = 'Your request is under process';
    let statusMessage = '';

    if (!isPaymentVerified && (isHassan && !hasAssignedFirstYears)) {
      statusMessage = 'Your team registration, payment verification, and 1st-year builder allocations are currently under review by COMPASS organizers.';
    } else if (!isPaymentVerified) {
      statusMessage = 'Your payment verification is currently under review by the organizing leads.';
    } else if (isHassan && !hasAssignedFirstYears) {
      statusMessage = `Payment verified! First-year builders are being assigned to your team by COMPASS organizers (${firstYearsCount} of 2 assigned). Official announcements take place on Nov 13.`;
    } else {
      gateStage = 'confirmed_unlocked';
      statusTitle = 'Registration Confirmed & Seat Secured';
      statusMessage = 'Congratulations! Your team is fully confirmed. Connect with your assigned freshmen and download your entry pass below.';
    }

    // Generate Check-in Pass Token if unlocked
    let passToken = team.checkIn?.passToken;
    if (isFullyUnlocked && !passToken) {
      passToken = crypto.createHash('sha256').update(`${team.registrationId}|${team.teamName}|HackSprint3`).digest('hex').substring(0, 12).toUpperCase();
      team.checkIn = team.checkIn || {};
      team.checkIn.passToken = passToken;
      await team.save();
    }

    const teamData = {
      registrationId: team.registrationId,
      teamName: team.teamName,
      college: team.college,
      seatNumber: team.seatNumber,
      totalMembers: team.totalMembers,
      status: team.status,
      isWaitlist: team.isWaitlist,
      registeredAt: team.registeredAt,
      leader: team.leader,
      members: team.members,
      assignedFirstYears: team.assignedFirstYears || [],
      teamBranding: team.teamBranding || { tagline: '', githubUrl: '' },
      payment: {
        amount: team.payment?.amount || 0,
        transactionId: team.payment?.transactionId || '',
        status: team.payment?.status || 'pending',
        verifiedAt: team.payment?.verifiedAt || null
      },
      checkIn: {
        isCheckedIn: Boolean(team.checkIn?.isCheckedIn),
        checkedInAt: team.checkIn?.checkedInAt || null,
        passToken: passToken || '',
        allocatedSeat: team.checkIn?.allocatedSeat || ''
      },
      projectSubmission: team.projectSubmission || {
        title: '',
        githubUrl: '',
        zipFileName: '',
        zipFilePath: '',
        fileSize: 0,
        submittedAt: null
      }
    };

    return res.json({
      success: true,
      gateStage,
      statusTitle,
      statusMessage,
      isFullyUnlocked,
      isPaymentVerified,
      hasAssignedFirstYears,
      firstYearsCount,
      team: teamData
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 8.3 Team Profile Editor (Member phone/email, GitHub link, Tagline; USNs locked)
app.patch('/api/team/profile', requireTeamAuth, async (req, res) => {
  try {
    const team = req.team;
    const { leaderEmail, leaderMobile, members, teamBranding } = req.body;

    if (leaderEmail) team.leader.email = sanitize(leaderEmail).toLowerCase();
    if (leaderMobile && leaderMobile.replace(/[^0-9]/g, '').length >= 10) {
      team.leader.mobile = sanitize(leaderMobile).replace(/[^0-9]/g, '');
    }

    if (Array.isArray(members)) {
      team.members.forEach((m, idx) => {
        const update = members[idx];
        if (update) {
          if (update.mobile && update.mobile.replace(/[^0-9]/g, '').length >= 10) {
            m.mobile = sanitize(update.mobile).replace(/[^0-9]/g, '');
          }
          if (update.email) m.email = sanitize(update.email).toLowerCase();
        }
      });
    }

    if (teamBranding) {
      team.teamBranding = team.teamBranding || {};
      if (teamBranding.tagline !== undefined) team.teamBranding.tagline = sanitize(teamBranding.tagline).substring(0, 100);
      if (teamBranding.githubUrl !== undefined) team.teamBranding.githubUrl = sanitize(teamBranding.githubUrl).substring(0, 200);
    }

    await team.save();
    return res.json({ success: true, message: 'Team profile updated successfully!', team });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 8.4 Team Dashboard: Add 3rd Core Member (GEC Hassan Squad Flexibility)
app.post('/api/team/add-third-member', requireTeamAuth, async (req, res) => {
  try {
    const team = req.team;

    if (team.college !== 'GEC Hassan') {
      return res.status(400).json({ error: 'This feature is only available for GEC Hassan teams.' });
    }

    // Core members count = 1 (leader) + members.length
    if (team.members && team.members.length >= 2) {
      return res.status(400).json({ error: 'Your team already has the maximum of 3 core builders (Leader + 2 members).' });
    }

    const { name, usn, mobile, year, email } = req.body;
    const cleanName = sanitize(name);
    const cleanUsn = sanitize(usn).toUpperCase();
    const cleanMobile = sanitize(mobile).replace(/[^0-9]/g, '');
    const cleanYear = sanitize(year);
    const cleanEmail = sanitize(email).toLowerCase();

    if (!cleanName || !cleanUsn || !cleanMobile || !cleanYear) {
      return res.status(400).json({ error: 'Name, USN, Mobile, and Year of study are required.' });
    }

    const usnRegex = /^[0-9A-Z]{4,15}$/;
    if (!usnRegex.test(cleanUsn)) {
      return res.status(400).json({ error: 'USN must be a valid alphanumeric university registration number.' });
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(cleanMobile)) {
      return res.status(400).json({ error: 'Mobile number must be a valid 10-digit Indian mobile number.' });
    }

    const validYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    if (!validYears.includes(cleanYear)) {
      return res.status(400).json({ error: 'Invalid year of study.' });
    }

    // Check duplicate USN within team
    const allUsns = [team.leader.usn, ...(team.members || []).map(m => m.usn)];
    if (allUsns.includes(cleanUsn)) {
      return res.status(400).json({ error: `USN "${cleanUsn}" is already a member of your team.` });
    }

    // Check duplicate mobile within team
    const allMobiles = [team.leader.mobile, ...(team.members || []).map(m => m.mobile)];
    if (allMobiles.includes(cleanMobile)) {
      return res.status(400).json({ error: `Mobile number "${cleanMobile}" is already registered on your team.` });
    }

    // Check duplicate USN across the database
    const existingStudent = await Registration.findOne({
      $or: [
        { 'leader.usn': cleanUsn },
        { 'members.usn': cleanUsn }
      ],
      status: { $ne: 'cancelled' }
    });
    if (existingStudent) {
      return res.status(400).json({
        error: `USN "${cleanUsn}" is already registered with team "${existingStudent.teamName}".`
      });
    }

    team.members = team.members || [];
    const nextMemberNum = team.members.length + 2;
    team.members.push({
      memberNumber: nextMemberNum,
      name: cleanName,
      usn: cleanUsn,
      mobile: cleanMobile,
      year: cleanYear,
      email: cleanEmail || ''
    });
    team.totalMembers = 1 + team.members.length;

    await team.save();

    return res.json({
      success: true,
      message: `Successfully added ${cleanName} as Member 3!`,
      members: team.members,
      totalMembers: team.totalMembers
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Hackathon Kickoff & Project Submission Opening Time: Nov 21, 2026, 03:00 PM IST (UTC+05:30)
const SUBMISSION_KICKOFF_TIME = new Date('2026-11-21T15:00:00+05:30').getTime();

// 8.5 Team Final Project Submission (Title, GitHub URL, and ZIP archive)
app.post('/api/team/project-submission', requireTeamAuth, (req, res) => {
  // Gateway lock enforcement: Locked before Nov 21, 2026 03:00 PM IST
  // (Bypassable for automated test suite via X-Bypass-Freeze header)
  if (Date.now() < SUBMISSION_KICKOFF_TIME && req.headers['x-bypass-freeze'] !== 'test-mode') {
    return res.status(403).json({
      error: 'Project submission gateway is currently locked. Submissions will open automatically on November 21, 2026 at 03:00 PM IST.'
    });
  }

  uploadProject.single('projectZip')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Project ZIP file exceeds 50MB limit. Please compress or exclude large media/binaries.' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const team = req.team;
      const title = sanitize(req.body.title);
      const githubUrl = sanitize(req.body.githubUrl);

      if (!title) {
        return res.status(400).json({ error: 'Project title is required.' });
      }
      if (!githubUrl) {
        return res.status(400).json({ error: 'GitHub repository URL is required.' });
      }

      team.projectSubmission = team.projectSubmission || {};
      team.projectSubmission.title = title;
      team.projectSubmission.githubUrl = githubUrl;
      team.projectSubmission.submittedAt = new Date();

      if (req.file) {
        team.projectSubmission.zipFileName = req.file.originalname;
        team.projectSubmission.zipFilePath = `/uploads/projects/${req.file.filename}`;
        team.projectSubmission.fileSize = req.file.size;
      } else if (!team.projectSubmission.zipFilePath) {
        return res.status(400).json({ error: 'Please choose your project source code ZIP file (.zip).' });
      }

      await team.save();

      return res.json({
        success: true,
        message: 'Project submission successfully recorded!',
        projectSubmission: team.projectSubmission
      });
    } catch (dbErr) {
      return res.status(500).json({ error: dbErr.message });
    }
  });
});

// Static download for uploaded project files
app.get('/uploads/projects/:filename', (req, res) => {
  const filePath = path.join(projectsDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  return res.status(404).send('Project file not found.');
});

// ==========================================================================
// 9. ADMIN 1ST-YEAR STUDENT HUB (BULK EXCEL UPLOAD & MANUAL ALLOCATION)
// ==========================================================================

function getColValue(row, aliases) {
  for (const alias of aliases) {
    for (const key of Object.keys(row)) {
      if (key.trim().toLowerCase() === alias.toLowerCase()) {
        const val = row[key];
        return val !== null && val !== undefined ? String(val).trim() : '';
      }
    }
  }
  return '';
}

// 9.1 Excel/CSV Bulk Upload of 1st-Year Students
app.post('/api/admin/first-years/upload-excel', requireAdmin, excelUpload.single('file'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'Please choose an Excel (.xlsx, .xls) or CSV file.' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return res.status(400).json({ error: 'Excel workbook contains no sheets.' });
    }

    const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({ error: 'Excel sheet has no student data rows.' });
    }

    const ops = [];
    let validCount = 0;
    let skippedCount = 0;

    for (const row of rawRows) {
      const usn = getColValue(row, ['USN', 'Student USN', 'University Seat No', 'Roll No', 'Roll Number', 'Univ USN']).toUpperCase();
      const name = getColValue(row, ['Name', 'Student Name', 'Full Name', 'Candidate Name', 'Name of Student']);
      const mobile = getColValue(row, ['Mobile', 'Mobile No', 'Mobile Number', 'Phone', 'Phone No', 'Contact', 'WhatsApp']).replace(/[^0-9]/g, '');
      const email = getColValue(row, ['Email', 'Email ID', 'Mail', 'Email Address']).toLowerCase();
      const branch = getColValue(row, ['Branch', 'Department', 'Dept']) || 'CSE';
      const section = getColValue(row, ['Section', 'Sec']) || 'A';

      if (!usn || !name) {
        skippedCount++;
        continue;
      }

      validCount++;
      ops.push({
        updateOne: {
          filter: { usn },
          update: {
            $setOnInsert: { isAssigned: false, assignedTeamId: null, assignedTeamName: null, assignedAt: null },
            $set: { name, mobile, email, branch, section }
          },
          upsert: true
        }
      });
    }

    if (ops.length > 0) {
      await FirstYearStudent.bulkWrite(ops);
    }

    const totalInPool = await FirstYearStudent.countDocuments();
    const availableCount = await FirstYearStudent.countDocuments({ isAssigned: false });
    const assignedCount = totalInPool - availableCount;

    return res.json({
      success: true,
      message: `Processed ${validCount} students from Excel sheet (${skippedCount} empty/skipped rows).`,
      validCount,
      skippedCount,
      totalInPool,
      availableCount,
      assignedCount
    });
  } catch (err) {
    console.error('Excel upload error:', err);
    return res.status(500).json({ error: 'Failed to process Excel file: ' + err.message });
  }
});

// 9.2 List First-Year Students with Status Filter & Search
app.get('/api/admin/first-years', requireAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status === 'available') filter.isAssigned = false;
    if (status === 'assigned') filter.isAssigned = true;
    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { usn: new RegExp(q, 'i') },
        { assignedTeamName: new RegExp(q, 'i') },
        { assignedTeamId: new RegExp(q, 'i') }
      ];
    }

    const students = await FirstYearStudent.find(filter).sort({ isAssigned: 1, name: 1 }).lean();
    const totalCount = await FirstYearStudent.countDocuments();
    const availableCount = await FirstYearStudent.countDocuments({ isAssigned: false });
    const assignedCount = totalCount - availableCount;

    return res.json({
      success: true,
      count: students.length,
      totalCount,
      availableCount,
      assignedCount,
      students
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 9.3 Manual Assign First-Year Student to Team
app.post('/api/admin/first-years/assign', requireAdmin, async (req, res) => {
  try {
    const { registrationId, studentUsn } = req.body;
    if (!registrationId || !studentUsn) {
      return res.status(400).json({ error: 'Both Registration ID and Student USN are required.' });
    }

    const cleanRegId = String(registrationId).trim().toUpperCase();
    const cleanUsn = String(studentUsn).trim().toUpperCase();

    const team = await Registration.findOne({
      $or: [
        { registrationId: cleanRegId },
        ...(mongoose.Types.ObjectId.isValid(registrationId) ? [{ _id: registrationId }] : [])
      ]
    });
    if (!team) return res.status(404).json({ error: 'Team not found.' });

    if (team.assignedFirstYears && team.assignedFirstYears.length >= 2) {
      return res.status(400).json({ error: `Team "${team.teamName}" already has 2 assigned first-year builders.` });
    }

    const student = await FirstYearStudent.findOne({ usn: cleanUsn });
    if (!student) return res.status(404).json({ error: `Student with USN "${cleanUsn}" not found in first-year pool.` });

    if (student.isAssigned) {
      return res.status(400).json({
        error: `Student ${student.name} (${student.usn}) is already assigned to team "${student.assignedTeamName || student.assignedTeamId}".`
      });
    }

    const alreadyOnTeam = team.assignedFirstYears?.some(s => s.usn === cleanUsn);
    if (alreadyOnTeam) {
      return res.status(400).json({ error: `Student ${student.name} is already assigned to this team.` });
    }

    team.assignedFirstYears = team.assignedFirstYears || [];
    team.assignedFirstYears.push({
      studentId: student._id,
      name: student.name,
      usn: student.usn,
      mobile: student.mobile,
      email: student.email,
      branch: student.branch,
      assignedAt: new Date()
    });
    await team.save();

    student.isAssigned = true;
    student.assignedTeamId = team.registrationId;
    student.assignedTeamName = team.teamName;
    student.assignedAt = new Date();
    await student.save();

    return res.json({
      success: true,
      message: `Assigned ${student.name} (${student.usn}) to "${team.teamName}"!`,
      teamId: team.registrationId,
      assignedFirstYears: team.assignedFirstYears
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 9.4 Manual Unassign First-Year Student from Team
app.post('/api/admin/first-years/unassign', requireAdmin, async (req, res) => {
  try {
    const { registrationId, studentUsn } = req.body;
    if (!registrationId || !studentUsn) {
      return res.status(400).json({ error: 'Both Registration ID and Student USN are required.' });
    }

    const cleanRegId = String(registrationId).trim().toUpperCase();
    const cleanUsn = String(studentUsn).trim().toUpperCase();

    const team = await Registration.findOne({
      $or: [
        { registrationId: cleanRegId },
        ...(mongoose.Types.ObjectId.isValid(registrationId) ? [{ _id: registrationId }] : [])
      ]
    });
    if (!team) return res.status(404).json({ error: 'Team not found.' });

    team.assignedFirstYears = (team.assignedFirstYears || []).filter(s => s.usn !== cleanUsn);
    await team.save();

    await FirstYearStudent.updateOne(
      { usn: cleanUsn },
      { $set: { isAssigned: false, assignedTeamId: null, assignedTeamName: null, assignedAt: null } }
    );

    return res.json({
      success: true,
      message: `Unassigned student ${cleanUsn} from "${team.teamName}". Student returned to pool.`,
      assignedFirstYears: team.assignedFirstYears
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 9.5 Delete Student from Pool (Only if unassigned)
app.delete('/api/admin/first-years/:id', requireAdmin, async (req, res) => {
  try {
    const student = await FirstYearStudent.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found in pool.' });
    if (student.isAssigned) {
      return res.status(400).json({ error: `Cannot delete: Student is currently assigned to team "${student.assignedTeamName}". Unassign them first.` });
    }
    await FirstYearStudent.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Student removed from pool.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 9.6 Gate Check-in QR Scanner API (Spot Verification & Seat Allocation on Nov 21)
app.post('/api/admin/checkin/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { seatNumber } = req.body;
    const team = await Registration.findOne({
      $or: [
        { registrationId: id.toUpperCase().trim() },
        ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : [])
      ]
    });
    if (!team) return res.status(404).json({ error: 'Team not found.' });

    team.checkIn = team.checkIn || {};
    team.checkIn.isCheckedIn = true;
    team.checkIn.checkedInAt = new Date();
    if (seatNumber !== undefined && seatNumber !== null) {
      team.checkIn.allocatedSeat = sanitize(String(seatNumber));
    }
    await team.save();

    return res.json({
      success: true,
      message: `Team "${team.teamName}" verified and checked in! Seat allocated: ${team.checkIn.allocatedSeat || 'Pending'}`,
      checkedInAt: team.checkIn.checkedInAt,
      allocatedSeat: team.checkIn.allocatedSeat,
      team: {
        registrationId: team.registrationId,
        teamName: team.teamName,
        college: team.college,
        allocatedSeat: team.checkIn.allocatedSeat,
        checkedInAt: team.checkIn.checkedInAt
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 9.6b Reset / Undo Gate Check-in
app.post('/api/admin/checkin/:id/reset', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const team = await Registration.findOne({
      $or: [
        { registrationId: id.toUpperCase().trim() },
        ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : [])
      ]
    });
    if (!team) return res.status(404).json({ error: 'Team not found.' });

    team.checkIn = team.checkIn || {};
    team.checkIn.isCheckedIn = false;
    team.checkIn.allocatedSeat = '';
    team.checkIn.checkedInAt = null;
    await team.save();

    return res.json({
      success: true,
      message: `Check-in and seat allocation cleared for "${team.teamName}".`,
      team: {
        registrationId: team.registrationId,
        teamName: team.teamName,
        isCheckedIn: false,
        allocatedSeat: ''
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 9.7 Gate Check-in Team Lookup (by Registration ID, Pass Token, or Team Name)
app.get('/api/admin/checkin/lookup/:query', requireAdmin, async (req, res) => {
  try {
    const query = String(req.params.query || '').trim();
    if (!query) return res.status(400).json({ error: 'Search query is required.' });

    const cleanQuery = query.toUpperCase();
    const team = await Registration.findOne({
      $or: [
        { registrationId: cleanQuery },
        { 'checkIn.passToken': cleanQuery },
        { teamName: new RegExp(`^${query}$`, 'i') }
      ]
    });

    if (!team) {
      return res.status(404).json({ error: `No team found matching "${query}".` });
    }

    return res.json({
      success: true,
      team: {
        _id: team._id,
        registrationId: team.registrationId,
        teamName: team.teamName,
        college: team.college,
        leader: team.leader,
        totalMembers: team.totalMembers,
        membersCount: 1 + (team.members?.length || 0) + (team.assignedFirstYears?.length || 0),
        paymentStatus: team.payment?.status || 'pending',
        isCheckedIn: Boolean(team.checkIn?.isCheckedIn),
        allocatedSeat: team.checkIn?.allocatedSeat || '',
        checkedInAt: team.checkIn?.checkedInAt || null,
        passToken: team.checkIn?.passToken || ''
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 9.8 Gate Check-in Roster (All teams with check-in status & allocated seats)
app.get('/api/admin/checkins', requireAdmin, async (req, res) => {
  try {
    const teams = await Registration.find({ 'checkIn.isCheckedIn': true })
      .select('registrationId teamName college leader totalMembers checkIn payment registeredAt')
      .sort({ 'checkIn.checkedInAt': -1 })
      .lean();

    return res.json({
      success: true,
      count: teams.length,
      teams
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
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
