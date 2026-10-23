import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import StudentDashboard from './pages/student/Dashboard.jsx';
import StudentProfile from './pages/student/Profile.jsx';
import Skills from './pages/student/Skills.jsx';
import Certificates from './pages/student/Certificates.jsx';
import Projects from './pages/student/Projects.jsx';
import Activities from './pages/student/Activities.jsx';
import WeeklyProgress from './pages/student/WeeklyProgress.jsx';
import CareerGrowth from './pages/student/CareerGrowth.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import Students from './pages/admin/Students.jsx';
import StudentDetail from './pages/admin/StudentDetail.jsx';
import Reports from './pages/admin/Reports.jsx';
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
          <Route path="/student/skills" element={<Skills />} />
          <Route path="/student/certificates" element={<Certificates />} />
          <Route path="/student/projects" element={<Projects />} />
          <Route path="/student/activities" element={<Activities />} />
          <Route path="/student/weekly-progress" element={<WeeklyProgress />} />
          <Route path="/student/career-growth" element={<CareerGrowth />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="admin" />}>
        <Route element={<AppLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<Students />} />
          <Route path="/admin/students/:id" element={<StudentDetail />} />
          <Route path="/admin/reports" element={<Reports />} />
        </Route>
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
