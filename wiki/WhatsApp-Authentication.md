# WhatsApp Authentication

Complete guide to authenticating your WhatsApp account with the Voice Transcription application.

## Table of Contents
- [Authentication Methods Overview](#authentication-methods-overview)
- [QR Code Authentication](#qr-code-authentication)
- [Pairing Code Authentication](#pairing-code-authentication)
- [When to Use Each Method](#when-to-use-each-method)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

## Authentication Methods Overview

WhatsApp Voice Transcription supports two authentication methods:

| Method | Best For | Requirements | Difficulty |
|--------|----------|-------------|------------|
| **QR Code** | Desktop/Local use | Physical access to device | Easy |
| **Pairing Code** | Server deployment | Phone number in .env | Medium |

Both methods establish a secure connection between your WhatsApp account and the application.

## QR Code Authentication

### Configuration
Set up QR code authentication in your `.env` file:

```env
AUTH_METHOD=QR_CODE
SERVER_ENV=false
```

### Step-by-Step Process

#### 1. Start the Application
```bash
npm start
```

#### 2. QR Code Generation
The application will generate a QR code in your terminal:
```
WhatsApp Voice Transcription starting...
Connecting to WhatsApp...
QR Code generated - scan with your phone
```

#### 3. Scan with WhatsApp
1. Open **WhatsApp** on your phone
2. Tap the **three dots** (Android) or **Settings** (iOS)
3. Select **Linked Devices**
4. Tap **Link a Device**
5. **Scan the QR code** displayed in your terminal

#### 4. Successful Connection
Once scanned, you'll see:
```
QR code scanned successfully
Connected to WhatsApp
Authentication saved to: ./auth_info_baileys/
Ready to receive voice messages!
```

### QR Code Tips
- **QR codes expire** after ~20 seconds - refresh if needed
- Ensure **good lighting** for scanning
- **Terminal size** affects QR readability - make it larger if needed
- QR codes work only when **physically present** at the device

## Pairing Code Authentication

### Configuration
Set up pairing code authentication in your `.env` file:

```env
AUTH_METHOD=PAIRING_CODE
WHATSAPP_PHONE_NUMBER=12345678901
SERVER_ENV=true
```

> **Important**: Phone number must be in E.164 format without the plus sign.  
> Example: US number +1-234-567-8901 becomes `12345678901`

### Step-by-Step Process

#### 1. Start the Application
```bash
npm start
```

#### 2. Pairing Code Generation
The application will generate a pairing code:
```
WhatsApp Voice Transcription starting...
Connecting to WhatsApp...
Pairing code: ABC-123-DEF
Enter this code in WhatsApp on your phone
```

#### 3. Enter Code in WhatsApp
1. Open **WhatsApp** on your phone
2. Tap the **three dots** (Android) or **Settings** (iOS)
3. Select **Linked Devices**
4. Tap **Link a Device**
5. Select **Link with phone number instead**
6. **Enter the pairing code** displayed in your terminal

#### 4. Successful Connection
Once the code is entered, you'll see:
```
Pairing code accepted
Connected to WhatsApp
Authentication saved to: ./auth_info_baileys/
Ready to receive voice messages!
```

### Pairing Code Tips
- **Codes expire** after a few minutes - restart if expired
- Ensure **phone number format** is correct in `.env`
- **Server environment** should be set to `true` for headless servers
- No physical access to server required

## When to Use Each Method

### Use QR Code When:
- ✅ Running on your **local machine**
- ✅ You have **physical access** to the device
- ✅ **Desktop/laptop** development
- ✅ **Testing and development** scenarios
- ✅ **Personal use** applications

### Use Pairing Code When:
- ✅ Running on a **headless server**
- ✅ **VPS/Cloud deployment**
- ✅ **Docker containers**
- ✅ **Remote server** without display
- ✅ **Production deployments**
- ✅ **Automated deployments**

## Security Considerations

### Authentication Data Storage
Both methods create authentication data in `./auth_info_baileys/`:
```
auth_info_baileys/
├── creds.json          # Encrypted credentials
├── keys.json           # Session keys
└── app-state-sync-*.json  # WhatsApp state sync
```

### Security Best Practices

#### File Permissions
```bash
# Secure authentication directory
chmod 700 auth_info_baileys/
chmod 600 auth_info_baileys/*
```

#### Backup Authentication
```bash
# Backup authentication data
tar -czf whatsapp_auth_backup.tar.gz auth_info_baileys/
```

#### Server Deployment Security
- Never commit `auth_info_baileys/` to version control
- Use secure file transfer (SCP/SFTP) for auth transfer
- Set restrictive file permissions on servers
- Consider encrypted backups for production

### Privacy Notes
- Authentication establishes a **linked device** connection
- The app can **receive messages** but respects WhatsApp's encryption
- **Audio files** are sent to AI services for transcription
- **No message content** is stored locally beyond processing

## Troubleshooting

### Common QR Code Issues

#### QR Code Not Displaying
```bash
# Terminal too small
# Solution: Resize terminal window larger
```

#### QR Code Scanning Fails
- Check **lighting conditions**
- Try **different phone angles**
- Ensure QR code is **complete in terminal**
- **Restart app** to generate new QR code

#### "QR Code Expired"
```bash
# QR codes expire after ~20 seconds
# Solution: Wait for automatic regeneration or restart app
```

### Common Pairing Code Issues

#### "Invalid Phone Number"
```env
# Wrong format
WHATSAPP_PHONE_NUMBER=+12345678901  # ❌ Don't include +

# Correct format
WHATSAPP_PHONE_NUMBER=12345678901   # ✅ E.164 without +
```

#### "Pairing Code Expired"
```bash
# Codes expire after a few minutes
# Solution: Restart the application to generate new code
```

#### Connection Errors
```bash
# Try setting server environment
SERVER_ENV=true

# Check internet connectivity
# Verify firewall settings
```

### Authentication Transfer Issues
See [Authentication Transfer](Authentication-Transfer) for detailed transfer troubleshooting.

### General Connection Issues
- **Internet connectivity**: Verify stable connection
- **Firewall settings**: Ensure WhatsApp servers aren't blocked
- **WhatsApp status**: Check if WhatsApp Web is working
- **Rate limiting**: Wait if you've tried multiple times recently

## Next Steps

After successful authentication:

1. **Test the Connection**
   - Send a voice note to your WhatsApp
   - Verify transcription works

2. **Choose Deployment Method**
   - [Docker Deployment](Docker-Deployment) for containerized setup
   - [Server Deployment](Server-Deployment) for VPS/cloud
   - [PM2 Setup](PM2-Setup) for process management

3. **Transfer Authentication** (if deploying to server)
   - Follow [Authentication Transfer](Authentication-Transfer) guide

4. **Configure Advanced Settings**
   - Review [Configuration](Configuration) options
   - Set up [API Keys](API-Keys-Setup) if not done

## Related Pages
- [Authentication Transfer](Authentication-Transfer) - Moving auth between devices
- [Authentication Troubleshooting](Authentication-Troubleshooting) - Detailed troubleshooting
- [Installation Guide](Installation-Guide) - Initial setup
- [Configuration](Configuration) - Environment variables
- [Server Deployment](Server-Deployment) - Server-specific setup

---

**Need help?** Check [Authentication Troubleshooting](Authentication-Troubleshooting) for detailed issue resolution.