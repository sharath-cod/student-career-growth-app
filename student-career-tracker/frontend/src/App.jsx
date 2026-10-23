import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import StudentDashboard from './pages/student/Dashboard.jsx';
import StudentProfile from './pages/student/Profile.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { homePathFor } from './utils/constants.js';

function RootRedirect() {
  const { user, profileCompleted, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? homePathFor(user, profileCompleted) : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Student: the profile form is always reachable; everything else needs a completed profile */}
      <Route element={<ProtectedRoute role="student" />}>
        <Route element={<AppLayout />}>
          <Route path="/student/profile" element={<StudentProfile />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute role="student" requireProfile />}>
        <Route element={<AppLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="admin" />}>
        <Route element={<AppLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
