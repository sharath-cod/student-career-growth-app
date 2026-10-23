import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import FormModal from '../../components/FormModal.jsx';
import Spinner from '../../components/Spinner.jsx';
import { Badge, ConfirmDialog, EmptyState, PageHeader } from '../../components/ui.jsx';
import { useCatalog } from '../../hooks/useCatalog.js';
import { useList } from '../../hooks/useList.js';
import { fmtDate, toDateInput } from '../../utils/format.js';

export default function Activities() {
  const catalog = useCatalog();
  const { items, loading, save, remove } = useList('/activities');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  if (!catalog) return <Spinner />;

  const fields = [
    { name: 'clubName', label: 'Club name', required: true, span: 1 },
    { name: 'activityName', label: 'Activity name', required: true, span: 1 },
    { name: 'participationType', label: 'Participation type', type: 'select', options: catalog.participationTypes, required: true, span: 1 },
    { name: 'role', label: 'Position / role', span: 1 },
    { name: 'date', label: 'Date', type: 'date', required: true, span: 1 },
    { name: 'achievement', label: 'Achievement', span: 1 },
    { name: 'description', label: 'Description', type: 'textarea' },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Club & extracurricular activities" subtitle="Leadership and teamwork count too. Record what you take part in."
        action={<button className="btn-primary" onClick={() => setEditing({})}><Plus size={16} /> Add activity</button>} />
      {loading ? <Spinner /> : !items.length ? (
        <EmptyState title="No activities yet" text="Add a club, event or competition you took part in." action={<button className="btn-primary" onClick={() => setEditing({})}>Add activity</button>} />
      ) : (
        <div className="card divide-y divide-line">
          {items.map((a) => (
            <article key={a._id} className="flex flex-wrap items-start justify-between gap-3 p-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-bold">{a.activityName}</h3>
                  <Badge>{a.participationType}</Badge>
                </div>
                <p className="text-sm text-muted">{a.clubName}{a.role ? ` · ${a.role}` : ''} · {fmtDate(a.date)}</p>
                {a.achievement && <p className="mt-2 text-sm"><span className="font-semibold">Achievement:</span> {a.achievement}</p>}
                {a.description && <p className="mt-1 text-sm text-muted">{a.description}</p>}
              </div>
              <span className="flex gap-1">
                <button className="rounded p-1.5 hover:bg-pine-light" onClick={() => setEditing(a)} aria-label={`Edit ${a.activityName}`}><Pencil size={16} /></button>
                <button className="rounded p-1.5 hover:bg-danger-light" onClick={() => setDeleting(a)} aria-label={`Delete ${a.activityName}`}><Trash2 size={16} /></button>
              </span>
            </article>
          ))}
        </div>
      )}
      {editing && <FormModal title={editing._id ? 'Edit activity' : 'Add activity'} fields={fields} initial={editing._id ? { ...editing, date: toDateInput(editing.date) } : {}} onSubmit={(v) => save(editing._id, v)} onClose={() => setEditing(null)} />}
      {deleting && <ConfirmDialog title="Delete activity?" message={`"${deleting.activityName}" will be removed.`} onCancel={() => setDeleting(null)} onConfirm={() => { remove(deleting._id); setDeleting(null); }} />}
    </div>
  );
}
