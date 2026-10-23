const EDITABLE = [
  'phone', 'department', 'semester', 'section', 'cgpa', 'previousCgpa', 'academicPerformance', 'backlogs', 'attendance',
  'shortTermGoal', 'longTermGoal', 'targetIndustry', 'targetDomain', 'targetJobRole',
];
const REQUIRED_FOR_COMPLETE = [
  'phone', 'department', 'semester', 'section', 'cgpa', 'academicPerformance', 'attendance',
  'shortTermGoal', 'longTermGoal', 'targetIndustry', 'targetDomain', 'targetJobRole',
];
const isComplete = (s) => REQUIRED_FOR_COMPLETE.every((k) => s[k] !== undefined && s[k] !== null && s[k] !== '');

// Copies the allowed fields from body onto a Student document (does not save).
function applyProfile(student, body, { allowUsn = false } = {}) {
  if (body.name) student.name = body.name;
  if (allowUsn && body.usn) student.usn = body.usn;
  EDITABLE.forEach((k) => {
    if (body[k] !== undefined) student[k] = body[k];
  });
  if (body.previousCgpa === null) student.previousCgpa = undefined;
  student.profileCompleted = isComplete(student);
  return student;
}

module.exports = { applyProfile, isComplete, EDITABLE };
