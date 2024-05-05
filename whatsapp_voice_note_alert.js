const fs = require('fs');
const { writeFile } = require('fs/promises');
const { MessageType, Mimetype, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const makeWASocket = require('@whiskeysockets/baileys').default;
const { DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { transcribeAudio } = require('./speech_to_text');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

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
  SUMMARY_SENT: "Summary sent back to the sender.",
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
    const chatCompletion = await openai.createChatCompletion({
      model: config.OPENAI_MODEL,
      messages: [
        { role: 'system', content: AI_PROMPT.OPENAI },
        { role: 'user', content: text },
      ],
      max_tokens: 2000,
      n: 1,
      temperature: 0.5,
    });

    return chatCompletion.data.choices[0].message.content.trim();
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

async function main() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    async function connectToWhatsApp() {
      try {
        const sock = makeWASocket({
          printQRInTerminal: true,
          auth: state,
          defaultQueryTimeoutMs: undefined,
        });

        sock.ev.on('connection.update', (update) => {
          const { connection, lastDisconnect } = update;
          if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect);
            if (shouldReconnect) {
              connectToWhatsApp();
            }
          } else if (connection === 'open') {
            console.log('opened connection');
          }
        });

        sock.ev.on('messages.upsert', async ({ messages }) => {
          const m = messages[0];

          if (!m.message) return; // if there is no text or media message
          if (m.key.remoteJid === 'status@broadcast') return;

          const messageType = Object.keys(m.message)[0]; // get what type of message it is -- text, image, video

          if (messageType === 'audioMessage') {
            console.log(MESSAGE_OUTPUT.VOICE_NOTE_RECEIVED);

            const buffer = await downloadContentFromMessage(m.message.audioMessage, 'audio');
            const oggFilename = `${m.key.id}.ogg`;
            await writeFile(oggFilename, buffer);

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
                const senderId = m.key.remoteJid;

                if (config.GENERATE_SUMMARY === 'true') {
                  console.log(MESSAGE_OUTPUT.GENERATING_SUMMARY);
                  const summaryAndActionSteps = await getSummaryAndActionSteps(outputText);
                  console.log(MESSAGE_OUTPUT.SUMMARY_GENERATED);

                  await sock.sendMessage(senderId, { text: `*Summary:*\n${summaryAndActionSteps}` });
                  console.log(MESSAGE_OUTPUT.SUMMARY_SENT);
                }

                await sock.sendMessage(senderId, { text: `*Transcript:*${outputText}` });
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

        sock.ev.on('creds.update', saveCreds);

        console.log('Before connecting to WhatsApp');
        await sock.waitForConnectionUpdate((update) => update.connection === 'open');
        console.log('After connecting to WhatsApp');

        try {
          await sock.query({
            tag: 'iq',
            attrs: {
              to: '@s.whatsapp.net',
              type: 'set',
              xmlns: 'w:web',
            },
            content: [
              {
                tag: 'query',
                attrs: {},
                content: [
                  {
                    tag: 'initial_queries',
                    attrs: {},
                    content: [],
                  },
                ],
              },
            ],
          });
          console.log('Initial queries executed successfully');
        } catch (error) {
          console.error('Error executing initial queries:', error);
        }
      } catch (error) {
        console.error('Error in connectToWhatsApp function:', error);
        throw error;
      }
    }

    await connectToWhatsApp();
  } catch (error) {
    console.error('Error in main function:', error);
    throw error;
  }
}

main().catch((error) => {
  console.error('Error occurred:', error);
  process.exit(1);
});