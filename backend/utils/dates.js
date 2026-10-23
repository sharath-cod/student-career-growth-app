// Monday 00:00 of the week containing `d`.
function startOfWeek(d = new Date()) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Monday = 0
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - day);
  return x;
}
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const fmtDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
module.exports = { startOfWeek, daysAgo, fmtDate };
