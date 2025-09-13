#!/bin/bash

echo "🚀 Starting Bot 6..."
echo "📱 Bot 6: Ultimate Self Bot (2025 Edition)"
echo "🔥 OWNS CHOTI ADVANCE"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📝 Please create .env file with BOT6_TOKEN=your_token_here"
    exit 1
fi

# Check if BOT6_TOKEN is set
if ! grep -q "BOT6_TOKEN" .env; then
    echo "❌ BOT6_TOKEN not found in .env file!"
    echo "📝 Please add BOT6_TOKEN=your_token_here to .env file"
    exit 1
fi

echo "✅ Environment variables loaded"
echo "🔄 Starting Bot 6..."

# Start bot 6
node bot6.js
