import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const exportStudents = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI not found in .env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(mongoUri);

  console.log('Fetching all students (excluding heavy raw photo data for speed)...');
  const students = await mongoose.connection.db
    .collection('students')
    .find({}, { projection: { 'photo.data': 0 } })
    .sort({ createdAt: -1 })
    .toArray();

  console.log(`Successfully fetched ${students.length} students! Generating HTML report...`);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Spheronix Students Database - (${students.length} Total)</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .header { max-width: 1200px; margin: 0 auto 20px auto; display: flex; justify-content: space-between; align-items: center; }
    h1 { margin: 0; font-size: 24px; color: #0f172a; }
    .badge { background: #2563eb; color: #fff; padding: 6px 14px; border-radius: 9999px; font-weight: 700; font-size: 14px; }
    .container { max-width: 1200px; margin: 0 auto; background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
    th { background: #f1f5f9; padding: 12px 16px; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; }
    td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; }
    tr:hover { background: #f8fafc; }
    .student-id { font-family: monospace; font-weight: 700; color: #2563eb; background: #eff6ff; padding: 3px 8px; border-radius: 6px; display: inline-block; }
    .status-badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; background: #fef3c7; color: #92400e; }
    .search-box { width: 100%; max-width: 350px; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 13px; outline: none; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Spheronix Student Records</h1>
      <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">Connected directly to MongoDB Atlas (${students.length} Verified Records)</p>
    </div>
    <div style="display:flex; gap: 12px; align-items:center;">
      <input type="text" id="search" class="search-box" placeholder="Filter by Name, ID, College..." onkeyup="filterTable()">
      <span class="badge">${students.length} Students</span>
    </div>
  </div>

  <div class="container">
    <table id="studentsTable">
      <thead>
        <tr>
          <th>#</th>
          <th>Student ID</th>
          <th>Full Name</th>
          <th>Email</th>
          <th>Mobile</th>
          <th>College Name</th>
          <th>Branch</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${students
          .map(
            (s: any, index: number) => `<tr>
          <td style="color:#94a3b8; font-weight:600;">${index + 1}</td>
          <td><span class="student-id">${s.studentId || '-'}</span></td>
          <td style="font-weight:600; color:#0f172a;">${s.fullName || '-'}</td>
          <td>${s.email || '-'}</td>
          <td>${s.mobile || '-'}</td>
          <td>${s.collegeName || '-'}</td>
          <td>${s.branch || '-'}</td>
          <td><span class="status-badge">${s.status || 'PENDING'}</span></td>
        </tr>`
          )
          .join('\n')}
      </tbody>
    </table>
  </div>

  <script>
    function filterTable() {
      const q = document.getElementById('search').value.toLowerCase();
      const rows = document.querySelectorAll('#studentsTable tbody tr');
      rows.forEach(r => {
        const text = r.innerText.toLowerCase();
        r.style.display = text.includes(q) ? '' : 'none';
      });
    }
  </script>
</body>
</html>`;

  const outputPath = path.resolve(__dirname, '../../../students-database.html');
  fs.writeFileSync(outputPath, html, 'utf-8');
  console.log(`\n🎉 Report ready! Saved to: ${outputPath}`);
  process.exit(0);
};

exportStudents().catch((err) => {
  console.error('Export failed:', err);
  process.exit(1);
});
