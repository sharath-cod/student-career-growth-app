import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import FormModal from '../../components/FormModal.jsx';
import TechPicker from '../../components/TechPicker.jsx';
import Spinner from '../../components/Spinner.jsx';
import { Badge, ConfirmDialog, EmptyState, PageHeader, ProgressBar, Tabs } from '../../components/ui.jsx';
import { useCatalog } from '../../hooks/useCatalog.js';
import { useList } from '../../hooks/useList.js';
import { LEVEL_TONE, fmtDate, joinTags, monthsText, splitTags, toDateInput } from '../../utils/format.js';

function SkillsTab({ catalog }) {
  const { items, loading, save, remove } = useList('/skills');
  const [editing, setEditing] = useState(null); // null | {} (new) | item
  const [deleting, setDeleting] = useState(null);

  const fields = [
    { type: 'custom', render: (ctx) => <TechPicker {...ctx} catalog={catalog} /> },
    { name: 'level', label: 'Level', type: 'select', options: catalog.levels, required: true, span: 1, onChange: (v, set, vals) => v && set('percentage', catalog.levelPercent[v]) },
    { name: 'percentage', label: 'Proficiency (%)', type: 'number', min: 0, max: 100, required: true, span: 1, hint: 'Filled from the level. Adjust it to match your real skill.' },
    { name: 'dateLearned', label: 'Date learned', type: 'date', span: 1 },
    { name: 'evidence', label: 'Evidence / project', span: 1, hint: 'A project or link that shows this skill' },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ];

  const submit = (v) => save(editing._id, {
    name: v.name, domain: v.domain, category: v.category, level: v.level, percentage: Number(v.percentage),
    dateLearned: v.dateLearned || null, evidence: v.evidence, notes: v.notes,
  });

  return (
    <>
      <div className="mb-4 flex justify-end"><button className="btn-primary" onClick={() => setEditing({})}><Plus size={16} /> Add skill</button></div>
      {loading ? <Spinner /> : !items.length ? (
        <EmptyState title="No skills yet" text="Add the skills you have. They count towards your career readiness for your target job." action={<button className="btn-primary" onClick={() => setEditing({})}>Add your first skill</button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((s) => (
            <article key={s._id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold">{s.name}</h3>
                  <p className="text-xs text-muted">{s.domain} · {s.category}</p>
                </div>
                <Badge className={LEVEL_TONE[s.level]}>{s.level}</Badge>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <ProgressBar value={s.percentage} label={`${s.name} proficiency`} />
                <span className="w-12 text-right text-sm font-semibold">{s.percentage}%</span>
              </div>
              {(s.evidence || s.notes) && <p className="mt-3 text-sm text-muted">{s.evidence}{s.evidence && s.notes ? ' · ' : ''}{s.notes}</p>}
              <div className="mt-4 flex items-center justify-between text-xs text-muted">
                <span>Learned {fmtDate(s.dateLearned)} · Updated {fmtDate(s.updatedAt)}</span>
                <span className="flex gap-1">
                  <button className="rounded p-1.5 hover:bg-pine-light" onClick={() => setEditing(s)} aria-label={`Edit ${s.name}`}><Pencil size={16} /></button>
                  <button className="rounded p-1.5 hover:bg-danger-light" onClick={() => setDeleting(s)} aria-label={`Delete ${s.name}`}><Trash2 size={16} /></button>
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
      {editing && <FormModal wide title={editing._id ? 'Edit skill' : 'Add skill'} fields={fields} initial={editing._id ? { ...editing, dateLearned: toDateInput(editing.dateLearned) } : { percentage: '' }} onSubmit={submit} onClose={() => setEditing(null)} />}
      {deleting && <ConfirmDialog title="Delete skill?" message={`"${deleting.name}" will be removed. Your past weekly records keep their history.`} onCancel={() => setDeleting(null)} onConfirm={() => { remove(deleting._id); setDeleting(null); }} />}
    </>
  );
}

function TechTab({ catalog }) {
  const { items, loading, save, remove } = useList('/technologies');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fields = [
    { type: 'custom', render: (ctx) => <TechPicker {...ctx} catalog={catalog} nameLabel="Technology" /> },
    { name: 'level', label: 'Skill level', type: 'select', options: catalog.levels, required: true, span: 1 },
    { name: 'experienceMonths', label: 'Experience (months)', type: 'number', min: 0, max: 600, integer: true, required: true, span: 1, hint: '18 = one and a half years' },
    { name: 'projects', label: 'Projects using this technology', type: 'tags', hint: 'Separate with commas' },
  ];
  const submit = (v) => save(editing._id, { name: v.name, domain: v.domain, category: v.category, level: v.level, experienceMonths: Number(v.experienceMonths), projects: splitTags(v.projects) });

  return (
    <>
      <div className="mb-4 flex justify-end"><button className="btn-primary" onClick={() => setEditing({})}><Plus size={16} /> Add technology</button></div>
      {loading ? <Spinner /> : !items.length ? (
        <EmptyState title="No technologies yet" text="List the tools and frameworks you have worked with, with your level and experience." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line bg-paper text-muted"><tr>{['Technology', 'Category', 'Level', 'Experience', 'Projects', 'Updated', ''].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {items.map((t) => (
                <tr key={t._id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-semibold">{t.name}</td>
                  <td className="px-4 py-3 text-muted">{t.category}</td>
                  <td className="px-4 py-3"><Badge className={LEVEL_TONE[t.level]}>{t.level}</Badge></td>
                  <td className="px-4 py-3">{monthsText(t.experienceMonths)}</td>
                  <td className="px-4 py-3 text-muted">{(t.projects || []).join(', ') || '-'}</td>
                  <td className="px-4 py-3 text-muted">{fmtDate(t.updatedAt)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button className="rounded p-1.5 hover:bg-pine-light" onClick={() => setEditing(t)} aria-label={`Edit ${t.name}`}><Pencil size={16} /></button>
                    <button className="rounded p-1.5 hover:bg-danger-light" onClick={() => setDeleting(t)} aria-label={`Delete ${t.name}`}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && <FormModal wide title={editing._id ? 'Edit technology' : 'Add technology'} fields={fields} initial={editing._id ? { ...editing, projects: joinTags(editing.projects) } : { experienceMonths: '0' }} onSubmit={submit} onClose={() => setEditing(null)} />}
      {deleting && <ConfirmDialog title="Delete technology?" message={`"${deleting.name}" will be removed from your list.`} onCancel={() => setDeleting(null)} onConfirm={() => { remove(deleting._id); setDeleting(null); }} />}
    </>
  );
}

export default function Skills() {
  const catalog = useCatalog();
  const [tab, setTab] = useState('skills');
  if (!catalog) return <Spinner />;
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Skills & technologies" subtitle="Pick a domain, then a category, then the skill. Keep your levels honest and update them as you grow." />
      <Tabs tabs={[['skills', 'Skills'], ['tech', 'Technologies']]} value={tab} onChange={setTab} />
      {tab === 'skills' ? <SkillsTab catalog={catalog} /> : <TechTab catalog={catalog} />}
    </div>
  );
}
