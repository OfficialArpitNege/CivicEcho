import { createContext, useState, useContext, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Authority email whitelist
  const AUTHORITY_EMAILS = ['authority@civicecho.gov'];

  // Function to fetch user role from Firestore
  const fetchUserRole = async (uid, email) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role || 'citizen';
        console.log(`👤 User role fetched from Firestore: ${role} (${uid})`);
        setUserRole(role);
        return role;
      } else {
        // User doesn't exist in Firestore yet, determine role from email
        const role = AUTHORITY_EMAILS.includes(email?.toLowerCase()) ? 'authority' : 'citizen';
        
        // Create user profile in Firestore
        await setDoc(doc(db, 'users', uid), {
          uid,
          email,
          name: email?.split('@')[0] || 'User',
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        console.log(`✅ Created user profile in Firestore with role: ${role}`);
        setUserRole(role);
        return role;
      }
    } catch (error) {
      console.error('❌ Error fetching user role:', error);
      setUserRole('citizen');
      return 'citizen';
    }
  };

  useEffect(() => {
    console.log('🔐 Auth Context Initialized - Using Firebase Client SDK');

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log(`✅ User authenticated: ${currentUser.email}`);
        
        // Fetch role from Firestore
        await fetchUserRole(currentUser.uid, currentUser.email);
        setUser(currentUser);
      } else {
        console.log('🔓 User logged out');
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
      
      // Fetch user role from Firestore
      await fetchUserRole(userCredential.user.uid, userCredential.user.email);
      setUser(userCredential.user);
      
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
      
      // Fetch/create user role from Firestore
      await fetchUserRole(userCredential.user.uid, userCredential.user.email);
      setUser(userCredential.user);
      
      return userCredential;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserRole(null);
    setUser(null);
    console.log('🔓 User logged out');
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
