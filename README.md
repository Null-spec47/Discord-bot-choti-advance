# Discord Bot Choti Advance 🚀

Advanced Discord Self-Bot Collection with Terminal Interface

## 🎯 Features

- **6 Individual Discord Bots** (bot1.js to bot6.js)
- **Terminal Interface** for easy bot management
- **PM2 Support** for process management
- **Web Panel** for web-based control
- **Advanced Stealth System** with anti-detection features
- **Voice Channel Support** with audio effects
- **Flirt & Roast Commands** in Hindi and English
- **Real-time Configuration** via environment variables

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Install dependencies (if node_modules.zip exists, it will be extracted automatically)
npm install

# Copy environment template
cp .env.example .env
```

### 2. Configure Bot Tokens

Edit `.env` file and add your Discord bot tokens:

```env
BOT1_TOKEN=your_discord_token_here
BOT2_TOKEN=your_discord_token_here
# ... add more bot tokens as needed
```

### 3. Run in Terminal

```bash
# Start the terminal interface
npm start
# OR
node index.js

# Or run individual bots
node bot1.js
./start-bot1.sh

# Or start all bots with PM2
./start-all.sh
```

## 📱 Terminal Interface

The terminal interface provides:

- **Interactive Menu** for bot selection
- **Status Indicators** for each bot
- **Environment Verification** 
- **Individual Bot Launching**
- **PM2 Mass Deployment**
- **Web Panel Access**
- **Setup Instructions**

## 🛠️ Bot Management

### Individual Bot Control
```bash
./start-bot1.sh    # Start Bot 1
./start-bot2.sh    # Start Bot 2
# ... etc
```

### All Bots with PM2
```bash
./start-all.sh     # Start all bots using PM2
pm2 status         # Check bot status
pm2 logs           # View logs
pm2 stop all       # Stop all bots
```

### Web Panel
```bash
node web-panel.js  # Start web interface
```

## ⚠️ Important Notes

- **Self-bots may violate Discord Terms of Service**
- **Use at your own risk**
- **Keep tokens secure and never share them**
- **Consider using official Discord bots instead**

## 📦 Dependencies

- `discord.js-selfbot-v13` - Discord API wrapper
- `@discordjs/voice` - Voice channel support  
- `dotenv` - Environment variable management
- `axios` - HTTP requests
- `ffmpeg-static` - Audio processing

## 🔧 Configuration

All configuration is handled through environment variables in `.env`:

- **Bot Tokens**: `BOT1_TOKEN`, `BOT2_TOKEN`, etc.
- **Security Settings**: Rate limiting, anti-detection features
- **Audio Settings**: Voice effects, equalizer settings
- **Stealth Mode**: Human behavior simulation

## 📝 Commands

Each bot includes various commands for:
- **Voice Management**: Join, leave, play sounds
- **Text Commands**: Flirt lines, roast lines
- **Utility Functions**: Status, help, configuration

---

**Disclaimer**: This software is for educational purposes. Users are responsible for compliance with Discord's Terms of Service.