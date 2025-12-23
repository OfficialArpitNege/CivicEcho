/**
 * Script to create hardcoded authority user in Firebase Emulator
 * Run with: node src/scripts/setupAuthority.js
 */

const { getAuth } = require('firebase-admin/auth');
const { db } = require('../config/firebase');

const AUTHORITY_EMAIL = 'authority@civicecho.gov';
const AUTHORITY_PASSWORD = 'Authority123!';
const AUTHORITY_UID = 'authority-user-001';

async function setupAuthority() {
  try {
    console.log('🔐 Setting up hardcoded authority user...');

    const auth = getAuth();

    // Check if user already exists by email
    let user;
    try {
      user = await auth.getUserByEmail(AUTHORITY_EMAIL);
      console.log(`✅ User already exists: ${AUTHORITY_EMAIL}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create new authority user
        user = await auth.createUser({
          email: AUTHORITY_EMAIL,
          password: AUTHORITY_PASSWORD,
          displayName: 'Authority Officer',
          disabled: false,
        });
        console.log(`✅ Created authority user: ${AUTHORITY_EMAIL}`);
      } else {
        throw error;
      }
    }

    // Create/update user profile in Firestore with authority role
    const userProfile = {
      uid: user.uid,
      email: AUTHORITY_EMAIL,
      name: 'Authority Officer',
      role: 'authority',
      department: 'CivicEcho Authority',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('users').doc(user.uid).set(userProfile, { merge: true });
    console.log(`✅ Updated Firestore profile with authority role`);

    console.log('\n📋 Authority User Setup Complete!');
    console.log('─'.repeat(50));
    console.log(`Email: ${AUTHORITY_EMAIL}`);
    console.log(`Password: ${AUTHORITY_PASSWORD}`);
    console.log(`UID: ${user.uid}`);
    console.log(`Role: authority`);
    console.log('─'.repeat(50));
    console.log('\nYou can now login with these credentials in the app.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up authority user:', error);
    process.exit(1);
  }
}

setupAuthority();
