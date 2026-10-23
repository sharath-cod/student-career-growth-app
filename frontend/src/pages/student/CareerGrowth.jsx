import { useEffect, useState } from 'react';
import { Check, Clock, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner.jsx';
import { Card, PageHeader, ProgressBar, Ring } from '../../components/ui.jsx';
import api, { parseError } from '../../services/api.js';
import { useCatalog } from '../../hooks/useCatalog.js';

const ICON = { Completed: <Check size={16} className="text-pine" />, Learning: <Clock size={16} className="text-signal" />, 'Not Started': <X size={16} className="text-danger" /> };

export default function CareerGrowth() {
  const catalog = useCatalog();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/career').then(({ data: d }) => setData(d)).catch((e) => toast.error(parseError(e).message));
  }, []);

  async function mark(skillName, status) {
    try {
      const { data: d } = await api.put('/career/requirements', { skillName, status });
      setData(d);
    } catch (e) { toast.error(parseError(e).message); }
  }

  if (!data || !catalog) return <Spinner />;
  const { items, missing, nextSteps, readiness, completed, learning, total, jobRole } = data;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Career growth" subtitle={`Requirements for your target job: ${jobRole}. Mark what you have finished. Skills you add also count automatically.`} />

      <div className="grid gap-6 md:grid-cols-[auto_1fr]">
        <Card className="flex items-center justify-center"><Ring value={readiness} size={170} /></Card>
        <Card title="Where you stand">
          <p className="text-sm text-muted">{completed} of {total} requirements completed · {learning} in progress · {total - completed - learning} not started</p>
          <div className="mt-3"><ProgressBar value={readiness} label="Career readiness" /></div>
          <p className="mt-4 text-xs text-muted">A requirement counts as completed when you mark it so, when a matching skill is at 60% or more, or when a matching technology is at Intermediate level or above.</p>
        </Card>
      </div>

      <Card title="Requirements for this role">
        <ul className="divide-y divide-line">
          {items.map((i) => (
            <li key={i.name} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3">
                {ICON[i.status]}
                <div>
                  <p className="font-semibold">{i.name}</p>
                  <p className="text-xs text-muted">
                    {i.category}{i.currentLevel ? ` · You: ${i.currentLevel}${i.percentage !== null ? ` ${i.percentage}%` : ''}` : ''}
                    {i.derivedStatus !== 'Not Started' && i.derivedStatus === i.status ? ' · from your skills' : ''}
                  </p>
                </div>
              </div>
              <select aria-label={`Status of ${i.name}`} className="input w-40" value={i.status}
                onChange={(e) => mark(i.name, e.target.value)}>
                {catalog.reqStatuses.map((s) => <option key={s}>{s}</option>)}
              </select>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="What am I missing for my target job?">
          {!missing.length ? <p className="text-sm text-muted">Nothing missing. You have everything on the list for {jobRole}.</p> : (
            <>
              <h3 className="mb-2 text-sm font-semibold text-muted">Missing skills</h3>
              <ul className="mb-5 flex flex-wrap gap-2">{missing.map((m) => <li key={m.name} className="rounded-full bg-danger-light px-3 py-1 text-sm text-danger">{m.name}</li>)}</ul>
            </>
          )}
        </Card>
        <Card title="Recommended next steps">
          {!nextSteps.length ? <p className="text-sm text-muted">No steps needed right now. Keep your weekly updates going.</p> : (
            <ol className="list-decimal space-y-2 pl-5 text-sm">{nextSteps.map((s) => <li key={s.skill}>{s.text}</li>)}</ol>
          )}
        </Card>
      </div>
    </div>
  );
}
