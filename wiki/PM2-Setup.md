# PM2 Setup

Complete guide for running WhatsApp Voice Transcription as a managed service using PM2.

## Table of Contents
- [PM2 Installation](#pm2-installation)
- [Process Configuration](#process-configuration)
- [Auto-Startup Configuration](#auto-startup-configuration)
- [Monitoring and Logging](#monitoring-and-logging)
- [Process Management Commands](#process-management-commands)
- [Advanced Configuration](#advanced-configuration)
- [Troubleshooting](#troubleshooting)

## PM2 Installation

### 1. Install PM2 Globally
```bash
# Install PM2 as global package
npm install -g pm2

# Verify installation
pm2 --version
```

### 2. Alternative Installation Methods
```bash
# Using yarn
yarn global add pm2

# Using specific Node.js version with nvm
nvm use 18
npm install -g pm2
```

## Process Configuration

### 1. Basic PM2 Start
```bash
# Navigate to project directory
cd /path/to/whatsapp_voice_transcription

# Start with PM2 using npm
pm2 start npm --name "whatsapp-transcript" -- start

# Or start index.js directly
pm2 start index.js --name "whatsapp-transcript"
```

### 2. PM2 Ecosystem File
Create `ecosystem.config.js` for advanced configuration:

```javascript
module.exports = {
  apps: [{
    name: 'whatsapp-transcript',
    script: 'index.js',
    
    // Basic settings
    instances: 1,
    exec_mode: 'fork',
    
    // Environment
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    
    // Restart policy
    restart_delay: 5000,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Logging
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Advanced options
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'auth_info_baileys'],
    
    // Memory management
    max_memory_restart: '300M',
    
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 8000,
    
    // Auto restart on file changes (development only)
    // watch: ['index.js', 'speech_to_text.js'],
  }]
};
```

### 3. Start with Ecosystem File
```bash
# Start using ecosystem configuration
pm2 start ecosystem.config.js

# Or specify environment
pm2 start ecosystem.config.js --env production
```

## Auto-Startup Configuration

### 1. Generate Startup Script
```bash
# Generate startup script for current user
pm2 startup

# For systemd (most modern Linux distributions)
pm2 startup systemd

# Follow the command provided by PM2 startup
# Usually something like:
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

### 2. Save Process List
```bash
# Start your application first
pm2 start ecosystem.config.js

# Save current process list
pm2 save

# This creates ~/.pm2/dump.pm2 file
```

### 3. Test Auto-Restart
```bash
# Reboot system and verify
sudo reboot

# After reboot, check if process started automatically
pm2 list
pm2 status whatsapp-transcript
```

## Monitoring and Logging

### 1. Process Monitoring
```bash
# List all processes
pm2 list

# Detailed status
pm2 status

# Real-time monitoring
pm2 monit

# Show process information
pm2 show whatsapp-transcript

# Process metrics
pm2 describe whatsapp-transcript
```

### 2. Log Management
```bash
# View logs
pm2 logs whatsapp-transcript

# View specific number of lines
pm2 logs whatsapp-transcript --lines 100

# Follow logs in real-time
pm2 logs whatsapp-transcript -f

# Clear logs
pm2 flush whatsapp-transcript

# Reload logs (after log rotation)
pm2 reloadLogs
```

### 3. Log Rotation Setup
```bash
# Install PM2 log rotate module
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss
pm2 set pm2-logrotate:rotateModule true
```

## Process Management Commands

### 1. Basic Commands
```bash
# Start application
pm2 start whatsapp-transcript

# Stop application
pm2 stop whatsapp-transcript

# Restart application
pm2 restart whatsapp-transcript

# Reload application (zero-downtime)
pm2 reload whatsapp-transcript

# Delete application from PM2
pm2 delete whatsapp-transcript

# Stop all applications
pm2 stop all

# Restart all applications
pm2 restart all
```

### 2. Advanced Management
```bash
# Graceful reload
pm2 gracefulReload whatsapp-transcript

# Scale application (create multiple instances)
pm2 scale whatsapp-transcript 2

# Reset restart counter
pm2 reset whatsapp-transcript

# Update PM2 itself
pm2 update

# Kill PM2 daemon
pm2 kill
```

### 3. Environment Management
```bash
# Start with specific environment
pm2 start ecosystem.config.js --env development
pm2 start ecosystem.config.js --env production

# Update environment variables
pm2 restart whatsapp-transcript --update-env
```

## Advanced Configuration

### 1. Multiple Environments
Update `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'whatsapp-transcript',
    script: 'index.js',
    
    // Development environment
    env: {
      NODE_ENV: 'development',
      DEBUG: '*'
    },
    
    // Production environment
    env_production: {
      NODE_ENV: 'production',
      SERVER_ENV: 'true',
      AUTH_METHOD: 'PAIRING_CODE'
    }
  }]
};
```

### 2. Cluster Mode
For CPU-intensive operations:

```javascript
module.exports = {
  apps: [{
    name: 'whatsapp-transcript',
    script: 'index.js',
    instances: 'max',  // Use all CPU cores
    exec_mode: 'cluster',
    
    // Load balancing
    instance_var: 'INSTANCE_ID'
  }]
};
```

### 3. Development vs Production
```javascript
module.exports = {
  apps: [{
    name: 'whatsapp-transcript',
    script: 'index.js',
    
    // Development settings
    env: {
      NODE_ENV: 'development',
      watch: true,
      ignore_watch: ['node_modules', 'logs'],
      restart_delay: 1000
    },
    
    // Production settings
    env_production: {
      NODE_ENV: 'production',
      watch: false,
      restart_delay: 5000,
      max_memory_restart: '500M'
    }
  }]
};
```

## Health Monitoring

### 1. Process Health Checks
```bash
# Create health check script
nano health-check.sh
```

```bash
#!/bin/bash
# health-check.sh

APP_NAME="whatsapp-transcript"
LOG_FILE="/var/log/whatsapp-health.log"

# Check if process is online
if pm2 describe $APP_NAME | grep -q "online"; then
    echo "$(date): $APP_NAME is healthy" >> $LOG_FILE
else
    echo "$(date): $APP_NAME is down - restarting" >> $LOG_FILE
    pm2 restart $APP_NAME
fi
```

```bash
# Make executable
chmod +x health-check.sh

# Add to crontab (check every 5 minutes)
crontab -e
# Add line:
# */5 * * * * /path/to/health-check.sh
```

### 2. Memory Monitoring
Add to ecosystem config:

```javascript
module.exports = {
  apps: [{
    name: 'whatsapp-transcript',
    script: 'index.js',
    
    // Auto-restart if memory usage exceeds limit
    max_memory_restart: '300M',
    
    // Monitor memory usage
    pmx: false
  }]
};
```

### 3. PM2 Plus Integration
```bash
# Connect to PM2 Plus for advanced monitoring
pm2 link <secret_key> <public_key>

# Or register new account
pm2 register
```

## Backup and Recovery

### 1. Backup PM2 Configuration
```bash
# Export PM2 process list
pm2 save

# Backup ecosystem file
cp ecosystem.config.js ecosystem.config.js.backup

# Backup startup configuration
sudo cp /etc/systemd/system/pm2-$USER.service /etc/systemd/system/pm2-$USER.service.backup
```

### 2. Recovery Process
```bash
# Restore from backup
pm2 resurrect

# Or start fresh from ecosystem
pm2 start ecosystem.config.js
pm2 save
```

## Troubleshooting

### Common PM2 Issues

#### "PM2 command not found"
```bash
# Check if PM2 is in PATH
which pm2

# If not found, install globally
npm install -g pm2

# Or add to PATH
export PATH=$PATH:/usr/local/lib/node_modules/pm2/bin
```

#### Process Won't Start
```bash
# Check PM2 logs
pm2 logs whatsapp-transcript

# Check ecosystem configuration
pm2 start ecosystem.config.js --no-daemon

# Validate ecosystem file
node -c ecosystem.config.js
```

#### Auto-Startup Not Working
```bash
# Check startup script
sudo systemctl status pm2-$USER

# Regenerate startup script
pm2 unstartup
pm2 startup
# Follow the provided command

# Save processes again
pm2 save
```

#### High Memory Usage
```bash
# Monitor memory usage
pm2 monit

# Set memory limit in ecosystem.config.js
max_memory_restart: '200M'

# Check for memory leaks
pm2 logs whatsapp-transcript | grep -i memory
```

#### Process Keeps Restarting
```bash
# Check restart count
pm2 list

# Check logs for errors
pm2 logs whatsapp-transcript --lines 200

# Increase restart delay
# In ecosystem.config.js:
restart_delay: 10000
```

### Performance Optimization

#### Log Management
```bash
# Reduce log verbosity in production
env_production: {
  LOG_LEVEL: 'warn',
  DEBUG: ''
}
```

#### Resource Limits
```javascript
module.exports = {
  apps: [{
    name: 'whatsapp-transcript',
    script: 'index.js',
    
    // Optimize for resource usage
    node_args: '--max-old-space-size=256',
    max_memory_restart: '300M',
    restart_delay: 5000
  }]
};
```

## Integration with Other Tools

### 1. Nginx Reverse Proxy
```nginx
# /etc/nginx/sites-available/whatsapp-transcript
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Systemd Integration
PM2 automatically integrates with systemd for auto-startup.

### 3. Docker with PM2
```dockerfile
FROM node:18-alpine

# Install PM2
RUN npm install -g pm2

# Copy app
COPY . /app
WORKDIR /app

# Install dependencies
RUN npm install --only=production

# Start with PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
```

## Related Pages
- [Installation Guide](Installation-Guide) - Initial setup
- [Server Deployment](Server-Deployment) - VPS deployment
- [Configuration](Configuration) - Environment variables
- [Troubleshooting](Troubleshooting) - Common issues
- [Docker Deployment](Docker-Deployment) - Container deployment

---

**Need help?** Check the [Troubleshooting](Troubleshooting) page or [open an issue](https://github.com/nerveband/wa-transcript/issues).