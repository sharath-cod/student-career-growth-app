import { Download, Eye, FileText, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { downloadFile, openFile } from '../services/files.js';

// Admin-only actions for one student. The server also refuses these calls for non-admins.
export default function StudentActions({ student, compact = false }) {
  const id = student._id;
  const usn = student.usn;
  const btn = 'inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold hover:bg-pine-light';
  return (
    <div className="flex flex-wrap gap-1.5">
      {!compact && <Link className={btn} to={`/admin/students/${id}`}><Eye size={14} /> View</Link>}
      {!compact && <Link className={btn} to={`/admin/students/${id}?edit=1`}><Pencil size={14} /> Edit</Link>}
      <button className={btn} onClick={() => openFile(`/admin/students/${id}/export/pdf?inline=1`)}><FileText size={14} /> Report</button>
      <button className={btn} onClick={() => downloadFile(`/admin/students/${id}/export/excel`, `Student_Career_Growth_${usn}.xlsx`)}><Download size={14} /> Excel</button>
      <button className={btn} onClick={() => downloadFile(`/admin/students/${id}/export/pdf`, `Student_Career_Report_${usn}.pdf`)}><Download size={14} /> PDF</button>
    </div>
  );
}
