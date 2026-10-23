import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileText, Pencil } from 'lucide-react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import CareerChain from '../../components/CareerChain.jsx';
import FormModal from '../../components/FormModal.jsx';
import Spinner from '../../components/Spinner.jsx';
import StudentActions from '../../components/StudentActions.jsx';
import { Badge, Card, EmptyState, ProgressBar, Ring } from '../../components/ui.jsx';
import { useCatalog } from '../../hooks/useCatalog.js';
import api, { parseError } from '../../services/api.js';
import { openFile } from '../../services/files.js';
import { LEVEL_TONE, fmtDate, monthsText } from '../../utils/format.js';

const Row = ({ k, v }) => <div><dt className="text-sm text-muted">{k}</dt><dd className="font-medium">{v === undefined || v === null || v === '' ? '-' : v}</dd></div>;
const str = (v) => (v === undefined || v === null ? '' : String(v));

export default function StudentDetail() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const catalog = useCatalog();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);

  const load = useCallback(() => api.get(`/admin/students/${id}`).then(({ data: d }) => setData(d)).catch((e) => setError(parseError(e).message)), [id]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (data && catalog && params.get('edit')) setEditing(true); }, [data, catalog, params]);

  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!data || !catalog) return <Spinner />;
  const { dashboard: d, lists } = data;
  const p = d.profile;
  const close = () => { setEditing(false); if (params.get('edit')) setParams({}); };

  const fields = [
    { name: 'name', label: 'Name', required: true, span: 1 },
    { name: 'usn', label: 'USN', required: true, span: 1 },
    { name: 'phone', label: 'Phone', required: true, span: 1 },
    { name: 'department', label: 'Department', type: 'select', options: catalog.departments, required: true, span: 1 },
    { name: 'semester', label: 'Semester', type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8'], required: true, span: 1 },
    { name: 'section', label: 'Section', required: true, span: 1 },
    { name: 'cgpa', label: 'CGPA', type: 'number', min: 0, max: 10, required: true, span: 1 },
    { name: 'previousCgpa', label: 'Previous CGPA', type: 'number', min: 0, max: 10, span: 1 },
    { name: 'academicPerformance', label: 'Academic performance', type: 'select', options: catalog.academicPerformance, required: true, span: 1 },
    { name: 'backlogs', label: 'Backlogs', type: 'number', min: 0, max: 50, integer: true, required: true, span: 1 },
    { name: 'attendance', label: 'Attendance (%)', type: 'number', min: 0, max: 100, required: true, span: 1 },
    { type: 'custom', render: ({ values, setMany, errors }) => <div><p className="mb-3 text-sm font-semibold">Career goals</p><CareerChain form={values} onChange={setMany} options={catalog} errors={errors} /></div> },
  ];
  const initial = Object.fromEntries(['name', 'usn', 'phone', 'department', 'semester', 'section', 'cgpa', 'previousCgpa', 'academicPerformance', 'backlogs', 'attendance', 'shortTermGoal', 'longTermGoal', 'targetIndustry', 'targetDomain', 'targetJobRole'].map((k) => [k, str(p[k])]));
  const submit = async (v) => {
    await api.put(`/admin/students/${id}`, {
      name: v.name.trim(), usn: v.usn.trim().toUpperCase(), phone: v.phone, department: v.department, semester: Number(v.semester), section: v.section,
      cgpa: Number(v.cgpa), previousCgpa: v.previousCgpa === '' ? null : Number(v.previousCgpa), academicPerformance: v.academicPerformance,
      backlogs: Number(v.backlogs), attendance: Number(v.attendance), shortTermGoal: v.shortTermGoal, longTermGoal: v.longTermGoal,
      targetIndustry: v.targetIndustry, targetDomain: v.targetDomain, targetJobRole: v.targetJobRole,
    });
    await load();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link to="/admin/students" className="inline-flex items-center gap-1.5 text-sm font-semibold text-pine"><ArrowLeft size={15} /> All students</Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{p.name}</h1>
          <p className="mt-1 text-muted">{p.usn} · {p.department} · {p.email}</p>
          {!p.profileCompleted && <Badge className="mt-2 bg-signal-light text-ink">Profile not completed by the student</Badge>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <button className="btn-ghost" onClick={() => setEditing(true)}><Pencil size={15} /> Edit profile</button>
          <StudentActions student={p} compact />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <Card className="flex flex-col items-center px-8"><Ring value={d.readiness} size={170} /><p className="mt-2 text-sm text-muted">for {p.targetJobRole || 'no target yet'}</p></Card>
        <Card title="Academic and career">
          <dl className="grid gap-4 sm:grid-cols-3">
            <Row k="CGPA" v={p.cgpa} /><Row k="Previous CGPA" v={p.previousCgpa} /><Row k="Attendance" v={p.attendance === undefined ? '' : `${p.attendance}%`} />
            <Row k="Semester" v={p.semester ? `${p.semester} (${p.section})` : ''} /><Row k="Backlogs" v={p.backlogs} /><Row k="Performance" v={p.academicPerformance} />
            <Row k="Short-term goal" v={p.shortTermGoal} /><Row k="Long-term goal" v={p.longTermGoal} /><Row k="Phone" v={p.phone} />
            <Row k="Industry" v={p.targetIndustry} /><Row k="Domain" v={p.targetDomain} /><Row k="Job role" v={p.targetJobRole} />
          </dl>
        </Card>
      </div>

      <Card title="Weekly growth">
        {!d.readinessTrend.length ? <p className="text-sm text-muted">No weekly updates yet.</p> : (
          <>
            <p className="mb-3 text-sm text-muted">Previous {d.weekly.previous === null ? '-' : `${d.weekly.previous}%`} → Current {d.weekly.current}% {d.weekly.growth !== null && <b className="text-ink">({d.weekly.growth >= 0 ? '+' : ''}{d.weekly.growth}%)</b>}</p>
            <div className="h-56"><ResponsiveContainer width="100%" height="100%">
              <LineChart data={d.readinessTrend} margin={{ left: -12, right: 8, top: 8 }}>
                <CartesianGrid stroke="#D8DDD6" strokeDasharray="3 3" /><XAxis dataKey="week" tick={{ fontSize: 12 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 12 }} /><Tooltip /><Legend />
                <Line type="monotone" dataKey="careerReadiness" name="Career readiness %" stroke="#0F5C4D" strokeWidth={3} />
                <Line type="monotone" dataKey="overallProgress" name="Overall progress %" stroke="#E3A32B" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer></div>
            <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-muted"><tr><th className="py-2 font-medium">Week</th><th className="font-medium">Date</th><th className="font-medium">Progress</th><th className="font-medium">Readiness</th><th className="font-medium">Learned</th></tr></thead>
              <tbody>{[...lists.progress].reverse().map((w) => <tr key={w._id} className="border-t border-line align-top"><td className="py-2 font-semibold">{w.weekNumber}</td><td>{fmtDate(w.date)}</td><td>{w.overallProgress}%</td><td>{w.careerReadiness}%</td><td className="max-w-md py-2 text-muted">{w.learned}</td></tr>)}</tbody>
            </table></div>
          </>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={`Skills (${lists.skills.length})`}>
          {!lists.skills.length ? <p className="text-sm text-muted">None added.</p> : <ul className="space-y-3">{lists.skills.map((s) => <li key={s._id}><div className="mb-1 flex justify-between text-sm"><span className="font-medium">{s.name} <Badge className={LEVEL_TONE[s.level]}>{s.level}</Badge></span><b>{s.percentage}%</b></div><ProgressBar value={s.percentage} label={s.name} /></li>)}</ul>}
        </Card>
        <Card title={`Technologies (${lists.technologies.length})`}>
          {!lists.technologies.length ? <p className="text-sm text-muted">None added.</p> : <ul className="space-y-2 text-sm">{lists.technologies.map((t) => <li key={t._id} className="flex justify-between"><span><b>{t.name}</b> <span className="text-muted">· {t.category}</span></span><span>{t.level} · {monthsText(t.experienceMonths)}</span></li>)}</ul>}
        </Card>
        <Card title={`Certificates (${lists.certificates.length})`}>
          {!lists.certificates.length ? <p className="text-sm text-muted">None added.</p> : <ul className="space-y-3 text-sm">{lists.certificates.map((c) => <li key={c._id} className="flex items-start justify-between gap-3"><span><b>{c.name}</b><br /><span className="text-muted">{c.organization} · {fmtDate(c.issueDate)}</span></span>{c.hasFile && <button className="btn-ghost px-2.5 py-1 text-xs" onClick={() => openFile(`/admin/certificates/${c._id}/file`)}><FileText size={14} /> File</button>}</li>)}</ul>}
        </Card>
        <Card title={`Projects (${lists.projects.length})`}>
          {!lists.projects.length ? <p className="text-sm text-muted">None added.</p> : <ul className="space-y-3 text-sm">{lists.projects.map((x) => <li key={x._id}><b>{x.name}</b> <Badge>{x.status}</Badge><br /><span className="text-muted">{(x.technologies || []).join(', ') || '-'}</span></li>)}</ul>}
        </Card>
        <Card title={`Club activities (${lists.activities.length})`}>
          {!lists.activities.length ? <p className="text-sm text-muted">None added.</p> : <ul className="space-y-3 text-sm">{lists.activities.map((a) => <li key={a._id}><b>{a.activityName}</b> <span className="text-muted">· {a.clubName} · {a.participationType} · {fmtDate(a.date)}</span></li>)}</ul>}
        </Card>
        <Card title="Career gap">
          {!d.requirements.items.length ? <p className="text-sm text-muted">No target role selected.</p> : (
            <>
              <ul className="grid gap-1 text-sm sm:grid-cols-2">{d.requirements.items.map((i) => <li key={i.name}>{i.status === 'Completed' ? '✓' : i.status === 'Learning' ? '◐' : '✗'} {i.name}</li>)}</ul>
              <p className="mt-3 text-sm"><b>Missing:</b> {d.requirements.missing.map((m) => m.name).join(', ') || 'none'}</p>
            </>
          )}
        </Card>
      </div>
      {editing && <FormModal wide title="Edit student profile" fields={fields} initial={initial} onSubmit={submit} onClose={close} />}
    </div>
  );
}
