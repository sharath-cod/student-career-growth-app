const PDFDocument = require('pdfkit');
const { fmtDate } = require('../utils/dates');
const { requirementsOf } = require('./dashboardService');

const C = { pine: '#0F5C4D', ink: '#17211F', muted: '#5E6B66', line: '#D8DDD6', zebra: '#F5F6F2', signal: '#E3A32B' };
const R = 'Helvetica';
const B = 'Helvetica-Bold';
const val = (v) => (v === undefined || v === null || v === '' ? '-' : String(v));

// bundle -> PDF Buffer
function buildPdf(bundle, { collegeName = 'Engineering College' } = {}) {
  return new Promise((resolve, reject) => {
    const { student: s, skills, technologies, certificates, projects, activities, progress } = bundle;
    const reqs = requirementsOf(bundle);
    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true, info: { Title: `Career Growth Report - ${s.usn}`, Author: collegeName } });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W = doc.page.width - 100; // usable width
    const bottom = () => doc.page.height - 70;
    const ensure = (h) => { if (doc.y + h > bottom()) doc.addPage(); };

    // Header band
    doc.rect(0, 0, doc.page.width, 92).fill(C.pine);
    doc.fillColor('#ffffff').font(R).fontSize(10).text(collegeName.toUpperCase(), 50, 28, { width: W, characterSpacing: 1.5 });
    doc.font(B).fontSize(21).text('STUDENT CAREER GROWTH REPORT', 50, 46, { width: W });
    doc.y = 112;

    const kv = (label, value) => {
      ensure(18);
      const y = doc.y;
      doc.font(B).fontSize(10).fillColor(C.muted).text(label, 50, y, { width: 150 });
      const y1 = doc.y;
      doc.font(R).fillColor(C.ink).text(val(value), 205, y, { width: W - 155 });
      doc.y = Math.max(y1, doc.y) + 3;
    };
    const section = (title) => {
      ensure(70);
      doc.moveDown(0.9);
      doc.font(B).fontSize(11).fillColor(C.pine).text(title, 50, doc.y, { characterSpacing: 0.8 });
      doc.moveTo(50, doc.y + 2).lineTo(50 + W, doc.y + 2).strokeColor(C.line).lineWidth(1).stroke();
      doc.y += 9;
    };
    const table = (headers, rows, widths) => {
      const total = widths.reduce((a, b) => a + b, 0);
      const w = widths.map((x) => (x / total) * W);
      const head = () => {
        const y = doc.y;
        doc.rect(50, y, W, 20).fill(C.pine);
        let x = 50;
        doc.font(B).fontSize(9).fillColor('#ffffff');
        headers.forEach((h, i) => { doc.text(h, x + 5, y + 6, { width: w[i] - 10, lineBreak: false }); x += w[i]; });
        doc.y = y + 20;
      };
      ensure(50);
      head();
      if (!rows.length) {
        doc.font(R).fontSize(9).fillColor(C.muted).text('No records yet.', 55, doc.y + 6);
        doc.y += 22;
        return;
      }
      rows.forEach((row, ri) => {
        doc.font(R).fontSize(9);
        const cells = row.map(val);
        const h = Math.max(...cells.map((c, i) => doc.heightOfString(c, { width: w[i] - 10 }))) + 10;
        if (doc.y + h > bottom()) { doc.addPage(); head(); }
        const y = doc.y;
        if (ri % 2 === 0) doc.rect(50, y, W, h).fill(C.zebra);
        let x = 50;
        doc.fillColor(C.ink);
        cells.forEach((c, i) => { doc.text(c, x + 5, y + 5, { width: w[i] - 10 }); x += w[i]; });
        doc.y = y + h;
      });
    };

    // Student
    kv('Student Name', s.name); kv('USN', s.usn); kv('Department', s.department); kv('Semester', s.semester ? `${s.semester} (Section ${val(s.section)})` : '-'); kv('Email', s.email); kv('Phone', s.phone);

    section('ACADEMIC PERFORMANCE');
    kv('CGPA', s.cgpa); kv('Previous semester CGPA', s.previousCgpa); kv('Attendance', s.attendance === undefined ? '-' : `${s.attendance}%`); kv('Backlogs', s.backlogs); kv('Academic performance', s.academicPerformance);

    section('CAREER GOALS');
    kv('Short-Term Goal', s.shortTermGoal); kv('Long-Term Goal', s.longTermGoal);

    section('TARGET CAREER');
    kv('Industry', s.targetIndustry); kv('Domain', s.targetDomain); kv('Job Role', s.targetJobRole);

    section('SKILLS');
    table(['Skill', 'Level', 'Percentage'], skills.map((x) => [x.name, x.level, `${x.percentage}%`]), [5, 3, 2]);

    section('TECHNOLOGIES');
    table(['Technology', 'Level'], technologies.map((x) => [x.name, x.level]), [5, 3]);

    section('CERTIFICATIONS');
    table(['Certificate', 'Organization', 'Date'], certificates.map((x) => [x.name, x.organization, fmtDate(x.issueDate)]), [5, 4, 2]);

    section('PROJECTS');
    table(['Project', 'Technology', 'Status'], projects.map((x) => [x.name, (x.technologies || []).join(', '), x.status]), [4, 5, 2]);

    section('CLUB ACTIVITIES');
    table(['Activity', 'Role', 'Date'], activities.map((x) => [`${x.clubName} - ${x.activityName}`, x.participationType + (x.role ? ` (${x.role})` : ''), fmtDate(x.date)]), [5, 4, 2]);

    section('WEEKLY GROWTH');
    table(['Week', 'Progress', 'Career Readiness'], progress.map((x) => [`Week ${x.weekNumber} (${fmtDate(x.date)})`, `${x.overallProgress}%`, `${x.careerReadiness}%`]), [4, 3, 3]);

    section('CAREER GAP ANALYSIS');
    const done = reqs.items.filter((i) => i.status === 'Completed').map((i) => i.name);
    kv('Required Skills', reqs.items.map((i) => i.name).join(', '));
    kv('Completed', done.join(', '));
    kv('Missing', reqs.missing.map((i) => i.name).join(', '));

    section('FINAL CAREER READINESS');
    ensure(80);
    const y = doc.y + 6;
    doc.roundedRect(50, y, W, 64, 6).lineWidth(1.5).strokeColor(C.pine).stroke();
    doc.font(B).fontSize(34).fillColor(C.pine).text(`${reqs.readiness}%`, 50, y + 14, { width: W, align: 'center' });
    doc.y = y + 76;

    // Footer on every page
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i += 1) {
      doc.switchToPage(i);
      doc.page.margins.bottom = 0;
      doc.font(R).fontSize(8).fillColor(C.muted).text(`${s.name} (${s.usn})  |  Page ${i + 1} of ${range.count}  |  Generated ${fmtDate(new Date())}`, 50, doc.page.height - 38, { width: W, align: 'center' });
    }
    doc.end();
  });
}

module.exports = { buildPdf };
