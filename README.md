# 🤖 Ultimate Bot Management System

Professional 24/7 Discord Bot Hosting Solution with Web Control Panel

## ✨ Features

### 🌐 Web Control Panel
- **Real-time Bot Status** - Monitor all bots with live updates
- **Professional UI** - Modern, responsive design with dark theme
- **Command Interface** - Send commands directly to bots
- **Log Viewer** - Real-time log monitoring
- **Statistics Dashboard** - Track messages, commands, uptime

### 🚀 24/7 Hosting
- **PM2 Process Management** - Automatic restart on crashes
- **Auto-recovery** - Failed processes restart automatically
- **Resource Monitoring** - CPU and memory usage tracking
- **Log Management** - Automatic log rotation and cleanup
- **System Health Checks** - Continuous monitoring

### 🎯 Bot Control Commands
- **Basic Operations**: Start, Stop, Restart bots
- **Message Management**: Send messages, mass messaging
- **Server Management**: Join/leave servers, list channels
- **Auto Functions**: Auto-flirt, auto-roast, auto-react
- **Stealth Features**: Anti-detection, stealth mode
- **Rate Limiting**: Configurable message limits

## 🛠️ Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn
- PM2 (installed automatically)

### Quick Setup
```bash
# Clone or download the project
cd /workspace

# Install dependencies
npm install

# Start the system
./start-all.sh
```

### Manual Setup
```bash
# Install dependencies
npm install

# Install PM2 globally
npm install -g pm2

# Start all processes
npm run pm2:start

# Or start individual components
node web-panel.js    # Web panel only
node monitor.js      # Monitoring only
```

## 🌐 Web Panel Access

Once started, access the web panel at:
- **Local**: http://localhost:3000
- **Network**: http://your-server-ip:3000

## 📊 Management Commands

### PM2 Commands
```bash
npm run pm2:start    # Start all processes
npm run pm2:stop     # Stop all processes  
npm run pm2:restart  # Restart all processes
npm run pm2:logs     # View all logs
npm run pm2:monit    # Open PM2 monitor
```

### Direct PM2 Commands
```bash
pm2 status           # View process status
pm2 logs             # View all logs
pm2 monit            # Open monitoring dashboard
pm2 restart all      # Restart all processes
pm2 stop all         # Stop all processes
pm2 delete all       # Delete all processes
```

## 🎮 Bot Control Commands

### Basic Bot Operations
```
start <bot_id>                    # Start a specific bot
stop <bot_id>                     # Stop a specific bot
restart <bot_id>                  # Restart a specific bot
status                            # Get status of all bots
```

### Message Management
```
send-message <bot_id> <channel_id> <message>
mass-message <bot_id> <channel_ids> <message>
```

### Server Management
```
join-server <bot_id> <invite_code>
leave-server <bot_id> <server_id>
mass-join <bot_id> <invite_codes>
mass-leave <bot_id> <server_ids>
list-servers <bot_id>
list-channels <bot_id> <server_id>
```

### Auto Functions
```
auto-flirt <bot_id> <channel_id> <interval_minutes>
auto-roast <bot_id> <channel_id> <interval_minutes>
auto-react <bot_id> <channel_id> <emoji>
auto-typing <bot_id> <channel_id>
```

### Advanced Features
```
stealth-mode <bot_id> <on/off>
anti-detection <bot_id> <on/off>
rate-limit <bot_id> <messages_per_minute>
```

### Utility Commands
```
help [command]                    # Show help
logs <bot_id> [lines]            # View bot logs
clear-logs <bot_id>              # Clear bot logs
export-data <bot_id>             # Export bot data
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file with your bot tokens:
```env
BOT1_TOKEN=your_bot1_token_here
BOT2_TOKEN=your_bot2_token_here
BOT3_TOKEN=your_bot3_token_here
BOT4_TOKEN=your_bot4_token_here
BOT5_TOKEN=your_bot5_token_here
BOT6_TOKEN=your_bot6_token_here
BOT7_TOKEN=your_bot7_token_here

# Optional configurations
PORT=3000
NODE_ENV=production
MAX_RETRIES=10
RETRY_DELAY=3000
```

### PM2 Configuration
The `ecosystem.config.js` file contains PM2 configuration for:
- Auto-restart on crashes
- Memory limits
- Log management
- Process monitoring

## 📁 File Structure

```
/workspace/
├── web-panel.js          # Main web panel server
├── command-panel.js      # Command handling system
├── monitor.js           # System monitoring
├── ecosystem.config.js  # PM2 configuration
├── start-all.sh         # Startup script
├── public/
│   └── index.html       # Web interface
├── logs/                # Log files directory
├── bot1.js - bot6.js    # Individual bot files
├── config.js            # Bot configuration
└── package.json         # Dependencies
```

## 🔍 Monitoring & Logs

### Log Files
- `logs/web-panel-*.log` - Web panel logs
- `logs/bot1-*.log` - Individual bot logs
- `logs/monitor.log` - System monitoring logs

### Real-time Monitoring
- Web panel shows live bot status
- PM2 monitor for process details
- System resource monitoring
- Automatic error detection and recovery

## 🚨 Troubleshooting

### Common Issues

**Bots not starting:**
```bash
# Check if tokens are set
cat .env

# Check PM2 status
pm2 status

# View logs
pm2 logs
```

**Web panel not accessible:**
```bash
# Check if port 3000 is available
netstat -tlnp | grep 3000

# Restart web panel
pm2 restart web-panel
```

**High memory usage:**
```bash
# Check system resources
pm2 monit

# Restart processes
pm2 restart all
```

### Reset Everything
```bash
# Stop all processes
pm2 delete all

# Clear logs
rm -rf logs/*

# Restart
./start-all.sh
```

## 🔒 Security Features

- **Token Encryption** - Secure token storage
- **Rate Limiting** - Prevent API abuse
- **Anti-Detection** - Stealth mode capabilities
- **Process Isolation** - Each bot runs independently
- **Log Security** - Sensitive data filtering

## 📈 Performance

- **Auto-scaling** - Dynamic resource allocation
- **Memory Management** - Automatic cleanup
- **Process Optimization** - Efficient resource usage
- **Network Optimization** - Connection pooling

## 🆘 Support

For issues or questions:
1. Check the logs in `logs/` directory
2. Use `pm2 logs` for real-time debugging
3. Check system resources with `pm2 monit`
4. Restart services with `pm2 restart all`

## 🎉 Features Summary

✅ **Professional Web Panel** - Modern UI with real-time updates  
✅ **24/7 Hosting** - PM2 process management with auto-restart  
✅ **Comprehensive Commands** - Full bot control from A-Z  
✅ **Real-time Monitoring** - Live status and log viewing  
✅ **Auto-recovery** - Failed processes restart automatically  
✅ **Resource Management** - Memory and CPU monitoring  
✅ **Log Management** - Automatic rotation and cleanup  
✅ **Security Features** - Anti-detection and stealth mode  
✅ **Mass Operations** - Bulk server and message management  
✅ **Professional Design** - Modern, responsive interface  

---

**🎯 Ready to host your bots 24/7 with professional management!**

Start the system with `./start-all.sh` and access the web panel at `http://localhost:3000`