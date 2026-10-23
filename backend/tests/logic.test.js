const test = require('node:test');
const assert = require('node:assert');
const { validationResult } = require('express-validator');
const { CATALOG, lookupSkill, isValidSkill } = require('../utils/techCatalog');
const { REQUIRED, buildJobRoles } = require('../utils/jobRolesData');
const { INDUSTRIES } = require('../utils/careerData');
const { computeRequirements, nextSteps } = require('../services/careerService');
const { buildDashboardData } = require('../services/dashboardService');
const { buildWorkbook } = require('../services/excelService');
const { buildPdf } = require('../services/pdfService');
const { profileRules } = require('../validators/profileRules');

test('every job role in the career tree has requirements, and every requirement exists in the skill catalog', () => {
  const roles = buildJobRoles();
  assert.ok(roles.length >= 38);
  roles.forEach((r) => {
    assert.ok(r.requiredSkills.length >= 3, `${r.name} has too few requirements`);
    r.requiredSkills.forEach((s) => assert.ok(lookupSkill(s.name), `${r.name}: unknown skill "${s.name}"`));
  });
  Object.keys(REQUIRED).forEach((name) => assert.ok(roles.some((r) => r.name === name), `orphan role ${name}`));
  Object.values(INDUSTRIES).forEach((d) => Object.keys(d).forEach((dom) => assert.ok(CATALOG[dom], `catalog missing domain ${dom}`)));
});

test('skill validation follows the nested catalog', () => {
  assert.ok(isValidSkill('Artificial Intelligence', 'Machine Learning', 'PyTorch'));
  assert.ok(!isValidSkill('Artificial Intelligence', 'Machine Learning', 'React'));
  assert.ok(isValidSkill('Other', 'General Skills', 'Anything custom'));
});

const reqs = [{ name: 'Python', category: 'x' }, { name: 'SQL', category: 'x' }, { name: 'Docker', category: 'x' }, { name: 'AWS', category: 'x' }];

test('readiness uses completed requirements; manual marks raise but skills prove', () => {
  const r = computeRequirements({
    requiredSkills: reqs,
    skills: [{ name: 'python', level: 'Advanced', percentage: 80 }, { name: 'SQL', level: 'Beginner', percentage: 30 }],
    technologies: [{ name: 'Docker', level: 'Intermediate' }],
    statuses: [{ skillName: 'AWS', status: 'Learning' }, { skillName: 'Python', status: 'Not Started' }],
  });
  const by = Object.fromEntries(r.items.map((i) => [i.name, i.status]));
  assert.deepStrictEqual(by, { Python: 'Completed', SQL: 'Learning', Docker: 'Completed', AWS: 'Learning' });
  assert.strictEqual(r.readiness, 50);
  assert.strictEqual(r.missing.length, 2);
  const steps = nextSteps(r.items);
  assert.strictEqual(steps.length, 2);
  assert.match(steps[1].text, /AWS|Finish/);
  const manual = computeRequirements({ requiredSkills: reqs, skills: [], technologies: [], statuses: reqs.map((x) => ({ skillName: x.name, status: 'Completed' })) });
  assert.strictEqual(manual.readiness, 100);
  assert.strictEqual(computeRequirements({ requiredSkills: [] }).readiness, 0);
});

const fixture = () => ({
  student: { _id: '1', name: 'Asha Rao', usn: '1AB22CS001', email: 'a@x.in', phone: '9876543210', department: 'Computer Science & Engineering', semester: 5, section: 'A', cgpa: 8.4, previousCgpa: 8.1, attendance: 91, backlogs: 0, academicPerformance: 'Good', shortTermGoal: 'Get a campus placement', longTermGoal: 'Grow into a technical lead or architect', targetIndustry: 'Data & Artificial Intelligence', targetDomain: 'Data Science', targetJobRole: 'Data Scientist', lastWeeklyUpdateAt: new Date() },
  skills: [{ name: 'Python', domain: 'Data Science', category: 'Foundations', level: 'Advanced', percentage: 80, updatedAt: new Date() }, { name: 'SQL', domain: 'Data Science', category: 'Tools', level: 'Beginner', percentage: 30, updatedAt: new Date() }],
  technologies: [{ name: 'Pandas', domain: 'Data Science', category: 'Libraries', level: 'Intermediate', experienceMonths: 8, projects: ['Sales'], updatedAt: new Date() }],
  certificates: [{ name: 'AWS Cloud Practitioner', organization: 'Amazon', category: 'AWS', issueDate: new Date(), url: 'https://x.y' }],
  projects: [{ name: 'Sales forecast', technologies: ['Python', 'Pandas'], status: 'Completed' }, { name: 'Chatbot', technologies: [], status: 'In Progress' }],
  activities: [{ clubName: 'Coding Club', activityName: 'Hackathon', participationType: 'Team Lead', role: 'Lead', date: new Date() }],
  progress: [
    { weekNumber: 1, date: new Date(), cgpa: 8.1, overallProgress: 40, careerReadiness: 10, avgSkill: 40, skillCount: 1, learned: 'a', nextGoal: 'b', newSkills: ['Python'], technologiesLearned: [] },
    { weekNumber: 2, date: new Date(), cgpa: null, overallProgress: 55, careerReadiness: 30, avgSkill: 55, skillCount: 2, learned: 'a', nextGoal: 'Learn SQL joins', newSkills: [], technologiesLearned: ['Pandas'] },
  ],
  statuses: [],
  jobRole: buildJobRoles().find((r) => r.name === 'Data Scientist'),
});

test('dashboard data: weekly growth, counts, trends', () => {
  const d = buildDashboardData(fixture());
  assert.strictEqual(d.weekly.previous, 10);
  assert.strictEqual(d.weekly.current, 30);
  assert.strictEqual(d.weekly.growth, 20);
  assert.strictEqual(d.certificates.total, 1);
  assert.strictEqual(d.certificates.thisMonth, 1);
  assert.deepStrictEqual([d.projects.completed, d.projects.inProgress], [1, 1]);
  assert.strictEqual(d.skillGrowth.length, 2);
  assert.strictEqual(d.cgpaTrend[0].label, 'Previous sem');
  assert.ok(d.nextSteps.length > 0);
});

test('Excel export has the 8 required sheets', () => {
  const XLSX = require('xlsx');
  const buf = buildWorkbook(fixture());
  assert.strictEqual(buf.slice(0, 2).toString(), 'PK');
  const wb = XLSX.read(buf);
  assert.deepStrictEqual(wb.SheetNames, ['Student Profile', 'Skills', 'Technologies', 'Certificates', 'Projects', 'Club Activities', 'Weekly Growth', 'Career Gap']);
  assert.strictEqual(XLSX.utils.sheet_to_json(wb.Sheets.Skills).length, 2);
});

test('PDF report is generated (also with no data at all)', async () => {
  const full = await buildPdf(fixture(), { collegeName: 'Test College' });
  assert.strictEqual(full.slice(0, 4).toString(), '%PDF');
  assert.ok(full.length > 3000);
  const f = fixture();
  Object.assign(f, { skills: [], technologies: [], certificates: [], projects: [], activities: [], progress: [], jobRole: null });
  const empty = await buildPdf(f);
  assert.strictEqual(empty.slice(0, 4).toString(), '%PDF');
  require('fs').writeFileSync('/tmp/sample_report.pdf', full);
});

async function run(rules, body) {
  const req = { body };
  await Promise.all(rules.map((r) => r.run(req)));
  return { errors: validationResult(req).mapped(), req };
}
const goodProfile = { name: 'Asha', phone: '98765 43210', department: 'Data Science', semester: '5', section: 'a', cgpa: '8.4', previousCgpa: '', academicPerformance: 'Good', backlogs: '0', attendance: '91', shortTermGoal: 'Get a campus placement', longTermGoal: 'Work as an engineer at a product company', targetIndustry: 'Data & Artificial Intelligence', targetDomain: 'Machine Learning', targetJobRole: 'MLOps Engineer' };

test('profile validation accepts a good profile and rejects bad data', async () => {
  const ok = await run(profileRules, goodProfile);
  assert.deepStrictEqual(Object.keys(ok.errors), []);
  assert.strictEqual(ok.req.body.section, 'A');
  assert.strictEqual(ok.req.body.phone, '9876543210');
  const bad = await run(profileRules, { ...goodProfile, cgpa: '11', attendance: '120', semester: '9', targetJobRole: 'Web Developer', longTermGoal: 'Graduate with distinction' });
  ['cgpa', 'attendance', 'semester', 'targetJobRole', 'longTermGoal'].forEach((k) => assert.ok(bad.errors[k], `expected error on ${k}`));
});
