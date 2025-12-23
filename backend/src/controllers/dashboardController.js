const { db } = require('../config/firebase');
const axios = require('axios');

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

      if (data.status)
        statuses[data.status] = (statuses[data.status] || 0) + 1;
      if (data.category)
        categories[data.category] = (categories[data.category] || 0) + 1;
      if (data.severity)
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

    const loggedInUserId = req.user?.uid || null;

    let priorityIssues = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((item) => item.status && item.status !== 'closed')
      .sort((a, b) => {
        // Sort by severity first (descending), then by upvotes
        const severityOrder = { CRITICAL: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };
        const aScore = (severityOrder[a.severity] || 0) * 1000 + (a.upvotes || 0);
        const bScore = (severityOrder[b.severity] || 0) * 1000 + (b.upvotes || 0);
        return bScore - aScore;
      })
      .slice(0, 20);

    priorityIssues = await Promise.all(
      priorityIssues.map(async (issue) => {
        let address = issue.address || null;

        if (!address && issue.latitude && issue.longitude) {
          try {
            const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
              params: {
                format: 'json',
                lat: issue.latitude,
                lon: issue.longitude,
                zoom: 18,
                addressdetails: 1,
              },
              headers: {
                'User-Agent': 'CivicEcho/1.0',
              },
            });
            address = response.data?.display_name || null;
          } catch (geoError) {
            console.error('Error reverse geocoding priority issue:', geoError.message);
          }
        }

        return {
          ...issue,
          reportedBy:
            loggedInUserId && issue.userId === loggedInUserId ? 'me' : 'others',
          address,
        };
      })
    );

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
  handleGetMyComplaints,
};

/**
 * Get user's own complaints
 * GET /api/dashboard/my-complaints
 */
const handleGetMyComplaints = async (req, res) => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized - User not authenticated',
      });
    }

    // Get all complaints for this user
    const snapshot = await db.collection('complaints').where('userId', '==', userId).get();

    const myComplaints = snapshot.docs.map((doc) => ({
      issueId: doc.id,
      ...doc.data(),
    }));

    // Sort by created date (newest first)
    myComplaints.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || new Date(a.createdAt).getTime();
      const bTime = b.createdAt?.toMillis?.() || new Date(b.createdAt).getTime();
      return bTime - aTime;
    });

    res.status(200).json({
      success: true,
      data: myComplaints,
    });
  } catch (error) {
    console.error('Error in handleGetMyComplaints:', error);
    res.status(500).json({
      error: 'Failed to fetch your complaints',
      details: error.message,
    });
  }
};
