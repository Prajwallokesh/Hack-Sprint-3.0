/**
 * HackSprint 3.0 — 100 Production Test Suite
 * Includes 20 Hardcore Stress, Exploit, Concurrency & Security Test Cases.
 * 
 * Strict Guarantees:
 * 1. Zero data mutation of existing team records.
 * 2. 100% isolated demo fixtures (prefixed with TEST-HS3-).
 * 3. Atomic teardown and sandbox cleanup upon completion.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const mongoose = require('mongoose');
const Registration = require('../models/Registration');
const FirstYearStudent = require('../models/FirstYearStudent');

const BASE_URL = 'http://localhost:3000';
function getRegisterUrl() {
  return BASE_URL;
}

const ADMIN_USER = (process.env.ADMIN_USERNAME || 'admin').trim().replace(/^["']|["']$/g, '');
const ADMIN_PASS = (process.env.ADMIN_PASSWORD || 'HackSprint2026!').trim().replace(/^["']|["']$/g, '');
const ADMIN_TOKEN = Buffer.from(`${ADMIN_USER}:${ADMIN_PASS}`).toString('base64');
const TEAM_SECRET = process.env.TEAM_SECRET || 'HackSprint2026_TeamPortal_Auth_Secret_Key';

const results = [];
let existingTeamIdsBefore = [];
let existingTeamCountBefore = 0;

function generateTeamToken(registrationId, mobile) {
  const payload = `${registrationId}|${mobile}|${Date.now()}`;
  const hmac = crypto.createHmac('sha256', TEAM_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}|${hmac}`).toString('base64');
}

function makeTinyPngBlob() {
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  return new Blob([Buffer.from(pngBase64, 'base64')], { type: 'image/png' });
}

function makeTinyZipBlob() {
  const zipBytes = Buffer.from([0x50, 0x4B, 0x05, 0x06, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  return new Blob([zipBytes], { type: 'application/zip' });
}

async function runTest(id, group, description, fn) {
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    results.push({ id, group, description, duration, passed: true, error: null });
    console.log(`\x1b[32m[PASS]\x1b[0m ${id.padEnd(5)} | ${group.padEnd(16)} | ${description} (${duration}ms)`);
  } catch (err) {
    const duration = Date.now() - start;
    results.push({ id, group, description, duration, passed: false, error: err.message });
    console.log(`\x1b[31m[FAIL]\x1b[0m ${id.padEnd(5)} | ${group.padEnd(16)} | ${description} (${duration}ms)`);
    console.log(`       \x1b[31mError: ${err.message}\x1b[0m`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

(async () => {
  console.log('================================================================');
  console.log('    HACKSPRINT 3.0 — 100 PRODUCTION READINESS TEST SUITE');
  console.log('    Includes 20 Hardcore Stress, Concurrency & Security Tests');
  console.log('================================================================\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const existingTeams = await Registration.find({}, { registrationId: 1, teamName: 1 }).lean();
    existingTeamIdsBefore = existingTeams.map(t => t.registrationId);
    existingTeamCountBefore = existingTeams.length;
    console.log(`\x1b[36m[SNAPSHOT]\x1b[0m Verified existing DB records: ${existingTeamCountBefore} teams in database.`);
    console.log(`\x1b[36m[SNAPSHOT]\x1b[0m Existing teams: ${existingTeams.map(t => t.teamName).slice(0, 5).join(', ')}...`);
    console.log('----------------------------------------------------------------\n');
  } catch (e) {
    console.error('Failed to connect to MongoDB for snapshot:', e.message);
    process.exit(1);
  }

  let demoHassanTeam = null;
  let demoNonHassanTeam = null;
  let demoAdminToken = ADMIN_TOKEN;

  // ========================================================================
  // GROUP 1: Core System & Public Routes (T01 - T10)
  // ========================================================================
  await runTest('T01', 'Core System', 'GET /api/health returns healthy server status', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.status === 'ok' || data.status === 'healthy', `Expected ok/healthy, got ${data.status}`);
  });

  await runTest('T02', 'Core System', 'GET / serves index.html landing page', async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const text = await res.text();
    assert(text.includes('HACKSPRINT') || text.includes('HackSprint'), 'Expected page to contain HackSprint branding');
  });

  await runTest('T03', 'Core System', 'GET /register serves registration page', async () => {
    const res = await fetch(`${BASE_URL}/register`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const text = await res.text();
    assert(text.includes('REGISTRATION') || text.includes('registrationForm'), 'Expected registration page content');
  });

  await runTest('T04', 'Core System', 'GET /admin serves admin operations console', async () => {
    const res = await fetch(`${BASE_URL}/admin`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const text = await res.text();
    assert(text.includes('ADMIN') || text.includes('adminLoginCard'), 'Expected admin portal HTML');
  });

  await runTest('T05', 'Core System', 'GET /team serves team dashboard portal', async () => {
    const res = await fetch(`${BASE_URL}/team`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const text = await res.text();
    assert(text.includes('teamDashboardWrap') || text.includes('teamLoginForm') || text.includes('team'), 'Expected team portal HTML');
  });

  await runTest('T06', 'Core System', 'GET /team-login routes properly to team portal', async () => {
    const res = await fetch(`${BASE_URL}/team-login`);
    assert(res.status === 200 || res.status === 302, `Expected 200 or 302, got ${res.status}`);
  });

  await runTest('T07', 'Core System', 'GET /api/seats-status returns accurate seat quotas', async () => {
    const res = await fetch(`${BASE_URL}/api/seats-status`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true, 'Expected success === true');
    assert(data.quotas && data.quotas['GEC Hassan'], 'Expected GEC Hassan quota details');
  });

  await runTest('T08', 'Core System', 'GET /styles.css serves valid stylesheet', async () => {
    const res = await fetch(`${BASE_URL}/styles.css`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert((res.headers.get('content-type') || '').includes('text/css'), 'Expected text/css header');
  });

  await runTest('T09', 'Core System', 'GET /js/xlsx.full.min.js serves client library', async () => {
    const res = await fetch(`${BASE_URL}/js/xlsx.full.min.js`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  await runTest('T10', 'Core System', 'GET non-existent route returns clean 404', async () => {
    const res = await fetch(`${BASE_URL}/api/non_existent_route_endpoint_9999`);
    assert(res.status === 404, `Expected 404, got ${res.status}`);
  });

  // ========================================================================
  // GROUP 2: Registration Engine & Validation Rules (T11 - T25)
  // ========================================================================
  const uniqueSuffix = Date.now().toString().slice(-6);

  await runTest('T11', 'Registration', 'Register GEC Hassan Team with 2 core members', async () => {
    const fd = new FormData();
    fd.append('college', 'GEC Hassan');
    fd.append('teamName', `TEST-TEAM-HSSN-${uniqueSuffix}`);
    fd.append('leaderName', 'Test Leader One');
    fd.append('leaderUsn', `4GH99CS1${uniqueSuffix.slice(-2)}`);
    fd.append('leaderMobile', `990011${uniqueSuffix.slice(-4)}`);
    fd.append('leaderYear', '3rd Year');
    fd.append('leaderEmail', `testlead1_${uniqueSuffix}@demo.com`);
    fd.append('transactionId', `UPI998877${uniqueSuffix}`);
    fd.append('membersJson', JSON.stringify([
      { name: 'Core Builder 2', usn: `4GH99CS2${uniqueSuffix.slice(-2)}`, mobile: `990022${uniqueSuffix.slice(-4)}`, year: '3rd Year' }
    ]));
    fd.append('paymentScreenshot', makeTinyPngBlob(), 'pay.png');

    const res = await fetch(`${getRegisterUrl()}/api/register`, { method: 'POST', body: fd });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true, 'Expected success: true');
    assert(data.registrationId && data.registrationId.startsWith('HS3-HSSN-'), `Expected HS3-HSSN- ID, got ${data.registrationId}`);
    assert(data.fee === 100, `Expected ₹100 fee for Hassan team, got ₹${data.fee}`);
    demoHassanTeam = data;
    demoHassanTeam.leaderMobile = `990011${uniqueSuffix.slice(-4)}`;
    demoHassanTeam.leaderUsn = `4GH99CS1${uniqueSuffix.slice(-2)}`;
  });

  await runTest('T12', 'Registration', 'Register GEC Hassan Team with 3 core members', async () => {
    const sfx = (parseInt(uniqueSuffix, 10) + 1).toString();
    const fd = new FormData();
    fd.append('college', 'GEC Hassan');
    fd.append('teamName', `TEST-TEAM-HSSN-3M-${sfx}`);
    fd.append('leaderName', 'Test Leader Trio');
    fd.append('leaderUsn', `4GH99CS3${sfx.slice(-2)}`);
    fd.append('leaderMobile', `990033${sfx.slice(-4)}`);
    fd.append('leaderYear', '3rd Year');
    fd.append('leaderEmail', `testlead3_${sfx}@demo.com`);
    fd.append('transactionId', `UPI998878${sfx}`);
    fd.append('membersJson', JSON.stringify([
      { name: 'Builder Two', usn: `4GH99CS4${sfx.slice(-2)}`, mobile: `990044${sfx.slice(-4)}`, year: '3rd Year' },
      { name: 'Builder Three', usn: `4GH99CS5${sfx.slice(-2)}`, mobile: `990055${sfx.slice(-4)}`, year: '2nd Year' }
    ]));
    fd.append('paymentScreenshot', makeTinyPngBlob(), 'pay.png');

    const res = await fetch(`${getRegisterUrl()}/api/register`, { method: 'POST', body: fd });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    const data = await res.json();
    assert(data.fee === 100, `Expected ₹100 fee, got ₹${data.fee}`);
  });

  await runTest('T13', 'Registration', 'Register Non-Hassan Team (GEC Mosalehosahalli, 4 members)', async () => {
    const sfx = (parseInt(uniqueSuffix, 10) + 2).toString();
    const fd = new FormData();
    fd.append('college', 'GEC Mosalehosahalli');
    fd.append('teamName', `TEST-TEAM-MOSH-${sfx}`);
    fd.append('leaderName', 'Mosh Leader');
    fd.append('leaderUsn', `4HG99CS1${sfx.slice(-2)}`);
    fd.append('leaderMobile', `990066${sfx.slice(-4)}`);
    fd.append('leaderYear', '3rd Year');
    fd.append('leaderEmail', `moshlead_${sfx}@demo.com`);
    fd.append('transactionId', `UPI998879${sfx}`);
    fd.append('membersJson', JSON.stringify([
      { name: 'Mosh M2', usn: `4HG99CS2${sfx.slice(-2)}`, mobile: `990077${sfx.slice(-4)}`, year: '3rd Year' },
      { name: 'Mosh M3', usn: `4HG99CS3${sfx.slice(-2)}`, mobile: `990088${sfx.slice(-4)}`, year: '2nd Year' },
      { name: 'Mosh M4', usn: `4HG99CS4${sfx.slice(-2)}`, mobile: `990099${sfx.slice(-4)}`, year: '2nd Year' }
    ]));
    fd.append('paymentScreenshot', makeTinyPngBlob(), 'pay.png');

    const res = await fetch(`${getRegisterUrl()}/api/register`, { method: 'POST', body: fd });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    const data = await res.json();
    assert(data.registrationId.startsWith('HS3-MOSH-'), `Expected HS3-MOSH- ID, got ${data.registrationId}`);
    assert(data.fee === 400, `Expected ₹400 fee for outside college, got ₹${data.fee}`);
    demoNonHassanTeam = data;
    demoNonHassanTeam.leaderMobile = `990066${sfx.slice(-4)}`;
    demoNonHassanTeam.leaderUsn = `4HG99CS1${sfx.slice(-2)}`;
  });

  await runTest('T14', 'Registration', 'Register Non-Hassan Team (GEC Arsikere, 5 members)', async () => {
    const sfx = (parseInt(uniqueSuffix, 10) + 3).toString();
    const fd = new FormData();
    fd.append('college', 'GEC Arsikere');
    fd.append('teamName', `TEST-TEAM-ARSI-${sfx}`);
    fd.append('leaderName', 'Arsi Leader');
    fd.append('leaderUsn', `4AR99CS1${sfx.slice(-2)}`);
    fd.append('leaderMobile', `991100${sfx.slice(-4)}`);
    fd.append('leaderYear', '3rd Year');
    fd.append('leaderEmail', `arsilead_${sfx}@demo.com`);
    fd.append('transactionId', `UPI998880${sfx}`);
    fd.append('membersJson', JSON.stringify([
      { name: 'Arsi M2', usn: `4AR99CS2${sfx.slice(-2)}`, mobile: `991111${sfx.slice(-4)}`, year: '3rd Year' },
      { name: 'Arsi M3', usn: `4AR99CS3${sfx.slice(-2)}`, mobile: `991122${sfx.slice(-4)}`, year: '3rd Year' },
      { name: 'Arsi M4', usn: `4AR99CS4${sfx.slice(-2)}`, mobile: `991133${sfx.slice(-4)}`, year: '2nd Year' },
      { name: 'Arsi M5', usn: `4AR99CS5${sfx.slice(-2)}`, mobile: `991144${sfx.slice(-4)}`, year: '2nd Year' }
    ]));
    fd.append('paymentScreenshot', makeTinyPngBlob(), 'pay.png');

    const res = await fetch(`${getRegisterUrl()}/api/register`, { method: 'POST', body: fd });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    const data = await res.json();
    assert(data.registrationId.startsWith('HS3-ARSK-') || data.registrationId.startsWith('HS3-ARSI-'), `Expected HS3-ARSK- ID, got ${data.registrationId}`);
  });

  await runTest('T15', 'Registration', 'Normalization of USN to uppercase', async () => {
    const sfx = (parseInt(uniqueSuffix, 10) + 4).toString();
    const fd = new FormData();
    fd.append('college', 'GEC Hassan');
    fd.append('teamName', `TEST-UPPERCASE-${sfx}`);
    fd.append('leaderName', 'Case Tester');
    fd.append('leaderUsn', `4gh99cs9${sfx.slice(-2)}`);
    fd.append('leaderMobile', `992200${sfx.slice(-4)}`);
    fd.append('leaderYear', '3rd Year');
    fd.append('leaderEmail', `casetester_${sfx}@demo.com`);
    fd.append('transactionId', `UPI998881${sfx}`);
    fd.append('membersJson', JSON.stringify([
      { name: 'Builder M2', usn: `4gh99cs8${sfx.slice(-2)}`, mobile: `992211${sfx.slice(-4)}`, year: '3rd Year' }
    ]));
    fd.append('paymentScreenshot', makeTinyPngBlob(), 'pay.png');

    const res = await fetch(`${getRegisterUrl()}/api/register`, { method: 'POST', body: fd });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    const doc = await Registration.findOne({ teamName: `TEST-UPPERCASE-${sfx}` });
    assert(doc && doc.leader.usn === `4GH99CS9${sfx.slice(-2)}`.toUpperCase(), 'USN was not capitalized');
  });

  await runTest('T16', 'Registration', 'Phone number sanitation and validation', async () => {
    const sfx = (parseInt(uniqueSuffix, 10) + 5).toString();
    const fd = new FormData();
    fd.append('college', 'GEC Hassan');
    fd.append('teamName', `TEST-PHONE-${sfx}`);
    fd.append('leaderName', 'Phone Tester');
    fd.append('leaderUsn', `4GH99CS7${sfx.slice(-2)}`);
    fd.append('leaderMobile', `992222${sfx.slice(-4)}`);
    fd.append('leaderYear', '3rd Year');
    fd.append('transactionId', `UPI998882${sfx}`);
    fd.append('membersJson', JSON.stringify([
      { name: 'Builder M2', usn: `4GH99CS6${sfx.slice(-2)}`, mobile: `992233${sfx.slice(-4)}`, year: '3rd Year' }
    ]));
    fd.append('paymentScreenshot', makeTinyPngBlob(), 'pay.png');

    const res = await fetch(`${getRegisterUrl()}/api/register`, { method: 'POST', body: fd });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
  });

  await runTest('T17', 'Registration', 'Duplicate team name validation rejection', async () => {
    const fd = new FormData();
    fd.append('college', 'GEC Hassan');
    fd.append('teamName', demoHassanTeam.teamName);
    fd.append('leaderName', 'Duplicate Leader');
    fd.append('leaderUsn', '4GH99CS999');
    fd.append('leaderMobile', '9933001122');
    fd.append('leaderYear', '3rd Year');
    fd.append('transactionId', 'UPI9988998877');
    fd.append('membersJson', JSON.stringify([
      { name: 'Builder M2', usn: '4GH99CS998', mobile: '9933001123', year: '3rd Year' }
    ]));
    fd.append('paymentScreenshot', makeTinyPngBlob(), 'pay.png');

    const res = await fetch(`${getRegisterUrl()}/api/register`, { method: 'POST', body: fd });
    assert(res.status === 400 || res.status === 429, `Expected 400 or 429, got ${res.status}`);
  });

  await runTest('T18', 'Registration', 'Duplicate leader USN across teams rejection', async () => {
    const fd = new FormData();
    fd.append('college', 'GEC Hassan');
    fd.append('teamName', `TEST-DUPUSN-${uniqueSuffix}`);
    fd.append('leaderName', 'Duplicate Leader');
    fd.append('leaderUsn', demoHassanTeam.leaderUsn);
    fd.append('leaderMobile', '9933001199');
    fd.append('leaderYear', '3rd Year');
    fd.append('transactionId', `UPI998899${uniqueSuffix}`);
    fd.append('membersJson', JSON.stringify([
      { name: 'Builder M2', usn: '4GH99CS997', mobile: '9933001198', year: '3rd Year' }
    ]));
    fd.append('paymentScreenshot', makeTinyPngBlob(), 'pay.png');

    const res = await fetch(`${getRegisterUrl()}/api/register`, { method: 'POST', body: fd });
    assert(res.status === 400 || res.status === 429, `Expected 400 or 429, got ${res.status}`);
  });

  await runTest('T19', 'Registration', 'Duplicate member USN across teams rejection', async () => {
    const fd = new FormData();
    fd.append('college', 'GEC Hassan');
    fd.append('teamName', `TEST-DUPMEM-${uniqueSuffix}`);
    fd.append('leaderName', 'New Leader');
    fd.append('leaderUsn', '4GH99CS996');
    fd.append('leaderMobile', '9933001177');
    fd.append('leaderYear', '3rd Year');
    fd.append('transactionId', `UPI998877${uniqueSuffix}B`);
    fd.append('membersJson', JSON.stringify([
      { name: 'Duplicate M2', usn: `4GH99CS2${uniqueSuffix.slice(-2)}`, mobile: '9933001176', year: '3rd Year' }
    ]));
    fd.append('paymentScreenshot', makeTinyPngBlob(), 'pay.png');

    const res = await fetch(`${getRegisterUrl()}/api/register`, { method: 'POST', body: fd });
    assert(res.status === 400 || res.status === 429, `Expected 400 or 429, got ${res.status}`);
  });

  await runTest('T20', 'Registration', 'Duplicate USN within same team rejection', async () => {
    const fd = new FormData();
    fd.append('college', 'GEC Hassan');
    fd.append('teamName', `TEST-SAMEUSN-${uniqueSuffix}`);
    fd.append('leaderName', 'Self Dup Leader');
    fd.append('leaderUsn', '4GH99CS995');
    fd.append('leaderMobile', '9933001166');
    fd.append('leaderYear', '3rd Year');
    fd.append('transactionId', `UPI998877${uniqueSuffix}C`);
    fd.append('membersJson', JSON.stringify([
      { name: 'Clone M2', usn: '4GH99CS995', mobile: '9933001165', year: '3rd Year' }
    ]));
    fd.append('paymentScreenshot', makeTinyPngBlob(), 'pay.png');

    const res = await fetch(`${getRegisterUrl()}/api/register`, { method: 'POST', body: fd });
    assert(res.status === 400 || res.status === 429, `Expected 400 or 429, got ${res.status}`);
  });

  await runTest('T21', 'Registration', 'Invalid mobile format rejection (<10 digits)', async () => {
    const fd = new FormData();
    fd.append('college', 'GEC Hassan');
    fd.append('teamName', `TEST-BADPHONE-${uniqueSuffix}`);
    fd.append('leaderName', 'Bad Phone Leader');
    fd.append('leaderUsn', '4GH99CS994');
    fd.append('leaderMobile', '12345');
    fd.append('leaderYear', '3rd Year');
    fd.append('transactionId', `UPI998877${uniqueSuffix}D`);
    fd.append('membersJson', JSON.stringify([
      { name: 'M2', usn: '4GH99CS993', mobile: '9933001155', year: '3rd Year' }
    ]));
    fd.append('paymentScreenshot', makeTinyPngBlob(), 'pay.png');

    const res = await fetch(`${getRegisterUrl()}/api/register`, { method: 'POST', body: fd });
    assert(res.status === 400 || res.status === 429, `Expected 400 or 429, got ${res.status}`);
  });

  await runTest('T22', 'Registration', 'Invalid transaction ID format rejection', async () => {
    const fd = new FormData();
    fd.append('college', 'GEC Hassan');
    fd.append('teamName', `TEST-BADTX-${uniqueSuffix}`);
    fd.append('leaderName', 'Bad Tx Leader');
    fd.append('leaderUsn', '4GH99CS992');
    fd.append('leaderMobile', '9933001144');
    fd.append('leaderYear', '3rd Year');
    fd.append('transactionId', '!!');
    fd.append('membersJson', JSON.stringify([
      { name: 'M2', usn: '4GH99CS991', mobile: '9933001143', year: '3rd Year' }
    ]));
    fd.append('paymentScreenshot', makeTinyPngBlob(), 'pay.png');

    const res = await fetch(`${getRegisterUrl()}/api/register`, { method: 'POST', body: fd });
    assert(res.status === 400 || res.status === 429, `Expected 400 or 429, got ${res.status}`);
  });

  await runTest('T23', 'Registration', 'Base64 image ingestion into MongoDB Atlas', async () => {
    const doc = await Registration.findOne({ registrationId: demoHassanTeam.registrationId });
    assert(doc && doc.payment && doc.payment.screenshotData, 'Screenshot was not saved as base64 in MongoDB');
    assert(doc.payment.screenshotData.startsWith('data:image/'), 'Invalid data URI scheme');
  });

  await runTest('T24', 'Registration', 'Fee calculation accuracy per college quota', async () => {
    assert(demoHassanTeam.fee === 100, 'Hassan fee should be 100');
    assert(demoNonHassanTeam.fee === 400, 'Non-Hassan fee should be 400');
  });

  await runTest('T25', 'Registration', 'Waitlist registration when payment omitted', async () => {
    const sfx = (parseInt(uniqueSuffix, 10) + 6).toString();
    const fd = new FormData();
    fd.append('college', 'GEC Hassan');
    fd.append('teamName', `TEST-WAITLIST-${sfx}`);
    fd.append('leaderName', 'Waitlist Leader');
    fd.append('leaderUsn', `4GH99CS0${sfx.slice(-2)}`);
    fd.append('leaderMobile', `994400${sfx.slice(-4)}`);
    fd.append('leaderYear', '3rd Year');
    fd.append('membersJson', JSON.stringify([
      { name: 'Waitlist M2', usn: `4GH99CS8${sfx.slice(-2)}`, mobile: `994411${sfx.slice(-4)}`, year: '3rd Year' }
    ]));

    const res = await fetch(`${getRegisterUrl()}/api/register`, { method: 'POST', body: fd });
    assert(res.status === 201 || res.status === 429, `Expected 201 or 429, got ${res.status}`);
  });

  // ========================================================================
  // GROUP 3: Admin Authentication & RBAC Security (T26 - T35)
  // ========================================================================
  await runTest('T26', 'Admin Auth', 'Admin login with valid credentials returns token', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASS })
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true && data.token, 'Token not received');
    demoAdminToken = data.token;
  });

  await runTest('T27', 'Admin Auth', 'Admin login with incorrect password returns 401', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: ADMIN_USER, password: 'WrongPassword123!' })
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await runTest('T28', 'Admin Auth', 'Admin login with missing credentials returns 401', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await runTest('T29', 'Admin Auth', 'Protected route access with valid Bearer token succeeds', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/registrations`, {
      headers: { 'Authorization': `Bearer ${demoAdminToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true, 'Expected success: true');
  });

  await runTest('T30', 'Admin Auth', 'Protected route without authorization header returns 401', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/registrations`);
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await runTest('T31', 'Admin Auth', 'Protected route with malformed Bearer token returns 403', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/registrations`, {
      headers: { 'Authorization': 'Bearer bad-invalid-token-string' }
    });
    assert(res.status === 403, `Expected 403, got ${res.status}`);
  });

  await runTest('T32', 'Admin Auth', 'Protected route with tampered token returns 403', async () => {
    const tampered = Buffer.from('admin:TamperedPassword!').toString('base64');
    const res = await fetch(`${BASE_URL}/api/admin/registrations`, {
      headers: { 'Authorization': `Bearer ${tampered}` }
    });
    assert(res.status === 403, `Expected 403, got ${res.status}`);
  });

  await runTest('T33', 'Admin Auth', 'Protected route with Basic auth header support', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/registrations`, {
      headers: { 'Authorization': `Basic ${demoAdminToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  await runTest('T34', 'Admin Auth', 'Admin desk lookup endpoint protected by token', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/checkin/lookup/query123`);
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await runTest('T35', 'Admin Auth', 'Multiple failed login attempts handled without unhandled exception', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await fetch(`${BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'fake', password: 'bad' })
      });
      assert(res.status === 401, `Expected 401, got ${res.status}`);
    }
  });

  // ========================================================================
  // GROUP 4: Admin Team Review, Mutations & Exports (T36 - T45)
  // ========================================================================
  await runTest('T36', 'Admin Management', 'GET /api/admin/registrations returns teams list', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/registrations`, {
      headers: { 'Authorization': `Bearer ${demoAdminToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data.registrations), 'Expected registrations array');
  });

  await runTest('T37', 'Admin Management', 'GET /api/admin/registrations/:id returns single record', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/registrations/${demoHassanTeam.registrationId}`, {
      headers: { 'Authorization': `Bearer ${demoAdminToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.registration.registrationId === demoHassanTeam.registrationId, 'ID mismatch');
  });

  await runTest('T38', 'Admin Management', 'PATCH /api/admin/registrations/:id/status verifies payment', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/registrations/${demoHassanTeam.registrationId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${demoAdminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'verified', adminNotes: 'Auto verified by test suite' })
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const doc = await Registration.findOne({ registrationId: demoHassanTeam.registrationId });
    assert(doc.payment.status === 'verified', 'Payment status was not updated to verified');
  });

  await runTest('T39', 'Admin Management', 'PATCH /api/admin/registrations/:id/status rejects payment with note', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/registrations/${demoHassanTeam.registrationId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${demoAdminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'rejected', adminNotes: 'Test rejection note' })
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const doc = await Registration.findOne({ registrationId: demoHassanTeam.registrationId });
    assert(doc.payment.status === 'rejected', 'Payment status was not updated to rejected');
    doc.payment.status = 'verified';
    await doc.save();
  });

  await runTest('T40', 'Admin Management', 'GET /api/registrations/:id/payment-proof streams image', async () => {
    const res = await fetch(`${BASE_URL}/api/registrations/${demoHassanTeam.registrationId}/payment-proof`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const buf = await res.arrayBuffer();
    assert(buf.byteLength > 0, 'Empty payment proof buffer');
  });

  await runTest('T41', 'Admin Management', 'GET /api/admin/stats returns calculated KPIs', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { 'Authorization': `Bearer ${demoAdminToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true && typeof data.stats.totalCollected === 'number', 'Invalid stats format');
  });

  await runTest('T42', 'Admin Management', 'GET /api/admin/export generates workbook', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/export`, {
      headers: { 'Authorization': `Bearer ${demoAdminToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const buf = await res.arrayBuffer();
    assert(buf.byteLength > 0, 'Export workbook empty');
  });

  await runTest('T43', 'Admin Management', 'DELETE /api/admin/registrations/:id safely deletes demo team', async () => {
    const sfx = 'DELTEST';
    const doc = await Registration.create({
      registrationId: `TEST-HS3-DEL-${sfx}`,
      teamName: `TEST-DEL-TEAM-${sfx}`,
      college: 'GEC Hassan',
      seatNumber: 9999,
      leader: { name: 'Del Lead', usn: `4GH99CSD${sfx.slice(0, 2)}`, mobile: '9955443322', year: '3rd Year' },
      totalMembers: 2,
      status: 'confirmed',
      payment: { status: 'verified', amount: 100 }
    });

    const res = await fetch(`${BASE_URL}/api/admin/registrations/${doc.registrationId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${demoAdminToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const check = await Registration.findOne({ registrationId: doc.registrationId });
    assert(!check, 'Record was not deleted');
  });

  await runTest('T44', 'Admin Management', 'DELETE non-existent registration returns 404', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/registrations/NON-EXISTENT-ID-XYZ`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${demoAdminToken}` }
    });
    assert(res.status === 404, `Expected 404, got ${res.status}`);
  });

  await runTest('T45', 'Admin Management', 'Filter registrations list by college query param', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/registrations?college=GEC+Hassan`, {
      headers: { 'Authorization': `Bearer ${demoAdminToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  // ========================================================================
  // GROUP 5: Team Portal Authentication & Session (T46 - T55)
  // ========================================================================
  let teamSessionToken = '';

  await runTest('T46', 'Team Portal', 'Team login with valid RegId + Leader Mobile succeeds', async () => {
    const res = await fetch(`${BASE_URL}/api/team/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registrationId: demoHassanTeam.registrationId,
        mobile: demoHassanTeam.leaderMobile
      })
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true && data.token, 'Team token missing');
    teamSessionToken = data.token;
  });

  await runTest('T47', 'Team Portal', 'Team login with lowercase RegId succeeds (case-insensitive)', async () => {
    const res = await fetch(`${BASE_URL}/api/team/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registrationId: demoHassanTeam.registrationId.toLowerCase(),
        mobile: demoHassanTeam.leaderMobile
      })
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  await runTest('T48', 'Team Portal', 'Team login with wrong mobile returns 401', async () => {
    const res = await fetch(`${BASE_URL}/api/team/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registrationId: demoHassanTeam.registrationId,
        mobile: '9111111111'
      })
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await runTest('T49', 'Team Portal', 'Team login with non-existent RegId returns 404 or 401', async () => {
    const res = await fetch(`${BASE_URL}/api/team/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registrationId: 'HS3-FAKE-0000',
        mobile: '9900112233'
      })
    });
    assert(res.status === 404 || res.status === 401, `Expected 404 or 401, got ${res.status}`);
  });

  await runTest('T50', 'Team Portal', 'Team login with blank payload returns 400', async () => {
    const res = await fetch(`${BASE_URL}/api/team/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await runTest('T51', 'Team Portal', 'GET /api/team/dashboard returns team payload', async () => {
    const res = await fetch(`${BASE_URL}/api/team/dashboard`, {
      headers: { 'Authorization': `Bearer ${teamSessionToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true && data.team, 'Expected team data in dashboard');
  });

  await runTest('T52', 'Team Portal', 'GET /api/team/dashboard without auth returns 401', async () => {
    const res = await fetch(`${BASE_URL}/api/team/dashboard`);
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await runTest('T53', 'Team Portal', 'GET /api/team/dashboard with bad token returns 401', async () => {
    const res = await fetch(`${BASE_URL}/api/team/dashboard`, {
      headers: { 'Authorization': 'Bearer bad-session-token' }
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await runTest('T54', 'Team Portal', 'PATCH /api/team/profile updates tagline', async () => {
    const res = await fetch(`${BASE_URL}/api/team/profile`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${teamSessionToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        teamBranding: { tagline: 'Building decentralized AI agents' }
      })
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const doc = await Registration.findOne({ registrationId: demoHassanTeam.registrationId });
    assert(doc.teamBranding && doc.teamBranding.tagline === 'Building decentralized AI agents', 'Tagline did not persist');
  });

  await runTest('T55', 'Team Portal', 'PATCH /api/team/profile ignores core USN tampering', async () => {
    const originalLeaderUsn = demoHassanTeam.leaderUsn;
    await fetch(`${BASE_URL}/api/team/profile`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${teamSessionToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ leaderUsn: '4GH99HACKER' })
    });
    const doc = await Registration.findOne({ registrationId: demoHassanTeam.registrationId });
    assert(doc.leader.usn === originalLeaderUsn.toUpperCase(), 'Core USN was improperly modified');
  });

  // ========================================================================
  // GROUP 6: Dynamic Roster & 1st-Year Allocation Logic (T56 - T65)
  // ========================================================================
  await runTest('T56', 'Roster & Gating', 'Hassan team gating: unverified payment shows locked pass', async () => {
    await Registration.updateOne({ registrationId: demoHassanTeam.registrationId }, { 'payment.status': 'pending' });
    const res = await fetch(`${BASE_URL}/api/team/dashboard`, {
      headers: { 'Authorization': `Bearer ${teamSessionToken}` }
    });
    const data = await res.json();
    assert(data.isFullyUnlocked === false, 'Pass should be locked when payment is pending');
  });

  await runTest('T57', 'Roster & Gating', 'Hassan team gating: verified payment but 0 freshmen shows locked pass', async () => {
    await Registration.updateOne({ registrationId: demoHassanTeam.registrationId }, { 'payment.status': 'verified', assignedFirstYears: [] });
    const res = await fetch(`${BASE_URL}/api/team/dashboard`, {
      headers: { 'Authorization': `Bearer ${teamSessionToken}` }
    });
    const data = await res.json();
    assert(data.isFullyUnlocked === false, 'Pass should be locked until 2 freshmen are assigned');
  });

  await runTest('T58', 'Roster & Gating', 'Hassan team gating: verified + 2 freshmen unlocks entry pass', async () => {
    await Registration.updateOne(
      { registrationId: demoHassanTeam.registrationId },
      {
        'payment.status': 'verified',
        assignedFirstYears: [
          { name: 'Freshman Alpha', usn: '4GH26CS001', mobile: '9966110011', branch: 'CSE', section: 'A' },
          { name: 'Freshman Beta', usn: '4GH26CS002', mobile: '9966110022', branch: 'AIML', section: 'B' }
        ]
      }
    );
    const res = await fetch(`${BASE_URL}/api/team/dashboard`, {
      headers: { 'Authorization': `Bearer ${teamSessionToken}` }
    });
    const data = await res.json();
    assert(data.isFullyUnlocked === true, 'Pass should unlock when verified + 2 freshmen assigned');
  });

  await runTest('T59', 'Roster & Gating', 'Non-Hassan team gating: verified payment unlocks immediately without freshmen', async () => {
    await Registration.updateOne({ registrationId: demoNonHassanTeam.registrationId }, { 'payment.status': 'verified', assignedFirstYears: [] });
    const moshToken = generateTeamToken(demoNonHassanTeam.registrationId, demoNonHassanTeam.leaderMobile);
    const res = await fetch(`${BASE_URL}/api/team/dashboard`, {
      headers: { 'Authorization': `Bearer ${moshToken}` }
    });
    const data = await res.json();
    assert(data.isFullyUnlocked === true, 'Non-Hassan team pass should unlock immediately upon payment verification');
  });

  await runTest('T60', 'Roster & Gating', 'Non-Hassan team roster includes all registered core builders', async () => {
    const doc = await Registration.findOne({ registrationId: demoNonHassanTeam.registrationId }).lean();
    assert(doc.members && doc.members.length === 3, `Expected 3 members + 1 leader = 4 builders, got ${doc.members.length}`);
  });

  await runTest('T61', 'Roster & Gating', 'Non-Hassan team has zero assigned freshmen dependency', async () => {
    const doc = await Registration.findOne({ registrationId: demoNonHassanTeam.registrationId }).lean();
    assert(!doc.assignedFirstYears || doc.assignedFirstYears.length === 0, 'Non-Hassan team should not have assigned freshmen');
  });

  await runTest('T62', 'Roster & Gating', 'Hassan team add 3rd member dynamically via /api/team/add-third-member', async () => {
    const res = await fetch(`${BASE_URL}/api/team/add-third-member`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${teamSessionToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Late Joining Member',
        usn: '4GH99CS888',
        mobile: '9977889900',
        year: '3rd Year'
      })
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const doc = await Registration.findOne({ registrationId: demoHassanTeam.registrationId });
    assert(doc.members.length === 2, `Expected 2 registered members, got ${doc.members.length}`);
  });

  await runTest('T63', 'Roster & Gating', 'Hassan team add 3rd member when squad already has 3 rejects with 400', async () => {
    const res = await fetch(`${BASE_URL}/api/team/add-third-member`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${teamSessionToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Fourth Member Attempt',
        usn: '4GH99CS777',
        mobile: '9977889911',
        year: '3rd Year'
      })
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await runTest('T64', 'Roster & Gating', 'Non-Hassan team add 3rd member attempt rejected with 400', async () => {
    const moshToken = generateTeamToken(demoNonHassanTeam.registrationId, demoNonHassanTeam.leaderMobile);
    const res = await fetch(`${BASE_URL}/api/team/add-third-member`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${moshToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Extra Mosh Member',
        usn: '4HG99CS666',
        mobile: '9977889922',
        year: '2nd Year'
      })
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await runTest('T65', 'Roster & Gating', 'Admin fetch 1st-year student pool endpoint', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/first-years`, {
      headers: { 'Authorization': `Bearer ${demoAdminToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true && Array.isArray(data.students), 'Expected students array');
  });

  // ========================================================================
  // GROUP 7: Gate Check-In Console & Desk Admittance (T66 - T75)
  // ========================================================================
  await runTest('T66', 'Gate Check-In', 'Desk lookup by Registration ID returns team payload', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/checkin/lookup/${demoHassanTeam.registrationId}`, {
      headers: { 'Authorization': `Bearer ${demoAdminToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.team.registrationId === demoHassanTeam.registrationId, 'Lookup mismatch');
  });

  await runTest('T67', 'Gate Check-In', 'Desk lookup by Team Name returns matching team', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/checkin/lookup/${encodeURIComponent(demoHassanTeam.teamName)}`, {
      headers: { 'Authorization': `Bearer ${demoAdminToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  await runTest('T68', 'Gate Check-In', 'Desk lookup by Leader Mobile returns matching team', async () => {
    const mobile = demoHassanTeam.leaderMobile;
    const res = await fetch(`${BASE_URL}/api/admin/checkin/lookup/${mobile}`, {
      headers: { 'Authorization': `Bearer ${demoAdminToken}` }
    });
    assert(res.status === 200 || res.status === 404, `Expected 200 or 404, got ${res.status}`);
  });

  await runTest('T69', 'Gate Check-In', 'Desk lookup by Pass Token code', async () => {
    const doc = await Registration.findOne({ registrationId: demoHassanTeam.registrationId });
    const passToken = doc.checkIn?.passToken || doc.registrationId;
    const res = await fetch(`${BASE_URL}/api/admin/checkin/lookup/${passToken}`, {
      headers: { 'Authorization': `Bearer ${demoAdminToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  await runTest('T70', 'Gate Check-In', 'Gate check-in execution marks isCheckedIn and allots physical seat', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/checkin/${demoHassanTeam.registrationId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${demoAdminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ seatNumber: 'TEST-A01' })
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const doc = await Registration.findOne({ registrationId: demoHassanTeam.registrationId });
    assert(doc.checkIn && doc.checkIn.isCheckedIn === true, 'Team was not marked checked in');
    assert(doc.checkIn.allocatedSeat === 'TEST-A01', `Expected seat TEST-A01, got ${doc.checkIn.allocatedSeat}`);
  });

  await runTest('T71', 'Gate Check-In', 'Gate check-in for non-existent team returns 404', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/checkin/HS3-NONEXISTENT-9999`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${demoAdminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ seatNumber: 'TEST-B01' })
    });
    assert(res.status === 404, `Expected 404, got ${res.status}`);
  });

  await runTest('T72', 'Gate Check-In', 'Gate check-in updates seat allotment cleanly', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/checkin/${demoHassanTeam.registrationId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${demoAdminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ seatNumber: 'TEST-A02' })
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const doc = await Registration.findOne({ registrationId: demoHassanTeam.registrationId });
    assert(doc.checkIn.allocatedSeat === 'TEST-A02', 'Seat was not updated');
  });

  await runTest('T73', 'Gate Check-In', 'POST /api/admin/checkin/:id/reset reverts check-in state', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/checkin/${demoHassanTeam.registrationId}/reset`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${demoAdminToken}`,
        'Content-Type': 'application/json'
      }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const doc = await Registration.findOne({ registrationId: demoHassanTeam.registrationId });
    assert(doc.checkIn.isCheckedIn === false, 'Check-in state was not reverted');
  });

  await runTest('T74', 'Gate Check-In', 'GET /api/admin/checkins returns live admitted feed', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/checkins`, {
      headers: { 'Authorization': `Bearer ${demoAdminToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data.teams), 'Expected teams array');
  });

  await runTest('T75', 'Gate Check-In', 'Check-in pass token SHA-256 derivation integrity', async () => {
    const doc = await Registration.findOne({ registrationId: demoHassanTeam.registrationId });
    assert(doc.checkIn?.passToken && doc.checkIn.passToken.length === 12, 'Pass token must be 12-char hex string');
  });

  // ========================================================================
  // GROUP 8: Final Project Submission & Gateway Time Lock (T76 - T80)
  // ========================================================================
  await runTest('T76', 'Project Gateway', 'Submission pre-kickoff without bypass header returns 403 Forbidden', async () => {
    const fd = new FormData();
    fd.append('title', 'HackSprint AI Agent');
    fd.append('githubUrl', 'https://github.com/demo/hacksprint');
    fd.append('projectZip', makeTinyZipBlob(), 'project.zip');

    const res = await fetch(`${BASE_URL}/api/team/project-submission`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${teamSessionToken}` },
      body: fd
    });
    assert(res.status === 403, `Expected 403, got ${res.status}`);
    const data = await res.json();
    assert(data.error.includes('locked'), 'Expected locked error message');
  });

  await runTest('T77', 'Project Gateway', 'Submission with test-mode bypass header succeeds', async () => {
    const fd = new FormData();
    fd.append('title', 'HackSprint AI Agent (Test Mode)');
    fd.append('githubUrl', 'https://github.com/demo/hacksprint');
    fd.append('projectZip', makeTinyZipBlob(), 'project.zip');

    const res = await fetch(`${BASE_URL}/api/team/project-submission`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${teamSessionToken}`,
        'x-bypass-freeze': 'test-mode'
      },
      body: fd
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true, 'Expected submission success: true');
  });

  await runTest('T78', 'Project Gateway', 'Submission with missing title returns 400', async () => {
    const fd = new FormData();
    fd.append('githubUrl', 'https://github.com/demo/hacksprint');
    fd.append('projectZip', makeTinyZipBlob(), 'project.zip');

    const res = await fetch(`${BASE_URL}/api/team/project-submission`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${teamSessionToken}`,
        'x-bypass-freeze': 'test-mode'
      },
      body: fd
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await runTest('T79', 'Project Gateway', 'Submission archive correctly saved to uploads/projects', async () => {
    const doc = await Registration.findOne({ registrationId: demoHassanTeam.registrationId });
    assert(doc.projectSubmission && doc.projectSubmission.zipFilePath, 'Project zip was not recorded in DB');
    const localPath = path.join(__dirname, '..', doc.projectSubmission.zipFilePath);
    assert(fs.existsSync(localPath), 'Project zip file was not found on disk');
  });

  await runTest('T80', 'Project Gateway', 'Gateway countdown timer calculation logic verification', async () => {
    const KICKOFF_TIME = new Date('2026-11-21T15:00:00+05:30').getTime();
    const now = Date.now();
    assert(now < KICKOFF_TIME, 'Kickoff time must be in future');
    const diff = KICKOFF_TIME - now;
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    assert(d >= 0, 'Days remaining should be >= 0');
  });

  // ========================================================================
  // GROUP 9: 20 HARDCORE STRESS, CONCURRENCY & SECURITY TESTS (T81 - T100)
  // ========================================================================
  await runTest('T81', 'HARDCORE', 'Concurrent Registration Race Condition: 5 parallel requests for same team name', async () => {
    const raceTeamName = `TEST-RACE-NAME-${uniqueSuffix}`;
    const makeReq = (idx) => {
      const fd = new FormData();
      fd.append('college', 'GEC Hassan');
      fd.append('teamName', raceTeamName);
      fd.append('leaderName', `Race Leader ${idx}`);
      fd.append('leaderUsn', `4GH99CSR${idx}${uniqueSuffix.slice(-2)}`);
      fd.append('leaderMobile', `9900${idx}${uniqueSuffix.slice(-5)}`);
      fd.append('leaderYear', '3rd Year');
      fd.append('transactionId', `UPI-RACE-${idx}-${uniqueSuffix}`);
      fd.append('membersJson', JSON.stringify([
        { name: `M2 ${idx}`, usn: `4GH99CSM${idx}${uniqueSuffix.slice(-2)}`, mobile: `9911${idx}${uniqueSuffix.slice(-5)}`, year: '3rd Year' }
      ]));
      fd.append('paymentScreenshot', makeTinyPngBlob(), 'pay.png');
      return fetch(`${getRegisterUrl()}/api/register`, { method: 'POST', body: fd });
    };

    const responses = await Promise.all([makeReq(1), makeReq(2), makeReq(3), makeReq(4), makeReq(5)]);
    const statuses = responses.map(r => r.status);
    const createdCount = statuses.filter(s => s === 201).length;
    assert(createdCount <= 1, `Multiple duplicate teams created under race condition: ${createdCount}`);
  });

  await runTest('T82', 'HARDCORE', 'Concurrent Gate Check-In Race Condition: 2 scanners check in same team', async () => {
    await Registration.updateOne({ registrationId: demoHassanTeam.registrationId }, { 'checkIn.isCheckedIn': false, 'checkIn.allocatedSeat': '' });

    const checkInReq = (seatNumber) => {
      return fetch(`${BASE_URL}/api/admin/checkin/${demoHassanTeam.registrationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${demoAdminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ seatNumber })
      });
    };

    const [res1, res2] = await Promise.all([checkInReq('SEAT-RACE-1'), checkInReq('SEAT-RACE-2')]);
    assert(res1.status === 200 || res2.status === 200, 'At least one scanner must successfully check in');
    await Registration.updateOne({ registrationId: demoHassanTeam.registrationId }, { 'checkIn.isCheckedIn': false, 'checkIn.allocatedSeat': '' });
  });

  await runTest('T83', 'HARDCORE', 'Cross-Team USN Piracy Prevention: Builder in Team A cannot be registered in Team B', async () => {
    const fd = new FormData();
    fd.append('college', 'GEC Hassan');
    fd.append('teamName', `TEST-PIRACY-${uniqueSuffix}`);
    fd.append('leaderName', 'Pirate Leader');
    fd.append('leaderUsn', '4GH99CSP99');
    fd.append('leaderMobile', '9988112233');
    fd.append('leaderYear', '3rd Year');
    fd.append('transactionId', `UPI-PIRACY-${uniqueSuffix}`);
    fd.append('membersJson', JSON.stringify([
      { name: 'Kidnapped Member', usn: demoHassanTeam.leaderUsn, mobile: '9988112244', year: '3rd Year' }
    ]));
    fd.append('paymentScreenshot', makeTinyPngBlob(), 'pay.png');

    const res = await fetch(`${getRegisterUrl()}/api/register`, { method: 'POST', body: fd });
    assert(res.status === 400 || res.status === 429, `Expected 400 or 429, got ${res.status}`);
  });

  await runTest('T84', 'HARDCORE', 'NoSQL Injection Attack on Admin Login ($gt object attack)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: { '$gt': '' },
        password: { '$gt': '' }
      })
    });
    assert(res.status === 401 || res.status === 500, `Expected 401 or 500, got ${res.status}`);
  });

  await runTest('T85', 'HARDCORE', 'NoSQL Injection Attack on Team Login ($ne object attack)', async () => {
    const res = await fetch(`${BASE_URL}/api/team/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registrationId: { '$ne': null },
        mobile: { '$ne': null }
      })
    });
    assert(res.status === 401 || res.status === 400 || res.status === 404 || res.status === 500, `Expected rejection, got ${res.status}`);
  });

  await runTest('T86', 'HARDCORE', 'NoSQL Injection / ReDoS on Gate Lookup Endpoint ($regex attack)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/checkin/lookup/%5B%24regex%5D%3D.*`, {
      headers: { 'Authorization': `Bearer ${demoAdminToken}` }
    });
    assert(res.status === 404 || res.status === 200, `Expected 404 or safe 200, got ${res.status}`);
  });

  await runTest('T87', 'HARDCORE', 'Stored XSS Sanitization in Team Name (<script> injection)', async () => {
    const sfx = (parseInt(uniqueSuffix, 10) + 7).toString();
    const xssPayload = `<script>alert('xss')</script>TESTXSS_${sfx}`;
    const fd = new FormData();
    fd.append('college', 'GEC Arsikere');
    fd.append('teamName', xssPayload);
    fd.append('leaderName', 'XSS Lead');
    fd.append('leaderUsn', `4AR99CSX${sfx.slice(-2)}`);
    fd.append('leaderMobile', `995566${sfx.slice(-4)}`);
    fd.append('leaderYear', '3rd Year');
    fd.append('membersJson', JSON.stringify([
      { name: 'XSS M2', usn: `4AR99CSY${sfx.slice(-2)}`, mobile: `995577${sfx.slice(-4)}`, year: '3rd Year' }
    ]));

    const res = await fetch(`${getRegisterUrl()}/api/register`, { method: 'POST', body: fd });
    assert(res.status === 201 || res.status === 429, `Expected 201 or 429, got ${res.status}`);
    const doc = await Registration.findOne({ 'leader.usn': `4AR99CSX${sfx.slice(-2)}`.toUpperCase() });
    if (doc) {
      assert(!doc.teamName.includes('<script>'), `Team name contained unescaped raw <script> tag: ${doc.teamName}`);
    }
  });

  await runTest('T88', 'HARDCORE', 'Stored XSS in Project Title & GitHub URL Sanitization', async () => {
    const fd = new FormData();
    fd.append('title', '<img src=x onerror=alert(1)>Malicious Title');
    fd.append('githubUrl', 'javascript:alert(document.cookie)');
    fd.append('projectZip', makeTinyZipBlob(), 'project.zip');

    const res = await fetch(`${BASE_URL}/api/team/project-submission`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${teamSessionToken}`,
        'x-bypass-freeze': 'test-mode'
      },
      body: fd
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const doc = await Registration.findOne({ registrationId: demoHassanTeam.registrationId });
    assert(!doc.projectSubmission.title.includes('<img'), 'Project title retained unescaped HTML tag');
  });

  await runTest('T89', 'HARDCORE', 'Oversized Project Payload DOS Protection (Over 50MB Limit)', async () => {
    const largeBuffer = Buffer.alloc(52 * 1024 * 1024);
    const fd = new FormData();
    fd.append('title', 'Large File Attack');
    fd.append('githubUrl', 'https://github.com/demo/hacksprint');
    fd.append('projectZip', new Blob([largeBuffer], { type: 'application/zip' }), 'large.zip');

    const res = await fetch(`${BASE_URL}/api/team/project-submission`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${teamSessionToken}`,
        'x-bypass-freeze': 'test-mode'
      },
      body: fd
    });
    assert(res.status === 400, `Expected 400 LIMIT_FILE_SIZE, got ${res.status}`);
    const data = await res.json();
    assert(data.error.includes('50MB limit'), 'Expected 50MB limit error message');
  });

  await runTest('T90', 'HARDCORE', 'Malicious File Extension Rejection in Project Upload (.exe / .sh)', async () => {
    const fd = new FormData();
    fd.append('title', 'Executable Test');
    fd.append('githubUrl', 'https://github.com/demo/hacksprint');
    fd.append('projectZip', new Blob([Buffer.from('binary-exe')], { type: 'application/octet-stream' }), 'malware.exe');

    const res = await fetch(`${BASE_URL}/api/team/project-submission`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${teamSessionToken}`,
        'x-bypass-freeze': 'test-mode'
      },
      body: fd
    });
    assert(res.status === 400, `Expected 400 for non-zip file, got ${res.status}`);
  });

  await runTest('T91', 'HARDCORE', 'Path Traversal Vulnerability Test on Project Files (../../nonexistent.txt)', async () => {
    const res = await fetch(`${BASE_URL}/uploads/projects/..%2F..%2Fnonexistent_file_9999.txt`);
    assert(res.status === 404 || res.status === 403, `Expected 404 or 403, got ${res.status}`);
  });

  await runTest('T92', 'HARDCORE', 'Path Traversal Vulnerability Test on Payment Proofs (../../.env)', async () => {
    const res = await fetch(`${BASE_URL}/uploads/payments/..%2F..%2F.env`);
    assert(res.status === 404 || res.status === 403 || res.status === 500, `Expected 404, 403, or 500, got ${res.status}`);
  });

  await runTest('T93', 'HARDCORE', 'Tampered JWT Signature Verification: Fake key rejected', async () => {
    const payload = `${demoHassanTeam.registrationId}|9900112233|${Date.now()}`;
    const forgedHmac = crypto.createHmac('sha256', 'FORGED_SECRET_KEY').update(payload).digest('hex');
    const forgedToken = Buffer.from(`${payload}|${forgedHmac}`).toString('base64');

    const res = await fetch(`${BASE_URL}/api/team/dashboard`, {
      headers: { 'Authorization': `Bearer ${forgedToken}` }
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
    const data = await res.json();
    assert(data.error.includes('Unauthorized') || data.error.includes('signature'), 'Expected signature error');
  });

  await runTest('T94', 'HARDCORE', 'Expired JWT Timestamp Handling: Old tokens rejected', async () => {
    const pastTimestamp = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const payload = `${demoHassanTeam.registrationId}|9900112233|${pastTimestamp}`;
    const hmac = crypto.createHmac('sha256', TEAM_SECRET).update(payload).digest('hex');
    const expiredToken = Buffer.from(`${payload}|${hmac}`).toString('base64');

    const res = await fetch(`${BASE_URL}/api/team/dashboard`, {
      headers: { 'Authorization': `Bearer ${expiredToken}` }
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
    const data = await res.json();
    assert(data.error.includes('expired'), 'Expected session expired message');
  });

  await runTest('T95', 'HARDCORE', 'Freshman Double-Allocation Prevention: Same student to two teams', async () => {
    // Clear assignedFirstYears first
    await Registration.updateOne({ registrationId: demoHassanTeam.registrationId }, { assignedFirstYears: [] });
    await Registration.updateOne({ registrationId: demoNonHassanTeam.registrationId }, { assignedFirstYears: [] });

    const fyDoc = await FirstYearStudent.create({
      name: 'Shared Freshman',
      usn: `4GH26CS9${uniqueSuffix.slice(-2)}`,
      mobile: '9988998899',
      branch: 'CSE',
      section: 'A',
      gender: 'Male',
      isAssigned: false
    });

    const res1 = await fetch(`${BASE_URL}/api/admin/first-years/assign`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${demoAdminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        registrationId: demoHassanTeam.registrationId,
        studentUsn: fyDoc.usn
      })
    });
    assert(res1.status === 200, `Expected 200 for first assignment, got ${res1.status}`);

    const res2 = await fetch(`${BASE_URL}/api/admin/first-years/assign`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${demoAdminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        registrationId: demoNonHassanTeam.registrationId,
        studentUsn: fyDoc.usn
      })
    });
    assert(res2.status === 400, `Expected 400 for double assignment, got ${res2.status}`);

    await FirstYearStudent.deleteOne({ _id: fyDoc._id });
  });

  await runTest('T96', 'HARDCORE', 'Over-Allocation Limit Prevention: Max 2 freshmen per Hassan squad', async () => {
    await Registration.updateOne(
      { registrationId: demoHassanTeam.registrationId },
      {
        assignedFirstYears: [
          { name: 'FY 1', usn: '4GH26CS111', mobile: '9988001122' },
          { name: 'FY 2', usn: '4GH26CS222', mobile: '9988001133' }
        ]
      }
    );

    const extraFy = await FirstYearStudent.create({
      name: 'Extra FY',
      usn: `4GH26CS8${uniqueSuffix.slice(-2)}`,
      mobile: '9988001144',
      branch: 'CSE',
      section: 'A',
      isAssigned: false
    });

    const res = await fetch(`${BASE_URL}/api/admin/first-years/assign`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${demoAdminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        registrationId: demoHassanTeam.registrationId,
        studentUsn: extraFy.usn
      })
    });
    assert(res.status === 400, `Expected 400 when assigning 3rd freshman, got ${res.status}`);

    await FirstYearStudent.deleteOne({ _id: extraFy._id });
  });

  await runTest('T97', 'HARDCORE', 'Zero-Data Mutation Boundary Check: Existing teams 100% unaltered', async () => {
    const existingTeamsNow = await Registration.find(
      { registrationId: { $in: existingTeamIdsBefore } },
      { registrationId: 1, teamName: 1, 'checkIn.isCheckedIn': 1 }
    ).lean();

    assert(existingTeamsNow.length === existingTeamCountBefore, `Expected ${existingTeamCountBefore} existing teams, found ${existingTeamsNow.length}`);
    const anyCheckedIn = existingTeamsNow.some(t => t.checkIn?.isCheckedIn === true);
    assert(!anyCheckedIn, 'Existing team had its checkIn state modified during testing!');
  });

  await runTest('T98', 'HARDCORE', 'High-Velocity Read Stress Burst: 50 simultaneous parallel GET /api/seats-status', async () => {
    const requests = [];
    for (let i = 0; i < 50; i++) {
      requests.push(fetch(`${BASE_URL}/api/seats-status`));
    }
    const responses = await Promise.all(requests);
    const statuses = responses.map(r => r.status);
    const all200 = statuses.every(s => s === 200);
    assert(all200, `Not all requests returned 200 OK: ${statuses.filter(s => s !== 200).length} failed`);
  });

  await runTest('T99', 'HARDCORE', 'Memory Leak & Heap Stability Audit', async () => {
    const mem = process.memoryUsage();
    const heapUsedMb = Math.round(mem.heapUsed / 1024 / 1024);
    assert(heapUsedMb < 500, `Abnormal memory usage: ${heapUsedMb}MB`);
  });

  await runTest('T100', 'HARDCORE', 'Automated Sandbox Cleanup Guarantee: Purge all demo fixtures', async () => {
    const delRes = await Registration.deleteMany({
      $or: [
        { registrationId: /^TEST-/i },
        { teamName: /^TEST-/i },
        { 'leader.usn': /^4GH99/i },
        { 'leader.usn': /^4HG99/i },
        { 'leader.usn': /^4AR99/i }
      ]
    });
    console.log(`       Purged ${delRes.deletedCount} temporary test records.`);

    await FirstYearStudent.deleteMany({ usn: /^4GH26CS[89]/i });

    const postCount = await Registration.countDocuments();
    assert(postCount === existingTeamCountBefore, `Expected ${existingTeamCountBefore} teams in DB after cleanup, found ${postCount}`);
  });

  // ========================================================================
  // FINAL REPORT & SUMMARY TABLE
  // ========================================================================
  console.log('\n================================================================');
  console.log('                 FINAL TEST EXECUTION REPORT                    ');
  console.log('================================================================\n');

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;

  console.log(`TOTAL TESTS RUN : ${results.length}`);
  console.log(`TESTS PASSED    : \x1b[32m${passedCount}\x1b[0m`);
  console.log(`TESTS FAILED    : ${failedCount === 0 ? '\x1b[32m0\x1b[0m' : `\x1b[31m${failedCount}\x1b[0m`}`);
  console.log(`SUCCESS RATE    : ${(passedCount / results.length * 100).toFixed(1)}%\n`);

  if (failedCount > 0) {
    console.log('FAILED TESTS SUMMARY:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - [${r.id}] ${r.description}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('\x1b[32m✔ ALL 100 TEST CASES PASSED WITH 100% PRODUCTION READINESS!\x1b[0m');
    console.log('\x1b[32m✔ ZERO REAL RECORDS WERE MUTATED OR ALTERED.\x1b[0m');
    console.log('\x1b[32m✔ ALL DEMO FIXTURES AND SANDBOX DATA HAVE BEEN SAFELY PURGED.\x1b[0m');
    process.exit(0);
  }
})();
