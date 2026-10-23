const { INDUSTRIES } = require('./careerData');
const { lookupSkill } = require('./techCatalog');

// Required skills per job role (every name exists in techCatalog).
const REQUIRED = {
  'Software Developer': ['Java', 'Data Structures & Algorithms', 'Object-Oriented Programming', 'SQL', 'Git & Version Control', 'Operating Systems', 'REST API Design', 'Test Automation'],
  'Software Engineer': ['Python', 'Data Structures & Algorithms', 'Object-Oriented Programming', 'System Design', 'SQL', 'Git & Version Control', 'Operating Systems', 'CI/CD'],
  'QA / Test Automation Engineer': ['Manual Testing', 'Test Automation', 'Selenium', 'API Testing', 'Python', 'SQL', 'Git & Version Control', 'CI/CD'],
  'Full Stack Developer': ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'REST API Design', 'Git & Version Control'],
  'Frontend Developer': ['HTML', 'CSS', 'JavaScript', 'React', 'Tailwind CSS', 'TypeScript', 'REST API Design', 'Git & Version Control'],
  'Backend Developer': ['Node.js', 'Express', 'REST API Design', 'SQL', 'MongoDB', 'Docker', 'System Design', 'Git & Version Control'],
  'Android Developer': ['Kotlin', 'Java', 'Android SDK', 'Jetpack Compose', 'REST API Design', 'SQL', 'Git & Version Control'],
  'iOS Developer': ['Swift', 'SwiftUI', 'REST API Design', 'Object-Oriented Programming', 'SQL', 'Git & Version Control'],
  'Cross-platform App Developer': ['Flutter', 'Dart', 'React Native', 'JavaScript', 'REST API Design', 'Git & Version Control'],
  'Cloud Engineer': ['Cloud Fundamentals', 'AWS', 'Linux', 'Docker', 'Infrastructure as Code', 'Computer Networks', 'Shell Scripting', 'Cloud Security'],
  'Cloud Architect': ['AWS', 'Microsoft Azure', 'Cloud Security', 'System Design', 'Kubernetes', 'Infrastructure as Code', 'Computer Networks', 'Serverless'],
  'Cloud Support Engineer': ['Cloud Fundamentals', 'AWS', 'Linux', 'Computer Networks', 'Shell Scripting', 'SQL'],
  'DevOps Engineer': ['Linux', 'Shell Scripting', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'Terraform', 'Git & Version Control', 'Monitoring & Observability'],
  'Site Reliability Engineer': ['Linux', 'Python', 'Kubernetes', 'Monitoring & Observability', 'CI/CD', 'Computer Networks', 'Infrastructure as Code'],
  'Platform Engineer': ['Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Linux', 'Go', 'GitHub Actions'],
  'Database Administrator': ['SQL', 'MySQL', 'PostgreSQL', 'Database Design', 'Linux', 'Shell Scripting', 'MongoDB'],
  'Data Engineer': ['Python', 'SQL', 'ETL & Data Pipelines', 'Apache Spark', 'Apache Kafka', 'Data Warehousing', 'Git & Version Control', 'AWS'],
  'Database Developer': ['SQL', 'Database Design', 'PostgreSQL', 'MySQL', 'Python', 'Git & Version Control'],
  'AI Engineer': ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Natural Language Processing', 'Git & Version Control', 'Docker'],
  'Research Engineer': ['Python', 'Deep Learning', 'PyTorch', 'Linear Algebra', 'Statistics', 'Neural Networks', 'Git & Version Control'],
  'Prompt / LLM Application Engineer': ['Python', 'LLM Applications', 'Prompt Engineering', 'RAG', 'Hugging Face', 'REST API Design', 'Git & Version Control'],
  'Machine Learning Engineer': ['Python', 'SQL', 'Statistics', 'Machine Learning', 'Deep Learning', 'PyTorch', 'Docker', 'AWS', 'Git & Version Control'],
  'MLOps Engineer': ['Python', 'Docker', 'Kubernetes', 'MLOps', 'MLflow', 'Model Deployment', 'CI/CD', 'AWS'],
  'Computer Vision Engineer': ['Python', 'Computer Vision', 'OpenCV', 'Deep Learning', 'PyTorch', 'NumPy', 'Git & Version Control'],
  'Data Scientist': ['Python', 'SQL', 'Statistics', 'Machine Learning', 'Pandas', 'NumPy', 'Scikit-learn', 'Data Visualization', 'Git & Version Control', 'Cloud Fundamentals'],
  'Applied Scientist': ['Python', 'Statistics', 'Machine Learning', 'Deep Learning', 'Linear Algebra', 'PyTorch', 'Feature Engineering'],
  'Data Science Analyst': ['Python', 'SQL', 'Statistics', 'Pandas', 'Data Visualization', 'Machine Learning', 'Excel'],
  'Data Analyst': ['Excel', 'SQL', 'Statistics', 'Data Cleaning', 'Power BI', 'Tableau', 'Python', 'Data Visualization'],
  'Business Intelligence Analyst': ['SQL', 'Power BI', 'Tableau', 'Excel', 'Data Visualization', 'Data Warehousing', 'Statistics'],
  'Analytics Engineer': ['SQL', 'Python', 'Data Warehousing', 'ETL & Data Pipelines', 'Git & Version Control', 'Data Visualization'],
  'Cyber Security Analyst': ['Cyber Security Basics', 'Network Security', 'Linux', 'SIEM', 'Incident Response', 'Vulnerability Assessment', 'Cryptography'],
  'Penetration Tester': ['Penetration Testing', 'Kali Linux', 'Web Application Security', 'Ethical Hacking', 'Linux', 'Python', 'Network Security'],
  'Security Engineer': ['Network Security', 'Cryptography', 'Cloud Security', 'Linux', 'Vulnerability Assessment', 'Python', 'Incident Response'],
  'Network Engineer': ['Computer Networks', 'TCP/IP', 'Routing & Switching', 'Cisco CCNA', 'Network Troubleshooting', 'Linux'],
  'Network Security Engineer': ['Network Security', 'TCP/IP', 'Routing & Switching', 'Cryptography', 'Cisco CCNA', 'SIEM'],
  'Systems Administrator': ['Linux', 'Windows Server', 'Shell Scripting', 'Computer Networks', 'Monitoring & Observability', 'Network Troubleshooting'],
  'Embedded Software Engineer': ['C', 'Embedded C', 'RTOS', 'Microcontrollers', 'I2C / SPI / UART', 'C++', 'Git & Version Control'],
  'IoT Engineer': ['Arduino', 'Raspberry Pi', 'Sensors & Interfacing', 'MQTT', 'Embedded C', 'Python', 'IoT Protocols'],
  'Firmware Engineer': ['Embedded C', 'C', 'RTOS', 'Microcontrollers', 'I2C / SPI / UART', 'Git & Version Control'],
  'VLSI Design Engineer': ['Digital Design', 'Verilog', 'VHDL', 'FPGA', 'Analog Electronics', 'Scripting (Perl/TCL)'],
  'Verification Engineer': ['SystemVerilog', 'UVM', 'Digital Design', 'Verilog', 'Scripting (Perl/TCL)'],
  'Electronics Engineer': ['Analog Electronics', 'Circuit Design', 'PCB Design', 'MATLAB', 'Microcontrollers', 'Digital Design'],
  Other: ['Communication', 'Problem Solving', 'Teamwork'],
};

function buildJobRoles() {
  const out = [];
  for (const [industry, domains] of Object.entries(INDUSTRIES)) {
    for (const [domain, roles] of Object.entries(domains)) {
      for (const name of roles) {
        const required = REQUIRED[name] || [];
        out.push({
          name,
          industry,
          domain,
          requiredSkills: required.map((s) => ({ name: s, category: (lookupSkill(s) || {}).category || 'General' })),
        });
      }
    }
  }
  return out;
}

module.exports = { REQUIRED, buildJobRoles };
