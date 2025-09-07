# API Keys Setup

Complete guide to obtaining and configuring API keys for all supported AI service providers.

## Table of Contents
- [OpenAI API Setup](#openai-api-setup)
- [Anthropic API Setup](#anthropic-api-setup)
- [Deepgram API Setup](#deepgram-api-setup)
- [Cost Estimation](#cost-estimation)
- [Security Best Practices](#security-best-practices)
- [API Key Configuration](#api-key-configuration)
- [Testing Your Setup](#testing-your-setup)
- [Troubleshooting](#troubleshooting)

## OpenAI API Setup

### 1. Create OpenAI Account
1. Visit [platform.openai.com](https://platform.openai.com/)
2. Click **"Sign up"** or **"Log in"** if you have an account
3. Complete email verification

### 2. Add Billing Information
1. Navigate to **"Settings" > "Billing"**
2. Click **"Add payment method"**
3. Enter credit card details
4. Set up billing limits if desired

> **Important**: OpenAI requires a paid account for API access. Free tier accounts cannot access the API.

### 3. Generate API Key
1. Go to **"API Keys"** in the left sidebar
2. Click **"Create new secret key"**
3. Choose a descriptive name (e.g., "WhatsApp Transcription")
4. Set appropriate permissions:
   - **Models**: `gpt-*`, `whisper-*` (for transcription)
   - **Usage**: All selected by default
5. Click **"Create secret key"**

### 4. Copy and Secure Your Key
```
sk-proj-abc123...xyz789
```
- Copy the key immediately (it won't be shown again)
- Store securely in your password manager
- Add to your `.env` file:

```env
OPENAI_API_KEY=sk-proj-abc123...xyz789
```

### OpenAI Pricing (January 2025)
- **GPT-4o**: $2.50/1M input tokens, $10.00/1M output tokens
- **GPT-4o-mini**: $0.15/1M input tokens, $0.60/1M output tokens
- **Whisper**: $0.006/minute of audio
- **Estimated monthly cost**: $5-20 for moderate usage

## Anthropic API Setup

### 1. Create Anthropic Account
1. Visit [console.anthropic.com](https://console.anthropic.com/)
2. Click **"Sign Up"** or **"Sign In"**
3. Complete account verification

### 2. Add Credits
1. Navigate to **"Billing"** in the dashboard
2. Click **"Add credits"**
3. Choose credit amount ($5, $25, $50, $100+)
4. Complete payment

> **Note**: Anthropic uses a prepaid credit system rather than monthly billing.

### 3. Generate API Key
1. Go to **"API Keys"** in the left sidebar
2. Click **"Create Key"**
3. Enter a descriptive name (e.g., "WhatsApp Voice Transcription")
4. Click **"Create Key"**

### 4. Copy and Secure Your Key
```
sk-ant-api03-abc123...xyz789
```
- Copy the key immediately
- Store securely in your password manager
- Add to your `.env` file:

```env
ANTHROPIC_API_KEY=sk-ant-api03-abc123...xyz789
```

### Anthropic Pricing (January 2025)
- **Claude 3.5 Haiku**: $0.25/1M input tokens, $1.25/1M output tokens
- **Claude 3.5 Sonnet**: $3.00/1M input tokens, $15.00/1M output tokens
- **Estimated monthly cost**: $3-15 for moderate usage

## Deepgram API Setup

### 1. Create Deepgram Account
1. Visit [console.deepgram.com](https://console.deepgram.com/)
2. Click **"Sign Up"** to create an account
3. Complete email verification

### 2. Free Credits
- Deepgram provides **$200 in free credits** for new accounts
- No credit card required initially
- Credits are sufficient for extensive testing

### 3. Generate API Key
1. Navigate to **"API Keys"** in the dashboard
2. Click **"Create a New API Key"**
3. Enter a descriptive name (e.g., "WhatsApp Transcription")
4. Select appropriate scopes:
   - ✅ **Speech-to-Text** (required)
   - ✅ **Usage** (for monitoring)
5. Click **"Create Key"**

### 4. Copy and Secure Your Key
```
abc123...xyz789
```
- Copy the key immediately
- Store securely in your password manager
- Add to your `.env` file:

```env
DEEPGRAM_API_KEY=abc123...xyz789
```

### Deepgram Pricing (January 2025)
- **Nova-3 Model**: $0.0043/minute for pre-recorded audio
- **Pay-as-you-go** with $200 free credits
- **Estimated monthly cost**: $2-10 for moderate usage

## Cost Estimation

### Typical Usage Scenarios

#### Light Usage (10 voice messages/day)
- **Average message length**: 30 seconds
- **Monthly minutes**: ~150 minutes
- **Estimated costs**:
  - OpenAI Whisper: $0.90/month
  - Deepgram Nova-3: $0.65/month
  - GPT-4o-mini summaries: $2-5/month
  - **Total**: $3-6/month

#### Moderate Usage (50 voice messages/day)
- **Average message length**: 45 seconds
- **Monthly minutes**: ~1,125 minutes
- **Estimated costs**:
  - OpenAI Whisper: $6.75/month
  - Deepgram Nova-3: $4.84/month
  - GPT-4o summaries: $15-25/month
  - **Total**: $20-30/month

#### Heavy Usage (200 voice messages/day)
- **Average message length**: 60 seconds
- **Monthly minutes**: ~6,000 minutes
- **Estimated costs**:
  - OpenAI Whisper: $36/month
  - Deepgram Nova-3: $25.80/month
  - Claude 3.5 Sonnet summaries: $40-60/month
  - **Total**: $65-95/month

### Cost Optimization Tips
1. **Use Deepgram for transcription** (cheaper than OpenAI Whisper)
2. **Use Claude 3.5 Haiku for summaries** (cheapest option)
3. **Set GENERATE_SUMMARY=false** to save on summary costs
4. **Monitor usage** through provider dashboards
5. **Set billing alerts** to avoid unexpected charges

## Security Best Practices

### API Key Security
```bash
# ❌ Never do this
echo "OPENAI_API_KEY=sk-..." >> ~/.bashrc

# ✅ Use .env files (not committed to git)
echo "OPENAI_API_KEY=sk-..." >> .env

# ✅ Set proper file permissions
chmod 600 .env
```

### Environment Variable Best Practices
```env
# .env file structure
# Keep keys separate and documented

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-abc123...xyz789
OPENAI_MODEL=gpt-4o-mini

# Anthropic Configuration  
ANTHROPIC_API_KEY=sk-ant-api03-abc123...xyz789
ANTHROPIC_MODEL=claude-3-5-haiku-latest

# Deepgram Configuration
DEEPGRAM_API_KEY=abc123...xyz789
DEEPGRAM_MODEL=nova-3
```

### Production Security
- **Use environment variables** instead of .env files
- **Implement key rotation** regularly
- **Set up API usage alerts**
- **Use least privilege permissions**
- **Monitor API usage** for unauthorized access

### Docker Security
```yaml
# Use Docker secrets for production
services:
  app:
    secrets:
      - openai_api_key
      - anthropic_api_key
      - deepgram_api_key

secrets:
  openai_api_key:
    file: ./secrets/openai_api_key.txt
```

## API Key Configuration

### Complete .env Example
```env
# Choose your services
VOICE_TRANSCRIPTION_SERVICE=DEEPGRAM
AI_SERVICE=ANTHROPIC

# API Keys
OPENAI_API_KEY=sk-proj-abc123...xyz789
ANTHROPIC_API_KEY=sk-ant-api03-abc123...xyz789
DEEPGRAM_API_KEY=abc123...xyz789

# Model Selection
OPENAI_MODEL=gpt-4o-mini
ANTHROPIC_MODEL=claude-3-5-haiku-latest
DEEPGRAM_MODEL=nova-3
WHISPER_MODEL=whisper-1

# Feature Configuration
GENERATE_SUMMARY=true
```

### Service Combinations

#### Cost-Optimized Setup
```env
VOICE_TRANSCRIPTION_SERVICE=DEEPGRAM
AI_SERVICE=ANTHROPIC
DEEPGRAM_MODEL=nova-3
ANTHROPIC_MODEL=claude-3-5-haiku-latest
```

#### Quality-Optimized Setup
```env
VOICE_TRANSCRIPTION_SERVICE=OPENAI
AI_SERVICE=OPENAI
WHISPER_MODEL=whisper-1
OPENAI_MODEL=gpt-4o
```

#### Balanced Setup
```env
VOICE_TRANSCRIPTION_SERVICE=DEEPGRAM
AI_SERVICE=OPENAI
DEEPGRAM_MODEL=nova-3
OPENAI_MODEL=gpt-4o-mini
```

## Testing Your Setup

### 1. Verify API Keys
Test each API key before full deployment:

```bash
# Test OpenAI API
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Test Anthropic API
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-haiku-20241022","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}'

# Test Deepgram API
curl https://api.deepgram.com/v1/projects \
  -H "Authorization: Token $DEEPGRAM_API_KEY"
```

### 2. Test Application
Start the application and verify configuration:

```bash
npm start
```

Look for successful API connections in the logs:
```
✅ OpenAI API key validated
✅ Deepgram API key validated
✅ Connected to WhatsApp
Ready to receive voice messages!
```

### 3. Send Test Voice Message
1. Send a short voice message to your WhatsApp
2. Verify transcription is received
3. Check if summary is generated (if enabled)
4. Monitor costs in provider dashboards

## Troubleshooting

### Common API Key Issues

#### "Invalid API Key" Errors
```bash
# Check key format and presence
echo $OPENAI_API_KEY | cut -c1-10
# Should show: sk-proj-ab or similar

# Verify key is in .env file
grep OPENAI_API_KEY .env
```

#### "Insufficient Credits" Errors
- **OpenAI**: Check billing page, add payment method
- **Anthropic**: Add more credits to account
- **Deepgram**: Usually $200 free credits should be sufficient

#### "Rate Limited" Errors
- **Wait and retry** - most rate limits are temporary
- **Check usage** in provider dashboards
- **Consider upgrading** API tiers for higher limits

### Provider-Specific Issues

#### OpenAI Issues
- **Free accounts**: Cannot access API - add billing method
- **Organization access**: Ensure API key has correct organization permissions
- **Model access**: Some models require tier upgrades

#### Anthropic Issues
- **Credit depletion**: Add more credits when balance is low
- **Regional restrictions**: Some regions may have limited access

#### Deepgram Issues
- **Free credit expiry**: Credits may expire after a period
- **Model availability**: Ensure selected model is available in your region

### Testing Individual Components
```bash
# Test only transcription (no summary)
GENERATE_SUMMARY=false npm start

# Test only OpenAI services
AI_SERVICE=OPENAI VOICE_TRANSCRIPTION_SERVICE=OPENAI npm start

# Test only Anthropic summary
AI_SERVICE=ANTHROPIC npm start
```

## Related Pages
- [Configuration](Configuration) - Complete environment variable reference
- [Installation Guide](Installation-Guide) - Initial setup instructions
- [Troubleshooting](Troubleshooting) - Common issues and solutions
- [Docker Deployment](Docker-Deployment) - Containerized setup with secrets

---

**Need help?** Check the [Troubleshooting](Troubleshooting) page or [open an issue](https://github.com/nerveband/wa-transcript/issues).