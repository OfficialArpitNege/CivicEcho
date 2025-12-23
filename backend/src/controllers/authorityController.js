const { db } = require('../config/firebase');

/**
 * Get all complaints (Authority only)
 * GET /api/authority/issues
 */
const getAllIssues = async (req, res) => {
  try {
    const snapshot = await db.collection('complaints').get();

    const issues = [];
    
    for (const docSnap of snapshot.docs) {
      const complaint = docSnap.data();
      const reportedByUserSnap = await db.collection('users').doc(complaint.userId).get();
      
      issues.push({
        issueId: docSnap.id,
        title: complaint.title || complaint.description?.substring(0, 50),
        description: complaint.description,
        category: complaint.category,
        status: complaint.status || 'reported',
        reportedBy: {
          userId: complaint.userId,
          email: reportedByUserSnap.exists ? reportedByUserSnap.data().email : 'Unknown',
          name: reportedByUserSnap.exists ? reportedByUserSnap.data().name : 'Anonymous',
        },
        upvotes: complaint.upvotes || 0,
        location: {
          latitude: complaint.latitude,
          longitude: complaint.longitude,
          address: complaint.address || 'Unknown',
        },
        assignedResolver: complaint.assignedResolver || null,
        severity: complaint.severity || 'MEDIUM',
        createdAt: complaint.createdAt?.toDate?.() || new Date(),
      });
    }

    // Sort by creation date (newest first)
    issues.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json({
      success: true,
      data: issues,
    });
  } catch (error) {
    console.error('Error fetching all issues:', error);
    res.status(500).json({
      error: 'Failed to fetch issues',
      details: error.message,
    });
  }
};

/**
 * Update complaint status
 * PATCH /api/authority/issues/:id/status
 */
const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['reported', 'in_progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be: reported, in_progress, or resolved',
      });
    }

    // Update in Firestore
    await db.collection('complaints').doc(id).update({
      status,
      updatedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: `Issue status updated to ${status}`,
    });
  } catch (error) {
    console.error('Error updating issue status:', error);
    res.status(500).json({
      error: 'Failed to update issue status',
      details: error.message,
    });
  }
};

/**
 * Assign resolver to complaint
 * PATCH /api/authority/issues/:id/assign
 */
const assignResolver = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedResolver } = req.body;

    if (!assignedResolver || assignedResolver.trim() === '') {
      return res.status(400).json({
        error: 'Resolver name is required',
      });
    }

    // Update in Firestore
    await db.collection('complaints').doc(id).update({
      assignedResolver: assignedResolver.trim(),
      updatedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Resolver assigned successfully',
    });
  } catch (error) {
    console.error('Error assigning resolver:', error);
    res.status(500).json({
      error: 'Failed to assign resolver',
      details: error.message,
    });
  }
};

module.exports = {
  getAllIssues,
  updateIssueStatus,
  assignResolver,
};
