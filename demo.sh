#!/bin/bash

# Discord Bot Choti Advance - Quick Start Demo
# This script demonstrates all the ways to run the Discord bot in terminal

echo "🎯 Discord Bot Choti Advance - Terminal Demo"
echo "=============================================="
echo

echo "📋 Available startup methods:"
echo
echo "1️⃣  Interactive Terminal Interface:"
echo "   npm start"
echo "   # OR"
echo "   node index.js"
echo
echo "2️⃣  Individual Bot Startup:"
echo "   ./start-bot1.sh"
echo "   ./start-bot2.sh"
echo "   # ... up to bot6"
echo
echo "3️⃣  All Bots with PM2:"
echo "   ./start-all.sh"
echo
echo "4️⃣  Direct Node.js execution:"
echo "   node bot1.js"
echo "   node bot2.js"
echo "   # ... etc"
echo
echo "5️⃣  Web Panel:"
echo "   node web-panel.js"
echo

echo "⚙️  Setup Steps:"
echo "1. Copy .env.example to .env"
echo "2. Add your Discord bot tokens to .env"
echo "3. Run: npm install (already done)"
echo "4. Choose any startup method above"
echo

echo "🎮 Launching Terminal Interface in 3 seconds..."
sleep 3

# Launch the terminal interface
npm start