import apiClient from './api';

const authorityAPI = {
  /**
   * Fetch all issues/complaints
   */
  getAllIssues: async () => {
    const response = await apiClient.get('/authority/issues');
    return response.data;
  },

  /**
   * Update issue status (reported → in_progress → resolved)
   */
  updateIssueStatus: async (issueId, status) => {
    const response = await apiClient.patch(`/authority/issues/${issueId}/status`, {
      status,
    });
    return response.data;
  },

  /**
   * Assign resolver to an issue
   */
  assignResolver: async (issueId, assignedResolver) => {
    const response = await apiClient.patch(`/authority/issues/${issueId}/assign`, {
      assignedResolver,
    });
    return response.data;
  },
};

export default authorityAPI;
