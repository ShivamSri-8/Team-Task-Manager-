import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage    from './pages/LoginPage';
import SignupPage   from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage  from './pages/ProjectsPage';
import TasksPage     from './pages/TasksPage';
import TeamPage      from './pages/TeamPage';

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"  element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects"  element={<ProjectsPage />} />
        <Route path="/tasks"     element={<TasksPage />} />
      </Route>

      {/* Admin-only */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/team" element={<TeamPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
