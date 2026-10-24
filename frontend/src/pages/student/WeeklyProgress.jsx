import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import FormModal from '../../components/FormModal.jsx';
import Spinner from '../../components/Spinner.jsx';
import { Badge, EmptyState, PageHeader, Tabs } from '../../components/ui.jsx';
import { useList } from '../../hooks/useList.js';
import api from '../../services/api.js';
import { fmtDate, joinTags, splitTags, toDateInput, today } from '../../utils/format.js';

export default function WeeklyProgress() {
  const { items, loading, save } = useList('/progress');
  const [editing, setEditing] = useState(null);
  const [tab, setTab] = useState('weeks');

  async function openNew() {
    let next = { nextWeek: items.length + 1, suggestedProgress: '' };
    try { next = (await api.get('/progress/next')).data; } catch (e) { /* use defaults */ }
    setEditing({ weekNumber: String(next.nextWeek), date: today(), overallProgress: String(next.suggestedProgress ?? ''), projectsCompleted: '0', certificationsCompleted: '0' });
  }

  const isNew = editing && !editing._id;
  const fields = [
    { name: 'weekNumber', label: 'Week number', type: 'number', min: 1, max: 104, integer: true, required: true, span: 1, readOnly: !isNew },
    { name: 'date', label: 'Date', type: 'date', required: true, span: 1 },
    { name: 'overallProgress', label: 'Overall progress (%)', type: 'number', min: 0, max: 100, required: true, span: 1, hint: 'Your own estimate. Starts at your average skill level.' },
    { name: 'cgpa', label: 'CGPA this week (optional)', type: 'number', min: 0, max: 10, span: 1, hint: 'Only if it changed' },
    { name: 'newSkills', label: 'New skills learned', type: 'tags', hint: 'Separate with commas' },
    { name: 'technologiesLearned', label: 'Technologies learned', type: 'tags', hint: 'Separate with commas' },
    { name: 'projectsCompleted', label: 'Projects completed', type: 'number', min: 0, integer: true, span: 1 },
    { name: 'certificationsCompleted', label: 'Certifications completed', type: 'number', min: 0, integer: true, span: 1 },
    { name: 'clubActivities', label: 'Club activities this week' },
    { name: 'learned', label: 'What I learned this week', type: 'textarea', required: true },
    { name: 'problemsFaced', label: 'Problems faced', type: 'textarea' },
    { name: 'nextGoal', label: "Next week's goal", type: 'textarea', required: true },
  ];

  const submit = (v) => save(editing._id, {
    weekNumber: Number(v.weekNumber), date: v.date, cgpa: v.cgpa === '' ? null : Number(v.cgpa), overallProgress: Number(v.overallProgress),
    newSkills: splitTags(v.newSkills), technologiesLearned: splitTags(v.technologiesLearned),
    projectsCompleted: Number(v.projectsCompleted || 0), certificationsCompleted: Number(v.certificationsCompleted || 0),
    clubActivities: v.clubActivities, problemsFaced: v.problemsFaced, learned: v.learned, nextGoal: v.nextGoal,
  });

  // Skill history matrix: skills as rows, weeks as columns
  const weeks = items;
  const skillNames = [...new Set(weeks.flatMap((w) => (w.skillSnapshot || []).map((s) => s.name)))];

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Weekly progress" subtitle="Log one update each week. Every week is kept, so your growth stays visible over time."
        action={<button className="btn-primary" onClick={openNew}><Plus size={16} /> Log a week</button>} />
      <Tabs tabs={[['weeks', 'Weekly records'], ['skills', 'Skill history']]} value={tab} onChange={setTab} />
      {loading ? <Spinner /> : !items.length ? (
        <EmptyState title="No weekly updates yet" text="Log week 1 to start your growth history." action={<button className="btn-primary" onClick={openNew}>Log week 1</button>} />
      ) : tab === 'weeks' ? (
        <div className="space-y-4">
          {[...items].reverse().map((w) => (
            <article key={w._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold">Week {w.weekNumber}</h3>
                  <p className="text-xs text-muted">{fmtDate(w.date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>Progress {w.overallProgress}%</Badge>
                  <Badge className="bg-pine text-on-pine">Readiness {w.careerReadiness}%</Badge>
                  <button className="rounded p-1.5 hover:bg-pine-light" onClick={() => setEditing(w)} aria-label={`Edit week ${w.weekNumber}`}><Pencil size={16} /></button>
                </div>
              </div>
              <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <div><dt className="text-muted">What I learned</dt><dd>{w.learned}</dd></div>
                <div><dt className="text-muted">Next week's goal</dt><dd>{w.nextGoal}</dd></div>
                {w.problemsFaced && <div><dt className="text-muted">Problems faced</dt><dd>{w.problemsFaced}</dd></div>}
                {!!w.newSkills?.length && <div><dt className="text-muted">New skills</dt><dd>{w.newSkills.join(', ')}</dd></div>}
                {!!w.technologiesLearned?.length && <div><dt className="text-muted">Technologies</dt><dd>{w.technologiesLearned.join(', ')}</dd></div>}
                <div><dt className="text-muted">Done this week</dt><dd>{w.projectsCompleted} projects · {w.certificationsCompleted} certificates{w.cgpa !== null && w.cgpa !== undefined ? ` · CGPA ${w.cgpa}` : ''}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      ) : !skillNames.length ? (
        <EmptyState title="No skill history yet" text="Add skills first. Each weekly update saves a snapshot of your skill levels." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-line bg-paper text-muted">
              <tr><th className="px-4 py-3 font-medium">Skill</th>{weeks.map((w) => <th key={w._id} className="px-4 py-3 font-medium">Week {w.weekNumber}</th>)}</tr>
            </thead>
            <tbody>
              {skillNames.map((n) => (
                <tr key={n} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-semibold">{n}</td>
                  {weeks.map((w) => {
                    const s = (w.skillSnapshot || []).find((x) => x.name === n);
                    return <td key={w._id} className="px-4 py-3">{s ? `${s.level} · ${s.percentage}%` : <span className="text-muted">-</span>}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && <FormModal wide title={isNew ? 'Log a week' : `Edit week ${editing.weekNumber}`} fields={fields}
        initial={isNew ? editing : { ...editing, weekNumber: String(editing.weekNumber), date: toDateInput(editing.date), cgpa: editing.cgpa ?? '', newSkills: joinTags(editing.newSkills), technologiesLearned: joinTags(editing.technologiesLearned) }}
        onSubmit={submit} onClose={() => setEditing(null)} />}
    </div>
  );
}
