import { useState } from 'react';
import { ExternalLink, FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import FormModal from '../../components/FormModal.jsx';
import Spinner from '../../components/Spinner.jsx';
import { Badge, ConfirmDialog, EmptyState, PageHeader } from '../../components/ui.jsx';
import { useCatalog } from '../../hooks/useCatalog.js';
import { useList } from '../../hooks/useList.js';
import { openFile } from '../../services/files.js';
import { fmtDate, toDateInput } from '../../utils/format.js';

export default function Certificates() {
  const catalog = useCatalog();
  const { items, loading, save, remove } = useList('/certificates');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  if (!catalog) return <Spinner />;

  const fields = [
    { name: 'name', label: 'Certificate name', required: true, span: 1 },
    { name: 'organization', label: 'Issuing organization', required: true, span: 1 },
    { name: 'category', label: 'Category', type: 'select', options: catalog.certCategories, required: true, span: 1 },
    { name: 'credentialId', label: 'Credential ID', span: 1 },
    { name: 'issueDate', label: 'Issue date', type: 'date', required: true, span: 1 },
    { name: 'expiryDate', label: 'Expiry date', type: 'date', span: 1, hint: 'Leave empty if it does not expire' },
    { name: 'url', label: 'Certificate URL', type: 'url', hint: 'Link to verify the certificate' },
    { name: 'file', label: 'Certificate file', type: 'file', accept: '.pdf,.png,.jpg,.jpeg', hint: 'PDF, PNG or JPG, up to 2 MB' },
    { name: 'description', label: 'Description', type: 'textarea' },
  ];

  const submit = (v) => {
    const fd = new FormData();
    ['name', 'organization', 'category', 'credentialId', 'issueDate', 'expiryDate', 'url', 'description'].forEach((k) => fd.append(k, v[k] ?? ''));
    if (v.file instanceof File) fd.append('file', v.file);
    return save(editing._id, fd);
  };

  const expired = (c) => c.expiryDate && new Date(c.expiryDate) < new Date();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Certificates" subtitle="Keep every course, internship and credential in one place."
        action={<button className="btn-primary" onClick={() => setEditing({})}><Plus size={16} /> Add certificate</button>} />
      {loading ? <Spinner /> : !items.length ? (
        <EmptyState title="No certificates yet" text="Add your first certificate. You can upload a PDF or image as proof." action={<button className="btn-primary" onClick={() => setEditing({})}>Add certificate</button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((c) => (
            <article key={c._id} className="card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold leading-snug">{c.name}</h3>
                  <p className="text-sm text-muted">{c.organization}</p>
                </div>
                <Badge>{c.category}</Badge>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div><dt className="text-muted">Issued</dt><dd>{fmtDate(c.issueDate)}</dd></div>
                <div><dt className="text-muted">Expires</dt><dd>{c.expiryDate ? fmtDate(c.expiryDate) : 'No expiry'} {expired(c) && <Badge className="bg-danger-light text-danger">Expired</Badge>}</dd></div>
                {c.credentialId && <div className="col-span-2"><dt className="text-muted">Credential ID</dt><dd className="break-all">{c.credentialId}</dd></div>}
              </dl>
              {c.description && <p className="mt-3 text-sm text-muted">{c.description}</p>}
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
                <span className="flex gap-2">
                  {c.hasFile && <button className="btn-ghost px-3 py-1.5" onClick={() => openFile(`/certificates/${c._id}/file`)}><FileText size={15} /> View file</button>}
                  {c.url && <a className="btn-ghost px-3 py-1.5" href={c.url} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Verify</a>}
                </span>
                <span className="flex gap-1">
                  <button className="rounded p-1.5 hover:bg-pine-light" onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`}><Pencil size={16} /></button>
                  <button className="rounded p-1.5 hover:bg-danger-light" onClick={() => setDeleting(c)} aria-label={`Delete ${c.name}`}><Trash2 size={16} /></button>
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
      {editing && <FormModal wide title={editing._id ? 'Edit certificate' : 'Add certificate'} fields={fields}
        initial={editing._id ? { ...editing, issueDate: toDateInput(editing.issueDate), expiryDate: toDateInput(editing.expiryDate), file: '' } : {}} onSubmit={submit} onClose={() => setEditing(null)} />}
      {deleting && <ConfirmDialog title="Delete certificate?" message={`"${deleting.name}" and its uploaded file will be removed.`} onCancel={() => setDeleting(null)} onConfirm={() => { remove(deleting._id); setDeleting(null); }} />}
    </div>
  );
}
