export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-');
export const toDateInput = (d) => (d ? String(d).slice(0, 10) : '');
export const today = () => new Date().toISOString().slice(0, 10);
export const splitTags = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);
export const joinTags = (a) => (Array.isArray(a) ? a.join(', ') : '');
export function monthsText(m) {
  const n = Number(m) || 0;
  const y = Math.floor(n / 12);
  const r = n % 12;
  if (!y) return `${r} mo`;
  return r ? `${y} yr ${r} mo` : `${y} yr`;
}
export const LEVEL_TONE = { Beginner: 'bg-signal-light text-ink', Intermediate: 'bg-pine-light text-pine-dark', Advanced: 'bg-pine text-white', Expert: 'bg-ink text-white' };
