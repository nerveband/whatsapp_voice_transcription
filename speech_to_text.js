const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();

async function transcribeAudio(filePath) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'json');

  const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
    headers: {
      ...formData.getHeaders(),
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
  });

  return response.data;
}

async function translateAudio(filePath) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'json');
  formData.append('translate_to', 'en');

  const response = await axios.post('https://api.openai.com/v1/audio/translations', formData, {
    headers: {
      ...formData.getHeaders(),
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
  });

  return response.data;
}

module.exports = {
  transcribeAudio,
  translateAudio,
};