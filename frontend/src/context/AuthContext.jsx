import { createContext, useState, useContext, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import apiClient from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user role from Firestore
  const fetchUserRole = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role || 'citizen';
        console.log(`👤 User role fetched: ${role} (${uid})`);
        setUserRole(role);
        return role;
      } else {
        console.warn(`⚠️ User profile not found in Firestore (${uid})`);
        setUserRole('citizen');
        return 'citizen';
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('citizen');
      return 'citizen';
    }
  };

  useEffect(() => {
    console.log('🔐 Auth Context Initialized - Using Real Firebase');

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const token = await currentUser.getIdToken();
        localStorage.setItem('authToken', token);
        
        // Fetch user role from Firestore
        await fetchUserRole(currentUser.uid);
        setUser(currentUser);
      } else {
        localStorage.removeItem('authToken');
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      console.log(`🔓 Attempting login with email: ${email}`);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log(`✅ Authentication successful, UID: ${userCredential.user.uid}`);
      
      // Ensure user profile exists in Firestore (role assigned server-side)
      try {
        console.log(`📡 Fetching user profile from API...`);
        const profileResponse = await apiClient.post('/users/profile', {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
        });
        
        console.log(`📦 API Response:`, profileResponse.data);
        
        // Immediately set the role from the API response
        if (profileResponse.data && profileResponse.data.data && profileResponse.data.data.role) {
          const role = profileResponse.data.data.role;
          console.log(`✅ Login successful - Role: ${role}`);
          setUserRole(role);
        } else {
          console.warn(`⚠️ No role found in API response, falling back to Firestore...`);
          await fetchUserRole(userCredential.user.uid);
        }
      } catch (error) {
        console.error('❌ Error updating user profile on login:', error);
        // Still try to fetch from Firestore as fallback
        await fetchUserRole(userCredential.user.uid);
      }
      
      return userCredential;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password) => {
    setLoading(true);
    try {
      console.log(`✍️ Attempting signup with email: ${email}`);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log(`✅ Account created, UID: ${userCredential.user.uid}`);
      
      // Create user profile in Firestore (role assigned server-side based on email whitelist)
      try {
        console.log(`📡 Creating user profile in API...`);
        const profileResponse = await apiClient.post('/users/profile', {
          uid: userCredential.user.uid,
          email,
        });
        
        console.log(`📦 API Response:`, profileResponse.data);
        
        // Immediately set the role from the API response
        if (profileResponse.data && profileResponse.data.data && profileResponse.data.data.role) {
          const role = profileResponse.data.data.role;
          console.log(`✅ Signup successful - Role: ${role}`);
          setUserRole(role);
        } else {
          console.warn(`⚠️ No role found in API response, falling back to Firestore...`);
          await fetchUserRole(userCredential.user.uid);
        }
      } catch (error) {
        console.error('❌ Error creating user profile:', error);
        // Still try to fetch from Firestore as fallback
        await fetchUserRole(userCredential.user.uid);
      }
      
      return userCredential;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('authToken');
    setUserRole(null);
  };

  // Helper functions for role checking
  const isAuthority = () => userRole === 'authority';
  const isCitizen = () => userRole === 'citizen';

  return (
    <AuthContext.Provider value={{ user, userRole, loading, login, signup, logout, isAuthority, isCitizen }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
