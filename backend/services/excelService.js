const XLSX = require('xlsx');
const { fmtDate } = require('../utils/dates');
const { requirementsOf } = require('./dashboardService');

const sheet = (header, rows, widths) => {
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  ws['!cols'] = widths.map((w) => ({ wch: w }));
  return ws;
};

// bundle -> .xlsx Buffer with the 8 sheets from the specification
function buildWorkbook(bundle) {
  const { student: s, skills, technologies, certificates, projects, activities, progress } = bundle;
  const reqs = requirementsOf(bundle);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    sheet(['Field', 'Value'], [
      ['Name', s.name], ['USN', s.usn], ['Email', s.email], ['Phone', s.phone], ['Department', s.department],
      ['Semester', s.semester], ['Section', s.section], ['CGPA', s.cgpa], ['Previous semester CGPA', s.previousCgpa],
      ['Attendance (%)', s.attendance], ['Backlogs', s.backlogs], ['Academic performance', s.academicPerformance],
      ['Short-term goal', s.shortTermGoal], ['Long-term goal', s.longTermGoal], ['Target industry', s.targetIndustry],
      ['Domain', s.targetDomain], ['Job role', s.targetJobRole], ['Career readiness (%)', reqs.readiness],
    ], [28, 50]),
    'Student Profile'
  );
  XLSX.utils.book_append_sheet(wb, sheet(['Skill', 'Domain', 'Category', 'Level', 'Percentage', 'Date learned', 'Last updated', 'Evidence / project', 'Notes'],
    skills.map((x) => [x.name, x.domain, x.category, x.level, x.percentage, fmtDate(x.dateLearned), fmtDate(x.updatedAt), x.evidence, x.notes]), [26, 22, 22, 14, 12, 14, 14, 30, 30]), 'Skills');
  XLSX.utils.book_append_sheet(wb, sheet(['Technology', 'Domain', 'Category', 'Level', 'Experience (months)', 'Projects', 'Last updated'],
    technologies.map((x) => [x.name, x.domain, x.category, x.level, x.experienceMonths, (x.projects || []).join(', '), fmtDate(x.updatedAt)]), [26, 22, 22, 14, 20, 40, 14]), 'Technologies');
  XLSX.utils.book_append_sheet(wb, sheet(['Certificate', 'Organization', 'Category', 'Issue date', 'Expiry date', 'Credential ID', 'URL', 'Description'],
    certificates.map((x) => [x.name, x.organization, x.category, fmtDate(x.issueDate), fmtDate(x.expiryDate), x.credentialId, x.url, x.description]), [30, 26, 14, 14, 14, 20, 36, 36]), 'Certificates');
  XLSX.utils.book_append_sheet(wb, sheet(['Project', 'Domain', 'Technologies', 'Role', 'Status', 'Start date', 'End date', 'GitHub', 'Live URL', 'Description'],
    projects.map((x) => [x.name, x.domain, (x.technologies || []).join(', '), x.role, x.status, fmtDate(x.startDate), fmtDate(x.endDate), x.githubUrl, x.liveUrl, x.description]), [28, 20, 32, 18, 14, 14, 14, 32, 32, 40]), 'Projects');
  XLSX.utils.book_append_sheet(wb, sheet(['Club', 'Activity', 'Position / role', 'Participation', 'Date', 'Achievement', 'Description'],
    activities.map((x) => [x.clubName, x.activityName, x.role, x.participationType, fmtDate(x.date), x.achievement, x.description]), [24, 28, 20, 16, 14, 30, 40]), 'Club Activities');
  XLSX.utils.book_append_sheet(wb, sheet(['Week', 'Date', 'CGPA', 'Overall progress (%)', 'Career readiness (%)', 'Avg skill (%)', 'New skills', 'Technologies learned', 'Projects completed', 'Certificates completed', 'Club activities', 'Problems faced', 'Learned', 'Next week goal'],
    progress.map((x) => [x.weekNumber, fmtDate(x.date), x.cgpa, x.overallProgress, x.careerReadiness, x.avgSkill, (x.newSkills || []).join(', '), (x.technologiesLearned || []).join(', '), x.projectsCompleted, x.certificationsCompleted, x.clubActivities, x.problemsFaced, x.learned, x.nextGoal]),
    [8, 12, 8, 20, 20, 14, 28, 28, 18, 20, 28, 36, 40, 36]), 'Weekly Growth');
  XLSX.utils.book_append_sheet(wb, sheet(['Required skill', 'Category', 'Status', 'Current level', 'Percentage', 'Present?'],
    reqs.items.map((i) => [i.name, i.category, i.status, i.currentLevel || '', i.percentage === null ? '' : i.percentage, i.status === 'Completed' ? 'Yes' : 'No']), [28, 24, 14, 16, 12, 10]), 'Career Gap');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

module.exports = { buildWorkbook };
