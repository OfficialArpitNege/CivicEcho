export const ISSUE_CATEGORIES = {
    WATER: 'water_leak',
    GARBAGE: 'garbage_waste',
    ROAD: 'road_damage',
    POWER: 'power_outage',
    SAFETY: 'safety_issue',
    OTHER: 'other',
};

export const SEVERITY_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
};

/**
 * Determine issue category based on keywords
 */
export const determineCategoryFromText = (text) => {
    const lowerText = text.toLowerCase();

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

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some((keyword) => lowerText.includes(keyword))) {
            return category;
        }
    }

    return ISSUE_CATEGORIES.OTHER;
};

/**
 * Determine severity based on text content
 */
export const determineSeverityFromText = (text) => {
    const lowerText = text.toLowerCase();

    const criticalKeywords = ['critical', 'urgent', 'emergency', 'asap', 'immediately', 'dangerous', 'severe', 'injury', 'explosion', 'blast', 'fire'];
    const highKeywords = ['serious', 'major', 'significant', 'needs repair', 'broken', 'hazard', 'risk'];
    const mediumKeywords = ['issue', 'problem', 'needs', 'should be', 'dirty', 'leak'];

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
