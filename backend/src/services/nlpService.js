const { languageClient, isCredentialsAvailable } = require('../config/googleAI');
const { ISSUE_CATEGORIES, SEVERITY_LEVELS } = require('../utils/constants');

/**
 * Analyze complaint text to extract category and severity
 * @param {string} text - Complaint text
 * @returns {Promise<Object>} Object with category and severity
 */
const analyzeComplaint = async (text) => {
  try {
    // If credentials are not available, use text-based analysis only
    if (!isCredentialsAvailable) {
      console.log('⚠️  Using text-based NLP analysis (Google Cloud credentials not configured)');
      const category = determineCategoryFromText(text);
      const severity = determineSeverityFromText(text);

      return {
        category: category || 'other',
        severity: severity || 'low',
        sentiment: { score: 0, magnitude: 0 },
        entities: [],
        mock: true,
      };
    }

    // Analyze entities and sentiment with Google Cloud NLP
    const document = {
      content: text,
      type: 'PLAIN_TEXT',
      language: 'en',
    };

    const [entityResponse] = await languageClient.analyzeEntities({ document });
    const [sentimentResponse] = await languageClient.analyzeSentiment({ document });

    // Determine category based on keywords
    const category = determineCategoryFromText(text);

    // Determine severity based on sentiment and entities
    const severity = determineSeverityFromSentiment(sentimentResponse, text);

    return {
      category,
      severity,
      sentiment: sentimentResponse.documentSentiment,
      entities: entityResponse.entities,
    };
  } catch (error) {
    console.error('Error analyzing complaint:', error);
    throw new Error('NLP analysis failed');
  }
};

/**
 * Determine issue category based on keywords
 */
const determineCategoryFromText = (text) => {
  const lowerText = text.toLowerCase();

  const categoryKeywords = {
    [ISSUE_CATEGORIES.WATER]: ['water', 'leak', 'burst', 'pipe', 'flooding', 'wet'],
    [ISSUE_CATEGORIES.GARBAGE]: ['garbage', 'waste', 'trash', 'litter', 'dump', 'dirty'],
    [ISSUE_CATEGORIES.ROAD]: ['road', 'pothole', 'crack', 'asphalt', 'pavement', 'damaged'],
    [ISSUE_CATEGORIES.POWER]: ['power', 'electricity', 'outage', 'blackout', 'light', 'electric'],
    [ISSUE_CATEGORIES.SAFETY]: ['safety', 'dangerous', 'hazard', 'broken', 'accident', 'risk'],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      return category;
    }
  }

  return ISSUE_CATEGORIES.OTHER;
};

/**
 * Determine severity based on text content (when API unavailable)
 */
const determineSeverityFromText = (text) => {
  const lowerText = text.toLowerCase();
  
  const criticalKeywords = ['critical', 'urgent', 'emergency', 'asap', 'immediately', 'dangerous', 'severe', 'injury'];
  const highKeywords = ['serious', 'major', 'significant', 'needs repair', 'broken'];
  const mediumKeywords = ['issue', 'problem', 'needs', 'should be'];

  if (criticalKeywords.some(word => lowerText.includes(word))) {
    return SEVERITY_LEVELS.CRITICAL;
  } else if (highKeywords.some(word => lowerText.includes(word))) {
    return SEVERITY_LEVELS.HIGH;
  } else if (mediumKeywords.some(word => lowerText.includes(word))) {
    return SEVERITY_LEVELS.MEDIUM;
  } else {
    return SEVERITY_LEVELS.LOW;
  }
};

/**
 * Determine severity based on sentiment
 */
const determineSeverityFromSentiment = (sentimentResponse, text) => {
  const sentiment = sentimentResponse.documentSentiment?.score || 0;
  const magnitude = sentimentResponse.documentSentiment?.magnitude || 0;

  const urgencyKeywords = ['critical', 'urgent', 'emergency', 'asap', 'immediately', 'dangerous'];
  const hasUrgency = urgencyKeywords.some((word) =>
    text.toLowerCase().includes(word)
  );

  // Combine sentiment and magnitude for severity assessment
  if (sentiment < -0.5 || magnitude > 2 || hasUrgency) {
    return SEVERITY_LEVELS.CRITICAL;
  } else if (sentiment < -0.25 || magnitude > 1) {
    return SEVERITY_LEVELS.HIGH;
  } else if (sentiment < 0) {
    return SEVERITY_LEVELS.MEDIUM;
  } else {
    return SEVERITY_LEVELS.LOW;
  }
};

/**
 * Calculate text similarity (simple implementation)
 */
const calculateTextSimilarity = (text1, text2) => {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
};

module.exports = {
  analyzeComplaint,
  calculateTextSimilarity,
  determineCategoryFromText,
  determineSeverityFromSentiment,
  determineSeverityFromText,
};
