#!/bin/bash

# Ultimate Bot Management System - Startup Script
# Professional 24/7 Hosting Solution

echo "🚀 Starting Ultimate Bot Management System..."
echo "=============================================="

# Create logs directory
mkdir -p logs

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "🔧 Installing PM2..."
    npm install -g pm2
fi

# Stop any existing processes
echo "🛑 Stopping existing processes..."
pm2 delete all 2>/dev/null || true

# Start all processes with PM2
echo "🎯 Starting all bots and web panel..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup

echo ""
echo "✅ All systems started successfully!"
echo ""
echo "📊 Management Commands:"
echo "  pm2 status          - View all processes"
echo "  pm2 logs            - View all logs"
echo "  pm2 monit           - Monitor dashboard"
echo "  pm2 restart all     - Restart all processes"
echo "  pm2 stop all        - Stop all processes"
echo ""
echo "🌐 Web Panel: http://localhost:3000"
echo "📱 PM2 Monitor: pm2 monit"
echo ""
echo "🔧 Bot Control Commands:"
echo "  npm run pm2:start   - Start all processes"
echo "  npm run pm2:stop    - Stop all processes"
echo "  npm run pm2:restart - Restart all processes"
echo "  npm run pm2:logs    - View logs"
echo "  npm run pm2:monit   - Open monitor"
echo ""

# Show initial status
pm2 status

echo ""
echo "🎉 System is now running 24/7!"
echo "💡 Use the web panel at http://localhost:3000 for easy management"