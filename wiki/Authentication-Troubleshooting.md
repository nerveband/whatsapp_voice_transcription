# Authentication Troubleshooting

Comprehensive guide for resolving WhatsApp authentication issues.

## Table of Contents
- [Connection Errors](#connection-errors)
- [Method Not Allowed Errors](#method-not-allowed-errors)
- [Connection Closed Issues](#connection-closed-issues)
- [Pairing Code Problems](#pairing-code-problems)
- [WhatsApp IP Blocking](#whatsapp-ip-blocking)
- [Debugging with Logs](#debugging-with-logs)
- [Server-Specific Issues](#server-specific-issues)

## Connection Errors

### "Cannot Connect to WhatsApp Servers"

#### Symptoms
```
Connection error: Unable to connect to WhatsApp servers
WebSocket connection failed
Error: connect ETIMEDOUT
```

#### Diagnosis
```bash
# Test basic connectivity
ping -c 4 web.whatsapp.com
curl -I https://web.whatsapp.com

# Check DNS resolution
nslookup web.whatsapp.com
dig web.whatsapp.com

# Test specific WhatsApp endpoints
curl -v https://w1.web.whatsapp.com/ws
```

#### Solutions

**1. Network Connectivity Issues**
```bash
# Check internet connection
ping -c 4 8.8.8.8

# Test HTTPS connectivity
curl -I https://google.com

# Check for proxy/firewall blocking
# Configure proxy if needed:
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
```

**2. Firewall Configuration**
```bash
# Allow WhatsApp domains through firewall
sudo ufw allow out 443
sudo ufw allow out 80

# For corporate networks, whitelist:
# - *.whatsapp.com
# - *.whatsapp.net
# - *.facebook.com
```

**3. Server Environment Settings**
```env
# In .env file, enable server environment
SERVER_ENV=true

# Use pairing code for headless servers
AUTH_METHOD=PAIRING_CODE
```

## Method Not Allowed Errors

### "405 Method Not Allowed"

#### Symptoms
```
HTTP 405: Method Not Allowed
WhatsApp Web returned 405 error
Connection rejected by server
```

#### Root Cause
WhatsApp blocks certain IP ranges, especially:
- Cloud hosting providers (AWS, DigitalOcean, etc.)
- VPN/proxy services
- Data centers with poor reputation
- Known bot/automation IP ranges

#### Solutions

**1. IP Address Check**
```bash
# Check your public IP
curl ifconfig.me
curl ipinfo.io

# Test WhatsApp Web access
curl -I https://web.whatsapp.com

# Response codes:
# 200 OK = IP is allowed
# 405 Method Not Allowed = IP is blocked
# 403 Forbidden = IP is blocked
```

**2. Server Location Change**
Try different hosting providers or regions:
```bash
# Generally better success rates:
# ✅ Europe: Germany, Netherlands, UK
# ✅ North America: US East Coast, Canada
# ✅ Asia: Singapore, Japan

# Often blocked:
# ❌ Some US West Coast data centers
# ❌ Cheap VPS providers
# ❌ Known cloud hosting IP ranges
```

**3. Use Authentication Transfer**
**Recommended solution**:
1. Authenticate locally with QR_CODE method
2. Transfer authentication data to server
3. Server uses existing session

See [Authentication Transfer](Authentication-Transfer) guide.

**4. Residential IP/VPN Solution**
```bash
# Use residential IP services
# Configure VPN for WhatsApp traffic only
# Route other traffic directly through server IP

# Example with WireGuard:
sudo apt install wireguard
# Configure with residential IP provider
```

## Connection Closed Issues

### "Connection Closed Unexpectedly"

#### Symptoms
```
Connection closed: Connection terminated
WebSocket connection closed
Session closed, reason: Connection terminated
```

#### Common Causes
1. **Session expired** or invalidated
2. **WhatsApp detected automation** patterns
3. **Network instability**
4. **Rate limiting** from too many requests
5. **WhatsApp server maintenance**

#### Solutions

**1. Check Session Status**
```bash
# Check authentication files
ls -la auth_info_baileys/
stat auth_info_baileys/creds.json

# Verify file contents aren't corrupted
file auth_info_baileys/*.json
```

**2. Reduce Automation Detection**
```env
# In .env file, enable server environment
SERVER_ENV=true

# Add delays between operations
DELAY_BETWEEN_MESSAGES=2000

# Reduce concurrent operations
MAX_CONCURRENT_PROCESSES=1
```

**3. Handle Network Instability**
```bash
# Use stable network connection
# Avoid Wi-Fi, use wired connection
# Check network stability:
ping -c 100 web.whatsapp.com | grep loss
```

**4. Implement Retry Logic**
```javascript
// In your application, add retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

async function connectWithRetry() {
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            await connectToWhatsApp();
            return;
        } catch (error) {
            if (i === MAX_RETRIES - 1) throw error;
            await sleep(RETRY_DELAY * (i + 1));
        }
    }
}
```

## Pairing Code Problems

### "Pairing Code Not Working"

#### Symptoms
```
Pairing code expired
Invalid pairing code
Pairing code not accepted
```

#### Common Issues

**1. Incorrect Phone Number Format**
```env
# Wrong formats ❌
WHATSAPP_PHONE_NUMBER=+1234567890
WHATSAPP_PHONE_NUMBER=1-234-567-8901
WHATSAPP_PHONE_NUMBER=(123) 456-7890

# Correct format ✅
WHATSAPP_PHONE_NUMBER=12345678901  # E.164 without + or formatting
```

**2. Pairing Code Expiration**
```bash
# Pairing codes expire after 2-3 minutes
# If expired, restart application for new code:
pm2 restart whatsapp-transcript
# Or
npm start
```

**3. Phone Number Mismatch**
Ensure the phone number in `.env` matches:
- The WhatsApp account you're trying to link
- The number format is exactly E.164 without +
- No spaces, dashes, or parentheses

#### Solutions

**1. Verify Phone Number Format**
```bash
# Check your .env configuration
grep WHATSAPP_PHONE_NUMBER .env

# Format examples:
# US: +1 234 567 8901 → 12345678901
# UK: +44 20 1234 5678 → 442012345678
# DE: +49 30 12345678 → 493012345678
```

**2. Quick Pairing Code Process**
```bash
# Start application
npm start

# Immediately note the pairing code (expires quickly)
# Open WhatsApp on phone → Settings → Linked Devices
# Link a Device → Link with phone number instead
# Enter code immediately
```

**3. Alternative: Use QR Code Method**
If pairing codes consistently fail:
```env
# Switch to QR code method temporarily
AUTH_METHOD=QR_CODE

# Authenticate locally, then transfer to server
# See Authentication Transfer guide
```

## WhatsApp IP Blocking

### Detecting IP Blocks

#### Quick IP Block Test
```bash
# Test WhatsApp Web access
curl -I https://web.whatsapp.com

# Expected responses:
# 200 OK: Your IP is allowed
# 405 Method Not Allowed: Your IP is likely blocked
# 403 Forbidden: Your IP is blocked
# Timeout: Network or severe blocking
```

#### Comprehensive Block Detection
```bash
# Test multiple WhatsApp endpoints
endpoints=(
    "https://web.whatsapp.com"
    "https://w1.web.whatsapp.com"
    "https://w2.web.whatsapp.com"
    "https://w3.web.whatsapp.com"
)

for endpoint in "${endpoints[@]}"; do
    echo "Testing $endpoint"
    curl -I "$endpoint" 2>/dev/null | head -1
done
```

### IP Block Solutions

**1. Authentication Transfer Method** (Recommended)
```bash
# Authenticate on local machine (not blocked)
# Transfer authentication to server
# Server uses existing session without new connection
```

**2. Alternative Hosting Provider**
Research and try providers with better WhatsApp compatibility:
- **Hetzner** (Europe) - Generally good success rate
- **Linode** - Better than some alternatives
- **DigitalOcean** - Mixed results, try different regions

**3. Residential IP Services**
```bash
# Use services that provide residential IP addresses
# Configure split tunneling:
# - WhatsApp traffic through residential IP
# - Other traffic through server IP
```

## Debugging with Logs

### Enable Debug Logging
```bash
# Start with debug mode
DEBUG=* npm start

# Or specific modules
DEBUG=whatsapp:*,baileys:* npm start

# Log to file
DEBUG=* npm start 2>&1 | tee debug.log
```

### Log Analysis Patterns

#### Successful Connection Logs
```bash
# Look for these patterns in logs:
"QR code generated"                # QR method working
"Pairing code: ABC-123"           # Pairing method working
"Connected to WhatsApp"           # Successful connection
"Authentication loaded"           # Using existing session
"Ready to receive messages"       # Fully operational
```

#### Error Pattern Analysis
```bash
# Connection errors
grep -i "connection.*error" debug.log
grep -i "websocket.*fail" debug.log

# Authentication errors
grep -i "auth.*error" debug.log
grep -i "session.*expired" debug.log

# Rate limiting
grep -i "rate.*limit" debug.log
grep -i "too.*many.*requests" debug.log
```

### Structured Log Analysis
```bash
# Create log analysis script
cat > analyze_logs.sh << 'EOF'
#!/bin/bash
LOG_FILE="debug.log"

echo "=== Connection Attempts ==="
grep -c "Connecting to WhatsApp" "$LOG_FILE"

echo "=== Successful Connections ==="
grep -c "Connected to WhatsApp" "$LOG_FILE"

echo "=== Error Summary ==="
grep -i error "$LOG_FILE" | sort | uniq -c | sort -nr

echo "=== WhatsApp Server Responses ==="
grep -i "405\|403\|timeout" "$LOG_FILE"
EOF

chmod +x analyze_logs.sh
./analyze_logs.sh
```

## Server-Specific Issues

### Cloud Provider Specific Problems

#### AWS EC2
```bash
# Common issues:
# - Some EC2 IP ranges are blocked
# - Security groups may block outbound HTTPS
# - NAT gateways can cause issues

# Solutions:
# Configure security groups for outbound HTTPS
aws ec2 authorize-security-group-egress \
    --group-id sg-123456 \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0
```

#### DigitalOcean
```bash
# Try different regions:
# - Frankfurt (fra1) - Often works well
# - Amsterdam (ams3) - Good success rate
# - New York (nyc1/nyc3) - Mixed results

# Avoid:
# - San Francisco regions (often blocked)
# - Bangalore (blr1) - Frequently blocked
```

#### Google Cloud Platform
```bash
# Generally better success rates
# Ensure firewall rules allow outbound HTTPS
gcloud compute firewall-rules create allow-whatsapp \
    --allow tcp:443 \
    --source-ranges 0.0.0.0/0 \
    --direction EGRESS
```

### Docker Container Issues

#### Container Network Problems
```bash
# Test network from inside container
docker exec -it whatsapp-container curl -I https://web.whatsapp.com

# Check container DNS
docker exec -it whatsapp-container nslookup web.whatsapp.com

# Fix DNS issues
# In docker-compose.yml:
services:
  app:
    dns:
      - 8.8.8.8
      - 1.1.1.1
```

#### Container Authentication Issues
```bash
# Ensure proper volume mounting
docker inspect whatsapp-container | grep -A 10 Mounts

# Check file permissions in container
docker exec -it whatsapp-container ls -la auth_info_baileys/

# Fix ownership issues
docker exec -it whatsapp-container chown -R node:node auth_info_baileys/
```

### VPS Provider Recommendations

Based on community success rates:

#### ✅ Generally Work Well
- **Hetzner Cloud** (Europe)
- **Linode** (Global)
- **Vultr** (Select regions)
- **OVH** (Europe)

#### ⚠️ Mixed Results
- **DigitalOcean** (Region dependent)
- **AWS EC2** (Instance dependent)
- **Google Cloud** (Usually good)

#### ❌ Often Blocked
- **Cheap VPS providers**
- **Known bot hosting services**
- **Residential proxy providers**

## Emergency Recovery

### Complete Authentication Reset
If all else fails:

```bash
# 1. Stop application
pm2 stop whatsapp-transcript

# 2. Remove corrupted authentication
rm -rf auth_info_baileys/

# 3. Clear application cache
rm -rf node_modules/
npm install

# 4. Try different approach
# Option A: Switch authentication method
AUTH_METHOD=QR_CODE  # or PAIRING_CODE

# Option B: Try from different IP/location
# Option C: Use authentication transfer method
```

### Last Resort Solutions
1. **Change server provider/location**
2. **Use local machine with port forwarding**
3. **Implement residential proxy solution**
4. **Consider alternative WhatsApp libraries**

## Related Pages
- [WhatsApp Authentication](WhatsApp-Authentication) - Authentication methods
- [Authentication Transfer](Authentication-Transfer) - Transfer auth between devices
- [Server Deployment](Server-Deployment) - Server setup considerations
- [Troubleshooting](Troubleshooting) - General troubleshooting
- [Configuration](Configuration) - Environment settings

---

**Still having issues?** [Open an issue](https://github.com/nerveband/wa-transcript/issues) with your diagnostic information and logs.