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

// Add delay function to prevent rate limiting
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Function to check if auth was previously successful
const hasSuccessfulAuth = () => {
  try {
    const authPath = './auth_info_baileys/creds.json';
    if (fs.existsSync(authPath)) {
      const creds = JSON.parse(fs.readFileSync(authPath, 'utf8'));
      return creds && creds.me && creds.me.id;
    }
  } catch (error) {
    console.error('Error checking auth state:', error);
  }
  return false;
};

async function main() {
  try {
    // Determine if running in a server environment
    const isServerEnvironment = process.env.SERVER_ENV === 'true';
    const maxRetries = isServerEnvironment ? 3 : 5;
    let currentRetry = 0;
    
    // Check if we already have valid auth
    const hasAuth = hasSuccessfulAuth();
    if (hasAuth) {
      console.log('Found existing authentication, using stored credentials');
    }

    // Use the built-in multi-file auth state handler with minimal setup
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    // Determine authentication method from environment variables
    const authMethod = process.env.AUTH_METHOD || 'QR_CODE'; // Default to QR code
    
    console.log('Starting WhatsApp connection...');
    
    // Track if we've already requested a pairing code in this session
    let pairingCodeRequested = false;
    
    async function connectToWhatsApp() {
      try {
        // Prevent too many rapid reconnection attempts
        if (currentRetry > 0) {
          const waitTime = Math.min(5000 * currentRetry, 30000); // Exponential backoff, max 30 seconds
          console.log(`Waiting ${waitTime/1000} seconds before reconnection attempt ${currentRetry}/${maxRetries}...`);
          await delay(waitTime);
        }
        
        currentRetry++;
        if (currentRetry > maxRetries) {
          console.log(`Maximum reconnection attempts (${maxRetries}) reached. Please check your network or try again later.`);
          return;
        }
        
        console.log(`Authentication method: ${authMethod}`);
        
        // Create socket with configuration optimized for server environments
        const sock = makeWASocket({
          auth: state,
          printQRInTerminal: authMethod === 'QR_CODE', // Only print QR in terminal if using QR auth
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
            retryRequestDelayMs: 10000, // Increased delay between retries
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
        
        let hasDisplayedQR = false; // Flag to track if we've displayed a QR code
        let reconnectAttempt = 0; // Track reconnection attempts
        
        // Handle connection updates with improved QR code display
        sock.ev.on('connection.update', async (update) => {
          const { connection, lastDisconnect, qr } = update;
          
          // Display QR code if provided and using QR auth method
          if (qr && authMethod === 'QR_CODE' && !hasDisplayedQR) {
            console.log('\nScan this QR code to log in:');
            qrcode.generate(qr, { small: true });
            console.log('\nOr use the pairing code authentication method by setting AUTH_METHOD=PAIRING_CODE in your .env file');
            hasDisplayedQR = true; // Prevent multiple QR codes
          }
          
          // Handle connection states with improved error handling
          if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const errorMsg = lastDisconnect?.error?.message || 'Unknown error';
            const location = lastDisconnect?.error?.data?.location || 'unknown';
            
            console.log(`Connection closed - Status: ${statusCode}, Location: ${location}, Error: ${errorMsg}`);
            
            // Handle specific error codes
            if (statusCode === 428) {
              // 428 Precondition Required - Session expired due to inactivity
              console.log('\nRECONNECTION REQUIRED: Session expired due to inactivity (428 Precondition Required)');
              console.log('Restarting connection to refresh session...');
              
              // Force credential reset to ensure clean reconnection
              try {
                // Save a backup of credentials first
                const credsPath = './auth_info_baileys/creds.json';
                if (fs.existsSync(credsPath)) {
                  const backup = `./auth_info_baileys/creds_backup_${new Date().getTime()}.json`;
                  fs.copyFileSync(credsPath, backup);
                  console.log(`Credentials backed up to ${backup}`);
                }
                
                // Wait before reconnecting to avoid rapid connection attempts
                await delay(5000);
              } catch (err) {
                console.error('Error handling credential backup:', err);
              }
              
              // Attempt reconnection with increased delay
              setTimeout(() => connectToWhatsApp(), 10000);
              return;
            } else if (statusCode === 405) {
              // 405 Method Not Allowed - WhatsApp is blocking the server IP
              console.log('\nWARNING: Server IP appears to be blocked by WhatsApp.');
              console.log('Consider the following options:');
              console.log('1. Try again after waiting 10-15 minutes');
              console.log('2. Generate auth on a non-server device and transfer the auth_info_baileys folder');
              console.log('3. Try using a residential proxy service');
              
              // Still attempt to reconnect, but with a longer delay
              await delay(10000);
            }
            
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
              // Implement exponential backoff for reconnection
              reconnectAttempt++;
              const reconnectDelay = Math.min(5000 * Math.pow(1.5, reconnectAttempt), 60000); // Max 1 minute
              console.log(`Reconnection attempt ${reconnectAttempt} scheduled in ${reconnectDelay/1000} seconds...`);
              
              // Don't reconnect immediately to avoid rapid reconnection flood
              setTimeout(() => {
                console.log(`Executing reconnection attempt ${reconnectAttempt}...`);
                connectToWhatsApp();
              }, reconnectDelay);
            } else {
              console.log('Logged out. Not attempting to reconnect.');
            }
          } else if (connection === 'open') {
            console.log('Connection established successfully!');
            currentRetry = 0; // Reset retry counter on successful connection
            
            // Save the fact that we connected successfully
            fs.writeFileSync('./auth_info_baileys/connection_success', new Date().toISOString());
          }
          
          // Handle pairing code authentication if configured
          if (connection === 'connecting' && authMethod === 'PAIRING_CODE' && !pairingCodeRequested) {
            try {
              // Only request pairing code once to prevent rapid changes
              pairingCodeRequested = true;
              
              // Format phone number (remove any non-numeric characters)
              const phoneNumber = process.env.WHATSAPP_PHONE_NUMBER.replace(/[^0-9]/g, '');
              
              // Give WhatsApp time to establish a stable connection first
              await delay(5000);
              
              // Clear any QR code display in terminal before showing pairing code
              console.clear();
              
              // Validate phone number format
              if (!/^[0-9]{10,15}$/.test(phoneNumber)) {
                console.error('ERROR: Phone number must be in E.164 format WITHOUT the plus sign');
                console.error('Example: 12345678901 (not +12345678901)');
                setTimeout(() => { pairingCodeRequested = false; }, 10000);
                return;
              }
              
              console.log(`Requesting pairing code for ${phoneNumber}...`);
              
              // Request pairing code with proper error handling
              const code = await sock.requestPairingCode(phoneNumber);
              
              if (!code) {
                console.error('ERROR: No pairing code received from WhatsApp');
                setTimeout(() => { pairingCodeRequested = false; }, 15000);
                return;
              }
              
              // Display the code prominently
              console.log('\n=======================================');
              console.log(`PAIRING CODE: ${code}`);
              console.log('=======================================\n');
              console.log('Enter this code on your WhatsApp mobile app:');
              console.log('WhatsApp > Settings > Linked Devices > Link a Device');
              console.log('\nThis code will remain valid for 60 seconds.\n');
              
              // Reset flag after a timeout so we can request again if needed
              setTimeout(() => { 
                pairingCodeRequested = false;
                console.log('Pairing code expired. Requesting a new one...');
              }, 60000);
            } catch (error) {
              console.error('Failed to request pairing code:', error);
              console.log('\nTROUBLESHOOTING TIPS:');
              console.log('1. Make sure your phone number is correctly formatted (no + sign)');
              console.log('2. Check that your WhatsApp mobile app is up to date');
              console.log('3. Verify your phone has an active internet connection');
              console.log('4. If on a server, your IP may be blocked by WhatsApp');
              
              // Reset flag after error to allow retry
              setTimeout(() => { pairingCodeRequested = false; }, 15000);
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
              // Safe file deletion with error handling
              try {
                if (fs.existsSync(oggFilename)) {
                  fs.unlinkSync(oggFilename);
                }
              } catch (deleteError) {
                console.error(`Warning: Could not delete temporary file ${oggFilename}:`, deleteError.message);
              }
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