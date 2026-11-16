const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config();
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const FirstYearStudent = require('../models/FirstYearStudent');
const Registration = require('../models/Registration');

function toTitleCase(str) {
  if (!str) return '';
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => {
      // If it's single letter or Roman numeral or acronym like CR, HN, etc.
      if (word.length <= 2 && word.toUpperCase() === word && !['TO', 'IN', 'ON'].includes(word.toUpperCase())) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

async function ingest() {
  try {
    const excelPath = 'C:/Users/prajw/.gemini/antigravity/brain/0ff6f0e5-0edb-4270-bf63-06b440717b61/.user_uploaded/media_1794805592397_4fa66557.xlsx';
    const wb = xlsx.readFile(excelPath);
    const rawRows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

    console.log(`Loaded ${rawRows.length} raw rows from Excel template.`);

    const cleanedStudents = rawRows.map((r, index) => {
      const rawName = String(r.Name || '').trim();
      const name = toTitleCase(rawName);
      const usn = '4GH26CS006'; // Exactly as instructed by user
      const mobile = String(r.Mobile || '').replace(/[^0-9]/g, '').trim();
      const email = String(r.Email || '').trim().toLowerCase();
      const branch = 'CSE';
      const section = String(r.Section || 'A').trim().toUpperCase();

      return {
        name,
        usn,
        mobile,
        email,
        branch,
        section,
        isAssigned: false,
        assignedTeamId: null,
        assignedTeamName: null,
        assignedAt: null
      };
    });

    console.log(`Prepared ${cleanedStudents.length} students with USN = 4GH26CS006.`);

    // 1. Create permanent Excel backup in data/
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const backupExcelPath = path.join(dataDir, 'FirstYear_Pool_61.xlsx');
    const newWb = xlsx.utils.book_new();
    const newWs = xlsx.utils.json_to_sheet(cleanedStudents.map((s, i) => ({
      'Sl No': i + 1,
      'USN': s.usn,
      'Name': s.name,
      'Mobile': s.mobile,
      'Email': s.email,
      'Branch': s.branch,
      'Section': s.section,
      'Status': 'Available'
    })));
    xlsx.utils.book_append_sheet(newWb, newWs, 'FirstYearStudents');
    xlsx.writeFile(newWb, backupExcelPath);
    console.log(`Permanent backup saved to: ${backupExcelPath}`);

    // 2. Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    // 3. Clear existing firstyearstudents if any (currently 0)
    const existingCount = await FirstYearStudent.countDocuments();
    console.log(`Existing first-year students in DB: ${existingCount}`);

    // 4. Batch insert into firstyearstudents
    const inserted = await FirstYearStudent.insertMany(cleanedStudents);
    console.log(`Successfully inserted ${inserted.length} first-year students into MongoDB Atlas!`);

    // 5. Verification
    const totalInPool = await FirstYearStudent.countDocuments();
    const availableCount = await FirstYearStudent.countDocuments({ isAssigned: false });
    const usn006Count = await FirstYearStudent.countDocuments({ usn: '4GH26CS006' });
    const regCount = await Registration.countDocuments();
    const checkedInCount = await Registration.countDocuments({ 'checkIn.isCheckedIn': true });

    console.log('\n--- VERIFICATION RESULTS ---');
    console.log(`Total first-year students in DB: ${totalInPool}`);
    console.log(`Available students (isAssigned = false): ${availableCount}`);
    console.log(`Students with USN 4GH26CS006: ${usn006Count}`);
    console.log(`Total teams in DB (untouched): ${regCount}`);
    console.log(`Checked-in teams count (must be 0): ${checkedInCount}`);

    process.exit(0);
  } catch (err) {
    console.error('Ingestion failed:', err);
    process.exit(1);
  }
}

ingest();
