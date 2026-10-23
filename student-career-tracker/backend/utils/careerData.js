// Single source of truth for the nested career dropdowns.
// The frontend fetches this from GET /api/students/options, and the backend uses it to validate.

// short-term goal -> long-term goals
const GOALS = {
  'Get a campus placement': [
    'Work as an engineer at a product company',
    'Grow into a technical lead or architect',
    'Move into engineering management',
  ],
  'Secure an internship': [
    'Convert the internship into a full-time role',
    'Build a career in a specialised technical domain',
    'Become a researcher or R&D engineer',
  ],
  'Prepare for higher studies (GATE / GRE / CAT)': [
    'Complete an M.Tech / MS at a reputed institute',
    'Pursue a PhD and a research career',
    'Complete an MBA and move into tech management',
  ],
  'Build projects and a portfolio': [
    'Become a freelance developer or consultant',
    'Start my own tech venture',
    'Work as an open-source contributor and engineer',
  ],
  'Improve academic performance': [
    'Graduate with distinction',
    'Get a job through strong academics',
    'Qualify for higher studies',
  ],
};

// industry -> domain -> job roles
const INDUSTRIES = {
  'IT Services & Product Companies': {
    'Software Development': ['Software Developer', 'Software Engineer', 'QA / Test Automation Engineer'],
    'Web Development': ['Full Stack Developer', 'Frontend Developer', 'Backend Developer'],
    'Mobile Development': ['Android Developer', 'iOS Developer', 'Cross-platform App Developer'],
    'Cloud Computing': ['Cloud Engineer', 'Cloud Architect', 'Cloud Support Engineer'],
    DevOps: ['DevOps Engineer', 'Site Reliability Engineer', 'Platform Engineer'],
    Database: ['Database Administrator', 'Data Engineer', 'Database Developer'],
  },
  'Data & Artificial Intelligence': {
    'Artificial Intelligence': ['AI Engineer', 'Research Engineer', 'Prompt / LLM Application Engineer'],
    'Machine Learning': ['Machine Learning Engineer', 'MLOps Engineer', 'Computer Vision Engineer'],
    'Data Science': ['Data Scientist', 'Applied Scientist', 'Data Science Analyst'],
    'Data Analytics': ['Data Analyst', 'Business Intelligence Analyst', 'Analytics Engineer'],
  },
  'Cyber Security & Networking': {
    'Cyber Security': ['Cyber Security Analyst', 'Penetration Tester', 'Security Engineer'],
    Networking: ['Network Engineer', 'Network Security Engineer', 'Systems Administrator'],
  },
  'Core Engineering & Electronics': {
    'Embedded Systems & IoT': ['Embedded Software Engineer', 'IoT Engineer', 'Firmware Engineer'],
    'VLSI & Electronics': ['VLSI Design Engineer', 'Verification Engineer', 'Electronics Engineer'],
  },
  Other: {
    Other: ['Other'],
  },
};

const ACADEMIC_PERFORMANCE = ['Excellent', 'Good', 'Average', 'Needs Improvement'];

const has = (obj, key) => typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key);

function isValidGoalPair(short, long) {
  return has(GOALS, short) && GOALS[short].includes(long);
}

function isValidCareerPath(industry, domain, role) {
  return has(INDUSTRIES, industry) && has(INDUSTRIES[industry], domain) && INDUSTRIES[industry][domain].includes(role);
}

module.exports = { GOALS, INDUSTRIES, ACADEMIC_PERFORMANCE, isValidGoalPair, isValidCareerPath };
