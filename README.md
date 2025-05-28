# WA Transcript

![WA Transcript Banner](banner/WA%20Transcript%20Banner.png)

A lightweight Node.js application that automatically transcribes WhatsApp voice notes to text. Send a voice note, get back a transcript and summary - it's that simple!

**Table of Contents**
- [Features](#features)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [Deployment Options](#deployment-options)
  - [Running as a Service with PM2](#running-as-a-service-with-pm2)
  - [Docker Deployment](#docker-deployment)
  - [Synology NAS Deployment](#synology-specific-instructions)
  - [Server Deployment](#server-environment-configuration)
- [Authentication Methods](#authentication-methods)
  - [QR Code Authentication](#qr-code-authentication)
  - [Pairing Code Authentication](#pairing-code-authentication)
  - [Transferring Authentication](#transferring-authentication-recommended)
- [Troubleshooting](#troubleshooting-connection-issues)
- [Configuration](#configuration)
- [Built With](#built-with)
- [Changelog](#changelog)
- [License](#license)

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

## Docker Deployment

You can run WhatsAppTranscribe in a Docker container, which works great for NAS devices like Synology:

### Prerequisites

- Docker and Docker Compose installed on your system
- For Synology: Docker package installed from Package Center

### Running with Docker Compose

1. Clone the repository:
   ```bash
   git clone https://github.com/username/whatsapp-voice-transcription.git
   cd whatsapp-voice-transcription
   ```

2. Create a `.env` file based on the example:
   ```bash
   cp .env.example .env
   # Edit .env file with your API keys and settings
   ```

3. Start the container:
   ```bash
   docker-compose up -d
   ```

4. View logs:
   ```bash
   docker-compose logs -f
   ```

### Synology-specific Instructions

#### Recommended Approach for Synology NAS

**Step 1: Authenticate locally first**

The most reliable method is to first authenticate on your local machine and then transfer the authentication data to your Synology:

1. On your computer:
   ```bash
   # Clone the repository
   git clone https://github.com/nerveband/whatsapp_voice_transcription.git
   cd whatsapp_voice_transcription
   
   # Install dependencies
   npm install
   
   # Create environment file
   cp .env.example .env
   
   # Edit the .env file with your API keys and configuration
   
   # Run the application to authenticate
   npm start
   ```

2. Complete the authentication process by scanning the QR code or using the pairing code

3. After successful authentication (you'll see "Connection established successfully!"), stop the application

4. Copy the `auth_info_baileys` folder to your computer for transfer to Synology

**Step 2: Set up on Synology**

1. Install Docker from Synology Package Center if not already installed

2. Create a directory for the application:
   - Open File Station
   - Navigate to a location like `docker` or create one
   - Create a new folder named `whatsapp-transcribe`

3. Upload files to Synology:
   - Upload all project files to the folder you created
   - Make sure to include your `.env` file with API keys
   - Upload the `auth_info_baileys` folder from your local machine

**Step 3: Using Docker Compose (Recommended)**

1. Connect to your Synology via SSH

2. Navigate to your project folder:
   ```bash
   cd /volume1/docker/whatsapp-transcribe
   # Your path might be different
   ```

3. Run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. Check logs:
   ```bash
   docker-compose logs -f
   ```

**Step 4: Using Synology Docker UI (Alternative)**

1. In Synology DSM, open Docker

2. Go to Registry and search for "node"

3. Download the node:20-slim image

4. Go to the Image tab and verify the node image is available

5. Go to Container and click Create

6. Select the node image and click Next

7. In Advanced Settings:
   - Name: whatsapp-transcribe
   - Enable auto-restart
   - Volume tab: Map `/volume1/docker/whatsapp-transcribe` to `/app`
   - Environment tab: Add SERVER_ENV=true and any other variables from your .env file
   - Command: `node index.js`

8. Click Apply to create and start the container

9. View logs from the Synology Docker UI by selecting the container and clicking Details > Log

**Troubleshooting Synology Deployment**

1. If you encounter connection issues (common on NAS devices):
   - Double-check that you're using the auth data generated on your local machine
   - Ensure proper permissions on the auth_info_baileys folder (chmod 755)
   - Try running with different network settings (host network mode)

2. If WhatsApp blocks your Synology's IP:
   - Regenerate auth on your local machine 
   - Transfer the new auth data to Synology
   - Consider using a VPN on your Synology to get a different IP

## Deployment Options

### Server Environment Configuration

If you're running on a server or VPS (like DigitalOcean, AWS, etc.), WhatsApp may block connections from these IP ranges. This is a common issue as WhatsApp actively blocks server IP addresses to prevent automation.

#### Basic Server Setup

1. Set `SERVER_ENV=true` in your `.env` file:
   ```
   SERVER_ENV=true
   ```

2. For persistent sessions on servers, **ALWAYS use the pairing code method instead of QR code**:
   ```
   AUTH_METHOD=PAIRING_CODE
   WHATSAPP_PHONE_NUMBER=12345678901  # Your number without the + sign
   ```

3. Delete any existing auth data to start fresh:
   ```bash
   rm -rf auth_info_baileys
   ```

4. Start the application with the server environment flag:
   ```
   SERVER_ENV=true pm2 start index.js --name WhatsAppTranscribe
   ```

#### Dealing with WhatsApp Server Blocks

If you see errors like `405 Method Not Allowed` or `Connection Terminated`, your server IP is likely being blocked by WhatsApp. Here are your options:

1. **Most Reliable Solution**: If your server IP is being blocked by WhatsApp (which is common with VPS providers), the most reliable solution is to generate the authentication on a non-server device (like your laptop) and then transfer the auth_info_baileys folder to your server.

   Steps:
   - Run the application on your local computer: `npm start`
   - Complete authentication with QR code or pairing code
   - Copy the entire `auth_info_baileys` folder to your server:
     ```bash
     scp -r auth_info_baileys user@your-server:/path/to/whatsapp-transcribe/
     ```
   - Start the application on your server with existing auth

2. **Try Different Times**: WhatsApp sometimes has less strict blocking during certain hours. Try connecting at different times.

3. **Use a Residential Proxy**: Set up a residential proxy service to route your WhatsApp connection through non-datacenter IPs.

4. **VPS Provider Matters**: Some VPS providers have IP ranges that are less likely to be blocked. AWS and Google Cloud IPs are often more heavily blocked than smaller providers.

5. **Reset Connection**: If you're seeing connection errors, try a complete reset:
   ```bash
   rm -rf auth_info_baileys
   SERVER_ENV=true AUTH_METHOD=PAIRING_CODE npm start
   ```

## Troubleshooting Connection Issues

Common connection errors and solutions:

1. **405 Method Not Allowed** - This typically means WhatsApp is blocking your IP or connection method:
   - Make sure `SERVER_ENV=true` is set
   - Use the pairing code method, not QR code
   - Try starting with a fresh authentication (delete auth_info_baileys folder)
   - Run with increased verbosity: `DEBUG=baileys* npm start`
   - Look for the `location` code in the error (e.g., `frc`, `lla`, `cln`) - these indicate where in the connection process WhatsApp is blocking you

2. **Connection Closed** - Connection was interrupted:
   - Check your internet connection
   - WhatsApp might be blocking the connection
   - Try with a fresh session after deleting auth_info_baileys
   - If this happens after a successful connection, your auth is likely still valid - just restart the app

3. **Cannot read properties of undefined** - Auth data might be corrupted:
   - Delete auth_info_baileys folder
   - Restart with fresh authentication

4. **Pairing Code Changes Too Quickly** - When multiple codes appear rapidly:
   - This happens when WhatsApp keeps closing your connection and the app keeps retrying
   - Use the most recent pairing code shown in the terminal
   - If no code works, this is a clear sign your server IP is blocked - use the laptop auth transfer method

5. **Debugging With Logs**:
   - Run with debug logs: `DEBUG=baileys* npm start`
   - Check for patterns in the connection failures
   - Look for specific error codes and locations in the logs

6. **Authentication Transfer Steps**:
   1. On your local machine: `npm start` and complete authentication
   2. Verify a successful connection (you should see "Connection established successfully!")
   3. Stop the application (Ctrl+C)
   4. Copy the auth folder: `scp -r auth_info_baileys user@your-server:/path/to/app/`
   5. On your server: `SERVER_ENV=true pm2 start index.js --name WhatsAppTranscribe`

## Authentication Methods

### QR Code Authentication

QR code authentication is the simplest method for local development:

1. Set these values in your `.env` file:
   ```
   SERVER_ENV=false
   AUTH_METHOD=QR_CODE
   ```

2. Start the application and scan the QR code with your WhatsApp mobile app

### Pairing Code Authentication

Pairing code authentication is recommended for server environments:

1. Set these values in your `.env` file:
   ```
   AUTH_METHOD=PAIRING_CODE
   WHATSAPP_PHONE_NUMBER=12345678901  # Your number WITHOUT the + sign
   ```

2. Start the application and enter the pairing code in your WhatsApp mobile app

### Transferring Authentication (Recommended)

The most reliable method for server deployment:

1. Authenticate on your local machine using QR code authentication
2. Copy the `auth_info_baileys` folder to your server
3. Set `SERVER_ENV=true` in your server's `.env` file
4. Start the application on your server

## Configuration

The app can be configured through environment variables in your `.env` file:

- `AI_SERVICE`: Choose between 'OPENAI' or 'ANTHROPIC' for summaries
- `VOICE_TRANSCRIPTION_SERVICE`: Choose between 'OPENAI' or 'DEEPGRAM' for transcription
- `OPENAI_API_KEY`: Your OpenAI API key
- `ANTHROPIC_API_KEY`: Your Anthropic API key (if using Claude)
- `DEEPGRAM_API_KEY`: Your Deepgram API key (if using Deepgram)
- `SERVER_ENV`: Set to 'true' for server environments, 'false' for local development
- `AUTH_METHOD`: Choose between 'QR_CODE' or 'PAIRING_CODE'
- `WHATSAPP_PHONE_NUMBER`: Your phone number in E.164 format WITHOUT the + sign (required for pairing code)

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