const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
// const natural = require('natural');
const nlp = require('compromise');

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

// Log the entire response object
  console.log('Response from server:', response.data);

  const transcript = response.data.text || '';
  const doc = nlp(transcript);
  const sentences = doc.sentences().out('array');
  const paragraphs = [];
  let currentParagraph = [];

  sentences.forEach((sentence) => {
  currentParagraph.push(sentence);
  if (currentParagraph.length > 3) {
    paragraphs.push(currentParagraph.join(' '));
    currentParagraph = [];
  }
  });

  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph.join(' '));
  }

  response.data.paragraphs = paragraphs;

  console.log('Transcript broken into paragraphs:');
  paragraphs.forEach((paragraph, index) => {
      console.log(`Paragraph ${index + 1}:`, paragraph);
  });

  return response.data;
}

module.exports = {
  transcribeAudio,
};
