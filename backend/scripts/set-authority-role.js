/**
 * Script to manually set authority role for a user
 * Usage: node scripts/set-authority-role.js <user-email>
 */

const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Firebase Admin
const useEmulator = process.env.FIREBASE_MODE === 'emulator';

if (useEmulator) {
  process.env.FIRESTORE_EMULATOR_HOST = process.env.FIREBASE_FIRESTORE_EMULATOR_HOST || 'localhost:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099';
  
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'civicecho-dev',
    });
  }
} else {
  if (!process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error('FIREBASE_PRIVATE_KEY not provided for production');
  }
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      }),
    });
  }
}

const db = admin.firestore();
const auth = admin.auth();

async function setAuthorityRole(email) {
  try {
    // Find user by email
    const user = await auth.getUserByEmail(email);
    
    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    // Update user role in Firestore
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: email.toLowerCase().trim(),
      role: 'authority',
      updatedAt: new Date(),
    }, { merge: true });

    console.log(`✅ Successfully set authority role for ${email}`);
    console.log(`   User UID: ${user.uid}`);
  } catch (error) {
    console.error('❌ Error setting authority role:', error.message);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('❌ Usage: node scripts/set-authority-role.js <user-email>');
  console.error('   Example: node scripts/set-authority-role.js admin@civicecho.gov');
  process.exit(1);
}

setAuthorityRole(email).then(() => {
  process.exit(0);
});

