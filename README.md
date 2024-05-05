# WhatsApp Voice Note Transcription

This Node.js application aids in transcribing voice notes sent via WhatsApp. The app can transcribe voice notes to text using either OpenAI's Whisper API or Deepgram's API. It also provides a summary and action steps using either OpenAI's GPT models or Anthropic's Claude models. The transcription and summary are then sent back to the user's WhatsApp account.

## Features

- Transcribes WhatsApp voice notes to text using OpenAI's Whisper API or Deepgram's API
- Generates a summary and action steps from the transcription using OpenAI's GPT models or Anthropic's Claude models
- Sends the transcription, summary, and action steps back to the user via WhatsApp
- Supports configuration through environment variables to choose the AI service provider, voice transcription service, and specific models to use

> [!WARNING]  
> WARNING: This uses third-party services (OpenAI, Deepgram, Anthropic) to transcribe the file and generate summaries. Be aware of the risks of automatically sending your audio files outside your encrypted messages to third-party services. In addition, this is using an unofficial WhatsApp library which may break at any time or result in your account being banned by Meta.

## Getting Started
These instructions will get you a copy of the project up and running on your local machine. To get started, follow these steps:

### Prerequisites
Before you start, make sure you have the following installed:

* Node.js
* npm
* WhatsApp account
* API Key from OpenAI for GPT and Whisper APIs (if using OpenAI)
* API Key from Anthropic for Claude models (if using Anthropic)
* API Key from Deepgram for voice transcription (if using Deepgram)

### Installing
1. Clone the repository to your local machine:

   ```
   git clone https://github.com/nerveband/whatsapp_voice_transcription.git
   ```
   
2. Navigate into the project directory:

   ```
   cd whatsapp_voice_transcription
   ```

3. Install the dependencies using npm:

   ```
   npm install
   ```

4. Create a `.env` file by copying the example file:

   ```
   cp .env.example .env
   ```
   
5. Set the necessary environment variables in the `.env` file. 
   
6. Run the application:

   ```
   npm start
   ```
   
7. Use the WhatsApp Web interface to scan the QR code generated in the console to log in.

## Usage

After following the installation steps above, simply send a voice note to your own WhatsApp account to test it. The app will then transcribe the voice note to text using the selected voice transcription service (OpenAI or Deepgram). It will also generate a summary and action steps using the selected AI service (OpenAI or Anthropic). The transcription will be sent back to you on WhatsApp as one message with the summary (if enabled) as message right after.

## Built With

* [@whiskeysockets/baileys](https://github.com/whiskeysockets/Baileys) - A WhatsApp Web API library for Node.js
* [qrcode-terminal](https://github.com/gtanner/qrcode-terminal) - A terminal QR code generator 
* [axios](https://github.com/axios/axios) - A Promise-based HTTP client
* [form-data](https://github.com/form-data/form-data) - A module which allows you to submit forms in Node.js
* [dotenv](https://github.com/motdotla/dotenv) - A zero-dependency module that loads environment variables from a .env file
* [compromise](https://github.com/spencermountain/compromise) - A modest natural language processing library for Node.js.
* [openai](https://www.npmjs.com/package/openai) - The OpenAI Node.js library
* [@anthropic-ai/sdk](https://www.npmjs.com/package/@anthropic-ai/sdk) - Anthropic's Node.js library
* [@deepgram/sdk](https://www.npmjs.com/package/@deepgram/sdk) - Deepgram's Node.js SDK

## Authors

* [Ashraf Ali](https://ashrafali.net)
With lots of help from GPT-4 and Claude 3 Opus :)

## License

This project is MIT Licensed. See the [LICENSE](LICENSE.md) file for details.