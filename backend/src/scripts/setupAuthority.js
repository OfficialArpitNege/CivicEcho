/**
 * Script to create hardcoded authority user in Firebase Emulator
 * Can be run as: node src/scripts/setupAuthority.js
 * Or imported and called from other modules
 */

const { getAuth } = require('firebase-admin/auth');
const { db } = require('../config/firebase');

const AUTHORITY_EMAIL = 'authority@civicecho.gov';
const AUTHORITY_PASSWORD = 'Authority123!';

async function setupAuthorityUser() {
  try {
    console.log('🔐 Setting up hardcoded authority user...');

    const auth = getAuth();

    // Check if user already exists by email
    let user;
    try {
      user = await auth.getUserByEmail(AUTHORITY_EMAIL);
      console.log(`✅ Authority user already exists: ${AUTHORITY_EMAIL}`);
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
    console.log(`✅ Authority user is ready to login`);

    return user;
  } catch (error) {
    console.error('❌ Error setting up authority user:', error.message);
    throw error;
  }
}

// If run directly as a script
if (require.main === module) {
  setupAuthorityUser()
    .then((user) => {
      console.log('\n📋 Authority User Setup Complete!');
      console.log('─'.repeat(50));
      console.log(`Email: ${AUTHORITY_EMAIL}`);
      console.log(`Password: ${AUTHORITY_PASSWORD}`);
      console.log(`UID: ${user.uid}`);
      console.log(`Role: authority`);
      console.log('─'.repeat(50));
      console.log('\nYou can now login with these credentials in the app.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    });
}

module.exports = { setupAuthorityUser };
