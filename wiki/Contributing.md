# Contributing

Guide for contributing to the WhatsApp Voice Transcription project.

## Table of Contents
- [Development Setup](#development-setup)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Procedures](#testing-procedures)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting Guidelines](#issue-reporting-guidelines)
- [Feature Requests](#feature-requests)
- [Development Workflow](#development-workflow)

## Development Setup

### 1. Fork and Clone
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/your-username/whatsapp_voice_transcription.git
cd whatsapp_voice_transcription

# Add upstream remote
git remote add upstream https://github.com/nerveband/whatsapp_voice_transcription.git
```

### 2. Development Environment
```bash
# Install Node.js 18+ (required)
node --version  # Should be 18.0.0+

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.dev

# Configure development environment
nano .env.dev
```

### 3. Development Configuration
```env
# .env.dev - Development settings
NODE_ENV=development
DEBUG=whatsapp:*,baileys:*

# Use test API keys (not production keys)
OPENAI_API_KEY=sk-test-your-test-key
DEEPGRAM_API_KEY=your-test-key

# Development-friendly settings
VOICE_TRANSCRIPTION_SERVICE=DEEPGRAM
AI_SERVICE=OPENAI
GENERATE_SUMMARY=false  # Save API costs during dev

# Authentication (use QR code for development)
AUTH_METHOD=QR_CODE
SERVER_ENV=false
```

### 4. Development Scripts
```bash
# Start in development mode
npm run dev

# Run with specific environment
NODE_ENV=development npm start

# Start with debug output
DEBUG=* npm start
```

## Code Style Guidelines

### 1. JavaScript Style
Follow these conventions:

```javascript
// Use modern JavaScript features
const fs = require('fs').promises;
const { WebSocketClient } = require('@whiskeysockets/baileys');

// Async/await over callbacks
async function processVoiceMessage(message) {
    try {
        const audioPath = await downloadAudio(message);
        const transcription = await transcribeAudio(audioPath);
        return transcription;
    } catch (error) {
        console.error('Processing failed:', error);
        throw error;
    }
}

// Clear error handling
function handleWhatsAppError(error) {
    if (error.code === 'CONNECTION_CLOSED') {
        console.log('Connection closed, attempting reconnect...');
        return reconnect();
    }
    throw error;
}
```

### 2. File Structure
```
whatsapp_voice_transcription/
├── index.js              # Main application entry
├── src/                  # Source code
│   ├── auth/             # Authentication handling
│   ├── transcription/    # Voice transcription logic
│   ├── summary/          # Text summarization
│   └── utils/            # Utility functions
├── config/               # Configuration files
├── tests/                # Test files
└── docs/                 # Additional documentation
```

### 3. Naming Conventions
```javascript
// Functions: camelCase, descriptive
async function transcribeVoiceMessage() {}
function generateSummary() {}
function handleAuthenticationError() {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const SUPPORTED_AUDIO_FORMATS = ['ogg', 'mp3', 'wav'];

// Files: kebab-case
// speech-to-text.js
// auth-handler.js
// message-processor.js
```

### 4. Documentation Standards
```javascript
/**
 * Transcribes audio file using specified service
 * @param {string} audioPath - Path to audio file
 * @param {string} service - Transcription service ('openai' or 'deepgram')
 * @returns {Promise<string>} Transcribed text
 * @throws {Error} If transcription fails
 */
async function transcribeAudio(audioPath, service = 'deepgram') {
    // Implementation
}

// Inline comments for complex logic
function processComplexAudioFormat(buffer) {
    // Convert Opus audio to WAV format for compatibility
    const wavBuffer = opusToWav(buffer);
    
    // Apply noise reduction if audio quality is poor
    if (detectNoiseLevel(wavBuffer) > NOISE_THRESHOLD) {
        return applyNoiseReduction(wavBuffer);
    }
    
    return wavBuffer;
}
```

## Testing Procedures

### 1. Manual Testing
```bash
# Test basic functionality
npm start

# Send test voice message
# Verify transcription accuracy
# Check summary generation
# Test error handling

# Test different configurations
AUTH_METHOD=QR_CODE npm start
AUTH_METHOD=PAIRING_CODE WHATSAPP_PHONE_NUMBER=123456 npm start
```

### 2. Unit Testing (Future)
```bash
# Run tests (when implemented)
npm test

# Run specific test files
npm test -- --grep "transcription"

# Run tests with coverage
npm run test:coverage
```

### 3. Integration Testing
```bash
# Test with different AI providers
VOICE_TRANSCRIPTION_SERVICE=OPENAI npm start
VOICE_TRANSCRIPTION_SERVICE=DEEPGRAM npm start

AI_SERVICE=OPENAI npm start
AI_SERVICE=ANTHROPIC npm start

# Test authentication methods
AUTH_METHOD=QR_CODE npm start
AUTH_METHOD=PAIRING_CODE npm start
```

### 4. Environment Testing
```bash
# Test on different platforms
# - Ubuntu 20.04+
# - macOS 12+
# - Windows 10+ (WSL)

# Test with different Node.js versions
nvm use 18 && npm test
nvm use 20 && npm test
```

## Pull Request Process

### 1. Branch Creation
```bash
# Create feature branch from latest master
git checkout master
git pull upstream master
git checkout -b feature/add-new-transcription-service

# Or for bug fixes
git checkout -b fix/authentication-issue
```

### 2. Making Changes
```bash
# Make your changes
# Test thoroughly
npm start  # Test manually

# Commit changes with clear messages
git add .
git commit -m "feat: add support for Azure Speech Services

- Add Azure Speech Services as transcription option
- Update configuration documentation
- Add error handling for Azure API
- Update .env.example with Azure settings"
```

### 3. Commit Message Format
Use [Conventional Commits](https://conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

Examples:
```bash
git commit -m "feat: add Anthropic Claude 3.5 support"
git commit -m "fix: resolve authentication timeout issues"
git commit -m "docs: update API setup instructions"
git commit -m "refactor: improve error handling in speech-to-text"
```

### 4. Pull Request Submission
```bash
# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub with:
# - Clear title and description
# - Reference any related issues
# - Include testing steps
# - Add screenshots if UI changes
```

### 5. Pull Request Template
Include this information:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Tested with OpenAI API
- [ ] Tested with Deepgram API  
- [ ] Tested authentication methods
- [ ] Tested on multiple platforms

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

## Issue Reporting Guidelines

### 1. Bug Reports
Use this template:

```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Start application with these settings...
2. Send voice message with...
3. Observe error...

**Expected Behavior** 
What should happen

**Actual Behavior**
What actually happened

**Environment**
- OS: Ubuntu 22.04
- Node.js: 18.17.0
- Auth Method: PAIRING_CODE
- Services: Deepgram + OpenAI

**Logs**
```
[Paste relevant logs here]
```

**Additional Context**
Any other relevant information
```

### 2. Required Information
Always include:
- **Operating System** and version
- **Node.js version** (`node --version`)
- **Configuration** (sanitized .env)
- **Error logs** (last 50-100 lines)
- **Steps to reproduce**

### 3. Sensitive Information
```bash
# Sanitize logs before sharing
sed 's/sk-[a-zA-Z0-9]*/sk-***REDACTED***/g' debug.log > debug_clean.log
sed 's/[0-9]\{10,\}/***PHONE***REDACTED***/g' debug_clean.log

# Never share:
# - API keys
# - Phone numbers  
# - Authentication files
# - Personal voice messages
```

## Feature Requests

### 1. Feature Request Template
```markdown
**Feature Description**
Clear description of the requested feature

**Use Case**
Why is this feature needed? What problem does it solve?

**Proposed Implementation**
How do you think this should work?

**Alternatives Considered**
What other approaches did you consider?

**Additional Context**
Screenshots, mockups, or examples
```

### 2. Discussion First
For major features:
1. **Open discussion issue** first
2. **Get maintainer feedback**
3. **Refine requirements**
4. **Then implement**

## Development Workflow

### 1. Regular Synchronization
```bash
# Keep your fork updated
git checkout master
git pull upstream master
git push origin master

# Rebase feature branches
git checkout feature/your-feature
git rebase master
```

### 2. Code Review Process
1. **Self-review** your changes
2. **Test thoroughly** in different scenarios
3. **Update documentation** if needed
4. **Submit pull request**
5. **Address review feedback**
6. **Maintain PR** until merged

### 3. Release Process
Maintainers handle:
1. **Version bumping** (semantic versioning)
2. **CHANGELOG updates**
3. **Tag creation**
4. **Release notes**

## Development Tips

### 1. Debugging
```bash
# Debug specific modules
DEBUG=whatsapp:auth,baileys:connection npm start

# Debug API calls
DEBUG=openai:*,deepgram:* npm start

# Full debug output
DEBUG=* npm start 2>&1 | tee debug.log
```

### 2. API Cost Management
```bash
# Use test/development API keys
# Set GENERATE_SUMMARY=false during development
# Use shorter test audio files
# Mock API responses for testing
```

### 3. Authentication Testing
```bash
# Use separate WhatsApp test account
# Keep authentication data backed up
# Test both QR_CODE and PAIRING_CODE methods
```

### 4. Performance Testing
```bash
# Test with large audio files
# Monitor memory usage during development
# Test with multiple concurrent messages
```

## Communication

### 1. Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback  
- Help others learn and contribute
- Focus on the code, not the person

### 2. Getting Help
- **GitHub Discussions** for questions
- **GitHub Issues** for bugs
- **Code comments** for implementation details
- **Wiki documentation** for usage help

### 3. Maintainer Contact
For sensitive issues or questions:
- Open a private issue
- Contact through GitHub profile
- Reference this contributing guide

## Recognition

Contributors will be:
- **Listed in README.md**
- **Mentioned in release notes**
- **Added to GitHub contributors**
- **Thanked in commit messages**

Thank you for contributing to WhatsApp Voice Transcription! 🎙️

## Related Pages
- [Installation Guide](Installation-Guide) - Development setup
- [Configuration](Configuration) - Environment variables
- [Troubleshooting](Troubleshooting) - Common development issues
- [API Keys Setup](API-Keys-Setup) - Development API keys

---

**Questions about contributing?** [Open a discussion](https://github.com/nerveband/wa-transcript/discussions) or [create an issue](https://github.com/nerveband/wa-transcript/issues).