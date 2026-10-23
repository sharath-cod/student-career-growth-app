import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { parseError } from '../../services/api.js';
import Spinner from '../../components/Spinner.jsx';

function Item({ label, value }) {
  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="font-medium">{value === undefined || value === '' || value === null ? '-' : value}</dd>
    </div>
  );
}

// Interim dashboard. Phase 6 replaces this with the full career growth dashboard.
export default function StudentDashboard() {
  const [p, setP] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/students/profile')
      .then(({ data }) => setP(data.profile))
      .catch((err) => setError(parseError(err).message));
  }, []);

  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!p) return <Spinner />;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Hello, {p.name.split(' ')[0]}</h1>
          <p className="mt-1 text-muted">Your skills, certificates and weekly growth will appear here as the next features are added.</p>
        </div>
        <Link to="/student/profile" className="btn-ghost">Edit profile</Link>
      </div>

      <section className="card p-6">
        <h2 className="text-lg font-bold">Profile</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-4">
          <Item label="Name" value={p.name} />
          <Item label="USN" value={p.usn} />
          <Item label="Department" value={p.department} />
          <Item label="CGPA" value={p.cgpa} />
          <Item label="Semester" value={`${p.semester} (Section ${p.section})`} />
          <Item label="Attendance" value={`${p.attendance}%`} />
          <Item label="Backlogs" value={p.backlogs} />
          <Item label="Academic performance" value={p.academicPerformance} />
        </dl>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-bold">Career goal</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <Item label="Short-term goal" value={p.shortTermGoal} />
          <Item label="Long-term goal" value={p.longTermGoal} />
          <Item label="Target industry" value={p.targetIndustry} />
          <Item label="Target domain" value={p.targetDomain} />
          <Item label="Target job role" value={p.targetJobRole} />
        </dl>
      </section>
    </div>
  );
}
