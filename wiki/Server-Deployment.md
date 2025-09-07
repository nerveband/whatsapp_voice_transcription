# Server Deployment

Complete guide for deploying WhatsApp Voice Transcription on VPS and cloud servers.

## Table of Contents
- [Server Requirements](#server-requirements)
- [Server Environment Setup](#server-environment-setup)
- [Security Configuration](#security-configuration)
- [Deployment Process](#deployment-process)
- [IP Blocking Issues](#ip-blocking-issues)
- [Environment-Specific Configurations](#environment-specific-configurations)
- [Auto-Restart Setup](#auto-restart-setup)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Server Requirements

### Minimum System Requirements
- **CPU**: 1 vCore (2+ recommended)
- **RAM**: 512MB (1GB+ recommended)
- **Storage**: 2GB free space (5GB+ recommended)
- **OS**: Ubuntu 20.04+, CentOS 8+, or Debian 11+
- **Network**: Stable internet connection, ports 80/443 open

### Recommended Cloud Providers
| Provider | Instance Type | Monthly Cost | Notes |
|----------|--------------|--------------|-------|
| **DigitalOcean** | Basic Droplet (1GB) | $6 | Simple, developer-friendly |
| **Linode** | Nanode 1GB | $5 | Good performance/price ratio |
| **Vultr** | Regular Performance 1GB | $6 | Global locations |
| **AWS EC2** | t3.micro (1GB) | $8-12 | Free tier available |
| **Google Cloud** | e2-micro | $6-10 | $300 free credits |
| **Hetzner** | CX11 (1GB) | $3.79 | Best price in EU |

## Server Environment Setup

### 1. Initial Server Setup
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git htop nano ufw fail2ban

# Create application user
sudo useradd -m -s /bin/bash whatsapp
sudo usermod -aG sudo whatsapp
```

### 2. Install Node.js
```bash
# Install Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version
```

### 3. Configure Firewall
```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Check status
sudo ufw status
```

### 4. Secure SSH Access
```bash
# Generate SSH key pair (on your local machine)
ssh-keygen -t ed25519 -C "whatsapp-server"

# Copy public key to server (replace with your server IP)
ssh-copy-id -i ~/.ssh/id_ed25519.pub whatsapp@YOUR_SERVER_IP

# Secure SSH configuration
sudo nano /etc/ssh/sshd_config
```

Add these security settings:
```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
Port 2222  # Change default SSH port
Protocol 2
```

```bash
# Restart SSH service
sudo systemctl restart sshd
```

## Security Configuration

### 1. Fail2Ban Setup
```bash
# Install and configure Fail2Ban
sudo apt install -y fail2ban

# Create jail configuration
sudo nano /etc/fail2ban/jail.local
```

Add configuration:
```ini
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port = 2222
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
```

```bash
# Start and enable Fail2Ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 2. Additional Security Measures
```bash
# Install and configure unattended upgrades
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Configure automatic security updates
echo 'Unattended-Upgrade::Automatic-Reboot "false";' | sudo tee -a /etc/apt/apt.conf.d/50unattended-upgrades
```

## Deployment Process

### 1. Application Deployment
```bash
# Switch to application user
sudo su - whatsapp

# Clone repository
git clone https://github.com/nerveband/wa-transcript.git
cd wa-transcript

# Install dependencies
npm install --only=production

# Copy and configure environment
cp .env.example .env
nano .env
```

### 2. Configure for Server Environment
```env
# Server-specific configuration
AUTH_METHOD=PAIRING_CODE
WHATSAPP_PHONE_NUMBER=12345678901
SERVER_ENV=true

# API Keys
OPENAI_API_KEY=your_key_here
DEEPGRAM_API_KEY=your_key_here

# Service configuration
VOICE_TRANSCRIPTION_SERVICE=DEEPGRAM
AI_SERVICE=OPENAI
GENERATE_SUMMARY=true
```

### 3. Test Deployment
```bash
# Test the application
npm start

# Look for successful startup messages
# Ctrl+C to stop after testing
```

## IP Blocking Issues

WhatsApp may block connections from certain server IP ranges. Here's how to handle this:

### 1. Detection
Signs of IP blocking:
```bash
# Common error messages:
Connection error: 405 Method Not Allowed
Connection closed: Connection terminated
Unable to connect to WhatsApp servers
```

### 2. Solutions

#### Option A: Use Different Server Location
```bash
# Try servers in these regions (generally better success):
# - Europe (Germany, Netherlands, UK)  
# - North America (US East Coast, Canada)
# - Asia (Singapore, Japan)

# Avoid these regions (often blocked):
# - Some US West Coast data centers
# - Some Asian cloud providers
# - Known VPN/proxy IP ranges
```

#### Option B: Residential IP/VPN
```bash
# Use residential IP service
# Configure VPN on server for WhatsApp connections only
# Route other traffic directly

# Example with WireGuard VPN
sudo apt install wireguard
# Configure with residential VPN provider
```

#### Option C: Authentication Transfer
The most reliable approach is to authenticate locally first:

1. **Authenticate locally** using QR_CODE method
2. **Transfer authentication** to server (see [Authentication Transfer](Authentication-Transfer))
3. **Server uses existing session** without new connection

### 3. Testing IP Compatibility
```bash
# Test WhatsApp Web access from server
curl -I https://web.whatsapp.com/

# Should return 200 OK, not 405 Method Not Allowed
# If blocked, you'll see 405 or connection timeout
```

## Environment-Specific Configurations

### Ubuntu 20.04/22.04 LTS
```bash
# Recommended setup
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs build-essential
```

### CentOS/RHEL 8+
```bash
# RHEL-based systems
sudo dnf update -y
sudo dnf install -y nodejs npm git curl wget
# OR use Node.js installer
```

### Debian 11+
```bash
# Debian setup
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### Alpine Linux (Docker-friendly)
```bash
# Minimal Alpine setup
apk add --no-cache nodejs npm git curl
```

## Auto-Restart Setup

### 1. Using PM2 (Recommended)
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start application with PM2
pm2 start npm --name "whatsapp-transcript" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command provided by PM2 startup

# Monitor application
pm2 status
pm2 logs whatsapp-transcript
```

### 2. Using Systemd Service
```bash
# Create systemd service file
sudo nano /etc/systemd/system/whatsapp-transcript.service
```

Add service configuration:
```ini
[Unit]
Description=WhatsApp Voice Transcription
After=network.target

[Service]
Type=simple
User=whatsapp
WorkingDirectory=/home/whatsapp/wa-transcript
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=whatsapp-transcript

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable whatsapp-transcript
sudo systemctl start whatsapp-transcript

# Check status
sudo systemctl status whatsapp-transcript
```

### 3. Using Docker with Restart Policies
```yaml
# docker-compose.yml
services:
  whatsapp-transcription:
    restart: unless-stopped
    # ... other configuration
```

## Monitoring and Maintenance

### 1. Log Management
```bash
# View application logs
pm2 logs whatsapp-transcript

# System logs
sudo journalctl -u whatsapp-transcript -f

# Configure log rotation
sudo nano /etc/logrotate.d/whatsapp-transcript
```

Add log rotation configuration:
```
/home/whatsapp/wa-transcript/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
```

### 2. Health Monitoring
```bash
# Create health check script
nano ~/health-check.sh
```

```bash
#!/bin/bash
# Simple health check script

APP_NAME="whatsapp-transcript"
LOG_FILE="/home/whatsapp/health.log"

if pm2 describe $APP_NAME | grep -q "online"; then
    echo "$(date): $APP_NAME is running" >> $LOG_FILE
else
    echo "$(date): $APP_NAME is DOWN - restarting" >> $LOG_FILE
    pm2 restart $APP_NAME
fi
```

```bash
# Make executable and add to crontab
chmod +x ~/health-check.sh
crontab -e

# Add line to check every 5 minutes:
# */5 * * * * /home/whatsapp/health-check.sh
```

### 3. Resource Monitoring
```bash
# Monitor system resources
htop

# Monitor disk usage
df -h

# Monitor application resource usage
pm2 monit
```

### 4. Update Process
```bash
# Regular update procedure
cd /home/whatsapp/wa-transcript
git pull origin main
npm install --only=production
pm2 restart whatsapp-transcript

# Check application status
pm2 status
pm2 logs whatsapp-transcript --lines 50
```

## Troubleshooting

### Common Server Issues

#### Connection Problems
```bash
# Test internet connectivity
ping -c 4 google.com

# Test DNS resolution
nslookup web.whatsapp.com

# Check if ports are blocked
telnet web.whatsapp.com 443
```

#### Performance Issues
```bash
# Check memory usage
free -h

# Check disk space
df -h

# Check CPU usage
top

# Monitor application resources
pm2 monit
```

#### Authentication Issues
```bash
# Check authentication files
ls -la auth_info_baileys/

# Verify permissions
stat auth_info_baileys/

# Check logs for authentication errors
pm2 logs whatsapp-transcript | grep -i auth
```

### Provider-Specific Issues

#### DigitalOcean
- Some IP ranges may be blocked by WhatsApp
- Try different regions (Frankfurt, Amsterdam work well)
- Enable floating IPs for better reliability

#### AWS EC2
- Ensure security groups allow outbound HTTPS (port 443)
- Some data centers have better success rates
- Consider using Elastic IP

#### Google Cloud
- Default VPC usually works well
- Ensure firewall rules don't block WhatsApp servers
- Consider using specific regions (us-central1, europe-west1)

### Recovery Procedures

#### Application Won't Start
```bash
# Check logs
pm2 logs whatsapp-transcript

# Clear PM2 processes
pm2 delete all
pm2 start npm --name "whatsapp-transcript" -- start

# Check environment variables
env | grep -E "(OPENAI|DEEPGRAM|ANTHROPIC)"
```

#### Lost Authentication
```bash
# Stop application
pm2 stop whatsapp-transcript

# Remove old authentication
rm -rf auth_info_baileys/

# Restart and re-authenticate
pm2 start whatsapp-transcript
pm2 logs whatsapp-transcript
```

## Related Pages
- [WhatsApp Authentication](WhatsApp-Authentication) - Authentication methods
- [Authentication Transfer](Authentication-Transfer) - Moving auth from local to server
- [Docker Deployment](Docker-Deployment) - Alternative deployment method
- [PM2 Setup](PM2-Setup) - Detailed PM2 configuration
- [Configuration](Configuration) - Server-specific settings
- [Troubleshooting](Troubleshooting) - Detailed issue resolution

---

**Need help?** Check the [Troubleshooting](Troubleshooting) page or [open an issue](https://github.com/nerveband/wa-transcript/issues).