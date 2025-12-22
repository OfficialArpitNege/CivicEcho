const express = require('express');
const {
  handleGetDashboardStats,
  handleGetHeatmapData,
  handleGetPriorityIssues,
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

module.exports = router;
