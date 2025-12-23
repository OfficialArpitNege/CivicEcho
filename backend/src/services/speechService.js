/**
 * Convert audio buffer to text.
 * For this MVP, always return a realistic mock transcription to avoid billing.
 * Keeps the same async API shape for easy swap to real Speech-to-Text later.
 */
const transcribeAudio = async (audioBuffer, languageCode = 'en-US') => {
  console.log('🎤 Received audio buffer for transcription (mock mode)', {
    length: audioBuffer?.length || 0,
    languageCode,
  });

  // Minimal realistic sample transcription
  return 'This is a sample transcription of your recorded complaint about local civic issues.';
};

module.exports = {
  transcribeAudio,
};
