module.exports = {
  ROLES: { STUDENT: 'student', ADMIN: 'admin' },
  DEPARTMENTS: [
    'Computer Science & Engineering',
    'Information Science & Engineering',
    'Artificial Intelligence & Machine Learning',
    'Data Science',
    'Electronics & Communication',
    'Electrical & Electronics',
    'Mechanical Engineering',
    'Civil Engineering',
    'Other',
  ],
  USN_REGEX: /^[A-Z0-9]{6,15}$/,
  PASSWORD_REGEX: /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/,
};
