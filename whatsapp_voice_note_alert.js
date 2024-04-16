const fs = require('fs');
const qrcode = require('qrcode-terminal');
const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const { transcribeAudio } = require('./speech_to_text');
require('dotenv').config();

// Import the OpenAI and Anthropic SDKs
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

// Configuration object
const config = {
  AI_SERVICE: process.env.AI_SERVICE || 'OPENAI',
  VOICE_TRANSCRIPTION_SERVICE: process.env.VOICE_TRANSCRIPTION_SERVICE || 'OPENAI',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
  WHISPER_MODEL: process.env.WHISPER_MODEL || 'whisper-1',
  DEEPGRAM_MODEL: process.env.DEEPGRAM_MODEL || 'nova-2',
  GENERATE_SUMMARY: process.env.GENERATE_SUMMARY || 'true', // Parse as boolean
};

// Check environment variables
function checkEnvVariables() {
  const requiredEnvVars = ['WHATSAPP_PHONE_NUMBER', 'OPENAI_API_KEY'];

  if (config.AI_SERVICE === 'ANTHROPIC') {
    requiredEnvVars.push('ANTHROPIC_API_KEY');
  }

  if (config.VOICE_TRANSCRIPTION_SERVICE === 'DEEPGRAM') {
    requiredEnvVars.push('DEEPGRAM_API_KEY');
  }

  const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);

  if (missingEnvVars.length > 0) {
    console.log('Please set the following environment variables in your .env file:');
    missingEnvVars.forEach(key => console.log(`- ${key}`));
    process.exit(1);
  }
}

checkEnvVariables();

// Prompt for both AI models
const AI_PROMPT = {
  OPENAI: "Summarize the message in 1-2 sentences max.",
  ANTHROPIC: "Summarize the message in 1-2 sentences max."
};

// Message output to the user
const MESSAGE_OUTPUT = {
  VOICE_NOTE_RECEIVED: "Voice note received.",
  TRANSCRIBING_VOICE_NOTE: "Transcribing voice note...",
  VOICE_NOTE_TRANSCRIBED: "Voice note transcribed.",
  GENERATING_SUMMARY: "Generating summary and action steps...",
  SUMMARY_GENERATED: "Summary and action steps generated.",
  TRANSCRIPTION_SENT: "Transcription sent back to the sender.",
  TRANSCRIPTION_SENT: "Summary sent back to the sender.",
  PROCESSING_ERROR: "Error: Failed to process voice note."
};

// Initialize the OpenAI and Anthropic clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function getOpenAISummary(text) {
  try {
    // Use the OpenAI SDK to generate a summary
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: AI_PROMPT.OPENAI },
        { role: 'user', content: text },
      ],
      model: config.OPENAI_MODEL,
      max_tokens: 2000,
      n: 1,
      temperature: 0.5,
    });

    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error('Error during OpenAI summary generation:', error);
    throw error;
  }
}

async function getAnthropicSummary(text) {
    console.log("Debug: Attempting to summarize text:", text);  // Debug log to check what text is being sent
    if (!text.trim()) {
        console.log("Error: No content to summarize");
        return "No content received for summarization.";
    }
    
    try {
        const chatCompletion = await anthropic.messages.create({
            messages: [{ role: 'user', content: text }],
            model: config.ANTHROPIC_MODEL,
            max_tokens: 2000,
            system: AI_PROMPT.ANTHROPIC,
        });

        return chatCompletion.content[0].text;
    } catch (error) {
        console.error('Error during Claude summary generation:', error);
        throw error;
    }
}


async function getSummaryAndActionSteps(text) {
  try {
    if (config.AI_SERVICE === 'OPENAI') {
      return await getOpenAISummary(text);
    } else if (config.AI_SERVICE === 'ANTHROPIC') {
      return await getAnthropicSummary(text);
    }
  } catch (error) {
    console.error('Error during summary and action steps generation:', error);
    return '';
  }
}

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    // puppeteer args here
  },
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2409.0.html',
  }
});

client.on('qr', (qr) => {
  console.log('QR RECEIVED', qr);
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Client is ready!');
});

client.on('message_create', async (msg) => {
  if (msg.hasMedia && msg.type === 'ptt' && (msg.fromMe || msg.to === process.env.WHATSAPP_PHONE_NUMBER)) {
    console.log(MESSAGE_OUTPUT.VOICE_NOTE_RECEIVED);
    const media = await msg.downloadMedia();
    const oggBuffer = Buffer.from(media.data, 'base64');
    const oggFilename = `${msg.id.id}.ogg`;
    fs.writeFileSync(oggFilename, oggBuffer);

    const audioFilename = oggFilename;

    try {
      console.log(MESSAGE_OUTPUT.TRANSCRIBING_VOICE_NOTE);
      const transcription = await transcribeAudio(audioFilename);
      console.log(MESSAGE_OUTPUT.VOICE_NOTE_TRANSCRIBED);

      let outputText = '';
      if (transcription) {
        outputText = transcription;
        console.log('Output text:', outputText);
      }

      if (outputText) {
        const senderId = msg.fromMe ? msg.to : msg.from;

        // Check GENERATE_SUMMARY .env variable is true
        if (config.GENERATE_SUMMARY === 'true') {
          console.log(MESSAGE_OUTPUT.GENERATING_SUMMARY);
          const summaryAndActionSteps = await getSummaryAndActionSteps(outputText);
          console.log(MESSAGE_OUTPUT.SUMMARY_GENERATED);

          // Send the summary and action steps as a separate message
          await client.sendMessage(senderId, `*Summary:*\n${summaryAndActionSteps}`);
          console.log(MESSAGE_OUTPUT.SUMMARY_SENT);
        }

        // Send the transcript
        await client.sendMessage(senderId, `*Transcript:*\n${outputText}`);
        console.log(MESSAGE_OUTPUT.TRANSCRIPTION_SENT);

      } else {
        console.log(MESSAGE_OUTPUT.PROCESSING_ERROR);
      }
    } catch (error) {
      console.log('Error:', error);
    } finally {
      fs.unlinkSync(oggFilename);
    }
  }
});

client.on('error', (error) => {
  console.error('Error:', error);
});

client.initialize();