const {
  createComplaint,
  getComplaintById,
  getAllComplaints,
  updateComplaintStatus,
  updateComplaint,
  deleteComplaint,
  upvoteComplaint,
  assignComplaint,
  reverseGeocode,
} = require('../services/complaintService');
const { isValidCoordinates } = require('../utils/helpers');
const axios = require('axios');

/**
 * Create a new complaint
 * POST /api/complaints
 */
const handleCreateComplaint = async (req, res) => {
  try {
    const { description, latitude, longitude, complaintType, audioUrl, userId, imageBase64 } = req.body;
    console.log(`[CONTROLLER DEBUG] Incoming complaint - Description: "${description?.substring(0, 50)}...", Type: ${complaintType}`);

    // Validation
    if (!description || !latitude || !longitude || !userId) {
      return res.status(400).json({
        error: 'Missing required fields: description, latitude, longitude, userId',
      });
    }

    if (!isValidCoordinates(latitude, longitude)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    // Check image size (max 5MB for base64)
    if (imageBase64 && imageBase64.length > 5 * 1024 * 1024) {
      return res.status(400).json({
        error: 'Image is too large. Maximum size is 5MB.',
      });
    }

    // Try to reverse geocode the coordinates to get address
    let address = null;
    if (process.env.NODE_ENV !== 'emulator') {
      try {
        address = await reverseGeocode(latitude, longitude);
        console.log(`📍 Geocoded address: ${address}`);
      } catch (error) {
        console.warn(`⚠️ Could not reverse geocode coordinates: ${error.message}`);
        // Continue without address - it's not critical
      }
    }

    const complaintData = {
      description,
      latitude,
      longitude,
      address: address || null,
      complaintType: complaintType || 'text',
      audioUrl,
      imageBase64: imageBase64 || null,
      userId,
      status: 'reported',
      upvotes: 0,
    };

    const complaint = await createComplaint(complaintData);

    res.status(201).json({
      success: true,
      data: complaint,
      message: 'Complaint created successfully',
    });
  } catch (error) {
    console.error('Error in handleCreateComplaint:', error);
    res.status(500).json({
      error: 'Failed to create complaint',
      details: error.message,
    });
  }
};

/**
 * Get all complaints
 * GET /api/complaints
 */
const handleGetAllComplaints = async (req, res) => {
  try {
    const { category, status, severity } = req.query;

    const filters = {};
    if (category) filters.category = category;
    if (status) filters.status = status;
    if (severity) filters.severity = severity;

    const complaints = await getAllComplaints(filters);
    const loggedInUserId = req.user?.uid || null;

    const enrichedComplaints = await Promise.all(
      complaints.map(async (complaint) => {
        let address = complaint.address || null;

        if (!address && complaint.latitude && complaint.longitude) {
          try {
            const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
              params: {
                format: 'json',
                lat: complaint.latitude,
                lon: complaint.longitude,
                zoom: 18,
                addressdetails: 1,
              },
              headers: {
                'User-Agent': 'CivicEcho/1.0',
              },
            });
            address = response.data?.display_name || null;
          } catch (geoError) {
            console.error('Error reverse geocoding complaint:', geoError.message);
          }
        }

        return {
          ...complaint,
          reportedBy:
            loggedInUserId && complaint.userId === loggedInUserId ? 'me' : 'others',
          address,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: enrichedComplaints,
      count: enrichedComplaints.length,
    });
  } catch (error) {
    console.error('Error in handleGetAllComplaints:', error);
    res.status(500).json({
      error: 'Failed to fetch complaints',
      details: error.message,
    });
  }
};

/**
 * Get complaint by ID
 * GET /api/complaints/:id
 */
const handleGetComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await getComplaintById(id);

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    console.error('Error in handleGetComplaint:', error);
    res.status(404).json({
      error: 'Complaint not found',
      details: error.message,
    });
  }
};

/**
 * Update complaint status
 * PATCH /api/complaints/:id/status
 * PUT /api/complaints/:id/status
 */
const handleUpdateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNote } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Only authority and admin can update status
    if (req.user?.role !== 'authority' && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only authority can update complaint status' });
    }

    // Validate status values - Accept both old and new formats
    const validStatuses = ['PENDING', 'VERIFIED', 'RESOLVED', 'reported', 'in_progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: PENDING, VERIFIED, RESOLVED`
      });
    }

    // Prevent changing back to PENDING
    const existing = await getComplaintById(id);
    if (status === 'PENDING' && existing.status !== 'PENDING') {
      return res.status(400).json({
        error: 'Cannot change status back to PENDING'
      });
    }

    const complaint = await updateComplaintStatus(id, status, req.user.uid, resolutionNote);

    res.status(200).json({
      success: true,
      data: complaint,
      message: `Complaint status updated to ${status}`,
    });
  } catch (error) {
    console.error('Error in handleUpdateComplaintStatus:', error);
    res.status(500).json({
      error: 'Failed to update complaint',
      details: error.message,
    });
  }
};

/**
 * Assign complaint to resolver
 * POST /api/complaints/:id/assign
 */
const handleAssignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo, resolverName } = req.body;

    if (!assignedTo || !resolverName) {
      return res.status(400).json({ error: 'assignedTo and resolverName are required' });
    }

    const complaint = await assignComplaint(id, assignedTo, resolverName);

    res.status(200).json({
      success: true,
      data: complaint,
      message: 'Complaint assigned successfully',
    });
  } catch (error) {
    console.error('Error in handleAssignComplaint:', error);
    res.status(500).json({
      error: 'Failed to assign complaint',
      details: error.message,
    });
  }
};

/**
 * Update complaint content (owned by current user)
 * PATCH /api/complaints/:id
 */
const handleUpdateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUserId = req.user?.uid;

    if (!loggedInUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const existing = await getComplaintById(id);

    if (existing.userId !== loggedInUserId) {
      return res.status(403).json({ error: 'You can only edit your own complaints' });
    }

    const { description } = req.body;

    const updates = {};
    if (description) updates.description = description;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    const updated = await updateComplaint(id, updates);

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Complaint updated successfully',
    });
  } catch (error) {
    console.error('Error in handleUpdateComplaint:', error);
    res.status(500).json({
      error: 'Failed to update complaint',
      details: error.message,
    });
  }
};

/**
 * Delete complaint (owned by current user)
 * DELETE /api/complaints/:id
 */
const handleDeleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUserId = req.user?.uid;

    if (!loggedInUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const existing = await getComplaintById(id);

    if (existing.userId !== loggedInUserId) {
      return res.status(403).json({ error: 'You can only delete your own complaints' });
    }

    await deleteComplaint(id);

    res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully',
      data: { id },
    });
  } catch (error) {
    console.error('Error in handleDeleteComplaint:', error);
    res.status(500).json({
      error: 'Failed to delete complaint',
      details: error.message,
    });
  }
};

/**
 * Upvote/Downvote a complaint
 * POST /api/complaints/:id/upvote
 */
const handleUpvoteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const complaint = await upvoteComplaint(id, userId);

    res.status(200).json({
      success: true,
      data: complaint,
      message: 'Complaint upvote toggled',
    });
  } catch (error) {
    console.error('Error in handleUpvoteComplaint:', error);
    res.status(500).json({
      error: 'Failed to upvote complaint',
      details: error.message,
    });
  }
};

module.exports = {
  handleCreateComplaint,
  handleGetAllComplaints,
  handleGetComplaint,
  handleUpdateComplaintStatus,
  handleUpdateComplaint,
  handleDeleteComplaint,
  handleUpvoteComplaint,
  handleAssignComplaint,
};
