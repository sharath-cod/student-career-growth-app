import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthShell from '../components/AuthShell.jsx';
import TextField from '../components/TextField.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { parseError } from '../services/api.js';
import { DEPARTMENTS, EMAIL_REGEX, PASSWORD_REGEX, USN_REGEX, homePathFor } from '../utils/constants.js';

const empty = { name: '', usn: '', email: '', department: '', password: '', confirm: '' };

export default function Register() {
  const { user, profileCompleted, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={homePathFor(user, profileCompleted)} replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!USN_REGEX.test(form.usn.trim().toUpperCase())) e.usn = 'USN should be 6-15 letters/digits with no spaces';
    if (!EMAIL_REGEX.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.department) e.department = 'Choose your department';
    if (!PASSWORD_REGEX.test(form.password)) e.password = 'Use 8+ characters with at least one letter and one number';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    return e;
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const data = await register({
        name: form.name.trim(),
        usn: form.usn.trim().toUpperCase(),
        email: form.email.trim(),
        department: form.department,
        password: form.password,
      });
      toast.success('Account created');
      navigate(homePathFor(data.user, data.profileCompleted), { replace: true });
    } catch (err) {
      const { message, fieldErrors } = parseError(err);
      setErrors(fieldErrors);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Use your college email and USN. You will fill in the rest of your profile next."
      footer={
        <p>
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-pine underline">
            Log in
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <TextField label="Full name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="USN" value={form.usn} onChange={set('usn')} error={errors.usn} inputClassName="uppercase" />
          <TextField label="Department" options={DEPARTMENTS} value={form.department} onChange={set('department')} error={errors.department} />
        </div>
        <TextField label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Password" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} />
          <TextField label="Confirm password" type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}
