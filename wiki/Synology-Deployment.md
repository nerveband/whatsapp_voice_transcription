# Synology Deployment

Guide for deploying WhatsApp Voice Transcription on Synology NAS devices using Docker.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Docker Package Installation](#docker-package-installation)
- [File Station Setup](#file-station-setup)
- [Container Creation via UI](#container-creation-via-ui)
- [SSH Deployment Method](#ssh-deployment-method)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Synology Requirements
- **Synology NAS** with DSM 7.0+ (recommended)
- **Docker package** support (most modern Synology models)
- At least **1GB RAM** available
- **SSH access** enabled (optional, for advanced setup)

### Supported Models
Most Synology NAS devices support Docker, including:
- DS218+, DS418+, DS718+, DS918+ series
- DS220+, DS420+, DS720+, DS920+ series
- DS1621+, DS1821+ series
- And most other modern models

## Docker Package Installation

### 1. Install Docker Package
1. Open **Package Center** in DSM
2. Search for **"Docker"**
3. Click **Install** on the Docker package
4. Wait for installation to complete
5. Launch Docker from the main menu

### 2. Verify Docker Installation
1. Open the **Docker** application
2. Go to **Registry** tab
3. Search for "node" to verify access to Docker Hub

## File Station Setup

### 1. Create Project Directory
1. Open **File Station**
2. Navigate to a shared folder (e.g., `/docker/`)
3. Create new folder: `whatsapp-transcription`
4. Inside this folder, create:
   - `config/` directory
   - `auth_info_baileys/` directory
   - `logs/` directory

### 2. Upload Configuration Files
1. Create `.env` file locally with your configuration
2. Upload `.env` file to the `config/` directory
3. Set proper permissions (readable by Docker)

## Container Creation via UI

### 1. Download Image
1. Open **Docker** application
2. Go to **Registry** tab
3. Search for **"node:18-alpine"**
4. Download the image

### 2. Create Container
1. Go to **Container** tab
2. Click **Create** > **Create via Docker Compose** (recommended)

### 3. Docker Compose Configuration
Create this `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  whatsapp-transcription:
    image: node:18-alpine
    container_name: wa-transcript
    restart: unless-stopped
    
    # Working directory
    working_dir: /app
    
    # Environment variables
    environment:
      - AUTH_METHOD=PAIRING_CODE
      - WHATSAPP_PHONE_NUMBER=12345678901
      - SERVER_ENV=true
      - NODE_ENV=production
    
    # Volume mounts
    volumes:
      - /volume1/docker/whatsapp-transcription:/app
      - /volume1/docker/whatsapp-transcription/auth_info_baileys:/app/auth_info_baileys
      - /volume1/docker/whatsapp-transcription/logs:/app/logs
    
    # Port mapping (if needed)
    ports:
      - "3000:3000"
    
    # Startup command
    command: sh -c "npm install && npm start"
```

### 4. Deploy via Web UI
1. Copy the docker-compose.yml content
2. In Docker app, go to **Container** > **Create**
3. Select **Create via Docker Compose**
4. Paste the configuration
5. Click **Deploy**

## SSH Deployment Method

### 1. Enable SSH
1. Go to **Control Panel** > **Terminal & SNMP**
2. Enable **SSH service**
3. Connect via SSH: `ssh admin@your-synology-ip`

### 2. Deploy via Command Line
```bash
# Navigate to docker directory
cd /volume1/docker/

# Clone the repository
sudo git clone https://github.com/nerveband/wa-transcript.git whatsapp-transcription
cd whatsapp-transcription

# Copy environment configuration
sudo cp .env.example .env
sudo nano .env  # Configure your settings

# Install dependencies
sudo docker run --rm -v $(pwd):/app -w /app node:18-alpine npm install

# Start with Docker Compose
sudo docker-compose up -d
```

## Configuration

### 1. Environment Variables
Configure your `.env` file with Synology-specific paths:

```env
# Authentication (use PAIRING_CODE for headless)
AUTH_METHOD=PAIRING_CODE
WHATSAPP_PHONE_NUMBER=12345678901
SERVER_ENV=true

# API Keys
OPENAI_API_KEY=your_openai_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key

# Service Configuration
VOICE_TRANSCRIPTION_SERVICE=DEEPGRAM
AI_SERVICE=OPENAI
GENERATE_SUMMARY=true

# Logging
LOG_LEVEL=info
LOG_FILE=/app/logs/app.log
```

### 2. Volume Paths
Synology uses specific volume paths:
- Main volume: `/volume1/`
- Docker data: `/volume1/docker/`
- Shared folders: `/volume1/homes/`, `/volume1/music/`, etc.

### 3. Permissions
Set proper permissions for Docker access:
```bash
# Via SSH
sudo chown -R 1000:1000 /volume1/docker/whatsapp-transcription/auth_info_baileys
sudo chmod 755 /volume1/docker/whatsapp-transcription/auth_info_baileys
```

## Container Management

### 1. Using Docker App
1. **Start/Stop**: Go to Container tab, select container, use Start/Stop buttons
2. **Logs**: Click on container, go to **Log** tab
3. **Terminal**: Click **Details** > **Terminal** for shell access

### 2. Using SSH Commands
```bash
# Check container status
sudo docker ps

# View logs
sudo docker logs wa-transcript

# Restart container
sudo docker restart wa-transcript

# Access container shell
sudo docker exec -it wa-transcript sh
```

## Auto-Start Configuration

### 1. Docker Auto-Start
1. In Docker app, go to **Container** tab
2. Select your container
3. Click **Edit**
4. Enable **Auto-restart**

### 2. Task Scheduler (Alternative)
1. Go to **Control Panel** > **Task Scheduler**
2. Create new **Triggered Task** > **User-defined script**
3. Set trigger: **Boot-up**
4. Add script:
```bash
#!/bin/bash
sleep 60  # Wait for system to fully boot
docker start wa-transcript
```

## Monitoring and Maintenance

### 1. Resource Monitoring
1. Open **Resource Monitor**
2. Check **Container** tab for resource usage
3. Monitor CPU, memory, and network usage

### 2. Log Management
Configure log rotation to prevent disk space issues:
```bash
# Create log rotation script
sudo nano /volume1/docker/whatsapp-transcription/rotate-logs.sh
```

```bash
#!/bin/bash
# Log rotation script
LOG_DIR="/volume1/docker/whatsapp-transcription/logs"
find $LOG_DIR -name "*.log" -type f -mtime +7 -delete
```

Add to Task Scheduler to run weekly.

## Troubleshooting

### Common Synology Issues

#### Container Won't Start
1. **Check Docker logs** in Container tab
2. **Verify volumes** are properly mounted
3. **Check permissions** on mounted directories
4. **Ensure sufficient resources** (RAM/CPU)

#### Permission Denied Errors
```bash
# Fix ownership via SSH
sudo chown -R 1000:1000 /volume1/docker/whatsapp-transcription/

# Fix permissions
sudo chmod -R 755 /volume1/docker/whatsapp-transcription/
```

#### Network Issues
1. **Check port conflicts** in Docker app
2. **Verify firewall settings** in Control Panel
3. **Test internet connectivity** from container

#### WhatsApp Authentication Issues
- Use **PAIRING_CODE** method (QR codes don't work well on headless NAS)
- Ensure **stable internet** connection
- Check if **WhatsApp servers block** your NAS IP

### DSM Version Specific Issues

#### DSM 6.x
- Use older Docker package versions
- Some features may be limited
- Consider upgrading to DSM 7.x

#### DSM 7.x
- Full Docker support
- Better container management
- Enhanced security features

### Performance Optimization

#### Resource Allocation
```yaml
# In docker-compose.yml, add resource limits
services:
  whatsapp-transcription:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

#### Storage Optimization
- Use **SSD cache** if available
- Store logs on separate volume
- Regular cleanup of temporary files

## Backup and Recovery

### 1. Authentication Backup
```bash
# Backup authentication data
sudo tar -czf /volume1/backups/whatsapp_auth_$(date +%Y%m%d).tar.gz \
    /volume1/docker/whatsapp-transcription/auth_info_baileys/
```

### 2. Configuration Backup
```bash
# Backup configuration
sudo cp /volume1/docker/whatsapp-transcription/.env \
    /volume1/backups/whatsapp_env_$(date +%Y%m%d).backup
```

### 3. Automated Backup
Use **Hyper Backup** to regularly backup the entire project directory.

## Related Pages
- [Docker Deployment](Docker-Deployment) - General Docker setup
- [Server Deployment](Server-Deployment) - VPS deployment guide
- [Configuration](Configuration) - Environment variables
- [WhatsApp Authentication](WhatsApp-Authentication) - Authentication methods
- [Troubleshooting](Troubleshooting) - Common issues

---

**Need help?** Check the [Troubleshooting](Troubleshooting) page or [open an issue](https://github.com/nerveband/wa-transcript/issues).