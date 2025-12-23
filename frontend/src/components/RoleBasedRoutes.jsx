import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * CitizenRoute: Only accessible to citizens
 * Redirects authorities to /authority
 */
export const CitizenRoute = ({ children }) => {
  const { isCitizen, loading, user } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!isCitizen()) {
    return <Navigate to="/authority" />;
  }

  return children;
};

/**
 * AuthorityRoute: Only accessible to authorities
 * Redirects citizens to /
 */
export const AuthorityRoute = ({ children }) => {
  const { isAuthority, loading, user } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!isAuthority()) {
    return <Navigate to="/" />;
  }

  return children;
};

export default { CitizenRoute, AuthorityRoute };
