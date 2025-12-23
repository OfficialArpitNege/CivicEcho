import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { reverseGeocodeWithSessionCache } from './geocodingService';
import { awardPoints, POINTS } from './firestoreUserService';

// Cache for user emails to avoid repeated Firestore queries
const userEmailCache = new Map();

/**
 * Get user email from Firestore users collection
 * Uses caching to avoid repeated queries
 */
const getUserEmail = async (userId) => {
  if (!userId) return null;

  // Check cache first
  if (userEmailCache.has(userId)) {
    return userEmailCache.get(userId);
  }

  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const email = userDoc.data().email || null;
      // Cache the result
      userEmailCache.set(userId, email);
      return email;
    }
  } catch (error) {
    console.warn(`⚠️ Could not fetch user email for ${userId}: ${error.message}`);
  }

  return null;
};

/**
 * Create a new complaint in Firestore
 */
export const createComplaint = async (userId, userEmail, complaintData) => {
  try {
    // Attempt to reverse geocode coordinates to get address
    let address = complaintData.address || null;
    if (!address && complaintData.latitude && complaintData.longitude) {
      try {
        console.log(`📍 Reverse geocoding coordinates...`);
        address = await reverseGeocodeWithSessionCache(complaintData.latitude, complaintData.longitude);
      } catch (geoError) {
        console.warn(`⚠️ Reverse geocoding failed: ${geoError.message}`);
        // Continue without address - it's not critical
      }
    }

    const complaintsRef = collection(db, 'complaints');

    const docRef = await addDoc(complaintsRef, {
      userId,
      userEmail,
      description: complaintData.description,
      latitude: complaintData.latitude,
      longitude: complaintData.longitude,
      address: address,
      imageBase64: complaintData.imageBase64 || null,
      complaintType: complaintData.complaintType || 'text',
      status: 'reported',
      upvotes: 0,
      upvoters: [],
      assignedResolver: null,
      category: complaintData.category || 'other',
      severity: complaintData.severity || 'medium',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Complaint created:', docRef.id);
    return {
      id: docRef.id,
      ...complaintData,
      status: 'reported',
      upvotes: 0,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('❌ Error creating complaint:', error);
    throw error;
  }
};

/**
 * Get all complaints
 */
export const getAllComplaints = async () => {
  try {
    const complaintsRef = collection(db, 'complaints');
    const q = query(complaintsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    // Fetch user emails for complaints that don't have them
    const complaints = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        let userEmail = data.userEmail;

        // If userEmail is not available, fetch it from users collection
        if (!userEmail && data.userId) {
          userEmail = await getUserEmail(data.userId);
        }

        return {
          id: doc.id,
          issueId: doc.id,
          ...data,
          userEmail: userEmail || null,
          createdAt: data.createdAt?.toDate?.() || new Date(),
        };
      })
    );

    return complaints;
  } catch (error) {
    console.error('❌ Error fetching complaints:', error);
    throw error;
  }
};

/**
 * Get complaints reported by a specific user
 */
export const getComplaintsByUser = async (userId) => {
  try {
    const complaintsRef = collection(db, 'complaints');
    const q = query(
      complaintsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    // Fetch user emails for complaints that don't have them
    const complaints = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        let userEmail = data.userEmail;

        // If userEmail is not available, fetch it from users collection
        if (!userEmail && data.userId) {
          userEmail = await getUserEmail(data.userId);
        }

        return {
          id: doc.id,
          issueId: doc.id,
          ...data,
          userEmail: userEmail || null,
          createdAt: data.createdAt?.toDate?.() || new Date(),
        };
      })
    );

    return complaints;
  } catch (error) {
    console.error('❌ Error fetching user complaints:', error);
    throw error;
  }
};

/**
 * Get a single complaint by ID
 */
export const getComplaintById = async (complaintId) => {
  try {
    const docRef = doc(db, 'complaints', complaintId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Complaint not found');
    }

    const complaint = {
      id: docSnap.id,
      issueId: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
    };

    // Fetch user email if not available
    if (!complaint.userEmail && complaint.userId) {
      complaint.userEmail = await getUserEmail(complaint.userId);
    }

    // Attempt to geocode if address is missing
    if (!complaint.address && complaint.latitude && complaint.longitude) {
      try {
        console.log(`📍 Geocoding complaint ${complaintId}...`);
        complaint.address = await reverseGeocodeWithSessionCache(complaint.latitude, complaint.longitude);

        // Update Firestore with the new address
        await updateDoc(docRef, { address: complaint.address });
      } catch (geoError) {
        console.warn(`⚠️ Could not geocode complaint: ${geoError.message}`);
      }
    }

    return complaint;
  } catch (error) {
    console.error('❌ Error fetching complaint:', error);
    throw error;
  }
};

/**
 * Update complaint status (reported → in_progress → resolved)
 */
export const updateComplaintStatus = async (complaintId, newStatus) => {
  try {
    const docRef = doc(db, 'complaints', complaintId);

    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });

    // Gamification: Award points if status changed to 'in_progress' (verified)
    let pointsResult = null;
    if (newStatus === 'in_progress') {
      // We need to fetch the complaint to identify the user
      const complaint = await getComplaintById(complaintId);
      if (complaint.userId) {
        pointsResult = await awardPoints(complaint.userId, POINTS.COMPLAINT_VERIFIED, 'Complaint Verified');
      }
    }

    console.log(`✅ Complaint status updated to ${newStatus}`);
    return {
      success: true,
      message: `Status updated to ${newStatus}`,
      pointsAwarded: !!pointsResult,
      pointsEarned: POINTS.COMPLAINT_VERIFIED
    };
  } catch (error) {
    console.error('❌ Error updating complaint status:', error);
    throw error;
  }
};

/**
 * Assign resolver to a complaint
 */
export const assignResolver = async (complaintId, resolverName) => {
  try {
    const docRef = doc(db, 'complaints', complaintId);

    await updateDoc(docRef, {
      assignedResolver: resolverName,
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ Resolver assigned: ${resolverName}`);
    return { success: true, message: 'Resolver assigned successfully' };
  } catch (error) {
    console.error('❌ Error assigning resolver:', error);
    throw error;
  }
};

/**
 * Upvote a complaint
 */
export const upvoteComplaint = async (complaintId, userId) => {
  try {
    const docRef = doc(db, 'complaints', complaintId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Complaint not found');
    }

    const upvoters = docSnap.data().upvoters || [];
    const hasUpvoted = upvoters.includes(userId);

    if (hasUpvoted) {
      // Remove upvote
      await updateDoc(docRef, {
        upvotes: Math.max(0, (docSnap.data().upvotes || 0) - 1),
        upvoters: arrayRemove(userId),
        updatedAt: serverTimestamp(),
      });
      console.log('✅ Upvote removed');
    } else {
      // Add upvote
      await updateDoc(docRef, {
        upvotes: (docSnap.data().upvotes || 0) + 1,
        upvoters: arrayUnion(userId),
        updatedAt: serverTimestamp(),
      });
      console.log('✅ Complaint upvoted');
    }

    const updated = await getComplaintById(complaintId);
    return updated;
  } catch (error) {
    console.error('❌ Error upvoting complaint:', error);
    throw error;
  }
};

/**
 * Update complaint description
 */
export const updateComplaint = async (complaintId, updates) => {
  try {
    const docRef = doc(db, 'complaints', complaintId);

    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Complaint updated');
    return { success: true, message: 'Complaint updated successfully' };
  } catch (error) {
    console.error('❌ Error updating complaint:', error);
    throw error;
  }
};

/**
 * Delete a complaint
 */
export const deleteComplaint = async (complaintId) => {
  try {
    const docRef = doc(db, 'complaints', complaintId);

    await deleteDoc(docRef);

    console.log('✅ Complaint deleted');
    return { success: true, message: 'Complaint deleted successfully' };
  } catch (error) {
    console.error('❌ Error deleting complaint:', error);
    throw error;
  }
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  try {
    const complaints = await getAllComplaints();

    const stats = {
      totalComplaints: complaints.length,
      byStatus: {
        reported: complaints.filter(c => c.status === 'reported').length,
        in_progress: complaints.filter(c => c.status === 'in_progress').length,
        resolved: complaints.filter(c => c.status === 'resolved').length,
      },
      byCategory: {},
      bySeverity: {},
      totalClusters: 0,
    };

    // Calculate category distribution
    complaints.forEach(complaint => {
      const category = complaint.category || 'other';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    });

    // Calculate severity distribution
    complaints.forEach(complaint => {
      const severity = complaint.severity || 'medium';
      stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    throw error;
  }
};

/**
 * Get priority issues (high upvotes, recent)
 */
export const getPriorityIssues = async () => {
  try {
    const complaints = await getAllComplaints();

    // Sort by upvotes (descending) and creation date (recent first)
    const sorted = complaints
      .sort((a, b) => {
        const upvoteDiff = (b.upvotes || 0) - (a.upvotes || 0);
        if (upvoteDiff !== 0) return upvoteDiff;

        const dateA = a.createdAt?.getTime?.() || 0;
        const dateB = b.createdAt?.getTime?.() || 0;
        return dateB - dateA;
      })
      .slice(0, 20);

    return sorted;
  } catch (error) {
    console.error('❌ Error fetching priority issues:', error);
    throw error;
  }
};
