import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock } from 'react-icons/fi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Extract user-friendly error message
      let errorMsg = 'Login failed. Please try again.';

      if (err.message) {
        if (err.message.includes('user-not-found')) {
          errorMsg = 'No account found with this email. Please sign up first.';
        } else if (err.message.includes('wrong-password')) {
          errorMsg = 'Incorrect password. Please try again.';
        } else if (err.message.includes('invalid-email')) {
          errorMsg = 'Invalid email address.';
        } else {
          errorMsg = err.message.replace('Firebase: Error (', '').replace(').', '');
        }
      }

      setError(errorMsg);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">CivicEcho</h1>
        <p className="text-center text-gray-600 mb-8">Community Issue Reporting</p>

        {/* Test Credentials Info */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6 text-sm">
          <p className="font-semibold text-blue-900 mb-2">📋 Test Credentials:</p>
          <div className="space-y-2 text-blue-800">
            <div>
              <p className="font-medium">Authority User:</p>
              <p className="text-xs font-mono">authority@civicecho.gov</p>
              <p className="text-xs font-mono">Authority123!</p>
            </div>
            <div>
              <p className="font-medium mt-2">Citizen User:</p>
              <p className="text-xs">Create any email/password</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2">
              <FiMail className="text-gray-400 mr-2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2">
              <FiLock className="text-gray-400 mr-2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="flex-1 outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary font-semibold"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
