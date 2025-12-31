import DashboardLayout from './pages/DashboardLayout';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { CitizenRoute, AuthorityRoute } from './components/RoleBasedRoutes';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';
import ReportComplaint from './pages/ReportComplaint';
import Leaderboard from './pages/Leaderboard';
import Landing from './pages/landing';

import './index.css';

function RoleBasedDashboard() {
  const { isAuthority } = useAuth();
  return isAuthority() ? <AuthorityDashboard /> : <Dashboard />;
}

function App() {
  return (
    <Router>
      <AuthProvider>

        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Dashboard (role based) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <RoleBasedDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Authority only */}
          <Route
            path="/authority"
            element={
              <ProtectedRoute>
                <AuthorityRoute>
                  <DashboardLayout>
                    <AuthorityDashboard />
                  </DashboardLayout>
                </AuthorityRoute>
              </ProtectedRoute>
            }
          />

          {/* Citizen only */}
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <CitizenRoute>
                  <DashboardLayout>
                    <ReportComplaint />
                  </DashboardLayout>
                </CitizenRoute>
              </ProtectedRoute>
            }
          />

          {/* Leaderboard */}
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Leaderboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <ToastContainer position="bottom-right" autoClose={3000} />
      </AuthProvider>
    </Router>
  );
}

export default App;
