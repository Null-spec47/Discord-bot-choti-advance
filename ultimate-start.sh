#!/bin/bash

# Ultimate Bot Management System - Complete Startup Script
# Professional 24/7 Hosting Solution with Full Monitoring

echo "🚀 Ultimate Bot Management System"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_header() {
    echo -e "${CYAN}$1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. Consider using a non-root user for security."
fi

# Check Node.js version
print_header "🔍 System Requirements Check"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 16 ]; then
        print_success "Node.js version: $(node --version) ✓"
    else
        print_error "Node.js version 16+ required. Current: $(node --version)"
        exit 1
    fi
else
    print_error "Node.js not found. Please install Node.js 16+ first."
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    print_success "npm version: $(npm --version) ✓"
else
    print_error "npm not found. Please install npm first."
    exit 1
fi

# Create necessary directories
print_header "📁 Setting up directories"
mkdir -p logs
mkdir -p public
print_success "Directories created"

# Check for .env file
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating template..."
    cat > .env << EOF
# Bot Tokens - Replace with your actual tokens
BOT1_TOKEN=your_bot1_token_here
BOT2_TOKEN=your_bot2_token_here
BOT3_TOKEN=your_bot3_token_here
BOT4_TOKEN=your_bot4_token_here
BOT5_TOKEN=your_bot5_token_here
BOT6_TOKEN=your_bot6_token_here
BOT7_TOKEN=your_bot7_token_here

# System Configuration
PORT=3000
NODE_ENV=production
MAX_RETRIES=10
RETRY_DELAY=3000
TOKEN_ROTATION_INTERVAL=3600000

# Anti-Detection Settings
USER_AGENT_ROTATION=true
MESSAGE_PATTERN_ROTATION=true
ACTIVITY_ROTATION=true
STATUS_ROTATION=true
TYPING_SIMULATION=true
REACTION_SIMULATION=true

# Rate Limiting
MAX_MESSAGES_PER_MINUTE=999999
MAX_COMMANDS_PER_MINUTE=999999
MAX_REACTIONS_PER_MINUTE=999999
MAX_JOINS_PER_HOUR=999999
MAX_LEAVES_PER_HOUR=999999

# Stealth Settings
STEALTH_MODE=true
HUMAN_BEHAVIOR=true
ANTI_DETECTION=true

# Discord API
API_VERSION=v10
GATEWAY_VERSION=10
INTENTS=3276799
EOF
    print_warning "Please edit .env file with your actual bot tokens before starting!"
    print_warning "You can start the system without tokens for testing, but bots won't work."
    read -p "Press Enter to continue or Ctrl+C to exit and configure tokens..."
fi

# Install dependencies
print_header "📦 Installing Dependencies"
if [ ! -d "node_modules" ]; then
    print_status "Installing npm packages..."
    npm install
    if [ $? -eq 0 ]; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
else
    print_success "Dependencies already installed"
fi

# Install PM2 globally if not installed
print_header "🔧 Installing PM2"
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2 globally..."
    npm install -g pm2
    if [ $? -eq 0 ]; then
        print_success "PM2 installed successfully"
    else
        print_error "Failed to install PM2"
        exit 1
    fi
else
    print_success "PM2 already installed: $(pm2 --version)"
fi

# Stop any existing processes
print_header "🛑 Cleaning up existing processes"
pm2 delete all 2>/dev/null || true
print_success "Existing processes cleaned up"

# Start monitoring system
print_header "🔍 Starting monitoring system"
node monitor.js &
MONITOR_PID=$!
print_success "Monitoring system started (PID: $MONITOR_PID)"

# Start health checker
print_header "❤️ Starting health checker"
node health-check.js &
HEALTH_PID=$!
print_success "Health checker started (PID: $HEALTH_PID)"

# Wait a moment for monitoring to initialize
sleep 2

# Start all processes with PM2
print_header "🎯 Starting all processes with PM2"
pm2 start ecosystem.config.js
if [ $? -eq 0 ]; then
    print_success "All processes started successfully"
else
    print_error "Failed to start processes"
    exit 1
fi

# Save PM2 configuration
pm2 save
print_success "PM2 configuration saved"

# Setup PM2 startup script (if not already done)
if ! pm2 startup | grep -q "already"; then
    print_status "Setting up PM2 startup script..."
    pm2 startup
    print_warning "Please run the command shown above to enable auto-start on boot"
fi

# Wait for services to initialize
print_header "⏳ Waiting for services to initialize"
sleep 5

# Check if web panel is accessible
print_header "🌐 Testing web panel"
for i in {1..10}; do
    if curl -s http://localhost:3000/api/bots > /dev/null 2>&1; then
        print_success "Web panel is accessible"
        break
    else
        if [ $i -eq 10 ]; then
            print_warning "Web panel not accessible after 10 attempts"
        else
            print_status "Waiting for web panel... (attempt $i/10)"
            sleep 2
        fi
    fi
done

# Display final status
print_header "📊 System Status"
echo ""
pm2 status
echo ""

# Display access information
print_header "🎉 System Ready!"
echo ""
echo -e "${GREEN}🌐 Web Panel:${NC} http://localhost:3000"
echo -e "${GREEN}📱 PM2 Monitor:${NC} pm2 monit"
echo -e "${GREEN}📊 Health Status:${NC} Check logs/health-report-*.json"
echo ""

# Display management commands
print_header "🔧 Management Commands"
echo ""
echo -e "${CYAN}Quick Commands:${NC}"
echo "  npm run pm2:start   - Start all processes"
echo "  npm run pm2:stop    - Stop all processes"
echo "  npm run pm2:restart - Restart all processes"
echo "  npm run pm2:logs    - View all logs"
echo "  npm run pm2:monit   - Open PM2 monitor"
echo ""
echo -e "${CYAN}Direct PM2 Commands:${NC}"
echo "  pm2 status          - View process status"
echo "  pm2 logs            - View all logs"
echo "  pm2 monit           - Monitor dashboard"
echo "  pm2 restart all     - Restart all processes"
echo "  pm2 stop all        - Stop all processes"
echo ""

# Display bot control information
print_header "🤖 Bot Control"
echo ""
echo -e "${CYAN}Web Panel Features:${NC}"
echo "  • Real-time bot status monitoring"
echo "  • Start/stop/restart individual bots"
echo "  • Send commands to bots"
echo "  • View real-time logs"
echo "  • Statistics dashboard"
echo ""
echo -e "${CYAN}Available Commands:${NC}"
echo "  • Basic: start, stop, restart, status"
echo "  • Messages: send-message, mass-message"
echo "  • Servers: join-server, leave-server, list-servers"
echo "  • Auto: auto-flirt, auto-roast, auto-react"
echo "  • Advanced: stealth-mode, anti-detection"
echo ""

# Display monitoring information
print_header "📈 Monitoring & Logs"
echo ""
echo -e "${CYAN}Log Files:${NC}"
echo "  • logs/web-panel-*.log - Web panel logs"
echo "  • logs/bot1-*.log - Individual bot logs"
echo "  • logs/monitor.log - System monitoring"
echo "  • logs/health-report-*.json - Health reports"
echo ""
echo -e "${CYAN}Monitoring Features:${NC}"
echo "  • Automatic process restart on crashes"
echo "  • System resource monitoring"
echo "  • Health checks every 10 seconds"
echo "  • Daily health reports"
echo "  • Log rotation and cleanup"
echo ""

# Display security information
print_header "🔒 Security Features"
echo ""
echo -e "${CYAN}Security:${NC}"
echo "  • Token encryption and secure storage"
echo "  • Rate limiting and anti-abuse"
echo "  • Stealth mode and anti-detection"
echo "  • Process isolation"
echo "  • Secure log management"
echo ""

# Final success message
print_success "🎉 Ultimate Bot Management System is now running 24/7!"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Configure your bot tokens in .env file"
echo "3. Use the web panel to control your bots"
echo "4. Monitor system health with 'pm2 monit'"
echo ""
echo -e "${YELLOW}Note:${NC} The system will automatically restart failed processes and maintain 24/7 uptime."
echo ""

# Keep script running to show real-time status
print_header "📊 Real-time Status (Press Ctrl+C to exit)"
echo ""
while true; do
    sleep 30
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} System running - $(pm2 list | grep -c online) processes online"
done