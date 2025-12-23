import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

/**
 * Firebase Configuration Module
 * Supports both emulator mode (local development) and production mode
 * 
 * Environment Variables:
 * - VITE_FIREBASE_MODE: "emulator" or "production"
 * - VITE_FIREBASE_API_KEY
 * - VITE_FIREBASE_AUTH_DOMAIN
 * - VITE_FIREBASE_PROJECT_ID
 * - VITE_FIREBASE_STORAGE_BUCKET
 * - VITE_FIREBASE_MESSAGING_SENDER_ID
 * - VITE_FIREBASE_APP_ID
 */

// Get mode from environment variable (default to 'production' for safety)
const FIREBASE_MODE = import.meta.env.VITE_FIREBASE_MODE?.toLowerCase() || 'production';
const IS_EMULATOR_MODE = FIREBASE_MODE === 'emulator';

// Validate that in production mode, all required config is present
if (!IS_EMULATOR_MODE) {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];

  const missingVars = requiredVars.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn(
      `⚠️ Production mode enabled but missing environment variables: ${missingVars.join(', ')}`
    );
  }
}

// Firebase configuration object
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'emulator-placeholder',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'localhost',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'emulator-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'localhost',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '0',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'emulator-app',
};

let app, auth, db;

try {
  // Initialize Firebase App
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  // Connect to emulators only if explicitly in emulator mode
  if (IS_EMULATOR_MODE) {
    console.log('🔥 Firebase Mode: EMULATOR (Local Development)');
    console.log('📍 Project ID:', firebaseConfig.projectId);

    try {
      // Connect Auth Emulator
      connectAuthEmulator(auth, 'http://localhost:9099', {
        disableWarnings: true,
      });
      console.log('✅ Auth Emulator connected: http://localhost:9099');

      // Connect Firestore Emulator
      connectFirestoreEmulator(db, 'localhost', 8090);
      console.log('✅ Firestore Emulator connected: localhost:8090');
    } catch (emulatorError) {
      console.error(
        '❌ Failed to connect to emulators:',
        emulatorError.message
      );
      throw new Error(
        `Emulator connection failed. Ensure Firebase Emulator Suite is running on ports 9099 (Auth) and 8090 (Firestore). Error: ${emulatorError.message}`
      );
    }
  } else {
    console.log('🌐 Firebase Mode: PRODUCTION');
    console.log('📍 Project ID:', firebaseConfig.projectId);
    console.log(
      '✅ Using Real Firebase Services (no emulator connections)'
    );
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  throw error;
}

export { auth, db };
export default app;
