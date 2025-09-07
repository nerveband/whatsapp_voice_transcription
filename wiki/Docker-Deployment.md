# Docker Deployment

Complete guide for deploying WhatsApp Voice Transcription using Docker containers.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Docker Compose Setup](#docker-compose-setup)
- [Container Configuration](#container-configuration)
- [Volume Management](#volume-management)
- [Network Configuration](#network-configuration)
- [Running the Container](#running-the-container)
- [Upgrading Docker Installations](#upgrading-docker-installations)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **Docker** version 20.10+ installed
- **Docker Compose** version 2.0+ installed
- At least **512MB RAM** available for the container
- **Stable internet connection**

### Install Docker
Choose your platform:

**Ubuntu/Debian:**
```bash
# Install Docker
sudo apt update
sudo apt install docker.io docker-compose-plugin
sudo usermod -aG docker $USER
# Log out and back in to apply group changes
```

**CentOS/RHEL:**
```bash
sudo yum install -y docker docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

**macOS:**
- Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)
- Install and start Docker Desktop

**Windows:**
- Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)
- Enable WSL2 integration

### Verify Installation
```bash
docker --version
docker compose version
```

## Docker Compose Setup

### 1. Create docker-compose.yml
Create a `docker-compose.yml` file in your project directory:

```yaml
version: '3.8'

services:
  whatsapp-transcription:
    build: .
    container_name: wa-transcript
    restart: unless-stopped
    
    # Environment configuration
    environment:
      - AUTH_METHOD=PAIRING_CODE
      - WHATSAPP_PHONE_NUMBER=12345678901
      - SERVER_ENV=true
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - DEEPGRAM_API_KEY=${DEEPGRAM_API_KEY}
      - VOICE_TRANSCRIPTION_SERVICE=DEEPGRAM
      - AI_SERVICE=OPENAI
      - GENERATE_SUMMARY=true
    
    # Volume mounts for persistence
    volumes:
      - ./auth_info_baileys:/app/auth_info_baileys
      - ./logs:/app/logs
      - ./config:/app/config
    
    # Network configuration
    networks:
      - whatsapp-network
    
    # Health check
    healthcheck:
      test: ["CMD", "node", "-e", "process.exit(0)"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  whatsapp-network:
    driver: bridge
```

### 2. Create Dockerfile
Create a `Dockerfile` in your project root:

```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p auth_info_baileys logs config

# Set proper permissions
RUN chown -R node:node /app
USER node

# Expose port (if your app uses one)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "process.exit(0)"

# Start the application
CMD ["npm", "start"]
```

### 3. Create .dockerignore
Create a `.dockerignore` file to exclude unnecessary files:

```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.nyc_output
.vscode
.DS_Store
auth_info_baileys
logs
*.log
```

## Container Configuration

### Environment Variables
Configure your container through environment variables in `docker-compose.yml`:

```yaml
environment:
  # Authentication (use PAIRING_CODE for containers)
  - AUTH_METHOD=PAIRING_CODE
  - WHATSAPP_PHONE_NUMBER=12345678901
  - SERVER_ENV=true
  
  # API Keys (use Docker secrets for production)
  - OPENAI_API_KEY=${OPENAI_API_KEY}
  - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
  - DEEPGRAM_API_KEY=${DEEPGRAM_API_KEY}
  
  # Service Configuration
  - VOICE_TRANSCRIPTION_SERVICE=DEEPGRAM
  - AI_SERVICE=OPENAI
  - OPENAI_MODEL=gpt-4o-mini
  - DEEPGRAM_MODEL=nova-3
  - GENERATE_SUMMARY=true
```

### Using Environment Files
Create a `.env.docker` file for cleaner configuration:

```env
# .env.docker
AUTH_METHOD=PAIRING_CODE
WHATSAPP_PHONE_NUMBER=12345678901
SERVER_ENV=true
OPENAI_API_KEY=your_openai_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key
VOICE_TRANSCRIPTION_SERVICE=DEEPGRAM
AI_SERVICE=OPENAI
GENERATE_SUMMARY=true
```

Then reference it in docker-compose.yml:
```yaml
services:
  whatsapp-transcription:
    env_file:
      - .env.docker
```

## Volume Management

### Persistent Data Volumes
Configure volumes to persist important data:

```yaml
volumes:
  # WhatsApp authentication data (CRITICAL)
  - ./auth_info_baileys:/app/auth_info_baileys
  
  # Application logs
  - ./logs:/app/logs
  
  # Configuration files
  - ./config:/app/config
  
  # Optional: Node modules cache
  - node_modules_cache:/app/node_modules
```

### Volume Permissions
Set proper permissions for mounted volumes:

```bash
# Create directories with proper permissions
mkdir -p auth_info_baileys logs config
chmod 755 auth_info_baileys logs config
chown -R 1000:1000 auth_info_baileys logs config
```

### Backup Volumes
Regular backup of authentication data:

```bash
# Backup authentication
docker compose exec whatsapp-transcription tar -czf /tmp/auth_backup.tar.gz auth_info_baileys/
docker cp wa-transcript:/tmp/auth_backup.tar.gz ./backups/
```

## Network Configuration

### Basic Network Setup
```yaml
networks:
  whatsapp-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/24
```

### Port Exposure (if needed)
```yaml
services:
  whatsapp-transcription:
    ports:
      - "3000:3000"  # Only if your app serves HTTP
```

### Reverse Proxy Integration
For integration with Nginx/Traefik:

```yaml
services:
  whatsapp-transcription:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.whatsapp.rule=Host(`whatsapp.yourdomain.com`)"
      - "traefik.http.services.whatsapp.loadbalancer.server.port=3000"
```

## Running the Container

### 1. Build and Start
```bash
# Build and start in detached mode
docker compose up -d --build
```

### 2. View Logs
```bash
# View container logs
docker compose logs -f whatsapp-transcription

# View last 100 lines
docker compose logs --tail=100 whatsapp-transcription
```

### 3. Authenticate WhatsApp
After starting, check logs for the pairing code:

```bash
# Watch for pairing code
docker compose logs -f whatsapp-transcription | grep -i "pairing"
```

Enter the pairing code in WhatsApp as described in [WhatsApp Authentication](WhatsApp-Authentication).

### 4. Verify Operation
```bash
# Check container status
docker compose ps

# Check container health
docker compose exec whatsapp-transcription npm run health-check
```

## Container Management

### Start/Stop/Restart
```bash
# Start services
docker compose start

# Stop services
docker compose stop

# Restart services
docker compose restart

# Stop and remove containers
docker compose down
```

### Shell Access
```bash
# Access container shell
docker compose exec whatsapp-transcription sh

# Run commands in container
docker compose exec whatsapp-transcription npm run status
```

### Container Updates
```bash
# Pull latest changes and rebuild
git pull origin main
docker compose down
docker compose up -d --build
```

## Upgrading Docker Installations

### Standard Upgrade Process
```bash
# 1. Backup authentication data
docker compose exec whatsapp-transcription tar -czf /tmp/auth_backup.tar.gz auth_info_baileys/
docker cp wa-transcript:/tmp/auth_backup.tar.gz ./backups/

# 2. Stop current container
docker compose down

# 3. Pull latest code
git pull origin main

# 4. Rebuild and start
docker compose up -d --build

# 5. Verify authentication is preserved
docker compose logs -f whatsapp-transcription
```

### Major Version Updates
```bash
# 1. Check breaking changes in CHANGELOG
cat CHANGELOG.md

# 2. Update docker-compose.yml if needed
# 3. Update environment variables as required
# 4. Follow standard upgrade process
```

## Troubleshooting

### Container Won't Start
```bash
# Check container logs
docker compose logs whatsapp-transcription

# Common issues:
# - Missing environment variables
# - Permission issues with volumes
# - Port conflicts
```

### Authentication Issues
```bash
# Check if auth directory is mounted correctly
docker compose exec whatsapp-transcription ls -la auth_info_baileys/

# Verify permissions
docker compose exec whatsapp-transcription ls -la / | grep auth
```

### Performance Issues
```bash
# Check container resource usage
docker stats wa-transcript

# Check available memory
docker compose exec whatsapp-transcription free -h

# Check disk usage
docker compose exec whatsapp-transcription df -h
```

### Network Issues
```bash
# Test internet connectivity from container
docker compose exec whatsapp-transcription ping -c 4 8.8.8.8

# Check DNS resolution
docker compose exec whatsapp-transcription nslookup google.com
```

### Volume Issues
```bash
# Check volume mounts
docker inspect wa-transcript | grep -A 10 "Mounts"

# Verify volume permissions
docker compose exec whatsapp-transcription ls -la /app/
```

### Common Error Solutions

**"EACCES: permission denied"**
```bash
# Fix volume permissions
sudo chown -R 1000:1000 auth_info_baileys logs config
```

**"Module not found"**
```bash
# Rebuild with fresh node_modules
docker compose down
docker compose up -d --build --no-deps
```

**"Connection timeout"**
```bash
# Check network connectivity
docker compose exec whatsapp-transcription ping -c 4 web.whatsapp.com
```

## Production Considerations

### Security
```yaml
# Use Docker secrets for sensitive data
secrets:
  openai_api_key:
    file: ./secrets/openai_api_key.txt

services:
  whatsapp-transcription:
    secrets:
      - openai_api_key
```

### Resource Limits
```yaml
services:
  whatsapp-transcription:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### Monitoring
```yaml
services:
  whatsapp-transcription:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Related Pages
- [Installation Guide](Installation-Guide) - Basic setup instructions
- [WhatsApp Authentication](WhatsApp-Authentication) - Authentication methods
- [Server Deployment](Server-Deployment) - VPS deployment guide
- [Configuration](Configuration) - Environment variables reference
- [Troubleshooting](Troubleshooting) - Common issues and solutions

---

**Need help?** Check the [Troubleshooting](Troubleshooting) page or [open an issue](https://github.com/nerveband/wa-transcript/issues).