const { LEVEL_RANK } = require('../utils/techCatalog');

const norm = (s) => String(s || '').toLowerCase().trim();
const ORDER = { 'Not Started': 0, Learning: 1, Completed: 2 };
const higher = (a, b) => (ORDER[a] >= ORDER[b] ? a : b);

// A requirement is "Completed" when the student marked it so, OR their skills show it:
//   skill >= 60%  or  technology at Intermediate level or above  -> Completed
//   any lower skill / technology entry                           -> Learning
// The student's manual mark can raise the status but never lowers what their skills prove.
function computeRequirements({ requiredSkills = [], skills = [], technologies = [], statuses = [] }) {
  const skillMap = new Map(skills.map((s) => [norm(s.name), s]));
  const techMap = new Map(technologies.map((t) => [norm(t.name), t]));
  const manual = new Map(statuses.map((s) => [norm(s.skillName), s.status]));

  const items = requiredSkills.map((r) => {
    const k = norm(r.name);
    const sk = skillMap.get(k);
    const tc = techMap.get(k);
    let derived = 'Not Started';
    if (sk) derived = sk.percentage >= 60 ? 'Completed' : 'Learning';
    else if (tc) derived = (LEVEL_RANK[tc.level] || 0) >= 2 ? 'Completed' : 'Learning';
    const manualStatus = manual.get(k) || 'Not Started';
    return {
      name: r.name,
      category: r.category,
      status: higher(manualStatus, derived),
      manualStatus,
      derivedStatus: derived,
      currentLevel: sk ? sk.level : tc ? tc.level : null,
      percentage: sk ? sk.percentage : null,
    };
  });

  const total = items.length;
  const completed = items.filter((i) => i.status === 'Completed').length;
  const learning = items.filter((i) => i.status === 'Learning').length;
  return {
    items,
    total,
    completed,
    learning,
    readiness: total ? Math.round((completed / total) * 100) : 0,
    missing: items.filter((i) => i.status !== 'Completed'),
  };
}

const SPECIAL = {
  'Deep Learning': 'Learn Deep Learning basics (neural networks and backpropagation)',
  PyTorch: 'Complete one PyTorch project',
  TensorFlow: 'Complete one TensorFlow project',
  Docker: 'Learn Docker fundamentals and containerise one of your projects',
  Kubernetes: 'Learn Kubernetes basics and deploy a sample application',
  AWS: 'Complete an AWS beginner course (Cloud Practitioner level)',
  'Microsoft Azure': 'Complete the Azure Fundamentals learning path',
  'Google Cloud': 'Complete a Google Cloud fundamentals course',
  SQL: 'Practise SQL every day: joins, grouping and subqueries',
  'Git & Version Control': 'Learn Git and publish your projects on GitHub',
  'Data Structures & Algorithms': 'Solve three DSA problems every week',
  Statistics: 'Revise statistics: distributions, hypothesis testing and regression',
  'System Design': 'Study system design basics and design one small system on paper',
  'CI/CD': 'Set up a CI pipeline for one of your projects',
};

// Rule-based next steps (no AI service needed). Skills already being learned come first.
function nextSteps(items, limit = 5) {
  const pending = items.filter((i) => i.status !== 'Completed');
  const ordered = [...pending.filter((i) => i.status === 'Learning'), ...pending.filter((i) => i.status === 'Not Started')];
  return ordered.slice(0, limit).map((i) => ({
    skill: i.name,
    text:
      i.status === 'Learning' && !SPECIAL[i.name]
        ? `Finish learning ${i.name} and show it in one project`
        : SPECIAL[i.name] || `Learn ${i.name} basics and build a small project with it`,
  }));
}

module.exports = { computeRequirements, nextSteps, norm };
