const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Determine if using Firebase Emulator (local development only)
const useEmulator = process.env.FIREBASE_MODE === 'emulator';
const isProduction = process.env.NODE_ENV === 'production';

// Initialize Firebase Admin SDK
let firebaseConfig = {};
let db, auth;

if (useEmulator) {
  // LOCAL DEVELOPMENT: Connect to Firebase Emulator Suite
  console.log('🔥 Connecting to Firebase Emulator Suite');
  
  // Connect to emulator instances (Admin SDK expects FIRESTORE_EMULATOR_HOST)
  const FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099';
  const FIREBASE_FIRESTORE_EMULATOR_HOST = process.env.FIREBASE_FIRESTORE_EMULATOR_HOST || 'localhost:8080';

  process.env.FIREBASE_AUTH_EMULATOR_HOST = FIREBASE_AUTH_EMULATOR_HOST;
  process.env.FIREBASE_FIRESTORE_EMULATOR_HOST = FIREBASE_FIRESTORE_EMULATOR_HOST;
  process.env.FIRESTORE_EMULATOR_HOST = FIREBASE_FIRESTORE_EMULATOR_HOST;

  // Use default credentials for emulator
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'civicecho-dev',
    });
  }

  db = admin.firestore();
  auth = admin.auth();

  console.log(`✅ Emulator Auth: ${FIREBASE_AUTH_EMULATOR_HOST}`);
  console.log(`✅ Emulator Firestore: ${FIREBASE_FIRESTORE_EMULATOR_HOST}`);
} else {
  // PRODUCTION/STAGING: Connect to real Firebase
  console.log('🌐 Connecting to real Firebase services');

  if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PROJECT_ID) {
    throw new Error(
      '❌ FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, or FIREBASE_PROJECT_ID not provided. For production, provide real Firebase credentials (from service account JSON, see docs).' +
      '\nFor local development, set FIREBASE_MODE=emulator and ensure Firebase Emulator Suite is running.'
    );
  }

  firebaseConfig = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  };

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }

  db = admin.firestore();
  auth = admin.auth();
  
  console.log(`✅ Connected to Firebase project: ${process.env.FIREBASE_PROJECT_ID}`);
}

module.exports = { db, auth, admin };
