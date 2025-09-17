# Discord Bot Setup Instructions

## Quick Setup Guide

### 1. Get Discord Bot Tokens
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or use existing ones
3. Go to "Bot" section for each application
4. Copy the bot token

### 2. Configure Tokens
1. Open the `.env` file in this directory
2. Replace `your_discord_bot_token_here` with your actual Discord bot tokens:
   ```
   BOT1_TOKEN=your_actual_bot_token_1
   BOT2_TOKEN=your_actual_bot_token_2
   BOT3_TOKEN=your_actual_bot_token_3
   BOT4_TOKEN=your_actual_bot_token_4
   BOT5_TOKEN=your_actual_bot_token_5
   BOT6_TOKEN=your_actual_bot_token_6
   ```

### 3. Run the Bots
Use any of the provided start scripts:
- `./start-bot1.sh` - Start Bot 1
- `./start-bot2.sh` - Start Bot 2
- `./start-bot3.sh` - Start Bot 3
- `./start-bot4.sh` - Start Bot 4
- `./start-bot5.sh` - Start Bot 5
- `./start-bot6.sh` - Start Bot 6
- `./start-all.sh` - Start all bots

Or run directly with Node.js:
```bash
node bot1.js
node bot2.js
# etc...
```

### 4. Important Notes
- **Keep your tokens secret!** Never share them publicly
- Each bot needs a unique Discord bot token
- The `.env` file is already created with the correct format
- Bot 7 token is optional (no bot7.js file currently exists)

### 5. Troubleshooting
- If you get "BOT TOKEN MISSING" error, check that your `.env` file has the correct token format
- If you get "Invalid token" error, verify your token is correct from Discord Developer Portal
- Make sure the start scripts are executable: `chmod +x start-bot*.sh`

### 6. File Structure
- `.env` - Your actual configuration file (edit this with your tokens)
- `.env.example` - Template file showing the format
- `setup-instructions.md` - This file