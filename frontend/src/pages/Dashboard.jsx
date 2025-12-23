import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { complaintService, dashboardService } from '../services/complaintService';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiTrendingUp, FiAlertTriangle, FiCheckCircle, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const getStatusBadge = (status) => {
  const badges = {
    'reported': { label: '📋 Reported', color: 'bg-blue-100 text-blue-800' },
    'in_progress': { label: '⏳ In Progress', color: 'bg-yellow-100 text-yellow-800' },
    'resolved': { label: '✓ Resolved', color: 'bg-green-100 text-green-800' },
  };
  return badges[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [priorityIssues, setPriorityIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, issuesResponse] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getPriorityIssues(),
      ]);

      setStats(statsResponse.data);
      setPriorityIssues(issuesResponse.data || []);
    } catch (error) {
      toast.error('Failed to load dashboard: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditComplaint = async (issue) => {
    const newDescription = window.prompt(
      'Update complaint description',
      issue.description || ''
    );
    if (!newDescription || newDescription === issue.description) return;

    try {
      await complaintService.updateComplaint(issue.id, { description: newDescription });
      toast.success('Complaint updated successfully');
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to update complaint: ' + error.message);
    }
  };

  const handleDeleteComplaint = async (issue) => {
    const confirmed = window.confirm('Are you sure you want to delete this complaint?');
    if (!confirmed) return;

    try {
      await complaintService.deleteComplaint(issue.id);
      toast.success('Complaint deleted successfully');
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to delete complaint: ' + error.message);
    }
  };

  const handleUpvote = async (issue) => {
    try {
      const response = await complaintService.upvoteComplaint(issue.id, user.uid);
      const updated = response.data;

      setPriorityIssues((prev) =>
        prev.map((i) => (i.id === updated.id ? { ...i, upvotes: updated.upvotes } : i))
      );
    } catch (error) {
      toast.error('Failed to upvote complaint: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  const statusData = Object.entries(stats.byStatus || {}).map(([key, value]) => ({
    name: key.replace('_', ' '),
    value,
  }));

  const categoryData = Object.entries(stats.byCategory || {}).map(([key, value]) => ({
    name: key.replace('_', ' '),
    value,
  }));

  const severityData = Object.entries(stats.bySeverity || {}).map(([key, value]) => ({
    name: key.toUpperCase(),
    value,
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Citizen Dashboard</h1>
          <p className="text-gray-600">View and manage your community issues</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Issues</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalComplaints}</p>
              </div>
              <FiTrendingUp className="text-blue-600 text-3xl opacity-20" />
            </div>
          </div>

          <div className="card bg-green-50 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Resolved</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {stats.byStatus?.resolved || 0}
                </p>
              </div>
              <FiCheckCircle className="text-green-600 text-3xl opacity-20" />
            </div>
          </div>

          <div className="card bg-yellow-50 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {stats.byStatus?.in_progress || 0}
                </p>
              </div>
              <FiClock className="text-yellow-600 text-3xl opacity-20" />
            </div>
          </div>

          <div className="card bg-red-50 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Clusters</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{stats.totalClusters}</p>
              </div>
              <FiAlertTriangle className="text-red-600 text-3xl opacity-20" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status Distribution */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Issues by Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Issues by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Severity Distribution */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Issues by Severity</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Issues */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Priority Issues</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {priorityIssues.length > 0 ? (
              priorityIssues.slice(0, 10).map((issue) => {
                const statusBadge = getStatusBadge(issue.status);
                return (
                  <div
                    key={issue.id}
                    className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {issue.category.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        📍 {issue.address || `${issue.latitude.toFixed(4)}, ${issue.longitude.toFixed(4)}`}
                      </p>
                      {issue.reportedBy && (
                        <p className="text-xs text-gray-500 mt-1">
                          {issue.reportedBy === 'me' ? 'Reported by me' : 'Reported by others'}
                        </p>
                      )}
                      {issue.resolverName && (
                        <p className="text-xs text-blue-600 mt-1">
                          Resolver: {issue.resolverName}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${statusBadge.color}`}
                      >
                        {statusBadge.label}
                      </span>
                      <div className="mt-1">
                        <span
                          className={`badge ${
                            issue.severity === 'critical'
                              ? 'badge-danger'
                              : issue.severity === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : 'badge-warning'
                          }`}
                        >
                          {issue.severity}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUpvote(issue)}
                        className="text-sm text-blue-600 mt-2 hover:underline"
                      >
                        ⬆️ {issue.upvotes} upvotes
                      </button>

                      {issue.reportedBy === 'me' && (
                        <div className="mt-3 space-x-2">
                          <button
                            type="button"
                            onClick={() => handleEditComplaint(issue)}
                            className="btn-secondary text-xs"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteComplaint(issue)}
                            className="btn-primary text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-8">No priority issues</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
