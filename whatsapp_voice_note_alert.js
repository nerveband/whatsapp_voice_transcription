const fs = require('fs');
const qrcode = require('qrcode-terminal');
const { Client, MessageMedia, LocalAuth, PhoneNumber } = require('whatsapp-web.js');
const axios = require('axios');
const FormData = require('form-data');
const ffmpeg = require('fluent-ffmpeg');
const ProgressBar = require('progress');
const { transcribeAudio, translateAudio } = require('./speech_to_text');
require('dotenv').config();

const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

async function getSummaryAndActionSteps(text) {
  const prompt = `Please summarize the following message and provide any action steps. For action steps, give them a heading and use the checkmark emoji next to them if there are any:\n\n${text}`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: 'text-davinci-003',
        prompt: prompt,
        max_tokens: 100,
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
      return response.data.choices[0].text.trim();
    } else {
      console.error('Error: Unexpected response format from OpenAI API. Status:', response.status, 'Data:', response.data);
      return '';
    }
  } catch (error) {
    console.error('Error during summary and action steps generation:', error);
    return '';
  }
}

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

      console.log('Translating voice note (if necessary)...');
      const translation = await translateAudio(m4aFilename);
      console.log('Voice note translated (if necessary).');

        const myNumber = process.env.WHATSAPP_PHONE_NUMBER;
        const outputText = translation.text || transcription.text;

        if (outputText) {
          console.log('Generating summary and action steps...');
          const summaryAndActionSteps = await getSummaryAndActionSteps(outputText);
          console.log('Summary and action steps generated.');

          // Clean and format the phone number
          const sanitizedNumber = myNumber.replace(/[- )(]/g, '');
          const finalNumber = `1${sanitizedNumber.substring(sanitizedNumber.length - 10)}`;
          const numberId = await client.getNumberId(finalNumber);

          if (numberId) {
            // Add sender's information and the time the message was sent to the transcription output
            const senderInfo = `Sender: ${msg.sender ? msg.sender.pushname : "Unknown"} (${msg.from})\nTime: ${new Date(msg.timestamp * 1000).toLocaleString()}\n\n`;
            const fullMessage = `You just got a voice note from:\n${senderInfo}**Summary and Action Steps:**\n${summaryAndActionSteps}\n\n**Full Transcription:**\n${outputText}`;
            
            await client.sendMessage(numberId._serialized, fullMessage);
            console.log('Transcription sent.');
          } else {
            console.log(`${finalNumber} Mobile number is not registered.`);
          }
        } else {
          console.log('Error: Failed to process voice note.');
        }


    } catch (error) {
      console.log('Error:', error);
    } finally {
      fs.unlinkSync(oggFilename);
      fs.unlinkSync(m4aFilename);
    }
  }
});

client.on('error', (error) => {
  console.error('Error:', error);
});

client.initialize();
