# WA Transcript

![WA Transcript Banner](banner/WA%20Transcript%20Banner.png)

A lightweight Node.js application that automatically transcribes WhatsApp voice notes to text. Send a voice note, get back a transcript and summary - it's that simple!

## Features

- 🎙️ Transcribes WhatsApp voice notes to text (using OpenAI's Whisper or Deepgram)
- 📝 Generates concise summaries (using OpenAI's GPT or Anthropic's Claude)
- 💬 Sends transcripts and summaries right back to WhatsApp
- ⚡ Fast and lightweight
- 🔧 Configurable AI providers and models

> [!WARNING]  
> This app uses third-party services (OpenAI, Deepgram, Anthropic) to transcribe audio files and generate summaries. Please be aware that your audio files will be sent to these services. Additionally, this app uses an unofficial WhatsApp library which may break or result in account restrictions from Meta.

## Quick Start

1. Make sure you have Node.js installed
2. Clone and install:
   ```bash
   git clone https://github.com/nerveband/wa-transcript.git
   cd wa-transcript
   npm install
   ```
3. Copy `.env.example` to `.env` and add your API keys:
   ```bash
   cp .env.example .env
   ```
4. Start the app:
   ```bash
   npm start
   ```
5. Scan the QR code with WhatsApp
6. Send a voice note to test!

## Usage

1. Set up environment variables by copying `.env.example` to `.env` and filling in your API keys.
2. Run `npm install` to install dependencies.
3. Run `npm start` to start the application.
4. Scan the QR code that appears in the terminal with your WhatsApp mobile app (Settings > Linked Devices > Link a Device).
5. Start sending voice notes to the linked WhatsApp account to get transcriptions!

## Running as a Service with PM2

To keep WhatsAppTranscribe running continuously in the background, you can use PM2, a process manager for Node.js applications:

1. Install PM2 globally:
   ```
   npm install -g pm2
   ```

2. Start the application with PM2:
   ```
   pm2 start index.js --name WhatsAppTranscribe
   ```

3. View logs:
   ```
   pm2 logs WhatsAppTranscribe
   ```

4. Configure PM2 to start on system boot:
   ```
   pm2 startup
   pm2 save
   ```

5. Other useful PM2 commands:
   ```
   pm2 status                    # View status of all applications
   pm2 restart WhatsAppTranscribe # Restart the application
   pm2 stop WhatsAppTranscribe    # Stop the application
   pm2 delete WhatsAppTranscribe  # Remove from PM2
   ```

## Configuration

The app can be configured through environment variables in your `.env` file:

- `AI_SERVICE`: Choose between 'OPENAI' or 'ANTHROPIC' for summaries
- `VOICE_TRANSCRIPTION_SERVICE`: Choose between 'OPENAI' or 'DEEPGRAM' for transcription
- `OPENAI_API_KEY`: Your OpenAI API key
- `ANTHROPIC_API_KEY`: Your Anthropic API key (if using Claude)
- `DEEPGRAM_API_KEY`: Your Deepgram API key (if using Deepgram)

## Built With

- [@whiskeysockets/baileys](https://github.com/whiskeysockets/Baileys) - WhatsApp Web API
- [openai](https://www.npmjs.com/package/openai) - OpenAI API
- [@anthropic-ai/sdk](https://www.npmjs.com/package/@anthropic-ai/sdk) - Anthropic API
- [@deepgram/sdk](https://www.npmjs.com/package/@deepgram/sdk) - Deepgram API

## Authors

* [Ashraf Ali](https://ashrafali.net)

Built with assistance from:
- GPT-4
- Claude 3 Opus
- Claude 3.7 Sonnet
- [Windsurf](https://windsurf.io) IDE

## Changelog

### v1.2.1 (May 28, 2025)
- Improved WhatsApp authentication system
  - Added support for pairing code authentication as an alternative to QR codes
  - Enhanced error handling and connection recovery
  - Fixed QR code display in terminal
  - Improved session management for better reliability
- Updated all package dependencies to latest versions
- Code refactoring for better stability and maintainability

## License

This project is MIT Licensed. See the [LICENSE](LICENSE.md) file for details.