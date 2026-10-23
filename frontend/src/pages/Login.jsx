import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthShell from '../components/AuthShell.jsx';
import TextField from '../components/TextField.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { parseError } from '../services/api.js';
import { EMAIL_REGEX, homePathFor } from '../utils/constants.js';

export default function Login() {
  const { user, profileCompleted, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={homePathFor(user, profileCompleted)} replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    const next = {};
    if (!EMAIL_REGEX.test(form.email)) next.email = 'Enter a valid email address';
    if (!form.password) next.password = 'Password is required';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const data = await login(form.email.trim(), form.password, 'student');
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}`);
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
      title="Log in"
      subtitle="Pick up where you left off and log this week's progress."
      footer={
        <>
          <p>
            New here?{' '}
            <Link to="/register" className="font-semibold text-pine underline">
              Create a student account
            </Link>
          </p>
          <p className="mt-2">
            Teacher or admin?{' '}
            <Link to="/admin/login" className="font-semibold text-pine underline">
              Use the admin login
            </Link>
          </p>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <TextField label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
        <TextField label="Password" type="password" autoComplete="current-password" value={form.password} onChange={set('password')} error={errors.password} />
        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthShell>
  );
}
