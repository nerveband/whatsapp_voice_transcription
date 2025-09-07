# WhatsApp Voice Transcription

![WA Transcript Banner](banner/WA%20Transcript%20Banner.png)

A lightweight Node.js application that automatically transcribes WhatsApp voice notes to text using AI. Send a voice note, get back a transcript and summary - it's that simple!

## Features

- 🎙️ **AI-Powered Transcription** - Supports OpenAI Whisper and Deepgram for accurate voice-to-text
- 📝 **Smart Summaries** - Generates concise summaries using OpenAI GPT or Anthropic Claude
- 💬 **WhatsApp Integration** - Sends transcripts and summaries directly back to WhatsApp
- ⚡ **Fast & Lightweight** - Efficient processing with configurable AI providers
- 🔧 **Highly Configurable** - Multiple deployment options and authentication methods

> [!WARNING]  
> This app uses third-party AI services to transcribe audio files and generate summaries. Audio files will be sent to these services. Additionally, this app uses an unofficial WhatsApp library which may break or result in account restrictions from Meta.

## Quick Start

1. **Prerequisites**: Node.js installed on your system
2. **Clone & Install**:
   ```bash
   git clone https://github.com/nerveband/wa-transcript.git
   cd wa-transcript
   npm install
   ```
3. **Configuration**: Copy `.env.example` to `.env` and add your API keys
4. **Start**: Run `npm start` and scan the QR code with WhatsApp
5. **Test**: Send a voice note to test the transcription!

## Documentation

For detailed setup, configuration, and deployment instructions, visit our **[GitHub Wiki](../../wiki)**:

### 📖 Setup & Configuration
- **[Installation Guide](../../wiki/Installation-Guide)** - Detailed setup instructions
- **[Configuration](../../wiki/Configuration)** - Complete environment variable reference
- **[API Keys Setup](../../wiki/API-Keys-Setup)** - How to obtain API keys from providers

### 🚀 Deployment
- **[Docker Deployment](../../wiki/Docker-Deployment)** - Containerized deployment
- **[Server Deployment](../../wiki/Server-Deployment)** - VPS/Cloud server setup
- **[Synology NAS](../../wiki/Synology-Deployment)** - NAS-specific instructions
- **[PM2 Process Manager](../../wiki/PM2-Setup)** - Running as a service

### 🔐 Authentication
- **[WhatsApp Authentication](../../wiki/WhatsApp-Authentication)** - QR code vs pairing code methods
- **[Authentication Transfer](../../wiki/Authentication-Transfer)** - Moving auth between devices
- **[Troubleshooting Auth](../../wiki/Authentication-Troubleshooting)** - Common authentication issues

### 🛠️ Advanced
- **[Troubleshooting](../../wiki/Troubleshooting)** - Common issues and solutions
- **[Upgrade Guide](../../wiki/Upgrade-Guide)** - How to update to latest versions
- **[Contributing](../../wiki/Contributing)** - How to contribute to the project

## Supported AI Providers

| Provider | Service | Status |
|----------|---------|--------|
| **OpenAI** | Transcription | ✅ Active |
| **OpenAI** | Summarization | ✅ Active |
| **Deepgram** | Transcription | ✅ Active |
| **Anthropic** | Summarization | ✅ Active |

## Community & Support

- **[Issues](https://github.com/nerveband/wa-transcript/issues)** - Report bugs or request features
- **[Discussions](https://github.com/nerveband/wa-transcript/discussions)** - Community support and ideas
- **[Wiki](../../wiki)** - Comprehensive documentation

## Built With

- [@whiskeysockets/baileys](https://github.com/whiskeysockets/Baileys) - WhatsApp Web API
- [openai](https://www.npmjs.com/package/openai) - OpenAI API SDK
- [@anthropic-ai/sdk](https://www.npmjs.com/package/@anthropic-ai/sdk) - Anthropic Claude API
- [@deepgram/sdk](https://www.npmjs.com/package/@deepgram/sdk) - Deepgram API SDK

## License

This project is MIT Licensed. See the [LICENSE](LICENSE.md) file for details.

---

**⭐ Star this repo if you find it helpful!** | **[📚 Visit the Wiki](../../wiki) for detailed documentation**