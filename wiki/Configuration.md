# Configuration

Complete reference for all environment variables and configuration options for WhatsApp Voice Transcription.

## Table of Contents
- [Environment File Overview](#environment-file-overview)
- [WhatsApp Authentication](#whatsapp-authentication)
- [AI Service Configuration](#ai-service-configuration)
- [Model Selection](#model-selection)
- [Advanced Settings](#advanced-settings)
- [Configuration Examples](#configuration-examples)
- [Troubleshooting](#troubleshooting)

## Environment File Overview

All configuration is managed through the `.env` file in your project root. Copy `.env.example` to `.env` and customize as needed:

```bash
cp .env.example .env
```

## WhatsApp Authentication

### Authentication Method
```env
# Choose your authentication method
AUTH_METHOD=QR_CODE
# Options: QR_CODE, PAIRING_CODE
```

**QR_CODE** (Recommended for desktop/local use):
- Scan QR code with your phone's WhatsApp
- Easier setup process
- Works well for personal/development use

**PAIRING_CODE** (Required for headless servers):
- Uses a pairing code instead of QR
- Better for server deployments
- Requires your phone number

### Phone Number (Required for PAIRING_CODE)
```env
WHATSAPP_PHONE_NUMBER=12345678901
# Format: E.164 without the plus sign
# Example: US number +1-234-567-8901 becomes 12345678901
```

### Server Environment
```env
SERVER_ENV=false
# Set to 'true' when running on headless servers
# Optimizes connection settings to avoid WhatsApp blocks
```

## AI Service Configuration

### Voice Transcription Service
```env
VOICE_TRANSCRIPTION_SERVICE=DEEPGRAM
# Options: OPENAI, DEEPGRAM
```

**DEEPGRAM** (Recommended):
- Faster transcription
- Better accuracy for diverse accents
- More cost-effective for high volume

**OPENAI** (Whisper):
- Good general accuracy
- Integrated with OpenAI ecosystem
- Higher cost per minute

### AI Summary Service
```env
AI_SERVICE=OPENAI
# Options: OPENAI, ANTHROPIC
```

**OPENAI**:
- GPT-4o and other models available
- Good general summarization
- Extensive model options

**ANTHROPIC**:
- Claude models available
- Excellent at nuanced summarization
- Good safety features

### Summary Generation
```env
GENERATE_SUMMARY=true
# Set to 'false' to disable summary generation
# Saves API costs if you only want transcriptions
```

## Model Selection

### OpenAI Models
```env
OPENAI_MODEL=gpt-4o
```

**Available Models** (latest first):
- `gpt-5-nano-2025-08-07` - Newest model (experimental)
- `gpt-4o` - Flagship model (recommended)
- `gpt-4o-mini` - Fast & cost-effective
- `o1-pro` - Advanced reasoning
- `o3-mini` - Latest reasoning model
- `gpt-4-turbo` - Previous generation
- `gpt-3.5-turbo` - Budget option

**Recommendations**:
- **Production**: `gpt-4o` for best quality
- **Development**: `gpt-4o-mini` for speed/cost
- **High Volume**: `gpt-3.5-turbo` for budget

### Anthropic Models
```env
ANTHROPIC_MODEL=claude-3-5-haiku-latest
```

**Available Models** (latest first):
- `claude-3-5-haiku-latest` - Latest cheap model (recommended)
- `claude-3-5-sonnet-20241022` - Best quality
- `claude-3-opus-20240229` - Previous flagship
- `claude-3-sonnet-20240229` - Previous mid-tier
- `claude-3-haiku-20240307` - Previous budget

**Recommendations**:
- **Production**: `claude-3-5-sonnet-20241022` for best quality
- **High Volume**: `claude-3-5-haiku-latest` for cost efficiency

### Whisper Models (OpenAI Transcription)
```env
WHISPER_MODEL=whisper-1
```

**Available Models**:
- `whisper-1` - Speech-to-text (recommended)
- `tts-1` - Text-to-speech (basic)
- `tts-1-hd` - Text-to-speech (high quality)
- `gpt-4o-mini-tts` - TTS with emotions

### Deepgram Models
```env
DEEPGRAM_MODEL=nova-3
```

**Available Models** (latest first):
- `nova-3` - Latest model (recommended)
- `nova-2` - Previous generation
- `nova` - Original nova model
- `general` - Standard model
- `general-enhanced` - Enhanced accuracy
- `meeting-recorder-general` - Meeting optimized
- `meeting-recorder-enhanced` - Enhanced meetings

**Recommendations**:
- **Production**: `nova-3` for best accuracy
- **Meetings**: `meeting-recorder-enhanced` for meeting content

## Advanced Settings

### API Keys
```env
# Add your API keys (obtain from provider dashboards)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key
```

> **Security Note**: Never commit API keys to version control. Use environment variables or secure secret management.

## Configuration Examples

### Cost-Optimized Setup
```env
# Minimize costs while maintaining quality
AUTH_METHOD=QR_CODE
SERVER_ENV=false

# Use Deepgram for transcription (cheaper)
VOICE_TRANSCRIPTION_SERVICE=DEEPGRAM
DEEPGRAM_API_KEY=your_deepgram_api_key
DEEPGRAM_MODEL=nova-3

# Use Claude Haiku for summaries (cheapest)
AI_SERVICE=ANTHROPIC
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_MODEL=claude-3-5-haiku-latest

GENERATE_SUMMARY=true
```

### Quality-Optimized Setup
```env
# Best quality regardless of cost
AUTH_METHOD=QR_CODE
SERVER_ENV=false

# Use OpenAI Whisper for transcription
VOICE_TRANSCRIPTION_SERVICE=OPENAI
OPENAI_API_KEY=your_openai_api_key
WHISPER_MODEL=whisper-1

# Use GPT-4o for summaries
AI_SERVICE=OPENAI
OPENAI_MODEL=gpt-4o

GENERATE_SUMMARY=true
```

### Server Deployment Setup
```env
# Optimized for headless server deployment
AUTH_METHOD=PAIRING_CODE
WHATSAPP_PHONE_NUMBER=12345678901
SERVER_ENV=true

# Reliable services for server use
VOICE_TRANSCRIPTION_SERVICE=DEEPGRAM
DEEPGRAM_API_KEY=your_deepgram_api_key
DEEPGRAM_MODEL=nova-3

AI_SERVICE=OPENAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

GENERATE_SUMMARY=true
```

### Development Setup
```env
# Fast iteration for development
AUTH_METHOD=QR_CODE
SERVER_ENV=false

# Fast, cheap options for testing
VOICE_TRANSCRIPTION_SERVICE=DEEPGRAM
DEEPGRAM_API_KEY=your_deepgram_api_key
DEEPGRAM_MODEL=nova-3

AI_SERVICE=OPENAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

# Disable summaries to save costs during dev
GENERATE_SUMMARY=false
```

## Troubleshooting

### Configuration Validation
The app will validate your configuration on startup. Common issues:

**Missing API Keys**:
```
Error: Missing OPENAI_API_KEY in environment
```
Solution: Add the required API key to your `.env` file

**Invalid Model Names**:
```
Error: Invalid model 'gpt-4' for OpenAI service
```
Solution: Use exact model names from this guide

**Authentication Conflicts**:
```
Error: WHATSAPP_PHONE_NUMBER required for PAIRING_CODE method
```
Solution: Add phone number or switch to QR_CODE method

### Performance Issues
- **Slow transcription**: Try switching from OPENAI to DEEPGRAM
- **High costs**: Use cheaper models like `gpt-4o-mini` or `claude-3-5-haiku-latest`
- **Connection issues**: Set `SERVER_ENV=true` for server deployments

### Model Availability
Models may become unavailable. Check provider documentation:
- **OpenAI**: [https://platform.openai.com/docs/models](https://platform.openai.com/docs/models)
- **Anthropic**: [https://docs.anthropic.com/claude/docs/models-overview](https://docs.anthropic.com/claude/docs/models-overview)
- **Deepgram**: [https://developers.deepgram.com/docs/models-languages-overview](https://developers.deepgram.com/docs/models-languages-overview)

## Related Pages
- [API Keys Setup](API-Keys-Setup) - How to obtain API keys
- [Installation Guide](Installation-Guide) - Initial setup
- [WhatsApp Authentication](WhatsApp-Authentication) - Authentication methods
- [Troubleshooting](Troubleshooting) - Common issues and solutions

---

**Need help?** Check the [Troubleshooting](Troubleshooting) page or [open an issue](https://github.com/nerveband/wa-transcript/issues).