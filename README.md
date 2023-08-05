# WhatsApp Voice Note Transcription

This Node.js application aids in transcribing voice notes sent via WhatsApp. The app can transcribe voice notes to text using OpenAI's Whisper API, and if necessary, translate the text to the language of the user's choice. The transcription is then sent to the user's WhatsApp account.

WARNING: This uses a third-party (OpenAI) to transcribe the file. Know the risks of automatically sending your audio files outside your encrypted messages to a third-party. In addition, this is using an unofficial WhatsApp library which may break at any time or result in your account being banned by Meta. 

## Getting Started
These instructions will get you a copy of the project up and running on your local machine. To get started, follow these steps:

### Prerequisites
Before you start, make sure you have the following installed:

* Node.js
* npm
* WhatsApp account
* API Key from OpenAI for GPT and Whisper APIs

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
   
5. Set the necessary environment variables in the `.env` file:

   ```
   WHATSAPP_PHONE_NUMBER=<your whatsapp phone number such as +15551234567 including plus and country code>
   OPENAI_API_KEY=<insert your OpenAI Key here>
   ```
   
6. Run the application:

   ```
   npm start
   ```
   
7. Use the WhatsApp Web interface to scan the QR code generated in the console to log in.

## Usage

After following the installation steps above, simply send a voice note to your WhatsApp account. The app will then convert the voice note to text, and if necessary, translate the text. It will also use GPT 3.5 to give you a summary of the transcript along with action steps.

## Built With

* [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) - A WhatsApp Web client library
* [qrcode-terminal](https://github.com/gtanner/qrcode-terminal) - A terminal QR code generator
* [axios](https://github.com/axios/axios) - A Promise-based HTTP client
* [form-data](https://github.com/form-data/form-data) - A module which allows you to submit forms in Node.js
* [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) - A Node.js wrapper for FFmpeg
* [progress](https://github.com/tj/node-progress) - A Node.js module that makes it easy to create progress bars
* [dotenv](https://github.com/motdotla/dotenv) - A zero-dependency module that loads environment variables from a .env file
* [compromise](https://github.com/spencermountain/compromise) - A modest natural language processing library for Node.js.

## Authors

* [Ashraf Ali](https://ashrafali.net) - *Initial work*
With lots of help from GPT-4 :)

## License

This project is MIT Licensed

Copyright (c) [2023] [Ashraf Ali]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
