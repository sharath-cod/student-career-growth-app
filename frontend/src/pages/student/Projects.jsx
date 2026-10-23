import { useState } from 'react';
import { ExternalLink, Github, Pencil, Plus, Trash2 } from 'lucide-react';
import FormModal from '../../components/FormModal.jsx';
import Spinner from '../../components/Spinner.jsx';
import { Badge, ConfirmDialog, EmptyState, PageHeader } from '../../components/ui.jsx';
import { useCatalog } from '../../hooks/useCatalog.js';
import { useList } from '../../hooks/useList.js';
import { fmtDate, joinTags, splitTags, toDateInput } from '../../utils/format.js';

const TONE = { Planned: 'bg-signal-light text-ink', 'In Progress': 'bg-pine-light text-pine-dark', Completed: 'bg-pine text-white' };

export default function Projects() {
  const catalog = useCatalog();
  const { items, loading, save, remove } = useList('/projects');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  if (!catalog) return <Spinner />;

  const fields = [
    { name: 'name', label: 'Project name', required: true, span: 1 },
    { name: 'domain', label: 'Domain', type: 'select', options: Object.keys(catalog.techCatalog), span: 1 },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'technologies', label: 'Technologies used', type: 'tags', hint: 'Separate with commas, for example React, Node.js' },
    { name: 'githubUrl', label: 'GitHub URL', type: 'url', span: 1 },
    { name: 'liveUrl', label: 'Live URL', type: 'url', span: 1 },
    { name: 'role', label: 'Your role', span: 1 },
    { name: 'status', label: 'Status', type: 'select', options: catalog.projectStatuses, required: true, span: 1 },
    { name: 'startDate', label: 'Start date', type: 'date', span: 1 },
    { name: 'endDate', label: 'End date', type: 'date', span: 1 },
  ];
  const validate = (v) => (v.startDate && v.endDate && v.endDate < v.startDate ? { endDate: 'End date cannot be before the start date' } : {});
  const submit = (v) => save(editing._id, { ...v, technologies: splitTags(v.technologies), startDate: v.startDate || null, endDate: v.endDate || null, githubUrl: v.githubUrl || '', liveUrl: v.liveUrl || '' });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Projects" subtitle="Projects show employers what you can build. Add planned ones too." action={<button className="btn-primary" onClick={() => setEditing({})}><Plus size={16} /> Add project</button>} />
      {loading ? <Spinner /> : !items.length ? (
        <EmptyState title="No projects yet" text="Add a project you are building or planning." action={<button className="btn-primary" onClick={() => setEditing({})}>Add project</button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((p) => (
            <article key={p._id} className="card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-lg font-bold">{p.name}</h3>
                <Badge className={TONE[p.status]}>{p.status}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted">{[p.domain, p.role].filter(Boolean).join(' · ')}</p>
              {p.description && <p className="mt-3 text-sm">{p.description}</p>}
              {!!p.technologies?.length && <div className="mt-3 flex flex-wrap gap-1.5">{p.technologies.map((t) => <Badge key={t} className="bg-paper text-ink border border-line">{t}</Badge>)}</div>}
              <p className="mt-3 text-xs text-muted">{fmtDate(p.startDate)} to {p.endDate ? fmtDate(p.endDate) : 'now'}</p>
              <div className="mt-auto flex items-center justify-between pt-4">
                <span className="flex gap-2">
                  {p.githubUrl && <a className="btn-ghost px-3 py-1.5" href={p.githubUrl} target="_blank" rel="noreferrer"><Github size={15} /> Code</a>}
                  {p.liveUrl && <a className="btn-ghost px-3 py-1.5" href={p.liveUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Live</a>}
                </span>
                <span className="flex gap-1">
                  <button className="rounded p-1.5 hover:bg-pine-light" onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`}><Pencil size={16} /></button>
                  <button className="rounded p-1.5 hover:bg-danger-light" onClick={() => setDeleting(p)} aria-label={`Delete ${p.name}`}><Trash2 size={16} /></button>
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
      {editing && <FormModal wide title={editing._id ? 'Edit project' : 'Add project'} fields={fields} validate={validate}
        initial={editing._id ? { ...editing, technologies: joinTags(editing.technologies), startDate: toDateInput(editing.startDate), endDate: toDateInput(editing.endDate) } : { status: 'Planned' }} onSubmit={submit} onClose={() => setEditing(null)} />}
      {deleting && <ConfirmDialog title="Delete project?" message={`"${deleting.name}" will be removed.`} onCancel={() => setDeleting(null)} onConfirm={() => { remove(deleting._id); setDeleting(null); }} />}
    </div>
  );
}
