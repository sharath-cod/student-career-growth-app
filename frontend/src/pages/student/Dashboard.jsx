import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Spinner from '../../components/Spinner.jsx';
import { Badge, Card, EmptyState, ProgressBar, Ring, Stat } from '../../components/ui.jsx';
import api, { parseError } from '../../services/api.js';
import { LEVEL_TONE, fmtDate } from '../../utils/format.js';

const AXIS = { fontSize: 12, fill: '#5E6B66' };

function Chart({ data, lines, domain = [0, 100], empty }) {
  if (!data.length) return <p className="py-10 text-center text-sm text-muted">{empty}</p>;
  return (
    <div className="h-60">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: -12, right: 8, top: 8 }}>
          <CartesianGrid stroke="#D8DDD6" strokeDasharray="3 3" />
          <XAxis dataKey={lines.x} tick={AXIS} />
          <YAxis domain={domain} tick={AXIS} />
          <Tooltip />
          {lines.series.length > 1 && <Legend />}
          {lines.series.map((s) => <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={3} dot={{ r: 4 }} />)}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function StudentDashboard() {
  const [d, setD] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard').then(({ data }) => setD(data.dashboard)).catch((e) => setError(parseError(e).message));
  }, []);

  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!d) return <Spinner />;

  const p = d.profile;
  const w = d.weekly;
  const missing = d.requirements.missing;
  const noWeeks = !d.readinessTrend.length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{p.name}</h1>
          <p className="mt-1 text-muted">{p.usn} · {p.department} · CGPA {p.cgpa}</p>
        </div>
        <Link to="/student/weekly-progress" className="btn-primary">Log this week</Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <Card className="flex flex-col items-center justify-center px-8">
          <Ring value={d.readiness} size={200} />
          <p className="mt-3 text-sm text-muted">for {p.targetJobRole}</p>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Weekly growth">
            <div className="flex items-end justify-between">
              <div><p className="text-xs text-muted">Previous week</p><p className="font-display text-2xl font-bold">{w.previous === null ? '-' : `${w.previous}%`}</p></div>
              <div><p className="text-xs text-muted">Current</p><p className="font-display text-2xl font-bold">{w.current}%</p></div>
              <div className={`rounded-full px-3 py-1 text-sm font-bold ${w.growth === null ? 'bg-paper text-muted' : w.growth >= 0 ? 'bg-pine-light text-pine-dark' : 'bg-danger-light text-danger'}`}>
                {w.growth === null ? 'New' : `${w.growth >= 0 ? '+' : ''}${w.growth}%`}
              </div>
            </div>
            {w.nextWeekGoal && <p className="mt-4 text-sm"><span className="font-semibold">Goal for next week:</span> {w.nextWeekGoal}</p>}
          </Card>
          <Card title="Career goal">
            <dl className="space-y-1.5 text-sm">
              <div><dt className="inline text-muted">Short-term: </dt><dd className="inline">{p.shortTermGoal}</dd></div>
              <div><dt className="inline text-muted">Long-term: </dt><dd className="inline">{p.longTermGoal}</dd></div>
              <div><dt className="inline text-muted">Domain: </dt><dd className="inline">{p.targetDomain}</dd></div>
              <div><dt className="inline text-muted">Job role: </dt><dd className="inline font-semibold">{p.targetJobRole}</dd></div>
            </dl>
          </Card>
          <Stat label="Certificates" value={d.certificates.total} sub={`${d.certificates.thisMonth} this month`} />
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Projects done" value={d.projects.completed} sub={`${d.projects.inProgress} in progress`} />
            <Stat label="Club activities" value={d.activities.total} sub={`${d.technologiesCount} technologies`} />
          </div>
        </div>
      </div>

      {noWeeks && <EmptyState title="Your growth charts start with your first weekly update" text="Log week 1 and your readiness, skill growth and CGPA trends will appear here." action={<Link to="/student/weekly-progress" className="btn-primary">Log week 1</Link>} />}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Skill growth"><Chart data={d.skillGrowth} lines={{ x: 'week', series: [{ key: 'avgSkill', name: 'Average skill %', color: '#0F5C4D' }] }} empty="No weekly records yet." /></Card>
        <Card title="Career readiness by week"><Chart data={d.readinessTrend} lines={{ x: 'week', series: [{ key: 'careerReadiness', name: 'Career readiness %', color: '#0F5C4D' }, { key: 'overallProgress', name: 'Overall progress %', color: '#E3A32B' }] }} empty="No weekly records yet." /></Card>
        <Card title="CGPA trend"><Chart data={d.cgpaTrend} domain={[0, 10]} lines={{ x: 'label', series: [{ key: 'cgpa', name: 'CGPA', color: '#0F5C4D' }] }} empty="No CGPA data yet." /></Card>
        <Card title="Skill development">
          {!d.skills.length ? <p className="py-6 text-center text-sm text-muted">No skills added yet. <Link className="font-semibold text-pine underline" to="/student/skills">Add a skill</Link></p> : (
            <ul className="space-y-3">
              {d.skills.slice(0, 8).map((s) => (
                <li key={s._id}>
                  <div className="mb-1 flex items-center justify-between text-sm"><span className="font-medium">{s.name} <Badge className={LEVEL_TONE[s.level]}>{s.level}</Badge></span><span className="font-semibold">{s.percentage}%</span></div>
                  <ProgressBar value={s.percentage} label={s.name} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Required skills for your target job">
          <ul className="grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-2">
            {d.requirements.items.map((i) => <li key={i.name} className={i.status === 'Completed' ? 'text-pine-dark' : 'text-ink'}>{i.status === 'Completed' ? '✓' : i.status === 'Learning' ? '◐' : '○'} {i.name}</li>)}
          </ul>
          {!!missing.length && <p className="mt-4 text-sm"><span className="font-semibold">Missing:</span> {missing.map((m) => m.name).join(', ')}</p>}
          <Link to="/student/career-growth" className="mt-4 inline-block text-sm font-semibold text-pine underline">Open full gap analysis</Link>
        </Card>
        <Card title="Next recommended goals">
          {!d.nextSteps.length ? <p className="text-sm text-muted">You have covered all requirements. Keep your weekly updates going.</p> : <ol className="list-decimal space-y-2 pl-5 text-sm">{d.nextSteps.map((s) => <li key={s.skill}>{s.text}</li>)}</ol>}
          {d.lastUpdate && <p className="mt-4 text-xs text-muted">Last weekly update: {fmtDate(d.lastUpdate)}</p>}
        </Card>
      </div>
    </div>
  );
}
