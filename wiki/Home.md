# WhatsApp Voice Transcription

Welcome to the comprehensive documentation for WhatsApp Voice Transcription - a lightweight Node.js application that automatically transcribes WhatsApp voice notes to text using AI.

## Quick Navigation

### 🚀 Getting Started
- **[Installation Guide](Installation-Guide)** - Complete setup instructions
- **[Configuration](Configuration)** - Environment variables and settings
- **[API Keys Setup](API-Keys-Setup)** - Obtain API keys from providers

### 🔧 Deployment Options
- **[Docker Deployment](Docker-Deployment)** - Containerized deployment
- **[Server Deployment](Server-Deployment)** - VPS/Cloud server setup
- **[Synology NAS](Synology-Deployment)** - NAS-specific instructions
- **[PM2 Process Manager](PM2-Setup)** - Running as a service

### 🔐 Authentication
- **[WhatsApp Authentication](WhatsApp-Authentication)** - QR code vs pairing methods
- **[Authentication Transfer](Authentication-Transfer)** - Moving auth between devices
- **[Authentication Troubleshooting](Authentication-Troubleshooting)** - Common auth issues

### 🛠️ Advanced Topics
- **[Troubleshooting](Troubleshooting)** - Common issues and solutions
- **[Upgrade Guide](Upgrade-Guide)** - Update to latest versions
- **[Contributing](Contributing)** - Development and contribution guidelines

## Features Overview

- 🎙️ **AI-Powered Transcription** - Supports OpenAI Whisper and Deepgram for accurate voice-to-text
- 📝 **Smart Summaries** - Generates concise summaries using OpenAI GPT or Anthropic Claude
- 💬 **WhatsApp Integration** - Sends transcripts and summaries directly back to WhatsApp
- ⚡ **Fast & Lightweight** - Efficient processing with configurable AI providers
- 🔧 **Highly Configurable** - Multiple deployment options and authentication methods

## Supported AI Providers

| Provider | Service | Status |
|----------|---------|--------|
| **OpenAI** | Transcription | ✅ Active |
| **OpenAI** | Summarization | ✅ Active |
| **Deepgram** | Transcription | ✅ Active |
| **Anthropic** | Summarization | ✅ Active |

## Recent Updates

- Updated to latest AI model offerings (OpenAI GPT-4o, Claude 3.5, Deepgram Nova-3)
- Streamlined documentation structure with dedicated wiki pages
- Enhanced deployment options with Docker and PM2 support
- Improved authentication transfer process

## Quick Start

1. Follow the **[Installation Guide](Installation-Guide)** for detailed setup
2. Configure your **[API Keys](API-Keys-Setup)** for chosen providers
3. Set up **[WhatsApp Authentication](WhatsApp-Authentication)**
4. Choose your **[Deployment Method](Docker-Deployment)**

## Support & Community

- **[GitHub Issues](https://github.com/nerveband/wa-transcript/issues)** - Report bugs or request features
- **[Main Repository](https://github.com/nerveband/wa-transcript)** - Source code and releases

---

> **⚠️ Important Notice**  
> This app uses third-party AI services to transcribe audio files and generate summaries. Audio files will be sent to these services. Additionally, this app uses an unofficial WhatsApp library which may break or result in account restrictions from Meta.

**Last updated**: September 2025