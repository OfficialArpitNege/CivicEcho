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

      console.log(`[NLP DEBUG] Text-only category: ${category}, severity: ${severity}`);

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

    // Determine category based on keywords and entities
    const category = determineCategoryFromText(text, entityResponse.entities);

    // Determine severity based on sentiment and entities
    const severity = determineSeverityFromSentiment(sentimentResponse, text);

    console.log(`[NLP DEBUG] AI Results - Category: ${category}, Severity: ${severity}`);
    console.log(`[NLP DEBUG] Detected Entities: ${entityResponse.entities.map(e => e.name).join(', ')}`);

    return {
      category,
      severity,
      sentiment: sentimentResponse.documentSentiment,
      entities: entityResponse.entities,
    };
  } catch (error) {
    console.error('⚠️ Error analyzing complaint with NLP, using fallback:', error.message);
    // Use text-based analysis as fallback
    const category = determineCategoryFromText(text);
    const severity = determineSeverityFromText(text);

    return {
      category: category || 'other',
      severity: severity || 'medium',
      sentiment: { score: 0, magnitude: 0 },
      entities: [],
      fallback: true,
    };
  }
};

/**
 * Determine issue category based on keywords
 */
/**
 * Determine issue category based on keywords and NLP entities
 */
const determineCategoryFromText = (text, entities = []) => {
  const lowerText = text.toLowerCase();

  // Extract entity names if available
  const entityNames = entities.map(e => e.name.toLowerCase());
  const combinedText = [lowerText, ...entityNames].join(' ');

  const categoryKeywords = {
    [ISSUE_CATEGORIES.WATER]: [
      'water', 'leak', 'burst', 'pipe', 'flooding', 'wet', 'drainage', 'sewage',
      'tap', 'supply', 'drinking', 'muddy', 'puddle', 'overflow', 'plumbing',
      'drain', 'gutter', 'hydrant', 'sprinkler', 'dam', 'well', 'reservoir',
      'tank', 'valve', 'main', 'spill', 'wash', 'sink', 'toilet', 'shower',
      'line', 'canal', 'stream', 'pond', 'wetland', 'sump', 'pump', 'meter'
    ],
    [ISSUE_CATEGORIES.GARBAGE]: [
      'garbage', 'waste', 'trash', 'litter', 'dump', 'dirty', 'dustbin', 'refuse',
      'rubbish', 'cleaning', 'smell', 'odor', 'stink', 'sanitation', 'debris',
      'pile', 'bin', 'receptacle', 'compost', 'recycling', 'stench', 'unhygienic',
      'scrap', 'junk', 'mess', 'clutter', 'disposal', 'pickup', 'truck', 'landfill',
      'overflowing', 'fly-tipping', 'plastic', 'bottle', 'can', 'bag'
    ],
    [ISSUE_CATEGORIES.ROAD]: [
      'road', 'pothole', 'crack', 'asphalt', 'pavement', 'damaged', 'street',
      'traffic', 'signal', 'sign', 'lane', 'bump', 'surface', 'footpath', 'sidewalk',
      'driveway', 'alley', 'highway', 'intersection', 'crossing', 'zebra',
      'barrier', 'curb', 'kerb', 'hole', 'dent', 'uneven', 'concrete', 'paving',
      'marking', 'lighting', 'light', 'lamp', 'post', 'bridge', 'overpass', 'tunnel'
    ],
    [ISSUE_CATEGORIES.POWER]: [
      'power', 'electricity', 'outage', 'blackout', 'light', 'electric', 'voltage',
      'wire', 'cable', 'pole', 'transformer', 'switch', 'current', 'spark', 'dark',
      'short', 'fuse', 'generator', 'panel', 'station', 'pylon', 'grid', 'supply',
      'cut', 'interruption', 'failure', 'shock', 'hanging', 'down', 'dead'
    ],
    [ISSUE_CATEGORIES.SAFETY]: [
      'safety', 'dangerous', 'hazard', 'broken', 'accident', 'risk', 'threat',
      'fire', 'smoke', 'suspicious', 'crime', 'theft', 'assault', 'unsafe', 'security',
      'danger', 'emergency', 'help', 'police', 'weapon', 'fight', 'argument',
      'harassment', 'abuse', 'falling', 'unstable', 'structurally', 'collapse',
      'poison', 'toxic', 'chemical', 'gas', 'explosion', 'blast', 'noise'
    ],
  };

  console.log(`[NLP DEBUG] Analyzing text: "${lowerText.substring(0, 50)}..."`);
  if (entities.length > 0) {
    console.log(`[NLP DEBUG] AI Entities found: ${entityNames.join(', ')}`);
  }

  // Check keywords against combined text (original text + entity names)
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => combinedText.includes(keyword))) {
      console.log(`[NLP DEBUG] Match found! Category: ${category} (triggered by keyword match)`);
      return category;
    }
  }

  console.log(`[NLP DEBUG] No specific match found. Defaulting to: ${ISSUE_CATEGORIES.OTHER}`);
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
