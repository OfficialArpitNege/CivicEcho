const dotenv = require('dotenv');

dotenv.config();

let speechClient = null;
let languageClient = null;

// Initialize Google Cloud clients only if credentials are available
try {
  // Check if Google Cloud credentials are configured
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const speech = require('@google-cloud/speech');
    const language = require('@google-cloud/language');
    
    speechClient = new speech.SpeechClient({
      projectId: process.env.GCP_PROJECT_ID,
    });

    languageClient = new language.LanguageServiceClient({
      projectId: process.env.GCP_PROJECT_ID,
    });
    
    console.log('✅ Google Cloud clients initialized with credentials');
  } else {
    console.log('⚠️  Google Cloud credentials not configured. Using mock responses for demo.');
  }
} catch (error) {
  console.log('⚠️  Could not initialize Google Cloud clients:', error.message);
  console.log('Using mock responses for demo mode.');
}

module.exports = {
  speechClient,
  languageClient,
  isCredentialsAvailable: !!(speechClient && languageClient),
};
