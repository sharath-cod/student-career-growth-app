import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Spinner from '../../components/Spinner.jsx';
import { Card, PageHeader, Stat } from '../../components/ui.jsx';
import api, { parseError } from '../../services/api.js';
import useChartColors from '../../hooks/useChartColors.js';

function BarBox({ data, x, y, color = 'a', domain }) {
  const cc = useChartColors();
  if (!data.length) return <p className="py-10 text-center text-sm text-muted">No data yet.</p>;
  return (
    <div className="h-60"><ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ left: -12, right: 8, top: 8 }}>
        <CartesianGrid stroke={cc.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={x} tick={cc.axis_tick} stroke={cc.grid} /><YAxis tick={cc.axis_tick} stroke={cc.grid} domain={domain} allowDecimals={false} /><Tooltip {...cc.tooltip} />
        <Bar dataKey={y} fill={cc[color]} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer></div>
  );
}

export default function AdminDashboard() {
  const cc = useChartColors();
  const [d, setD] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/admin/dashboard').then(({ data }) => setD(data)).catch((e) => setError(parseError(e).message)); }, []);
  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!d) return <Spinner />;
  const c = d.cards;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Overview" subtitle="How your students are doing this week." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Stat label="Total students" value={c.totalStudents} />
        <Stat label="Active students" value={c.activeStudents} sub="Updated in the last 30 days" />
        <Stat label="Average CGPA" value={c.averageCgpa || '-'} />
        <Stat label="Average career readiness" value={`${c.averageReadiness}%`} />
        <Stat label="Updated this week" value={c.updatedThisWeek} />
        <Stat label="Missing weekly update" value={c.missingWeeklyUpdate} sub="Not updated since Monday" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Average CGPA by semester"><BarBox data={d.cgpaBySemester} x="semester" y="cgpa" domain={[0, 10]} /></Card>
        <Card title="Career readiness distribution"><BarBox data={d.readinessDistribution} x="range" y="students" color="b" /></Card>
        <Card title="Skill growth (average skill % by week)">
          {!d.skillGrowth.length ? <p className="py-10 text-center text-sm text-muted">No weekly updates yet.</p> : (
            <div className="h-60"><ResponsiveContainer width="100%" height="100%">
              <LineChart data={d.skillGrowth} margin={{ left: -12, right: 8, top: 8 }}>
                <CartesianGrid stroke={cc.grid} strokeDasharray="3 3" /><XAxis dataKey="week" tick={cc.axis_tick} stroke={cc.grid} /><YAxis domain={[0, 100]} tick={cc.axis_tick} stroke={cc.grid} /><Tooltip {...cc.tooltip} />
                <Line type="monotone" dataKey="avgSkill" name="Avg skill %" stroke={cc.a} strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer></div>
          )}
        </Card>
        <Card title="Certifications by category"><BarBox data={d.certificationCount} x="category" y="count" /></Card>
        <Card title="Weekly student participation" className="lg:col-span-2"><BarBox data={d.weeklyParticipation} x="week" y="students" /></Card>
      </div>
    </div>
  );
}
