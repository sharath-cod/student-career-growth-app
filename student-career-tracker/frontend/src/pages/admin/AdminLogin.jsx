import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthShell from '../../components/AuthShell.jsx';
import TextField from '../../components/TextField.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { parseError } from '../../services/api.js';
import { EMAIL_REGEX, homePathFor } from '../../utils/constants.js';

export default function AdminLogin() {
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
      // expectedRole makes the server refuse student accounts on this page.
      await login(form.email.trim(), form.password, 'admin');
      toast.success('Signed in');
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      toast.error(parseError(err).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Teacher and admin login"
      subtitle="Review weekly progress and download student reports."
      footer={
        <p>
          Student?{' '}
          <Link to="/login" className="font-semibold text-pine underline">
            Go to the student login
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <TextField label="Email" type="email" autoComplete="username" value={form.email} onChange={set('email')} error={errors.email} />
        <TextField label="Password" type="password" autoComplete="current-password" value={form.password} onChange={set('password')} error={errors.password} />
        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  );
}
