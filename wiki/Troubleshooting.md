# Troubleshooting

Comprehensive guide to diagnosing and resolving common issues with WhatsApp Voice Transcription.

## Table of Contents
- [Quick Diagnostics](#quick-diagnostics)
- [Connection Issues](#connection-issues)
- [Authentication Problems](#authentication-problems)
- [Audio Processing Issues](#audio-processing-issues)
- [API and Rate Limiting](#api-and-rate-limiting)
- [Memory and Performance Issues](#memory-and-performance-issues)
- [Log Analysis](#log-analysis)
- [Debug Mode](#debug-mode)
- [Getting Help](#getting-help)

## Quick Diagnostics

### Check Application Status
```bash
# Check if application is running
ps aux | grep node

# Check logs for obvious errors
npm start 2>&1 | head -20

# Quick connectivity test
ping -c 3 web.whatsapp.com
```

### Environment Validation
```bash
# Verify Node.js version
node --version  # Should be 18.0.0+

# Check environment variables
env | grep -E "(OPENAI|DEEPGRAM|ANTHROPIC|WHATSAPP)"

# Verify .env file exists and is readable
ls -la .env && head -5 .env
```

## Connection Issues

### "Cannot Connect to WhatsApp" Errors

#### Symptom
```
Connection error: Unable to connect to WhatsApp servers
WebSocket connection failed
Connection timeout after 30 seconds
```

#### Diagnosis
```bash
# Test WhatsApp Web connectivity
curl -I https://web.whatsapp.com/

# Check DNS resolution
nslookup web.whatsapp.com

# Test WebSocket connectivity
curl --include \
     --no-buffer \
     --header "Connection: Upgrade" \
     --header "Upgrade: websocket" \
     --header "Sec-WebSocket-Key: SGVsbG8sIHdvcmxkIQ==" \
     --header "Sec-WebSocket-Version: 13" \
     https://web.whatsapp.com/ws
```

#### Solutions
1. **Check Internet Connection**
   ```bash
   # Test general connectivity
   ping -c 4 8.8.8.8
   curl -I https://google.com
   ```

2. **Firewall/Proxy Issues**
   ```bash
   # Configure proxy if needed
   export HTTP_PROXY=http://proxy.company.com:8080
   export HTTPS_PROXY=http://proxy.company.com:8080
   ```

3. **Server Environment Settings**
   ```env
   # In .env file
   SERVER_ENV=true  # For headless servers
   AUTH_METHOD=PAIRING_CODE  # More reliable for servers
   ```

### "405 Method Not Allowed" Errors

#### Symptom
```
HTTP 405: Method Not Allowed
WhatsApp Web returned 405 error
IP address may be blocked
```

#### Cause
WhatsApp blocks certain IP ranges, especially from:
- Known VPN/proxy providers
- Some cloud hosting providers
- Data centers with poor reputation

#### Solutions
1. **Try Different Server Location**
   - Europe: Germany, Netherlands, UK
   - North America: US East Coast, Canada
   - Asia: Singapore, Japan

2. **Use Authentication Transfer**
   - Authenticate locally first
   - Transfer session to server
   - See [Authentication Transfer](Authentication-Transfer) guide

3. **Use Residential IP/VPN**
   ```bash
   # Install and configure VPN client
   sudo apt install openvpn
   # Configure with residential IP provider
   ```

## Authentication Problems

### QR Code Issues

#### QR Code Not Displaying
```bash
# Check terminal size
tput lines && tput cols  # Should be at least 25x80

# Try different terminal
export TERM=xterm-256color
npm start
```

#### QR Code Scan Fails
- Ensure good lighting
- Clean camera lens
- Try different angles
- Make terminal window larger
- Restart application for new QR code

### Pairing Code Issues

#### "Invalid Phone Number Format"
```env
# Wrong formats ❌
WHATSAPP_PHONE_NUMBER=+1234567890
WHATSAPP_PHONE_NUMBER=1-234-567-890

# Correct format ✅
WHATSAPP_PHONE_NUMBER=1234567890  # E.164 without +
```

#### "Pairing Code Expired"
```bash
# Codes expire after 2-3 minutes
# Restart application to generate new code
pm2 restart whatsapp-transcript
# Or
npm start
```

### Authentication Loss

#### "Session Terminated" Errors
```bash
# Check authentication files
ls -la auth_info_baileys/

# Look for corruption
file auth_info_baileys/creds.json

# If corrupted, remove and re-authenticate
rm -rf auth_info_baileys/
npm start
```

#### Frequent Re-authentication Required
1. **Check file permissions**
   ```bash
   chmod 700 auth_info_baileys/
   chmod 600 auth_info_baileys/*
   ```

2. **Verify persistent storage**
   ```bash
   # For Docker deployments
   docker volume inspect wa-transcript_auth_data
   ```

3. **WhatsApp multi-device limits**
   - WhatsApp allows max 4 linked devices
   - Unlink old devices in WhatsApp settings

## Audio Processing Issues

### "Audio Download Failed" Errors

#### Symptom
```
Failed to download audio message
Error processing voice message
Invalid audio format received
```

#### Diagnosis
```bash
# Check available disk space
df -h

# Verify temp directory permissions
ls -la /tmp/

# Test audio processing libraries
node -e "console.log(require('fs').existsSync('/usr/bin/ffmpeg'))"
```

#### Solutions
1. **Install Audio Dependencies**
   ```bash
   # Ubuntu/Debian
   sudo apt install -y ffmpeg libavcodec-extra

   # macOS
   brew install ffmpeg

   # Check installation
   ffmpeg -version
   ```

2. **Free Disk Space**
   ```bash
   # Clean npm cache
   npm cache clean --force

   # Clean temporary files
   sudo apt autoremove
   sudo apt autoclean
   ```

### Transcription Failures

#### "Transcription Service Error"
```bash
# Test API connectivity
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models

curl -H "Authorization: Token $DEEPGRAM_API_KEY" \
     https://api.deepgram.com/v1/projects
```

#### "Audio Format Not Supported"
- WhatsApp typically sends .ogg Opus files
- Ensure ffmpeg supports Opus codec
- Check audio file isn't corrupted

## API and Rate Limiting

### API Rate Limits

#### OpenAI Rate Limits
```
Error: Rate limit exceeded for requests
Wait time: 20s
```

**Solutions:**
1. **Check usage tier**
   - Visit OpenAI platform billing page
   - Upgrade to higher tier if needed

2. **Implement backoff**
   ```env
   # Reduce concurrent requests in code
   # Add delays between API calls
   ```

#### Anthropic Rate Limits
```
Error: 429 Too Many Requests
Retry after: 60 seconds
```

**Solutions:**
1. **Monitor credits**
   - Check Anthropic console for remaining credits
   - Add more credits if needed

2. **Optimize model usage**
   ```env
   # Use cheaper model
   ANTHROPIC_MODEL=claude-3-5-haiku-latest
   ```

### API Key Issues

#### "Invalid API Key"
```bash
# Verify key format
echo $OPENAI_API_KEY | grep -E "^sk-"
echo $ANTHROPIC_API_KEY | grep -E "^sk-ant-"
echo $DEEPGRAM_API_KEY | wc -c  # Should be ~40 characters

# Test individual keys
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models
```

#### "Insufficient Quota"
- **OpenAI**: Add payment method and billing
- **Anthropic**: Add more credits to account
- **Deepgram**: Check remaining free credits

## Memory and Performance Issues

### High Memory Usage

#### Symptoms
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head -10
```

#### Solutions
1. **Restart Application Periodically**
   ```bash
   # Add to crontab for daily restart
   0 3 * * * pm2 restart whatsapp-transcript
   ```

2. **Optimize Node.js Memory**
   ```bash
   # Increase Node.js heap size
   export NODE_OPTIONS="--max-old-space-size=2048"
   npm start
   ```

3. **Monitor for Memory Leaks**
   ```bash
   # Use PM2 monitoring
   pm2 install pm2-server-monit
   pm2 monit
   ```

### CPU Performance Issues

#### High CPU Usage
```bash
# Identify CPU-intensive processes
top -p $(pgrep -f "node")

# Check if transcription queue is backed up
# Review logs for processing delays
```

#### Solutions
1. **Limit Concurrent Processing**
   ```env
   # Reduce simultaneous audio processing
   # Implement queue system for high volume
   ```

2. **Optimize AI Model Selection**
   ```env
   # Use faster models
   OPENAI_MODEL=gpt-4o-mini  # Faster than gpt-4o
   DEEPGRAM_MODEL=nova-2     # Faster than nova-3
   ```

## Log Analysis

### Enable Debug Logging
```bash
# Set debug environment
export DEBUG=*
npm start

# Or specific modules
export DEBUG=whatsapp:*,baileys:*
npm start
```

### Common Log Patterns

#### Successful Operation
```
✅ Connected to WhatsApp
📱 Received voice message from +1234567890
🎙️ Transcription: "Hello, this is a test message"
📝 Summary: "User sent a greeting"
✅ Response sent successfully
```

#### Connection Problems
```
❌ WebSocket connection failed
⚠️ Retrying connection (attempt 2/5)
❌ Authentication failed: Session expired
🔄 Regenerating QR code
```

#### API Issues
```
❌ OpenAI API error: Rate limit exceeded
⚠️ Retrying in 60 seconds
❌ Deepgram error: Invalid audio format
⚠️ Fallback to OpenAI Whisper
```

### Log File Locations
```bash
# PM2 logs
pm2 logs whatsapp-transcript

# Systemd logs
sudo journalctl -u whatsapp-transcript -f

# Application logs (if configured)
tail -f logs/app.log
tail -f logs/error.log
```

## Debug Mode

### Enable Comprehensive Debugging
```bash
# Create debug configuration
cat > debug.env << EOF
NODE_ENV=development
DEBUG=*
LOG_LEVEL=debug
VERBOSE_LOGGING=true
EOF

# Start with debug config
NODE_OPTIONS="--inspect" npm start
```

### Network Debugging
```bash
# Capture network traffic
sudo tcpdump -i any host web.whatsapp.com -w whatsapp_traffic.pcap

# Analyze with Wireshark or
tcpdump -r whatsapp_traffic.pcap -A
```

### Code-Level Debugging
```bash
# Start with Node.js inspector
node --inspect index.js

# Connect with Chrome DevTools
# Open chrome://inspect in Chrome browser
```

## Getting Help

### Before Seeking Help
1. **Check this troubleshooting guide** thoroughly
2. **Search existing issues** on GitHub
3. **Gather diagnostic information**:
   ```bash
   # System info
   uname -a
   node --version
   npm --version
   
   # Application logs
   pm2 logs whatsapp-transcript --lines 100 > debug.log
   
   # Environment info
   env | grep -E "(OPENAI|DEEPGRAM|ANTHROPIC|NODE)" > env.log
   ```

### Creating a Good Issue Report
Include these details:
- **OS and version** (Ubuntu 22.04, macOS 13, etc.)
- **Node.js version** (`node --version`)
- **Deployment method** (local, Docker, VPS)
- **Authentication method** (QR_CODE, PAIRING_CODE)
- **Complete error message** with stack trace
- **Steps to reproduce** the issue
- **Configuration** (sanitized .env file)
- **Recent logs** (last 50-100 lines)

### Support Channels
1. **GitHub Issues** - [Report bugs](https://github.com/nerveband/wa-transcript/issues)
2. **GitHub Discussions** - [Community support](https://github.com/nerveband/wa-transcript/discussions)
3. **Wiki Pages** - Check related documentation:
   - [Configuration](Configuration) - Settings issues
   - [Authentication Transfer](Authentication-Transfer) - Auth problems
   - [Server Deployment](Server-Deployment) - Server issues
   - [Docker Deployment](Docker-Deployment) - Container issues

### Emergency Recovery
If completely broken:
```bash
# Nuclear option - complete reset
rm -rf auth_info_baileys/
rm -rf node_modules/
rm package-lock.json
npm install
npm start
```

## Related Pages
- [Configuration](Configuration) - Settings and environment variables
- [WhatsApp Authentication](WhatsApp-Authentication) - Authentication methods
- [API Keys Setup](API-Keys-Setup) - API configuration issues
- [Server Deployment](Server-Deployment) - Server-specific problems
- [Docker Deployment](Docker-Deployment) - Container troubleshooting

---

**Still need help?** [Open an issue](https://github.com/nerveband/wa-transcript/issues) with your diagnostic information.