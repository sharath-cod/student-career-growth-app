import api, { parseError } from './api.js';
import toast from 'react-hot-toast';

function nameFrom(res, fallback) {
  const cd = res.headers['content-disposition'] || '';
  const m = /filename="?([^";]+)"?/i.exec(cd);
  return m ? decodeURIComponent(m[1]) : fallback;
}

// Authenticated download (the token is sent in the header, so plain <a href> links would not work).
export async function downloadFile(url, fallbackName) {
  const t = toast.loading('Preparing file…');
  try {
    const res = await api.get(url, { responseType: 'blob', timeout: 120000 });
    const href = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = href;
    a.download = nameFrom(res, fallbackName);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 10000);
    toast.success('Downloaded', { id: t });
  } catch (err) {
    toast.error(await blobError(err), { id: t });
  }
}

// Opens a PDF or image in a new tab.
export async function openFile(url) {
  const t = toast.loading('Opening…');
  const w = window.open('', '_blank');
  try {
    const res = await api.get(url, { responseType: 'blob', timeout: 120000 });
    const href = URL.createObjectURL(res.data);
    if (w) w.location.href = href;
    else window.location.href = href;
    toast.dismiss(t);
  } catch (err) {
    if (w) w.close();
    toast.error(await blobError(err), { id: t });
  }
}

async function blobError(err) {
  try {
    if (err.response?.data instanceof Blob) {
      const j = JSON.parse(await err.response.data.text());
      return j.message || 'Something went wrong.';
    }
  } catch (e) { /* fall through */ }
  return parseError(err).message;
}
