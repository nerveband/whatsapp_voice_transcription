const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { createClient } = require("@deepgram/sdk");

require('dotenv').config();

async function transcribeAudioWithOpenAI(filePath) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('model', process.env.WHISPER_MODEL || 'whisper-1');
  formData.append('response_format', 'json');
  formData.append('prompt', 'The transcript should have natural paragraph breaks and bullet points for any action steps. The output should be easy to read and follow.');

  const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
    headers: {
      ...formData.getHeaders(),
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
  });

  console.log('Response from OpenAI:', response.data);

  return response.data;
}

async function transcribeAudioWithDeepgram(filePath) {
  const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
  const deepgram = createClient(deepgramApiKey);
  const audioStream = fs.createReadStream(filePath);

  try {
    const { result } = await deepgram.listen.prerecorded.transcribeFile(audioStream, {
      model: process.env.DEEPGRAM_MODEL || 'nova-2',
      language: 'en',
      smart_format: true,
    });

    // console.log('Immediate Deepgram Full Response:', JSON.stringify(result, null, 2));

    if (
      !result ||
      !result.results ||
      !result.results.channels ||
      !result.results.channels.length ||
      !result.results.channels[0].alternatives ||
      !result.results.channels[0].alternatives.length ||
      !result.results.channels[0].alternatives[0].paragraphs ||
      !result.results.channels[0].alternatives[0].paragraphs.transcript
    ) {
      console.error('Error: Necessary structure missing from Deepgram response');
      return null;
    }

    // Directly accessing transcript assuming the structure has been validated
    const transcript = result.results.channels[0].alternatives[0].paragraphs.transcript;

    console.log("Directly accessed Transcript:", transcript);

    return transcript;
  } catch (error) {
    console.error("Error processing Deepgram transcription:", error);
    return null;
  }
}

module.exports = {
  transcribeAudio: async (filePath) => {
    const VOICE_TRANSCRIPTION_SERVICE = process.env.VOICE_TRANSCRIPTION_SERVICE || 'OPENAI';

    if (VOICE_TRANSCRIPTION_SERVICE === 'OPENAI') {
      return transcribeAudioWithOpenAI(filePath);
    } else if (VOICE_TRANSCRIPTION_SERVICE === 'DEEPGRAM') {
      return transcribeAudioWithDeepgram(filePath);
    } else {
      throw new Error(`Unsupported voice transcription service: ${VOICE_TRANSCRIPTION_SERVICE}`);
    }
  },
};