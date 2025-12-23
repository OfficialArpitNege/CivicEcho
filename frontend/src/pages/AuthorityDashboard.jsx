import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import authorityAPI from '../services/authorityAPI';
import { FiMapPin, FiUser, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function AuthorityDashboard() {
  const { user, isAuthority, loading: authLoading } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState({});
  const [editingResolver, setEditingResolver] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const [allIssues, setAllIssues] = useState([]);

  useEffect(() => {
    if (user && isAuthority()) {
      loadAllIssues();
    }
  }, [user, isAuthority]);

  useEffect(() => {
    if (filter === 'all') {
      setIssues(allIssues);
    } else {
      setIssues(allIssues.filter(issue => issue.status === filter));
    }
  }, [filter, allIssues]);

  const loadAllIssues = async () => {
    try {
      setLoading(true);
      const response = await authorityAPI.getAllIssues();
      const issuesList = response.data || [];
      setAllIssues(issuesList);
    } catch (error) {
      console.error('Error loading issues:', error);
      toast.error('Failed to load issues: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update status
  const handleStatusChange = async (issueId, newStatus) => {
    try {
      setActionLoading(prev => ({ ...prev, [issueId]: 'status' }));
      await authorityAPI.updateIssueStatus(issueId, newStatus);
      toast.success(`✅ Status updated to ${newStatus}`);
      await loadAllIssues();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setActionLoading(prev => ({ ...prev, [issueId]: null }));
    }
  };

  // Update resolver
  const handleAssignResolver = async (issueId) => {
    const resolverName = editingResolver[issueId] || '';
    
    if (!resolverName.trim()) {
      toast.warning('Please enter resolver name');
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [issueId]: 'assign' }));
      await authorityAPI.assignResolver(issueId, resolverName);
      toast.success(`✅ Resolver "${resolverName}" assigned successfully`);
      setEditingResolver(prev => ({ ...prev, [issueId]: '' }));
      await loadAllIssues();
    } catch (error) {
      console.error('Error assigning resolver:', error);
      toast.error('Failed to assign resolver');
    } finally {
      setActionLoading(prev => ({ ...prev, [issueId]: null }));
    }
  };

  // Status badge styling
  const getStatusBadge = (status) => {
    const statusMap = {
      'reported': { color: 'bg-yellow-100 text-yellow-800', icon: '📋', label: 'Reported' },
      'in_progress': { color: 'bg-blue-100 text-blue-800', icon: '⏳', label: 'In Progress' },
      'resolved': { color: 'bg-green-100 text-green-800', icon: '✓', label: 'Resolved' },
    };
    return statusMap[status] || statusMap['reported'];
  };

  const severityColors = {
    'CRITICAL': 'text-red-600 font-bold',
    'HIGH': 'text-orange-600',
    'MEDIUM': 'text-yellow-600',
    'LOW': 'text-green-600',
  };

  const openImageModal = (imageBase64) => {
    setSelectedImage(imageBase64);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">⚙️</div>
          <p className="text-gray-600 font-medium">Verifying authority status...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">📊</div>
          <p className="text-gray-600 font-medium">Loading issues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Authority Dashboard</h1>
          <p className="text-gray-600">Manage and resolve civic issues</p>
        </div>

        {/* Filter Tabs & Refresh Button */}
        <div className="mb-6 flex gap-2 flex-wrap items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'All Issues', icon: '📋' },
              { key: 'reported', label: 'Reported', icon: '🆕' },
              { key: 'in_progress', label: 'In Progress', icon: '⏳' },
              { key: 'resolved', label: 'Resolved', icon: '✓' },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === key
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
          <button
            onClick={loadAllIssues}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition"
          >
            {loading ? '⏳ Loading...' : '🔄 Refresh'}
          </button>
        </div>

        {/* Issues Table */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {issues.length === 0 && allIssues.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg">📭 No issues reported yet</p>
              <p className="text-gray-400 text-sm mt-2">Check back later for new complaints</p>
            </div>
          ) : issues.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg">🔍 No issues with status "{filter}"</p>
              <button
                onClick={() => setFilter('all')}
                className="mt-4 px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View all issues
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Severity</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Reported By</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Upvotes</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Assigned To</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {issues.map(issue => {
                    const statusBadge = getStatusBadge(issue.status);
                    const isResolved = issue.status === 'resolved';
                    
                    return (
                      <tr key={issue.issueId} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 max-w-xs truncate" title={issue.title}>
                            {issue.title}
                          </div>
                          <p className="text-sm text-gray-500 mt-1 max-w-xs truncate" title={issue.description}>
                            {issue.description?.substring(0, 80)}...
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                            {issue.category?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={severityColors[issue.severity] || 'text-gray-600'}>
                            {issue.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-600 max-w-xs">
                            <FiMapPin className="mr-2 flex-shrink-0" />
                            <span title={issue.location?.address || 'Location'}>
                              {issue.location?.address ? (
                                issue.location.address.substring(0, 25) + (issue.location.address.length > 25 ? '...' : '')
                              ) : (
                                `${issue.location?.latitude?.toFixed(2)}, ${issue.location?.longitude?.toFixed(2)}`
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">{issue.reportedBy?.name}</p>
                            <p className="text-gray-500">{issue.reportedBy?.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full font-semibold text-sm">
                            👍 {issue.upvotes}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusBadge.color}`}>
                            {statusBadge.icon} {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            {issue.assignedResolver ? (
                              <div className="flex items-center">
                                <FiUser className="mr-2 text-indigo-600" />
                                <span className="font-medium">{issue.assignedResolver}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">Unassigned</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            {/* Show Attachments Button */}
                            {issue.imageBase64 && (
                              <button
                                onClick={() => openImageModal(issue.imageBase64)}
                                className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition"
                              >
                                📸 Show Attachments
                              </button>
                            )}

                            {/* Assign Resolver */}
                            {!isResolved && (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Officer/Dept name"
                                  value={editingResolver[issue.issueId] || ''}
                                  onChange={(e) => setEditingResolver(prev => ({
                                    ...prev,
                                    [issue.issueId]: e.target.value
                                  }))}
                                  disabled={actionLoading[issue.issueId]}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:bg-gray-100"
                                />
                                <button
                                  onClick={() => handleAssignResolver(issue.issueId)}
                                  disabled={actionLoading[issue.issueId] === 'assign'}
                                  className="px-3 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:bg-gray-400 transition"
                                  title="Assign this officer/department to handle the issue"
                                >
                                  {actionLoading[issue.issueId] === 'assign' ? '...' : '✓'}
                                </button>
                              </div>
                            )}

                            {/* Change Status */}
                            {!isResolved && (
                              <select
                                value={issue.status}
                                onChange={(e) => handleStatusChange(issue.issueId, e.target.value)}
                                disabled={actionLoading[issue.issueId]}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:bg-gray-100 transition"
                              >
                                <option value="reported">📋 Reported</option>
                                <option value="in_progress">⏳ In Progress</option>
                                <option value="resolved">✓ Resolved</option>
                              </select>
                            )}

                            {isResolved && (
                              <div className="text-xs text-green-600 font-semibold">
                                ✓ Resolved
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="mt-8 grid grid-cols-4 gap-4">
          {[
            { label: 'Total Issues', count: allIssues.length, icon: '📊' },
            { label: 'Reported', count: allIssues.filter(i => i.status === 'reported').length, icon: '🆕' },
            { label: 'In Progress', count: allIssues.filter(i => i.status === 'in_progress').length, icon: '⏳' },
            { label: 'Resolved', count: allIssues.filter(i => i.status === 'resolved').length, icon: '✓' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-lg p-4 shadow text-center hover:shadow-lg transition">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
            </div>
          ))}
        </div>

        {/* Image Modal */}
        {imageModalOpen && selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">📸 Attachment Preview</h3>
                <button
                  onClick={closeImageModal}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <img
                  src={selectedImage}
                  alt="Complaint attachment"
                  className="w-full h-auto max-h-96 object-contain rounded-lg"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={closeImageModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

