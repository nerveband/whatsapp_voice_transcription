# Upgrade Guide

Complete guide for updating WhatsApp Voice Transcription to the latest version.

## Table of Contents
- [Before You Upgrade](#before-you-upgrade)
- [Standard Installation Upgrades](#standard-installation-upgrades)
- [Docker Installation Upgrades](#docker-installation-upgrades)
- [Breaking Changes by Version](#breaking-changes-by-version)
- [Rollback Procedures](#rollback-procedures)
- [Configuration Migration](#configuration-migration)
- [Dependency Updates](#dependency-updates)

## Before You Upgrade

### 1. Check Current Version
```bash
# Check your current version
git log --oneline -1
cat package.json | grep version

# Check latest available version
git fetch origin
git log --oneline origin/master -5
```

### 2. Backup Critical Data
```bash
# Backup authentication data
cp -r auth_info_baileys/ auth_info_baileys.backup

# Backup configuration
cp .env .env.backup

# Backup logs (optional)
cp -r logs/ logs.backup

# Create complete backup archive
tar -czf whatsapp_backup_$(date +%Y%m%d_%H%M%S).tar.gz \
    auth_info_baileys/ .env logs/ package.json package-lock.json
```

### 3. Check Breaking Changes
Review the [Breaking Changes](#breaking-changes-by-version) section below before upgrading.

### 4. Plan Downtime
- **Local development**: Minimal downtime expected
- **Production server**: Plan for 5-15 minutes of downtime
- **Docker deployment**: May require container restart

## Standard Installation Upgrades

### 1. Simple Upgrade Process
```bash
# Stop the application
pm2 stop whatsapp-transcript
# Or if running directly: Ctrl+C

# Pull latest changes
git pull origin master

# Update dependencies
npm install

# Start application
pm2 start whatsapp-transcript
# Or: npm start
```

### 2. Detailed Upgrade Process
```bash
# 1. Check current status
pm2 status whatsapp-transcript
git status

# 2. Stop application gracefully
pm2 stop whatsapp-transcript

# 3. Backup current state
git stash  # Save any local changes

# 4. Fetch and merge latest changes
git fetch origin
git pull origin master

# 5. Check for new dependencies
npm install

# 6. Handle configuration changes
# Compare .env with .env.example for new options
diff .env .env.example

# 7. Test configuration
npm run test  # If tests are available
node -c index.js  # Syntax check

# 8. Start application
pm2 start whatsapp-transcript

# 9. Verify operation
pm2 logs whatsapp-transcript --lines 50
```

### 3. Upgrade with Version Locking
```bash
# Check available versions
git tag -l | sort -V | tail -10

# Upgrade to specific version
git checkout v1.3.0  # Replace with desired version
npm install
pm2 restart whatsapp-transcript
```

## Docker Installation Upgrades

### 1. Docker Compose Upgrade
```bash
# Stop current containers
docker-compose down

# Backup authentication data
docker cp wa-transcript:/app/auth_info_baileys ./auth_backup

# Pull latest code
git pull origin master

# Rebuild and start
docker-compose up -d --build

# Verify upgrade
docker-compose logs -f whatsapp-transcription
```

### 2. Docker Image Upgrade
```bash
# Pull latest base images
docker-compose pull

# Rebuild with no cache
docker-compose build --no-cache

# Recreate containers
docker-compose up -d --force-recreate

# Clean up old images
docker image prune -f
```

### 3. Volume Preservation
```bash
# Ensure volumes are preserved during upgrade
# In docker-compose.yml:
volumes:
  - ./auth_info_baileys:/app/auth_info_baileys  # Persistent auth
  - ./logs:/app/logs                            # Persistent logs
  - ./config:/app/config                        # Persistent config
```

## Breaking Changes by Version

### Version 1.4.0 (Latest - September 2025)
**New Features:**
- Comprehensive GitHub Wiki documentation with 14 detailed pages
- Streamlined README with improved navigation (83% size reduction)
- Latest AI model support: OpenAI GPT-5-nano, Claude 3.5 Haiku, Deepgram Nova-3
- Complete deployment guides for Docker, Server, Synology NAS, and PM2
- Enhanced authentication troubleshooting and transfer guides
- Contributing guidelines and upgrade documentation

**Breaking Changes:**
- **README structure completely redesigned** - moved from 480+ lines to 85 lines
- All detailed documentation moved to GitHub Wiki pages
- Some environment variable recommendations updated

**Migration Steps:**
1. Update `.env` with latest model recommendations (see `.env.example`)
2. Bookmark new [GitHub Wiki](../../wiki) for documentation
3. Review new deployment options if using custom setup
4. Check [CHANGELOG.md](../CHANGELOG.md) for complete version history

### Version 1.3.0
**New Features:**
- Updated AI model support (GPT-4o, Claude 3.5, Deepgram Nova-3)  
- Enhanced error handling

**Breaking Changes:**
- None - fully backward compatible

**Migration Steps:**
1. Update `.env` with new model options (optional)

### Version 1.2.1
**New Features:**
- Improved authentication system
- Added PM2 setup instructions
- Better error handling

**Breaking Changes:**
- Authentication file structure updated
- May require re-authentication

**Migration Steps:**
```bash
# Backup old auth
mv auth_info_baileys/ auth_info_baileys.old/

# Allow application to create new auth structure
npm start  # Will create new auth_info_baileys/

# If needed, migrate old sessions (manual process)
```

### Version 1.2.0
**New Features:**
- Added Anthropic Claude support
- Enhanced Docker configuration
- Improved logging

**Breaking Changes:**
- New environment variables required for Anthropic
- Docker configuration updated

**Migration Steps:**
```bash
# Add new environment variables to .env
echo "ANTHROPIC_API_KEY=your_key_here" >> .env
echo "ANTHROPIC_MODEL=claude-3-5-haiku-latest" >> .env

# Update Docker configuration
docker-compose down
docker-compose up -d --build
```

### Version 1.1.0
**New Features:**
- Added Deepgram transcription support
- Improved audio processing
- Better error messages

**Breaking Changes:**
- Environment variable `TRANSCRIPTION_SERVICE` renamed to `VOICE_TRANSCRIPTION_SERVICE`

**Migration Steps:**
```bash
# Update .env file
sed -i 's/TRANSCRIPTION_SERVICE/VOICE_TRANSCRIPTION_SERVICE/g' .env

# Or manually edit .env:
# TRANSCRIPTION_SERVICE=OPENAI  →  VOICE_TRANSCRIPTION_SERVICE=OPENAI
```

## Rollback Procedures

### 1. Quick Rollback
```bash
# Stop current version
pm2 stop whatsapp-transcript

# Revert to previous commit
git log --oneline -10  # Find previous working commit
git checkout COMMIT_HASH  # Replace with actual hash

# Restore dependencies
npm install

# Restore configuration if needed
cp .env.backup .env

# Restore authentication if needed
rm -rf auth_info_baileys/
cp -r auth_info_baileys.backup/ auth_info_baileys/

# Start previous version
pm2 start whatsapp-transcript
```

### 2. Complete System Restore
```bash
# Restore from backup archive
tar -xzf whatsapp_backup_YYYYMMDD_HHMMSS.tar.gz

# Verify restoration
ls -la auth_info_baileys/
cat .env | head -10

# Start application
pm2 start whatsapp-transcript
```

### 3. Docker Rollback
```bash
# Stop current containers
docker-compose down

# Revert code changes
git checkout PREVIOUS_COMMIT

# Rebuild with previous version
docker-compose build --no-cache
docker-compose up -d

# Restore volumes if needed
docker cp ./auth_backup/. wa-transcript:/app/auth_info_baileys/
```

## Configuration Migration

### 1. Environment Variable Updates
```bash
# Compare configurations
diff .env .env.example

# Add new variables with defaults
cat >> .env << 'EOF'
# New configuration options
NEW_FEATURE_ENABLED=true
TIMEOUT_DURATION=30000
EOF
```

### 2. Automatic Migration Script
Create `migrate-config.sh`:
```bash
#!/bin/bash
# migrate-config.sh

ENV_FILE=".env"
BACKUP_FILE=".env.backup"

# Backup current config
cp "$ENV_FILE" "$BACKUP_FILE"

# Add new required variables if missing
add_if_missing() {
    local key="$1"
    local default_value="$2"
    
    if ! grep -q "^$key=" "$ENV_FILE"; then
        echo "$key=$default_value" >> "$ENV_FILE"
        echo "Added $key=$default_value"
    fi
}

# Add new configuration options
add_if_missing "ANTHROPIC_API_KEY" "your_anthropic_api_key"
add_if_missing "DEEPGRAM_MODEL" "nova-3"
add_if_missing "GENERATE_SUMMARY" "true"

echo "Configuration migration completed"
```

```bash
# Run migration
chmod +x migrate-config.sh
./migrate-config.sh
```

### 3. Model Configuration Updates
```bash
# Update to latest recommended models
sed -i 's/OPENAI_MODEL=gpt-3.5-turbo/OPENAI_MODEL=gpt-4o-mini/g' .env
sed -i 's/ANTHROPIC_MODEL=claude-3-haiku/ANTHROPIC_MODEL=claude-3-5-haiku-latest/g' .env
sed -i 's/DEEPGRAM_MODEL=nova-2/DEEPGRAM_MODEL=nova-3/g' .env
```

## Dependency Updates

### 1. Check for Vulnerabilities
```bash
# Audit dependencies
npm audit

# Fix automatically fixable issues
npm audit fix

# Check for major version updates
npm outdated
```

### 2. Update Dependencies Safely
```bash
# Update patch versions only (safe)
npm update

# Update to latest versions (potentially breaking)
npm install package-name@latest

# Update specific packages
npm install @whiskeysockets/baileys@latest
npm install openai@latest
```

### 3. Node.js Version Updates
```bash
# Check current Node.js version
node --version

# Check application compatibility
cat package.json | grep "engines" -A 3

# If using nvm, update Node.js
nvm install 18  # or latest LTS
nvm use 18
npm install  # Rebuild native modules
```

## Post-Upgrade Verification

### 1. Functional Testing
```bash
# Start application
npm start

# Check logs for errors
tail -f logs/app.log

# Send test voice message
# Verify transcription and summary work correctly
```

### 2. Performance Monitoring
```bash
# Monitor resource usage
pm2 monit

# Check response times
pm2 logs whatsapp-transcript --lines 100 | grep "processing time"

# Monitor memory usage
ps aux | grep node
```

### 3. Configuration Validation
```bash
# Verify all required environment variables
node -e "
const requiredVars = ['OPENAI_API_KEY', 'VOICE_TRANSCRIPTION_SERVICE', 'AI_SERVICE'];
const missing = requiredVars.filter(v => !process.env[v]);
if (missing.length) {
    console.error('Missing variables:', missing);
    process.exit(1);
} else {
    console.log('All required variables present');
}
"
```

## Troubleshooting Upgrade Issues

### Common Upgrade Problems

#### "Module not found" errors
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### Authentication issues after upgrade
```bash
# Authentication format may have changed
rm -rf auth_info_baileys/
# Re-authenticate or restore from backup
```

#### Docker build failures
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

#### Configuration errors
```bash
# Validate configuration syntax
node -c .env  # Won't work for .env files
# Instead, check manually or use migration script
```

## Staying Updated

### 1. Enable Notifications
- **Star the repository** on GitHub for releases
- **Watch releases** for update notifications
- **Follow project announcements**

### 2. Regular Update Schedule
```bash
# Create update reminder
echo "0 9 * * 0 cd /path/to/whatsapp-transcription && git fetch && git log --oneline HEAD..origin/master" | crontab -

# Weekly check for updates (Sundays at 9 AM)
```

### 3. Automated Update Script
```bash
#!/bin/bash
# auto-update.sh (use with caution in production)

cd /path/to/whatsapp-transcription

# Check for updates
git fetch
if [ $(git rev-list HEAD...origin/master --count) -eq 0 ]; then
    echo "No updates available"
    exit 0
fi

# Backup and update
./migrate-config.sh
pm2 stop whatsapp-transcript
git pull origin master
npm install
pm2 start whatsapp-transcript

echo "Update completed"
```

## Related Pages
- [Installation Guide](Installation-Guide) - Initial setup
- [Configuration](Configuration) - Environment variables
- [Troubleshooting](Troubleshooting) - Common issues
- [Docker Deployment](Docker-Deployment) - Container updates
- [Server Deployment](Server-Deployment) - Server maintenance

---

**Need help with upgrades?** Check the [Troubleshooting](Troubleshooting) page or [open an issue](https://github.com/nerveband/wa-transcript/issues).