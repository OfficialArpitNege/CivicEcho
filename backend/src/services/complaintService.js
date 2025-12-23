const { db } = require('../config/firebase');
const { analyzeComplaint, calculateTextSimilarity } = require('./nlpService');
const { calculateDistance } = require('../utils/helpers');
const { CLUSTERING } = require('../utils/constants');

/**
 * Create a new complaint in Firestore
 */
const createComplaint = async (complaintData) => {
  try {
    const complaint = {
      ...complaintData,
      createdAt: new Date(),
      updatedAt: new Date(),
      upvotes: 0,
      clusterId: null,
    };

    // Analyze complaint for category and severity
    const analysis = await analyzeComplaint(complaintData.description);
    complaint.category = analysis.category;
    complaint.severity = analysis.severity;
    complaint.sentiment = analysis.sentiment;

    // Check for duplicate/similar complaints
    const clusterId = await findOrCreateCluster(complaint);
    complaint.clusterId = clusterId;

    // Save to Firestore
    const docRef = await db.collection('complaints').add(complaint);

    return {
      id: docRef.id,
      ...complaint,
    };
  } catch (error) {
    console.error('Error creating complaint:', error);
    throw error;
  }
};

/**
 * Find or create a cluster for similar complaints
 */
const findOrCreateCluster = async (complaint) => {
  try {
    const { latitude, longitude, description } = complaint;

    // Query nearby complaints within distance threshold
    const snapshot = await db.collection('complaints').get();

    let matchingCluster = null;
    const timeThreshold = Date.now() - CLUSTERING.TIME_THRESHOLD_HOURS * 60 * 60 * 1000;

    snapshot.forEach((doc) => {
      const existingComplaint = doc.data();

      // Check distance and time
      const distance = calculateDistance(
        latitude,
        longitude,
        existingComplaint.latitude,
        existingComplaint.longitude
      );

      const isNearby = distance <= CLUSTERING.DISTANCE_THRESHOLD_KM;
      const createdAt = existingComplaint.createdAt instanceof Date
        ? existingComplaint.createdAt.getTime()
        : existingComplaint.createdAt?.toMillis?.();
      const isRecent = createdAt > timeThreshold;

      // Check text similarity
      const similarity = calculateTextSimilarity(description, existingComplaint.description);
      const isSimilar = similarity >= CLUSTERING.SIMILARITY_THRESHOLD;

      if (isNearby && isRecent && isSimilar && existingComplaint.clusterId) {
        matchingCluster = existingComplaint.clusterId;
      }
    });

    // If found matching cluster, return it
    if (matchingCluster) {
      return matchingCluster;
    }

    // Create new cluster
    const clusterRef = await db.collection('clusters').add({
      complaints: [complaint.id],
      category: complaint.category,
      severity: complaint.severity,
      location: {
        latitude,
        longitude,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return clusterRef.id;
  } catch (error) {
    console.error('Error finding/creating cluster:', error);
    return null;
  }
};

/**
 * Get complaint by ID
 */
const getComplaintById = async (complaintId) => {
  try {
    const doc = await db.collection('complaints').doc(complaintId).get();
    if (!doc.exists) {
      throw new Error('Complaint not found');
    }
    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    console.error('Error fetching complaint:', error);
    throw error;
  }
};

/**
 * Get all complaints
 */
const getAllComplaints = async (filters = {}) => {
  try {
    let query = db.collection('complaints');

    if (filters.category) {
      query = query.where('category', '==', filters.category);
    }

    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }

    if (filters.severity) {
      query = query.where('severity', '==', filters.severity);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching complaints:', error);
    throw error;
  }
};

/**
 * Update complaint status
 */
const updateComplaintStatus = async (complaintId, status, authorityId = null, resolutionNote = null) => {
  try {
    const updateData = {
      status,
      updatedAt: new Date(),
    };

    // Add audit trail
    if (authorityId) {
      updateData.updatedBy = authorityId;
    }

    // Add resolution note if resolving
    if (resolutionNote && status === 'resolved') {
      updateData.resolutionNote = resolutionNote;
      updateData.resolvedAt = new Date();
    }

    await db.collection('complaints').doc(complaintId).update(updateData);

    return await getComplaintById(complaintId);
  } catch (error) {
    console.error('Error updating complaint status:', error);
    throw error;
  }
};

/**
 * Update complaint content (e.g., description)
 */
const updateComplaint = async (complaintId, updates) => {
  try {
    await db.collection('complaints').doc(complaintId).update({
      ...updates,
      updatedAt: new Date(),
    });

    return await getComplaintById(complaintId);
  } catch (error) {
    console.error('Error updating complaint:', error);
    throw error;
  }
};

/**
 * Delete complaint
 */
const deleteComplaint = async (complaintId) => {
  try {
    await db.collection('complaints').doc(complaintId).delete();
    return { id: complaintId };
  } catch (error) {
    console.error('Error deleting complaint:', error);
    throw error;
  }
};

/**
 * Upvote a complaint
 */
const upvoteComplaint = async (complaintId, userId) => {
  try {
    const complaint = await getComplaintById(complaintId);

    // Check if user already upvoted
    const upvoteRef = db
      .collection('complaints')
      .doc(complaintId)
      .collection('upvotes')
      .doc(userId);

    const upvoteDoc = await upvoteRef.get();

    if (upvoteDoc.exists) {
      // Remove upvote
      await upvoteRef.delete();
      await db
        .collection('complaints')
        .doc(complaintId)
        .update({
          upvotes: Math.max(0, complaint.upvotes - 1),
        });
    } else {
      // Add upvote
      await upvoteRef.set({ createdAt: new Date() });
      await db.collection('complaints').doc(complaintId).update({
        upvotes: complaint.upvotes + 1,
      });
    }

    return await getComplaintById(complaintId);
  } catch (error) {
    console.error('Error upvoting complaint:', error);
    throw error;
  }
};

/**
 * Assign complaint to resolver
 */
const assignComplaint = async (complaintId, assignedTo, resolverName) => {
  try {
    await db.collection('complaints').doc(complaintId).update({
      assignedTo,
      resolverName,
      status: 'in_progress',
      updatedAt: new Date(),
    });

    return await getComplaintById(complaintId);
  } catch (error) {
    console.error('Error assigning complaint:', error);
    throw error;
  }
};

module.exports = {
  createComplaint,
  getComplaintById,
  getAllComplaints,
  updateComplaintStatus,
  updateComplaint,
  deleteComplaint,
  upvoteComplaint,
  assignComplaint,
  findOrCreateCluster,
  reverseGeocode,
};

/**
 * Reverse geocode coordinates to get address
 * Uses OpenStreetMap Nominatim API (free, no key required)
 */
async function reverseGeocode(latitude, longitude) {
  try {
    const response = await require('axios').get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: latitude,
        lon: longitude,
        format: 'json',
        zoom: 18,
        addressdetails: 1,
      },
      timeout: 5000,
      headers: {
        'User-Agent': 'CivicEcho-App/1.0',
      },
    });

    if (response.data && response.data.address) {
      // Build a readable address from the components
      const addr = response.data.address;
      const addressParts = [];
      
      if (addr.road || addr.pedestrian || addr.footway) {
        addressParts.push(addr.road || addr.pedestrian || addr.footway);
      }
      if (addr.neighbourhood || addr.suburb) {
        addressParts.push(addr.neighbourhood || addr.suburb);
      }
      if (addr.city || addr.town || addr.village) {
        addressParts.push(addr.city || addr.town || addr.village);
      }
      if (addr.country) {
        addressParts.push(addr.country);
      }

      return addressParts.join(', ') || response.data.display_name;
    }
    
    return response.data?.display_name || null;
  } catch (error) {
    console.error('Error reverse geocoding:', error.message);
    return null;
  }
}
