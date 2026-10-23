// Domain -> category -> skills/technologies. Used by the nested dropdowns and for validation.
const CATALOG = {
  'Software Development': {
    'Programming Languages': ['Python', 'Java', 'C', 'C++', 'JavaScript', 'TypeScript', 'Go'],
    'Core Computer Science': ['Data Structures & Algorithms', 'Object-Oriented Programming', 'Operating Systems', 'Computer Networks', 'System Design', 'Git & Version Control'],
    Testing: ['Manual Testing', 'Test Automation', 'Selenium', 'API Testing'],
  },
  'Web Development': {
    Frontend: ['HTML', 'CSS', 'JavaScript', 'React', 'Angular', 'Vue.js', 'Tailwind CSS'],
    Backend: ['Node.js', 'Express', 'Django', 'Spring Boot', 'REST API Design'],
  },
  'Mobile Development': {
    Android: ['Kotlin', 'Java', 'Android SDK', 'Jetpack Compose'],
    iOS: ['Swift', 'SwiftUI'],
    'Cross-platform': ['Flutter', 'Dart', 'React Native'],
  },
  'Cloud Computing': {
    'Cloud Platforms': ['AWS', 'Microsoft Azure', 'Google Cloud'],
    'Cloud Skills': ['Cloud Fundamentals', 'Serverless', 'Cloud Security', 'Infrastructure as Code'],
  },
  DevOps: {
    'Containers & Orchestration': ['Docker', 'Kubernetes'],
    'CI/CD & Automation': ['CI/CD', 'Jenkins', 'GitHub Actions', 'Terraform', 'Ansible'],
    Operations: ['Linux', 'Shell Scripting', 'Monitoring & Observability'],
  },
  Database: {
    Relational: ['SQL', 'MySQL', 'PostgreSQL', 'Database Design'],
    NoSQL: ['MongoDB', 'Redis'],
    'Data Engineering': ['ETL & Data Pipelines', 'Apache Spark', 'Apache Kafka', 'Data Warehousing'],
  },
  'Artificial Intelligence': {
    'Machine Learning': ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn'],
    'Deep Learning': ['Deep Learning', 'Neural Networks', 'Natural Language Processing'],
    'Generative AI': ['LLM Applications', 'Prompt Engineering', 'RAG', 'Hugging Face'],
  },
  'Machine Learning': {
    Foundations: ['Machine Learning', 'Statistics', 'Linear Algebra', 'Feature Engineering'],
    Libraries: ['Scikit-learn', 'NumPy', 'Pandas', 'XGBoost'],
    MLOps: ['MLOps', 'Model Deployment', 'MLflow'],
    'Computer Vision': ['Computer Vision', 'OpenCV'],
  },
  'Data Science': {
    Foundations: ['Python', 'Statistics', 'Machine Learning', 'Data Visualization'],
    Libraries: ['Pandas', 'NumPy', 'Scikit-learn', 'Matplotlib'],
    Tools: ['Jupyter', 'SQL', 'Git & Version Control'],
  },
  'Data Analytics': {
    Analysis: ['Excel', 'SQL', 'Statistics', 'Data Cleaning'],
    Visualization: ['Power BI', 'Tableau', 'Data Visualization'],
    Languages: ['Python', 'R'],
  },
  'Cyber Security': {
    Fundamentals: ['Cyber Security Basics', 'Cryptography', 'Network Security'],
    Offensive: ['Penetration Testing', 'Kali Linux', 'Web Application Security', 'Ethical Hacking'],
    Defensive: ['SIEM', 'Incident Response', 'Vulnerability Assessment'],
  },
  Networking: {
    Fundamentals: ['Computer Networks', 'TCP/IP', 'Routing & Switching', 'Network Troubleshooting'],
    Vendor: ['Cisco CCNA'],
    'Systems Administration': ['Linux', 'Windows Server', 'Shell Scripting'],
  },
  'Embedded Systems & IoT': {
    Programming: ['C', 'C++', 'Embedded C', 'RTOS'],
    Hardware: ['Microcontrollers', 'Arduino', 'Raspberry Pi', 'Sensors & Interfacing'],
    Protocols: ['I2C / SPI / UART', 'MQTT', 'IoT Protocols'],
  },
  'VLSI & Electronics': {
    'Digital Design': ['Digital Design', 'Verilog', 'VHDL', 'FPGA'],
    Verification: ['SystemVerilog', 'UVM', 'Scripting (Perl/TCL)'],
    Electronics: ['Analog Electronics', 'Circuit Design', 'PCB Design', 'MATLAB'],
  },
  // "Other" lets a student type any skill name.
  Other: {
    'General Skills': ['Communication', 'Problem Solving', 'Teamwork'],
  },
};

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const LEVEL_PERCENT = { Beginner: 25, Intermediate: 50, Advanced: 75, Expert: 95 };
const LEVEL_RANK = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };
const CERT_CATEGORIES = ['AWS', 'Python', 'Google', 'Coursera', 'NPTEL', 'Microsoft', 'Internship', 'Other'];
const PARTICIPATION_TYPES = ['Member', 'Volunteer', 'Coordinator', 'Team Lead', 'President', 'Organizer'];
const PROJECT_STATUSES = ['Planned', 'In Progress', 'Completed'];
const REQ_STATUSES = ['Not Started', 'Learning', 'Completed'];

function isValidSkill(domain, category, name) {
  if (!name) return false;
  if (domain === 'Other') return true;
  return Boolean(CATALOG[domain] && CATALOG[domain][category] && CATALOG[domain][category].includes(name));
}

// name -> first {domain, category} that contains it
function lookupSkill(name) {
  for (const [domain, cats] of Object.entries(CATALOG)) {
    for (const [category, names] of Object.entries(cats)) {
      if (names.includes(name)) return { domain, category };
    }
  }
  return null;
}

module.exports = { CATALOG, LEVELS, LEVEL_PERCENT, LEVEL_RANK, CERT_CATEGORIES, PARTICIPATION_TYPES, PROJECT_STATUSES, REQ_STATUSES, isValidSkill, lookupSkill };
