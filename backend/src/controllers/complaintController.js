const {
  createComplaint,
  getComplaintById,
  getAllComplaints,
  updateComplaintStatus,
  upvoteComplaint,
} = require('../services/complaintService');
const { isValidCoordinates } = require('../utils/helpers');

/**
 * Create a new complaint
 * POST /api/complaints
 */
const handleCreateComplaint = async (req, res) => {
  try {
    const { description, latitude, longitude, complaintType, audioUrl, userId } = req.body;

    // Validation
    if (!description || !latitude || !longitude || !userId) {
      return res.status(400).json({
        error: 'Missing required fields: description, latitude, longitude, userId',
      });
    }

    if (!isValidCoordinates(latitude, longitude)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const complaintData = {
      description,
      latitude,
      longitude,
      complaintType: complaintType || 'text',
      audioUrl,
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

    res.status(200).json({
      success: true,
      data: complaints,
      count: complaints.length,
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
 */
const handleUpdateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const complaint = await updateComplaintStatus(id, status);

    res.status(200).json({
      success: true,
      data: complaint,
      message: 'Complaint status updated',
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
  handleUpvoteComplaint,
};
