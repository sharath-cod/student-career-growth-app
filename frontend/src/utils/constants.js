export const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Science & Engineering',
  'Artificial Intelligence & Machine Learning',
  'Data Science',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Other',
];

export const USN_REGEX = /^[A-Z0-9]{6,15}$/;
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/;
export const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

// Where each role lands after login. Students with an incomplete profile go to the profile form first.
export function homePathFor(user, profileCompleted = true) {
  if (!user) return '/login';
  if (user.role === 'admin') return '/admin/dashboard';
  return profileCompleted ? '/student/dashboard' : '/student/profile';
}
