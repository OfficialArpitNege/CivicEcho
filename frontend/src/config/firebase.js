import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Determine if using emulator based on env variable or invalid credentials
const useEmulator = import.meta.env.VITE_FIREBASE_MODE === 'emulator' || 
                    !import.meta.env.VITE_FIREBASE_API_KEY ||
                    import.meta.env.VITE_FIREBASE_API_KEY.startsWith('AIzaSyDE');

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyEmulatorPlaceholder123456789',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'civicecho-emulator.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'civicecho-dev',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'civicecho-emulator.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abc123def456',
};

let app, auth, db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Connect to emulators if in emulator mode
  if (useEmulator) {
    console.log('🔥 Using Firebase Emulator Suite (Local Development)');
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, 'localhost', 8090);
      console.log('✅ Emulator Auth: http://localhost:9099');
      console.log('✅ Emulator Firestore: localhost:8080');
    } catch (e) {
      // Emulator already connected or error connecting
      console.error('⚠️ Emulator connection error:', e.message);
    }
  } else {
    console.log('🌐 Using Real Firebase Services (Production)');
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  throw error;
}

export { auth, db };
export default app;
