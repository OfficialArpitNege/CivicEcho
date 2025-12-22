// Issue Categories
const ISSUE_CATEGORIES = {
  WATER: 'water_leak',
  GARBAGE: 'garbage_waste',
  ROAD: 'road_damage',
  POWER: 'power_outage',
  SAFETY: 'safety_issue',
  OTHER: 'other',
};

// Issue Status
const ISSUE_STATUS = {
  REPORTED: 'reported',
  VERIFIED: 'verified',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

// Severity Levels
const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Clustering Thresholds
const CLUSTERING = {
  DISTANCE_THRESHOLD_KM: 0.5, // 500 meters
  TIME_THRESHOLD_HOURS: 24, // 24 hours
  SIMILARITY_THRESHOLD: 0.8, // 80% similarity for text
};

module.exports = {
  ISSUE_CATEGORIES,
  ISSUE_STATUS,
  SEVERITY_LEVELS,
  CLUSTERING,
};
