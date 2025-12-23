import apiClient from './api';

export const complaintService = {
  /**
   * Create a new complaint
   */
  createComplaint: async (complaintData) => {
    const response = await apiClient.post('/complaints', complaintData);
    return response.data;
  },

  /**
   * Get all complaints with filters
   */
  getAllComplaints: async (filters = {}) => {
    const response = await apiClient.get('/complaints', { params: filters });
    return response.data;
  },

  /**
   * Get complaint by ID
   */
  getComplaintById: async (id) => {
    const response = await apiClient.get(`/complaints/${id}`);
    return response.data;
  },

  /**
   * Update complaint status
   */
  updateComplaintStatus: async (id, status, resolutionNote = null) => {
    const payload = { status };
    if (resolutionNote) {
      payload.resolutionNote = resolutionNote;
    }
    const response = await apiClient.put(`/complaints/${id}/status`, payload);
    return response.data;
  },

  /**
   * Update complaint content (description)
   */
  updateComplaint: async (id, updates) => {
    const response = await apiClient.patch(`/complaints/${id}`, updates);
    return response.data;
  },

  /**
   * Delete complaint
   */
  deleteComplaint: async (id) => {
    const response = await apiClient.delete(`/complaints/${id}`);
    return response.data;
  },

  /**
   * Upvote complaint
   */
  upvoteComplaint: async (id, userId) => {
    const response = await apiClient.post(`/complaints/${id}/upvote`, { userId });
    return response.data;
  },

  /**
   * Assign complaint to resolver (authority only)
   */
  assignComplaint: async (id, assignedTo, resolverName) => {
    const response = await apiClient.post(`/complaints/${id}/assign`, {
      assignedTo,
      resolverName,
    });
    return response.data;
  },
};

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  getStats: async () => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  },

  /**
   * Get heatmap data
   */
  getHeatmapData: async () => {
    const response = await apiClient.get('/dashboard/heatmap');
    return response.data;
  },

  /**
   * Get priority issues
   */
  getPriorityIssues: async () => {
    const response = await apiClient.get('/dashboard/priority');
    return response.data;
  },
};
