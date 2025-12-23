const { db } = require('../config/firebase');

/**
 * Get dashboard statistics
 * GET /api/dashboard/stats
 */
const handleGetDashboardStats = async (req, res) => {
  try {
    // Total complaints
    const complaintsSnapshot = await db.collection('complaints').get();
    const totalComplaints = complaintsSnapshot.size;

    // Complaints by status
    const statuses = {};
    const categories = {};
    const severities = {};

    complaintsSnapshot.forEach((doc) => {
      const data = doc.data();

      statuses[data.status] = (statuses[data.status] || 0) + 1;
      categories[data.category] = (categories[data.category] || 0) + 1;
      severities[data.severity] = (severities[data.severity] || 0) + 1;
    });

    // Get clusters
    const clustersSnapshot = await db.collection('clusters').get();
    const totalClusters = clustersSnapshot.size;

    res.status(200).json({
      success: true,
      data: {
        totalComplaints,
        totalClusters,
        byStatus: statuses,
        byCategory: categories,
        bySeverity: severities,
      },
    });
  } catch (error) {
    console.error('Error in handleGetDashboardStats:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard stats',
      details: error.message,
    });
  }
};

/**
 * Get heatmap data
 * GET /api/dashboard/heatmap
 */
const handleGetHeatmapData = async (req, res) => {
  try {
    // Get all complaints and filter client-side
    const snapshot = await db.collection('complaints').get();

    const heatmapData = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          lat: data.latitude,
          lng: data.longitude,
          weight: data.upvotes || 1,
          severity: data.severity,
          category: data.category,
        };
      })
      .filter((item) => item.lat && item.lng);

    res.status(200).json({
      success: true,
      data: heatmapData,
    });
  } catch (error) {
    console.error('Error in handleGetHeatmapData:', error);
    res.status(500).json({
      error: 'Failed to fetch heatmap data',
      details: error.message,
    });
  }
};

/**
 * Get priority-ranked issues
 * GET /api/dashboard/priority
 */
const handleGetPriorityIssues = async (req, res) => {
  try {
    // Get all complaints and sort/filter client-side
    const snapshot = await db.collection('complaints').get();

    const priorityIssues = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((item) => item.status !== 'closed')
      .sort((a, b) => {
        // Sort by severity first (descending), then by upvotes
        const severityOrder = { CRITICAL: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };
        const aScore = (severityOrder[a.severity] || 0) * 1000 + (a.upvotes || 0);
        const bScore = (severityOrder[b.severity] || 0) * 1000 + (b.upvotes || 0);
        return bScore - aScore;
      })
      .slice(0, 20);

    res.status(200).json({
      success: true,
      data: priorityIssues,
    });
  } catch (error) {
    console.error('Error in handleGetPriorityIssues:', error);
    res.status(500).json({
      error: 'Failed to fetch priority issues',
      details: error.message,
    });
  }
};

module.exports = {
  handleGetDashboardStats,
  handleGetHeatmapData,
  handleGetPriorityIssues,
};
