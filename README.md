# WhatsApp Voice Note Transcription

This Node.js application aids in transcribing voice notes sent via WhatsApp. The app can transcribe voice notes to text using OpenAI's Whisper API, and if necessary, translate the text to the language of the user's choice. The transcription is then sent to the user's WhatsApp account.

## Getting Started
These instructions will get you a copy of the project up and running on your local machine. To get started, follow these steps:

### Prerequisites
Before you start, make sure you have the following installed:

* Node.js
* npm
* WhatsApp account
* OAPI Key from OpenAI Whisper's API

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

After following the installation steps above, simply send a voice note to your WhatsApp account. The app will then convert the voice note to text, and if necessary, translate the text.

## Built With

* [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) - A WhatsApp Web client library
* [qrcode-terminal](https://github.com/gtanner/qrcode-terminal) - A terminal QR code generator
* [axios](https://github.com/axios/axios) - A Promise-based HTTP client
* [form-data](https://github.com/form-data/form-data) - A module which allows you to submit forms in Node.js
* [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) - A Node.js wrapper for FFmpeg
* [progress](https://github.com/tj/node-progress) - A Node.js module that makes it easy to create progress bars
* [dotenv](https://github.com/motdotla/dotenv) - A zero-dependency module that loads environment variables from a .env file

## Authors

* [Ashraf Ali](https://github.com/nerveband) - *Initial work*

## License

This project is not licensed yet, lol. 
