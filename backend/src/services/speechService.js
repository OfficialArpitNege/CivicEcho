const { speechClient, isCredentialsAvailable } = require('../config/googleAI');

/**
 * Convert audio buffer to text using Google Speech-to-Text API
 * @param {Buffer} audioBuffer - Audio file buffer
 * @param {string} languageCode - Language code (e.g., 'en-US')
 * @returns {Promise<string>} Transcribed text
 */
const transcribeAudio = async (audioBuffer, languageCode = 'en-US') => {
  try {
    // If credentials are not available, return mock transcription
    if (!isCredentialsAvailable) {
      console.log('⚠️  Using mock speech-to-text response (credentials not configured)');
      return 'Mock transcription: The road is full of potholes near the park area. Needs immediate repair.';
    }

    const audio = {
      content: audioBuffer.toString('base64'),
    };

    const config = {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: languageCode,
      model: 'latest_long',
    };

    const request = {
      audio,
      config,
    };

    const [operation] = await speechClient.longRunningRecognize(request);
    const [response] = await operation.promise();

    // Extract the transcription from response
    const transcription = response.results
      ?.map((result) => result.alternatives?.[0]?.transcript)
      .join('\n');

    return transcription || '';
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error('Speech-to-Text conversion failed');
  }
};

module.exports = {
  transcribeAudio,
};
