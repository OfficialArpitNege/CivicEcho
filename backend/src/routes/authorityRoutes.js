const express = require('express');
const authorityCheck = require('../middleware/authorityCheck');
const {
  getAllIssues,
  updateIssueStatus,
  assignResolver,
} = require('../controllers/authorityController');

const router = express.Router();

// All authority routes require authorityCheck middleware
router.use(authorityCheck);

// GET all issues
router.get('/issues', getAllIssues);

// PATCH issue status
router.patch('/issues/:id/status', updateIssueStatus);

// PATCH assign resolver
router.patch('/issues/:id/assign', assignResolver);

module.exports = router;
