import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

// Navigation lists grow phase by phase (profile, skills, certificates, ...).
const NAV = {
  student: [
    { to: '/student/dashboard', label: 'My dashboard', icon: LayoutDashboard },
    { to: '/student/profile', label: 'My profile', icon: User },
  ],
  admin: [{ to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard }],
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const items = NAV[user.role] || [];

  function onLogout() {
    const target = user.role === 'admin' ? '/admin/login' : '/login';
    logout();
    navigate(target, { replace: true });
  }

  const sidebar = (
    <nav className="flex h-full flex-col bg-pine-dark text-white" aria-label="Main">
      <div className="px-6 py-6">
        <p className="font-display text-lg font-bold leading-tight">Career Growth Tracker</p>
        <p className="mt-1 text-xs text-white/60">{user.role === 'admin' ? 'Teacher / admin' : 'Student'}</p>
      </div>
      <ul className="flex-1 space-y-1 px-3">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/15 text-white' : 'text-white/75 hover:bg-white/10'
                }`
              }
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="border-t border-white/10 p-4">
        <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/75 hover:bg-white/10">
          <LogOut size={18} aria-hidden="true" />
          Log out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-0 h-screen">{sidebar}</div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between border-b border-line bg-surface px-5 py-3">
          <button className="rounded-md p-2 hover:bg-pine-light lg:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="ml-auto text-right">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-muted">{user.email}</p>
          </div>
        </header>
        <main className="flex-1 p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
