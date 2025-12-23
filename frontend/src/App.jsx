import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { CitizenRoute, AuthorityRoute } from './components/RoleBasedRoutes';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';
import ReportComplaint from './pages/ReportComplaint';
import MapView from './pages/MapView';

// CSS
import './index.css';

function RoleBasedDashboard() {
  const { isAuthority, userRole, loading, user } = useAuth();
  
  console.log(`🎯 RoleBasedDashboard - Email: ${user?.email}, Role: ${userRole}, isAuthority: ${isAuthority()}, Loading: ${loading}`);
  
  if (isAuthority()) {
    console.log('📊 Rendering Authority Dashboard');
    return <AuthorityDashboard />;
  }
  
  console.log('👥 Rendering Citizen Dashboard');
  return <Dashboard />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Dashboard Route - Shows citizen or authority based on role */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RoleBasedDashboard />
              </ProtectedRoute>
            }
          />

          {/* Authority-only Route */}
          <Route
            path="/authority"
            element={
              <ProtectedRoute>
                <AuthorityRoute>
                  <AuthorityDashboard />
                </AuthorityRoute>
              </ProtectedRoute>
            }
          />

          {/* Citizen-only Routes */}
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <CitizenRoute>
                  <ReportComplaint />
                </CitizenRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <CitizenRoute>
                  <MapView />
                </CitizenRoute>
              </ProtectedRoute>
            }
          />

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
