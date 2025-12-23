const express = require('express');
const {
  handleGetDashboardStats,
  handleGetHeatmapData,
  handleGetPriorityIssues,
  handleGetMyComplaints,
} = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/dashboard/stats - Dashboard statistics
 */
router.get('/stats', verifyToken, handleGetDashboardStats);

/**
 * GET /api/dashboard/heatmap - Heatmap data for Google Maps
 */
router.get('/heatmap', handleGetHeatmapData);

/**
 * GET /api/dashboard/priority - Priority-ranked issues
 */
router.get('/priority', verifyToken, handleGetPriorityIssues);

/**
 * GET /api/dashboard/my-complaints - User's own complaints
 */
router.get('/my-complaints', verifyToken, handleGetMyComplaints);

module.exports = router;
