const fs = require('fs');
const qrcode = require('qrcode-terminal');
const { Client, MessageMedia, LocalAuth, PhoneNumber } = require('whatsapp-web.js');
const axios = require('axios');
const FormData = require('form-data');
const ffmpeg = require('fluent-ffmpeg');
const ProgressBar = require('progress');
const { transcribeAudio, translateAudio } = require('./speech_to_text');
require('dotenv').config();

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
          console.log('Sending transcription to self...');

          // Clean and format the phone number
          const sanitizedNumber = myNumber.replace(/[- )(]/g, '');
          const finalNumber = `1${sanitizedNumber.substring(sanitizedNumber.length - 10)}`;
          const numberId = await client.getNumberId(finalNumber);

          if (numberId) {
            // Add sender's information and the time the message was sent to the transcription output
            const senderInfo = `Sender: ${msg.from}\nTime: ${msg.timestamp.toLocaleString()}\n\n`;
            const fullMessage = `You just got a voice note from...:\n\n${senderInfo}\n\n$${outputText}`;

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
