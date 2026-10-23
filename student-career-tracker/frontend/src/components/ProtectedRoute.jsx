import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { homePathFor } from '../utils/constants.js';
import Spinner from './Spinner.jsx';

// <Route element={<ProtectedRoute role="student" requireProfile />}> ... </Route>
// requireProfile: students who have not completed their profile are sent to the profile form first.
// The backend enforces roles too; this only decides what the UI shows.
export default function ProtectedRoute({ role, requireProfile = false }) {
  const { user, profileCompleted, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;

  if (!user) {
    const loginPath = location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }
  if (role && user.role !== role) return <Navigate to={homePathFor(user, profileCompleted)} replace />;
  if (requireProfile && user.role === 'student' && !profileCompleted) return <Navigate to="/student/profile" replace />;
  return <Outlet />;
}
