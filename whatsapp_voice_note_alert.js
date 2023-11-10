const fs = require('fs');
const qrcode = require('qrcode-terminal');
const { Client, MessageMedia, LocalAuth, PhoneNumber } = require('whatsapp-web.js');
const axios = require('axios');
const FormData = require('form-data');
const ffmpeg = require('fluent-ffmpeg');
const ProgressBar = require('progress');
const { transcribeAudio } = require('./speech_to_text');
require('dotenv').config();

const natural = require('natural');

async function getSummaryAndActionSteps(text) {
  const messages = [
    {
      "role": "system",
      "content": "Kindly provide a concise summary of the message below. If applicable, identify any necessary action steps. For each action step, begin a new paragraph, format the heading with asterisks for emphasis, and precede the instructions with a checkmark emoji to highlight them. Please ensure that the action steps are clear, direct, and actionable."
    },
    {
      "role": "user",
      "content": text
    }
  ];

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 2000,
        n: 1,
        stop: null,
        temperature: 0.5,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    // Check if the response has the 'choices' property and at least one choice
    if (response && response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    } else {
      console.error('Error: Unexpected response format from OpenAI API. Status:', response.status, 'Data:', response.data);
      return '';
    }
  } catch (error) {
    console.error('Error during summary and action steps generation:', error);
    return '';
  }
}

// ... rest of your code ...


const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on('qr', (qr) => {
  console.log('QR RECEIVED', qr);
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Client is ready!');
});

async function convertAudio(inputFilename, outputFilename) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputFilename)
      .output(outputFilename)
      .on('end', () => resolve())
      .on('error', (error) => reject(error))
      .run();
  });
}

client.on('message', async (msg) => {
  if (msg.hasMedia && msg.type === 'ptt') {
    console.log('Voice note received.');
    const media = await msg.downloadMedia();
    const oggBuffer = Buffer.from(media.data, 'base64');
    const oggFilename = `${msg.id.id}.ogg`;
    fs.writeFileSync(oggFilename, oggBuffer);

    console.log('Converting voice note to M4A...');
    const m4aFilename = `${msg.id.id}.m4a`;

    try {
      await convertAudio(oggFilename, m4aFilename);
      console.log('Voice note converted.');

      console.log('Transcribing voice note...');
      const transcription = await transcribeAudio(m4aFilename);
      console.log('Voice note transcribed.');

      const outputText = transcription.paragraphs.join('\n\n');
      console.log('Output text:', outputText); // Debugging statement

      if (outputText) {
        console.log('Generating summary and action steps...');
        const summaryAndActionSteps = await getSummaryAndActionSteps(outputText);
        console.log('Summary and action steps generated.');

        // No need to sanitize or format the number, as we're sending the message back to the sender
        const senderId = msg.from;

        // New message format
        const fullMessage = `Your voice note has been transcribed: \n\n*Summary:*\n${summaryAndActionSteps}\n\n*Full Transcript:*\n${outputText}`;

        await client.sendMessage(senderId, fullMessage);
        console.log('Transcription sent back to the sender.');
      } else {
        console.log('Error: Failed to process voice note.');
      }
    } catch (error) {
      console.log('Error:', error);
    } finally {
      // Clean up the audio files
      fs.unlinkSync(oggFilename);
      fs.unlinkSync(m4aFilename);
    }
  }
});


client.on('error', (error) => {
  console.error('Error:', error);
});

client.initialize();
