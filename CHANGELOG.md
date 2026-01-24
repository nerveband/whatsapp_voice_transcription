# Changelog

All notable changes to WhatsApp Voice Transcription will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0] - 2026-01-24

### Changed
- **BREAKING**: Upgraded to Baileys 7.x (from 6.x) - requires re-authentication
- **BREAKING**: Upgraded to OpenAI SDK 6.x (from 5.x)
- **BREAKING**: Upgraded to Mongoose 9.x (from 8.x)
- Removed deprecated `printQRInTerminal` option (now handled via connection.update event)

### Updated Dependencies
- `@anthropic-ai/sdk`: 0.61.0 → 0.71.2
- `@deepgram/sdk`: 4.11.2 → 4.11.3
- `@whiskeysockets/baileys`: 6.7.19 → 7.0.0-rc.9
- `axios`: 1.11.0 → 1.13.2
- `dotenv`: 17.2.1 → 17.2.3
- `form-data`: 4.0.4 → 4.0.5
- `mongoose`: 8.18.0 → 9.1.5
- `openai`: 5.19.1 → 6.16.0
- `ws`: 8.18.3 → 8.19.0

### Migration Notes
- Delete `auth_info_baileys/` folder and re-authenticate via QR code
- No code changes required for OpenAI or Mongoose upgrades (APIs compatible)

---

## [1.4.0] - 2025-09-07

### Added
- Comprehensive GitHub Wiki documentation with 14 detailed pages
- Streamlined README with improved navigation and wiki integration
- Latest AI model support: OpenAI GPT-5-nano, Claude 3.5 Haiku, Deepgram Nova-3
- Complete deployment guides for Docker, Server, Synology NAS, and PM2
- Enhanced authentication troubleshooting and transfer guides
- Contributing guidelines for developers
- Upgrade guide with version history and migration steps

### Changed
- **BREAKING**: README restructured from 480+ lines to 85 lines (83% reduction)
- Moved detailed documentation from README to dedicated wiki pages
- Updated `.env.example` with latest model recommendations from all providers
- Enhanced OpenAI SDK v4+ integration with improved error handling and debugging

### Fixed
- README authorship attribution (Ashraf Ali, ashrafali.net)
- All wiki links now have corresponding documentation pages
- Date references updated to September 2025
- Removed non-existent discussion links

## [1.3.0] - 2024-12-15

### Added
- Updated AI model support (GPT-4o, Claude 3.5, Deepgram Nova-3)
- Enhanced error handling across all services

### Changed
- Improved Docker and dependency configurations

### Fixed
- None - fully backward compatible

## [1.2.1] - 2024-11-20

### Added
- Improved authentication system with better stability
- PM2 process manager setup instructions
- Enhanced server environment handling with robust connection fixes
- Detailed server connection troubleshooting guide

### Changed
- Authentication file structure updated for better reliability
- Enhanced pairing code stability for server environments

### Fixed
- Connection issues in server environments
- Authentication timeout problems
- Duplicate transcription processing

### Migration Notes
- May require re-authentication due to auth structure changes
- Backup `auth_info_baileys/` before upgrading

## [1.2.0] - 2024-10-15

### Added
- Anthropic Claude support for text summarization
- Enhanced Docker configuration with multi-stage builds
- Improved logging system with configurable levels
- Support for multiple AI providers simultaneously

### Changed
- Docker configuration updated with new environment variables
- Enhanced error messages and debugging output

### Fixed
- OpenAI SDK compatibility issues
- Transcription return value handling

### Migration Notes
```bash
# Add new environment variables to .env
echo "ANTHROPIC_API_KEY=your_key_here" >> .env
echo "ANTHROPIC_MODEL=claude-3-5-haiku-latest" >> .env
```

## [1.1.0] - 2024-09-10

### Added
- Deepgram transcription support as alternative to OpenAI Whisper
- Improved audio processing pipeline
- Better error messages and user feedback
- Support for multiple audio formats

### Changed
- **BREAKING**: Environment variable `TRANSCRIPTION_SERVICE` renamed to `VOICE_TRANSCRIPTION_SERVICE`

### Fixed
- Audio format compatibility issues
- Memory leaks in audio processing

### Migration Notes
```bash
# Update .env file
sed -i 's/TRANSCRIPTION_SERVICE/VOICE_TRANSCRIPTION_SERVICE/g' .env
```

## [1.0.0] - 2024-08-01

### Added
- Initial release of WhatsApp Voice Transcription
- OpenAI Whisper integration for voice transcription
- OpenAI GPT integration for text summarization
- WhatsApp Web API integration using Baileys
- QR Code and Pairing Code authentication methods
- Docker deployment support
- Basic error handling and logging

### Features
- Automatic transcription of WhatsApp voice messages
- AI-powered text summarization
- Direct WhatsApp integration
- Configurable AI providers
- Multiple authentication methods
- Cross-platform support (Linux, macOS, Windows)

---

## Version History Summary

- **1.5.0**: Major SDK upgrades - Baileys 7.x, OpenAI 6.x, Mongoose 9.x, Anthropic SDK 0.71
- **1.4.0**: Major documentation overhaul with GitHub Wiki, README streamlining, latest AI models
- **1.3.0**: Updated AI models and enhanced error handling
- **1.2.1**: Improved authentication and server environment support
- **1.2.0**: Added Anthropic Claude support and enhanced Docker configuration
- **1.1.0**: Added Deepgram support and improved audio processing
- **1.0.0**: Initial release with OpenAI integration and WhatsApp support

## Support

For detailed upgrade instructions, see the [Upgrade Guide](../../wiki/Upgrade-Guide).
For issues or questions, visit our [GitHub Issues](https://github.com/nerveband/whatsapp_voice_transcription/issues).