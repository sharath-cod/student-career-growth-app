import { useState } from 'react';
import { Search } from 'lucide-react';
import Spinner from '../../components/Spinner.jsx';
import StudentActions from '../../components/StudentActions.jsx';
import { EmptyState, PageHeader } from '../../components/ui.jsx';
import { useStudents } from './Students.jsx';

const NONE = { q: '', department: '', domain: '', jobRole: '', semester: '', readiness: '', cgpaMin: '', lastUpdate: '' };

export default function Reports() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(NONE);
  const { loading, items, pages } = useStudents(filters, 'name', 'asc', page, 10);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Reports" subtitle="Find a student, then open the printable PDF report or download the Excel workbook (8 sheets). Students cannot access these downloads." />
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-3.5 text-muted" aria-hidden="true" />
        <input className="input pl-9" placeholder="Search by name or USN" aria-label="Search students" value={q} onChange={(e) => { setQ(e.target.value); setFilters({ ...NONE, q: e.target.value }); setPage(1); }} />
      </div>
      {loading ? <Spinner /> : !items.length ? <EmptyState title="No students found" /> : (
        <div className="card divide-y divide-line">
          {items.map((s) => (
            <div key={s._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div><p className="font-semibold">{s.name}</p><p className="text-xs text-muted">{s.usn} · {s.jobRole || 'No target role yet'} · Readiness {s.readiness}%</p></div>
              <StudentActions student={s} compact />
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 flex items-center justify-end gap-2 text-sm text-muted">
        <button className="btn-ghost px-3 py-1.5" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
        Page {page} of {pages}
        <button className="btn-ghost px-3 py-1.5" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
}
