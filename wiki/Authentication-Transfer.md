# Authentication Transfer

Guide for transferring WhatsApp authentication between devices - the recommended approach for server deployment.

## Table of Contents
- [Why Transfer Authentication](#why-transfer-authentication)
- [Prerequisites](#prerequisites)
- [Step-by-Step Transfer Process](#step-by-step-transfer-process)
- [Local to Server Transfer](#local-to-server-transfer)
- [Verification Steps](#verification-steps)
- [Common Transfer Issues](#common-transfer-issues)
- [Security Considerations](#security-considerations)

## Why Transfer Authentication

Authentication transfer is the **recommended approach** for server deployment because:

✅ **Avoids IP blocking** - WhatsApp may block server IP addresses  
✅ **Higher success rate** - Local authentication usually works reliably  
✅ **Better stability** - Established sessions are more stable  
✅ **Easier troubleshooting** - Isolates connection issues from auth issues

### Recommended Workflow
1. **Authenticate locally** using QR_CODE method
2. **Transfer authentication data** to server
3. **Server uses existing session** without new connection

## Prerequisites

### Local Machine
- **Working WhatsApp authentication** (completed QR code scan)
- **SSH/SCP access** to target server
- **Terminal access** for file operations

### Target Server
- **WhatsApp Voice Transcription** installed
- **Same Node.js version** as local machine
- **SSH access** configured
- **Proper file permissions** set

## Step-by-Step Transfer Process

### 1. Authenticate Locally First
On your local machine:

```bash
# Start application with QR code method
AUTH_METHOD=QR_CODE npm start

# Scan QR code with your phone
# Wait for successful connection message
# Stop application once connected (Ctrl+C)
```

Verify authentication files were created:
```bash
ls -la auth_info_baileys/
# Should show: creds.json, keys.json, app-state-sync-*.json
```

### 2. Prepare Authentication Data
Create secure backup of authentication data:

```bash
# Create compressed backup
tar -czf whatsapp_auth_$(date +%Y%m%d_%H%M%S).tar.gz auth_info_baileys/

# Verify backup contents
tar -tzf whatsapp_auth_*.tar.gz

# Check backup size (should be small, few KB)
ls -lh whatsapp_auth_*.tar.gz
```

### 3. Transfer to Server
Choose your preferred transfer method:

#### Option A: SCP Transfer
```bash
# Copy authentication backup to server
scp whatsapp_auth_*.tar.gz user@your-server:/home/user/

# Or direct directory transfer
scp -r auth_info_baileys/ user@your-server:/home/user/wa-transcript/
```

#### Option B: SFTP Transfer
```bash
# Connect via SFTP
sftp user@your-server

# Upload backup
put whatsapp_auth_*.tar.gz

# Exit SFTP
exit
```

#### Option C: rsync Transfer
```bash
# Sync authentication directory
rsync -avz auth_info_baileys/ user@your-server:/home/user/wa-transcript/auth_info_baileys/
```

## Local to Server Transfer

### Detailed Server Setup

#### 1. Connect to Server
```bash
# SSH to your server
ssh user@your-server

# Navigate to application directory
cd /home/user/wa-transcript
```

#### 2. Extract Authentication Data
```bash
# If you uploaded the tar.gz backup
tar -xzf ~/whatsapp_auth_*.tar.gz

# Verify extraction
ls -la auth_info_baileys/
```

#### 3. Set Proper Permissions
```bash
# Set directory permissions
chmod 700 auth_info_baileys/

# Set file permissions
chmod 600 auth_info_baileys/*

# Verify ownership
ls -la auth_info_baileys/
```

#### 4. Configure for Server Environment
Update `.env` file on server:

```env
# Server-specific authentication settings
AUTH_METHOD=PAIRING_CODE  # Fallback method
WHATSAPP_PHONE_NUMBER=12345678901
SERVER_ENV=true

# Other configuration...
VOICE_TRANSCRIPTION_SERVICE=DEEPGRAM
AI_SERVICE=OPENAI
GENERATE_SUMMARY=true
```

#### 5. Test Server Connection
```bash
# Start application on server
npm start

# Look for successful connection message:
# "Connected to WhatsApp"
# "Ready to receive voice messages!"
```

## Verification Steps

### 1. Connection Verification
On the server, check for these success indicators:

```bash
# Start application and monitor logs
npm start 2>&1 | tee startup.log

# Look for success messages:
# ✅ WhatsApp authentication loaded
# ✅ Connected to WhatsApp
# ✅ Ready to receive voice messages
```

### 2. Functionality Test
```bash
# Send a test voice message to your WhatsApp
# Check server logs for processing:
# 📱 Received voice message from +1234567890
# 🎙️ Transcription: "Test message"
# 📝 Summary: "User sent a test"
```

### 3. Authentication Persistence
```bash
# Stop and restart application
# Verify it connects without re-authentication
pm2 restart whatsapp-transcript

# Check logs
pm2 logs whatsapp-transcript
```

## Common Transfer Issues

### Authentication Files Not Found
**Error**: `Authentication files not found, starting fresh authentication`

**Solutions**:
```bash
# Check if files exist
ls -la auth_info_baileys/

# Verify file contents (should not be empty)
ls -la auth_info_baileys/
wc -l auth_info_baileys/*.json

# Check permissions
stat auth_info_baileys/creds.json
```

### Permission Denied Errors
**Error**: `EACCES: permission denied, open 'auth_info_baileys/creds.json'`

**Solutions**:
```bash
# Fix ownership
sudo chown -R $USER:$USER auth_info_baileys/

# Fix permissions
chmod 700 auth_info_baileys/
chmod 600 auth_info_baileys/*
```

### Session Expired Errors
**Error**: `Session closed, reason: Connection terminated`

**Solutions**:
1. **Re-transfer fresh authentication** from local machine
2. **Check WhatsApp app** - ensure it's still linked to the device
3. **Wait and retry** - temporary WhatsApp server issues

### Node.js Version Mismatch
**Error**: `Unexpected token` or compatibility errors

**Solutions**:
```bash
# Check Node.js versions
# Local machine:
node --version

# Server:
ssh user@server 'node --version'

# Install matching version on server if different
```

### Corrupted Authentication Data
**Error**: `Invalid authentication data` or JSON parsing errors

**Solutions**:
```bash
# Check file integrity
file auth_info_baileys/*.json

# Validate JSON format
node -e "console.log(JSON.parse(require('fs').readFileSync('auth_info_baileys/creds.json')))"

# Re-transfer from local backup if corrupted
```

## Security Considerations

### File Security
```bash
# Secure permissions (readable only by owner)
chmod 700 auth_info_baileys/
chmod 600 auth_info_baileys/*

# Remove group/other access
chmod go-rwx auth_info_baileys/
```

### Transfer Security
```bash
# Use encrypted transfer methods
# ✅ SCP/SFTP over SSH
# ✅ rsync over SSH
# ❌ Avoid FTP, HTTP, email

# Delete local backup after successful transfer
rm whatsapp_auth_*.tar.gz
```

### Backup Strategy
```bash
# Create encrypted backup on server
gpg --symmetric --cipher-algo AES256 whatsapp_auth_backup.tar.gz

# Store backup securely
mv whatsapp_auth_backup.tar.gz.gpg ~/backups/
chmod 600 ~/backups/whatsapp_auth_backup.tar.gz.gpg
```

### Access Control
```bash
# Limit SSH access to specific users
# In /etc/ssh/sshd_config:
# AllowUsers username

# Use SSH keys instead of passwords
ssh-copy-id user@server
```

## Advanced Transfer Scenarios

### Multiple Server Deployment
WhatsApp allows **up to 4 linked devices**:

```bash
# You can transfer the same authentication to multiple servers
# But monitor for conflicts and rate limiting

# Server 1
scp -r auth_info_baileys/ user@server1:/path/to/app/

# Server 2 (same auth data)
scp -r auth_info_baileys/ user@server2:/path/to/app/
```

### Docker Container Transfer
```bash
# Copy to Docker host
scp -r auth_info_baileys/ user@docker-host:/opt/whatsapp/

# Mount in Docker container
docker run -v /opt/whatsapp/auth_info_baileys:/app/auth_info_baileys whatsapp-app
```

### Automated Transfer Script
```bash
#!/bin/bash
# transfer-auth.sh

SERVER="user@your-server"
REMOTE_PATH="/home/user/wa-transcript"

# Create backup
tar -czf auth_backup.tar.gz auth_info_baileys/

# Transfer to server
scp auth_backup.tar.gz $SERVER:~/

# Extract on server
ssh $SERVER "cd $REMOTE_PATH && tar -xzf ~/auth_backup.tar.gz && chmod 700 auth_info_baileys/ && chmod 600 auth_info_baileys/*"

# Clean up
rm auth_backup.tar.gz

echo "Authentication transfer completed"
```

## Troubleshooting Authentication Transfer

### Diagnostic Commands
```bash
# Check authentication file sizes
ls -lah auth_info_baileys/

# Verify JSON format
for file in auth_info_baileys/*.json; do
    echo "Checking $file"
    python3 -m json.tool "$file" > /dev/null && echo "✅ Valid JSON" || echo "❌ Invalid JSON"
done

# Test application startup
NODE_ENV=development npm start --verbose
```

### Recovery Process
If transfer fails:

1. **Delete corrupted auth data**:
   ```bash
   rm -rf auth_info_baileys/
   ```

2. **Re-authenticate locally** and transfer again
3. **Check server logs** for specific error messages
4. **Verify network connectivity** between local and server

## Related Pages
- [WhatsApp Authentication](WhatsApp-Authentication) - Authentication methods
- [Server Deployment](Server-Deployment) - Server setup guide
- [Authentication Troubleshooting](Authentication-Troubleshooting) - Detailed issue resolution
- [Configuration](Configuration) - Environment variables
- [Docker Deployment](Docker-Deployment) - Container deployment

---

**Need help?** Check [Authentication Troubleshooting](Authentication-Troubleshooting) for detailed issue resolution.