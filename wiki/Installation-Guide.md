# Installation Guide

Complete step-by-step instructions for setting up WhatsApp Voice Transcription.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation Steps](#installation-steps)
- [First-Time Configuration](#first-time-configuration)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

## Prerequisites

Before installing WhatsApp Voice Transcription, ensure you have:

### System Requirements
- **Node.js** version 18.0.0 or higher
- **npm** (comes with Node.js) or **yarn**
- **Git** for cloning the repository
- Active internet connection for downloading dependencies

### Check Your Node.js Version
```bash
node --version
npm --version
```

If you need to install or update Node.js:
- **Official installer**: [nodejs.org](https://nodejs.org/)
- **Package managers**: 
  - macOS: `brew install node`
  - Ubuntu/Debian: `sudo apt install nodejs npm`
  - Windows: Use the official installer or `winget install OpenJS.NodeJS`

## Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/nerveband/wa-transcript.git
cd wa-transcript
```

### 2. Install Dependencies
Choose your preferred package manager:

**Using npm:**
```bash
npm install
```

**Using yarn:**
```bash
yarn install
```

### 3. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```

## First-Time Configuration

### 1. Edit Environment Variables
Open the `.env` file in your preferred editor and configure the following:

```env
# Authentication Method (choose one)
AUTH_METHOD=QR_CODE
# or
# AUTH_METHOD=PAIRING_CODE

# For PAIRING_CODE method, add your phone number
WHATSAPP_PHONE_NUMBER=12345678901

# Server Environment (set to true for headless servers)
SERVER_ENV=false
```

### 2. Configure AI Services
Add your API keys for the services you want to use:

```env
# Required: Choose your transcription service
VOICE_TRANSCRIPTION_SERVICE=DEEPGRAM
DEEPGRAM_API_KEY=your_deepgram_api_key

# Required: Choose your AI service for summaries
AI_SERVICE=OPENAI
OPENAI_API_KEY=your_openai_api_key
```

> **Need API Keys?** See the [API Keys Setup](API-Keys-Setup) guide for detailed instructions on obtaining API keys from each provider.

### 3. Model Selection
Configure your preferred models (optional, defaults are provided):

```env
# Latest recommended models
OPENAI_MODEL=gpt-4o
ANTHROPIC_MODEL=claude-3-5-haiku-latest
DEEPGRAM_MODEL=nova-3
WHISPER_MODEL=whisper-1
```

> **Model Options**: See the [Configuration](Configuration) page for complete model listings and recommendations.

## Verification

### 1. Test Installation
Run the application to verify everything is set up correctly:

```bash
npm start
```

### 2. Expected Output
You should see output similar to:
```
WhatsApp Voice Transcription starting...
Connecting to WhatsApp...
QR Code generated - scan with your phone
```

### 3. Authentication Test
- **QR Code Method**: A QR code will appear in your terminal
- **Pairing Code Method**: A pairing code will be displayed

> **Authentication Details**: See [WhatsApp Authentication](WhatsApp-Authentication) for detailed authentication steps.

## Troubleshooting

### Common Installation Issues

#### Node.js Version Too Old
```bash
# Error: Node.js version not supported
# Solution: Update Node.js to version 18+
```

#### Permission Errors (Linux/macOS)
```bash
# Error: EACCES permission denied
# Solution: Don't use sudo with npm, fix npm permissions instead
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

#### Network/Proxy Issues
```bash
# Configure npm to use proxy if needed
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

#### Missing Dependencies
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Specific Error Messages

**"Cannot find module '@whiskeysockets/baileys'"**
- Solution: Run `npm install` again

**"Invalid API key"**
- Solution: Check your API key configuration in `.env`

**"Connection timeout"**
- Solution: Check your internet connection and firewall settings

## Next Steps

After successful installation:

1. **Complete Configuration** - Visit [Configuration](Configuration) for advanced settings
2. **Set Up Authentication** - Follow [WhatsApp Authentication](WhatsApp-Authentication) guide
3. **Choose Deployment Method**:
   - [Docker Deployment](Docker-Deployment) for containerized setup
   - [Server Deployment](Server-Deployment) for VPS/cloud deployment
   - [PM2 Setup](PM2-Setup) for process management

## Development Setup

If you plan to contribute or modify the code:

```bash
# Install development dependencies
npm install --include=dev

# Run in development mode
npm run dev
```

See [Contributing](Contributing) for development guidelines.

## Related Pages
- [Configuration](Configuration) - Complete environment variable reference
- [API Keys Setup](API-Keys-Setup) - Obtain API keys from providers
- [WhatsApp Authentication](WhatsApp-Authentication) - Authentication methods
- [Troubleshooting](Troubleshooting) - Common issues and solutions

---

**Need help?** Check the [Troubleshooting](Troubleshooting) page or [open an issue](https://github.com/nerveband/wa-transcript/issues).