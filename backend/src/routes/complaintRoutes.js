const express = require('express');
const {
  handleCreateComplaint,
  handleGetAllComplaints,
  handleGetComplaint,
  handleUpdateComplaintStatus,
  handleUpvoteComplaint,
} = require('../controllers/complaintController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/complaints - Create new complaint
 * Body: { description, latitude, longitude, complaintType, audioUrl, userId }
 */
router.post('/', handleCreateComplaint);

/**
 * GET /api/complaints - Get all complaints with optional filters
 * Query: ?category=&status=&severity=
 */
router.get('/', handleGetAllComplaints);

/**
 * GET /api/complaints/:id - Get single complaint
 */
router.get('/:id', handleGetComplaint);

/**
 * PATCH /api/complaints/:id/status - Update complaint status
 * Body: { status }
 */
router.patch('/:id/status', verifyToken, handleUpdateComplaintStatus);

/**
 * POST /api/complaints/:id/upvote - Upvote complaint
 * Body: { userId }
 */
router.post('/:id/upvote', handleUpvoteComplaint);

module.exports = router;
