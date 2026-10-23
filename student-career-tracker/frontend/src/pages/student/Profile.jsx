import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { parseError } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Spinner from '../../components/Spinner.jsx';
import TextField from '../../components/TextField.jsx';
import CareerChain from '../../components/CareerChain.jsx';

const EMPTY = {
  name: '', usn: '', email: '', phone: '', department: '', semester: '', section: '',
  cgpa: '', previousCgpa: '', academicPerformance: '', backlogs: '0', attendance: '',
  shortTermGoal: '', longTermGoal: '', targetIndustry: '', targetDomain: '', targetJobRole: '',
};

const str = (v) => (v === undefined || v === null ? '' : String(v));
const inRange = (v, min, max) => v !== '' && !Number.isNaN(Number(v)) && Number(v) >= min && Number(v) <= max;

function validate(f) {
  const e = {};
  if (!f.name.trim()) e.name = 'Name is required';
  if (!/^\+?\d{10,13}$/.test(f.phone.replace(/[\s-]/g, ''))) e.phone = 'Enter a valid phone number (10 to 13 digits)';
  if (!f.department) e.department = 'Choose your department';
  if (!(Number.isInteger(Number(f.semester)) && inRange(f.semester, 1, 8))) e.semester = 'Semester must be between 1 and 8';
  if (!/^[A-Za-z0-9]{1,3}$/.test(f.section.trim())) e.section = 'Section should be 1 to 3 letters or digits (for example A)';
  if (!inRange(f.cgpa, 0, 10)) e.cgpa = 'CGPA must be between 0 and 10';
  if (f.previousCgpa !== '' && !inRange(f.previousCgpa, 0, 10)) e.previousCgpa = 'Previous CGPA must be between 0 and 10';
  if (!f.academicPerformance) e.academicPerformance = 'Choose your academic performance';
  if (!(Number.isInteger(Number(f.backlogs)) && inRange(f.backlogs, 0, 50))) e.backlogs = 'Backlogs must be a whole number from 0 to 50';
  if (!inRange(f.attendance, 0, 100)) e.attendance = 'Attendance must be between 0 and 100';
  if (!f.shortTermGoal) e.shortTermGoal = 'Choose a short-term goal';
  if (f.shortTermGoal && !f.longTermGoal) e.longTermGoal = 'Choose a long-term goal';
  if (!f.targetIndustry) e.targetIndustry = 'Choose a target industry';
  if (f.targetIndustry && !f.targetDomain) e.targetDomain = 'Choose a target domain';
  if (f.targetDomain && !f.targetJobRole) e.targetJobRole = 'Choose a target job role';
  return e;
}

function Section({ title, subtitle, children }) {
  return (
    <section className="card p-6">
      <h2 className="text-lg font-bold">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function StudentProfile() {
  const { profileCompleted, setProfileCompleted } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [options, setOptions] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.get('/students/options'), api.get('/students/profile')])
      .then(([opt, prof]) => {
        if (cancelled) return;
        setOptions(opt.data);
        const p = prof.data.profile;
        setForm(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, k === 'backlogs' ? str(p[k] ?? 0) : str(p[k])])));
      })
      .catch((err) => toast.error(parseError(err).message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const patch = (p) => setForm((f) => ({ ...f, ...p }));

  async function onSubmit(ev) {
    ev.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) {
      toast.error('Please fix the highlighted fields.');
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.put('/students/profile', {
        name: form.name.trim(),
        phone: form.phone.trim(),
        department: form.department,
        semester: Number(form.semester),
        section: form.section.trim(),
        cgpa: Number(form.cgpa),
        previousCgpa: form.previousCgpa === '' ? null : Number(form.previousCgpa),
        academicPerformance: form.academicPerformance,
        backlogs: Number(form.backlogs),
        attendance: Number(form.attendance),
        shortTermGoal: form.shortTermGoal,
        longTermGoal: form.longTermGoal,
        targetIndustry: form.targetIndustry,
        targetDomain: form.targetDomain,
        targetJobRole: form.targetJobRole,
      });
      setProfileCompleted(data.profileCompleted);
      toast.success('Profile saved');
      navigate('/student/dashboard');
    } catch (err) {
      const { message, fieldErrors } = parseError(err);
      setErrors(fieldErrors);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Spinner />;
  if (!options) return <p className="text-sm text-danger">Could not load the form. Refresh the page and try again.</p>;

  return (
    <form onSubmit={onSubmit} noValidate className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{profileCompleted ? 'My profile' : 'Complete your profile'}</h1>
        <p className="mt-2 text-muted">
          {profileCompleted ? 'Keep this up to date. Your dashboard updates when you save.' : 'This takes about three minutes. You will see your career dashboard right after.'}
        </p>
      </div>

      <Section title="Basic information">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Student name" value={form.name} onChange={set('name')} error={errors.name} />
          <TextField label="USN" value={form.usn} readOnly hint="Set at registration. Ask your teacher to change it." inputClassName="bg-paper" />
          <TextField label="Email" value={form.email} readOnly inputClassName="bg-paper" />
          <TextField label="Phone" type="tel" inputMode="tel" value={form.phone} onChange={set('phone')} error={errors.phone} />
          <TextField label="Department" options={options.departments} value={form.department} onChange={set('department')} error={errors.department} />
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Semester" options={['1', '2', '3', '4', '5', '6', '7', '8']} value={form.semester} onChange={set('semester')} error={errors.semester} />
            <TextField label="Section" value={form.section} onChange={set('section')} error={errors.section} inputClassName="uppercase" />
          </div>
        </div>
      </Section>

      <Section title="Academic information">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="CGPA" type="number" step="0.01" min="0" max="10" inputMode="decimal" value={form.cgpa} onChange={set('cgpa')} error={errors.cgpa} />
          <TextField label="Previous semester CGPA" type="number" step="0.01" min="0" max="10" inputMode="decimal" value={form.previousCgpa} onChange={set('previousCgpa')} error={errors.previousCgpa} hint="Leave empty if this is your first semester." />
          <TextField label="Academic performance" options={options.academicPerformance} value={form.academicPerformance} onChange={set('academicPerformance')} error={errors.academicPerformance} />
          <TextField label="Backlogs" type="number" min="0" max="50" inputMode="numeric" value={form.backlogs} onChange={set('backlogs')} error={errors.backlogs} />
          <TextField label="Attendance (%)" type="number" step="0.1" min="0" max="100" inputMode="decimal" value={form.attendance} onChange={set('attendance')} error={errors.attendance} />
        </div>
      </Section>

      <Section title="Career goals" subtitle="Choose step by step. Each choice decides what you can pick next.">
        <CareerChain form={form} onChange={patch} options={options} errors={errors} />
      </Section>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary min-w-40" disabled={busy}>
          {busy ? 'Saving…' : profileCompleted ? 'Save changes' : 'Save and continue'}
        </button>
      </div>
    </form>
  );
}
