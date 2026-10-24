import ThemeToggle from './ThemeToggle.jsx';

// Split-screen wrapper for login/register. The left panel shows a weekly growth
// line: the single visual idea of the product (progress recorded week by week).
const POINTS = [12, 18, 17, 29, 38, 36, 52, 61];

function GrowthLine() {
  const w = 420;
  const h = 200;
  const step = w / (POINTS.length - 1);
  const coords = POINTS.map((p, i) => [i * step, h - (p / 70) * h]);
  const path = coords.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`-10 -14 ${w + 20} ${h + 52}`} className="w-full max-w-md" role="img" aria-label="Example of weekly progress rising over eight weeks">
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1="0" x2={w} y1={(h / 3) * i} y2={(h / 3) * i} stroke="#ffffff" strokeOpacity="0.12" />
      ))}
      <path d={path} fill="none" stroke="#E3A32B" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {coords.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={i === coords.length - 1 ? 6 : 3.5} fill={i === coords.length - 1 ? '#E3A32B' : '#0A3F35'} stroke="#E3A32B" strokeWidth="2" />
          <text x={x} y={h + 24} textAnchor="middle" fontSize="11" fill="#ffffff" fillOpacity="0.7">
            {`W${i + 1}`}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="hidden flex-col justify-between bg-sidebar p-12 text-white lg:flex">
        <div>
          <p className="font-display text-xl font-bold">Student Career Growth Tracker</p>
          <p className="mt-1 text-sm text-white/70">Student Progress, Skills &amp; Career Development Monitoring System</p>
        </div>
        <div>
          <GrowthLine />
          <p className="mt-8 max-w-sm font-display text-3xl font-bold leading-tight">Every week you log is a week your growth shows.</p>
          <p className="mt-3 max-w-sm text-sm text-white/70">
            Keep your skills, certificates and projects in one place, and see how close you are to your target job.
          </p>
        </div>
        <p className="text-xs text-white/50">Engineering College</p>
      </aside>

      <main className="relative flex items-center justify-center px-5 py-12">
        <ThemeToggle className="absolute right-5 top-5" />
        <div className="w-full max-w-md">
          <p className="mb-6 font-display text-lg font-bold text-pine lg:hidden">Student Career Growth Tracker</p>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-sm text-muted">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
