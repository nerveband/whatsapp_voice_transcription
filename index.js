const fs = require('fs');
const { writeFile } = require('fs/promises');
const { MessageType, Mimetype, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const makeWASocket = require('@whiskeysockets/baileys').default;
const { DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { transcribeAudio } = require('./speech_to_text');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const qrcode = require('qrcode-terminal');
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

  // Validate phone number format for pairing code (if we use that method)
  if (process.env.AUTH_METHOD === 'PAIRING_CODE' && process.env.WHATSAPP_PHONE_NUMBER) {
    const phoneNumber = process.env.WHATSAPP_PHONE_NUMBER.replace(/[^0-9]/g, '');
    if (!/^[0-9]{10,15}$/.test(phoneNumber)) {
      console.log('Error: WHATSAPP_PHONE_NUMBER must be in E.164 format without the plus sign (e.g., 12345678901)');
      process.exit(1);
    }
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
    // Use the built-in multi-file auth state handler with minimal setup
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    // Determine authentication method from environment variables
    const authMethod = process.env.AUTH_METHOD || 'QR_CODE'; // Default to QR code
    
    console.log('Starting WhatsApp connection...');
    
    async function connectToWhatsApp() {
      try {
        // Determine if running in a server environment (no UI)
        const isServerEnvironment = process.env.SERVER_ENV === 'true';
        
        // Create socket with configuration optimized for the environment
        const sock = makeWASocket({
          auth: state,
          printQRInTerminal: false, // We'll handle QR code display ourselves
          // Common configurations for all environments
          browser: ['Chrome', 'Windows', '10'], // More common user agent to avoid blocks
          connectTimeoutMs: isServerEnvironment ? 120000 : 60000,
          keepAliveIntervalMs: 30000,
          emitOwnEvents: false,
          fireInitQueries: false, // Disable initial queries that can trigger blocks
          // Additional server-specific configurations
          ...(isServerEnvironment && {
            // Disable features that can trigger server detection
            syncFullHistory: false,
            markOnlineOnConnect: false,
            transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 3000 },
            getMessage: async () => undefined, // Avoid unnecessary fetches
            // Use retry and timeout configs that reduce server signature
            retryRequestDelayMs: 5000,
            qrTimeout: 60000,
            defaultQueryTimeoutMs: 120000
          }),
          // Handle message sending in a way less likely to be flagged
          patchMessageBeforeSending: msg => {
            if (msg.viewOnce) delete msg.viewOnce; // Fix for view once messages
            return msg;
          }
        });
        
        // Handle credential updates
        sock.ev.on('creds.update', saveCreds);
        
        // Handle connection updates with improved QR code display
        sock.ev.on('connection.update', async (update) => {
          const { connection, lastDisconnect, qr } = update;
          
          // Display QR code if provided and using QR auth method
          if (qr && authMethod === 'QR_CODE') {
            console.log('\nScan this QR code to log in:');
            qrcode.generate(qr, { small: true });
            console.log('\nOr use the pairing code authentication method by setting AUTH_METHOD=PAIRING_CODE in your .env file');
          }
          
          // Handle different connection states
          if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed due to ', lastDisconnect?.error, ', reconnecting: ', shouldReconnect);
            
            // Reconnect if appropriate
            if (shouldReconnect) {
              connectToWhatsApp();
            }
          } else if (connection === 'open') {
            console.log('Connection established successfully!');
          }
          
          // Handle pairing code authentication if configured
          if ((connection === 'connecting' || qr) && authMethod === 'PAIRING_CODE') {
            try {
              // Format phone number (remove any non-numeric characters)
              const phoneNumber = process.env.WHATSAPP_PHONE_NUMBER.replace(/[^0-9]/g, '');
              
              // Request pairing code
              console.log(`Requesting pairing code for ${phoneNumber}...`);
              const code = await sock.requestPairingCode(phoneNumber);
              console.log(`\nPairing code: ${code}\n`);
              console.log('Enter this code on your WhatsApp mobile app:');
              console.log('WhatsApp > Settings > Linked Devices > Link a Device');
            } catch (error) {
              console.error('Failed to request pairing code:', error);
            }
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

            try {
              console.log(MESSAGE_OUTPUT.TRANSCRIBING_VOICE_NOTE);
              const transcription = await transcribeAudio(oggFilename);

              if (transcription) {
                const senderId = m.key.remoteJid;

                if (config.GENERATE_SUMMARY === 'true') {
                  const summaryAndActionSteps = await getSummaryAndActionSteps(transcription);
                  await sock.sendMessage(senderId, { text: `*Summary:*\n${summaryAndActionSteps}` });
                }

                await sock.sendMessage(senderId, { text: `*Transcript:*\n${transcription}` });
                console.log('Processing completed successfully.');
              } else {
                console.log(MESSAGE_OUTPUT.PROCESSING_ERROR);
              }
            } catch (error) {
              console.error('Error:', error);
            } finally {
              fs.unlinkSync(oggFilename);
            }
          }
        });

        // Process incoming messages
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

            try {
              console.log(MESSAGE_OUTPUT.TRANSCRIBING_VOICE_NOTE);
              const transcription = await transcribeAudio(oggFilename);

              if (transcription) {
                const senderId = m.key.remoteJid;

                if (config.GENERATE_SUMMARY === 'true') {
                  const summaryAndActionSteps = await getSummaryAndActionSteps(transcription);
                  await sock.sendMessage(senderId, { text: `*Summary:*\n${summaryAndActionSteps}` });
                }

                await sock.sendMessage(senderId, { text: `*Transcript:*\n${transcription}` });
                console.log('Processing completed successfully.');
              } else {
                console.log(MESSAGE_OUTPUT.PROCESSING_ERROR);
              }
            } catch (error) {
              console.error('Error:', error);
            } finally {
              fs.unlinkSync(oggFilename);
            }
          }
        });

        // Skip the initial status query on server environments to reduce chance of connection blocks
        if (!isServerEnvironment) {
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
        } else {
          console.log('Skipping initial queries in server environment to avoid connection blocks');
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