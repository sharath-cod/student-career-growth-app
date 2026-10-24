import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import Spinner from '../../components/Spinner.jsx';
import StudentActions from '../../components/StudentActions.jsx';
import TextField from '../../components/TextField.jsx';
import { Badge, EmptyState, PageHeader } from '../../components/ui.jsx';
import { useCatalog } from '../../hooks/useCatalog.js';
import api, { parseError } from '../../services/api.js';
import { fmtDate } from '../../utils/format.js';
import toast from 'react-hot-toast';

const READINESS = { '': 'Any readiness', '0-25': '0-25%', '26-50': '26-50%', '51-75': '51-75%', '76-100': '76-100%' };
const LAST = { '': 'Any time', this_week: 'Updated this week', last_30_days: 'Last 30 days', not_this_week: 'Not updated this week', never: 'Never updated' };
const empty = { q: '', department: '', domain: '', jobRole: '', semester: '', readiness: '', cgpaMin: '', lastUpdate: '' };

export function useStudents(filters, sort, order, page, limit = 15) {
  const [state, setState] = useState({ loading: true, items: [], total: 0, pages: 1 });
  useEffect(() => {
    const t = setTimeout(async () => {
      const [rMin, rMax] = filters.readiness ? filters.readiness.split('-') : ['', ''];
      const params = { q: filters.q, department: filters.department, domain: filters.domain, jobRole: filters.jobRole, semester: filters.semester, cgpaMin: filters.cgpaMin, lastUpdate: filters.lastUpdate, readinessMin: rMin, readinessMax: rMax, sort, order, page, limit };
      Object.keys(params).forEach((k) => params[k] === '' && delete params[k]);
      try {
        const { data } = await api.get('/admin/students', { params });
        setState({ loading: false, items: data.items, total: data.total, pages: data.pages });
      } catch (e) { toast.error(parseError(e).message); setState((s) => ({ ...s, loading: false })); }
    }, 300);
    return () => clearTimeout(t);
  }, [filters, sort, order, page, limit]);
  return state;
}

export default function Students() {
  const catalog = useCatalog();
  const [f, setF] = useState(empty);
  const [sort, setSort] = useState('name');
  const [order, setOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const { loading, items, total, pages } = useStudents(f, sort, order, page);
  if (!catalog) return <Spinner />;

  const set = (k) => (e) => { setF((o) => ({ ...o, [k]: e.target.value })); setPage(1); };
  const domains = [...new Set(Object.values(catalog.industries).flatMap((d) => Object.keys(d)))];
  const roles = [...new Set(Object.values(catalog.industries).flatMap((d) => Object.values(d).flat()))].sort();
  const toggle = (k) => { if (sort === k) setOrder((o) => (o === 'asc' ? 'desc' : 'asc')); else { setSort(k); setOrder('asc'); } };
  const Th = ({ k, children }) => (
    <th className="px-4 py-3 font-medium">
      {k ? <button className="inline-flex items-center gap-1 hover:text-ink" onClick={() => toggle(k)}>{children}{sort === k && (order === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />)}</button> : children}
    </th>
  );

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Students" subtitle="Search, filter and open any student. Reports can only be downloaded from here." />
      <div className="card mb-5 p-4">
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-3.5 text-muted" aria-hidden="true" />
          <input className="input pl-9" placeholder="Search by name, USN, domain, job role, department or semester" aria-label="Search students" value={f.q} onChange={set('q')} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <TextField label="Department" options={catalog.departments} value={f.department} onChange={set('department')} />
          <TextField label="Domain" options={domains} value={f.domain} onChange={set('domain')} />
          <TextField label="Job role" options={roles} value={f.jobRole} onChange={set('jobRole')} />
          <TextField label="Semester" options={['1', '2', '3', '4', '5', '6', '7', '8']} value={f.semester} onChange={set('semester')} />
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="rd">Career readiness</label>
            <select id="rd" className="input" value={f.readiness} onChange={set('readiness')}>{Object.entries(READINESS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="cg">CGPA</label>
            <select id="cg" className="input" value={f.cgpaMin} onChange={set('cgpaMin')}>{[['', 'Any CGPA'], ['9', '9 and above'], ['8', '8 and above'], ['7', '7 and above'], ['6', '6 and above']].map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="lu">Last update</label>
            <select id="lu" className="input" value={f.lastUpdate} onChange={set('lastUpdate')}>{Object.entries(LAST).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          </div>
          <div className="flex items-end"><button className="btn-ghost w-full" onClick={() => { setF(empty); setPage(1); }}>Clear filters</button></div>
        </div>
      </div>

      {loading ? <Spinner /> : !items.length ? (
        <EmptyState title="No students match" text="Try clearing a filter or searching for something else." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-line bg-paper text-muted">
              <tr><Th k="name">Student</Th><Th k="usn">USN</Th><Th k="cgpa">CGPA</Th><Th>Domain</Th><Th>Job role</Th><Th k="readiness">Career readiness</Th><Th k="lastUpdate">Last update</Th><Th>Action</Th></tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s._id} className="border-b border-line align-top last:border-0">
                  <td className="px-4 py-3"><Link to={`/admin/students/${s._id}`} className="font-semibold text-pine hover:underline">{s.name}</Link><p className="text-xs text-muted">{s.department}{s.semester ? ` · Sem ${s.semester}` : ''}</p></td>
                  <td className="px-4 py-3">{s.usn}</td>
                  <td className="px-4 py-3">{s.cgpa ?? '-'}</td>
                  <td className="px-4 py-3">{s.domain || '-'}</td>
                  <td className="px-4 py-3">{s.jobRole || '-'}</td>
                  <td className="px-4 py-3"><Badge className={s.readiness >= 75 ? 'bg-pine text-on-pine' : s.readiness >= 40 ? 'bg-pine-light text-pine-dark' : 'bg-signal-light text-ink'}>{s.readiness}%</Badge></td>
                  <td className="px-4 py-3 text-muted">{s.lastUpdate ? fmtDate(s.lastUpdate) : 'Never'}</td>
                  <td className="px-4 py-3"><StudentActions student={s} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 flex items-center justify-between text-sm text-muted">
        <span>{total} student{total === 1 ? '' : 's'}</span>
        <span className="flex items-center gap-2">
          <button className="btn-ghost px-3 py-1.5" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          Page {page} of {pages}
          <button className="btn-ghost px-3 py-1.5" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </span>
      </div>
    </div>
  );
}
