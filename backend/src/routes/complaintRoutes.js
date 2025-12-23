const express = require('express');
const {
  handleCreateComplaint,
  handleGetAllComplaints,
  handleGetComplaint,
  handleUpdateComplaintStatus,
  handleUpdateComplaint,
  handleDeleteComplaint,
  handleUpvoteComplaint,
  handleAssignComplaint,
} = require('../controllers/complaintController');
const { verifyToken, requireAuthority } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/complaints - Create new complaint
 * Body: { description, latitude, longitude, complaintType, audioUrl, userId }
 */
router.post('/', handleCreateComplaint);

/**
 * GET /api/complaints - Get all complaints with optional filters
 * Query: ?category=&status=&severity=
 * Requires auth to personalize results for current user
 */
router.get('/', verifyToken, handleGetAllComplaints);

/**
 * GET /api/complaints/:id - Get single complaint
 */
router.get('/:id', handleGetComplaint);

/**
 * PATCH /api/complaints/:id/status - Update complaint status (authority only)
 * Body: { status }
 */
router.patch('/:id/status', verifyToken, requireAuthority, handleUpdateComplaintStatus);

/**
 * PUT /api/complaints/:id/status - Update complaint status (authority only)
 * Body: { status: "VERIFIED" | "RESOLVED" }
 */
router.put('/:id/status', verifyToken, requireAuthority, handleUpdateComplaintStatus);

/**
 * POST /api/complaints/:id/assign - Assign complaint to resolver (authority only)
 * Body: { assignedTo, resolverName }
 */
router.post('/:id/assign', verifyToken, requireAuthority, handleAssignComplaint);

/**
 * PATCH /api/complaints/:id - Update complaint content (owned by current user)
 */
router.patch('/:id', verifyToken, handleUpdateComplaint);

/**
 * DELETE /api/complaints/:id - Delete complaint (owned by current user)
 */
router.delete('/:id', verifyToken, handleDeleteComplaint);

/**
 * POST /api/complaints/:id/upvote - Upvote complaint
 * Body: { userId }
 */
router.post('/:id/upvote', handleUpvoteComplaint);

module.exports = router;
