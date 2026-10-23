import { useAuth } from '../../context/AuthContext.jsx';

// Phase 1 landing page. Phase 8 replaces this with the full admin dashboard.
export default function AdminDashboard() {
  const { user } = useAuth();
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
      <p className="mt-2 text-muted">You are signed in as an admin. Student monitoring, reports and exports will appear here as they are built.</p>
    </div>
  );
}
