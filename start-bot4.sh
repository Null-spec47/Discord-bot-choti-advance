#!/bin/bash

echo "🚀 Starting Bot 4..."
echo "📱 Bot 4: Ultimate Self Bot (2025 Edition)"
echo "🔥 OWNS CHOTI ADVANCE"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📝 Please create .env file with BOT4_TOKEN=your_token_here"
    exit 1
fi

# Check if BOT4_TOKEN is set
if ! grep -q "BOT4_TOKEN" .env; then
    echo "❌ BOT4_TOKEN not found in .env file!"
    echo "📝 Please add BOT4_TOKEN=your_token_here to .env file"
    exit 1
fi

echo "✅ Environment variables loaded"
echo "🔄 Starting Bot 4..."

# Start bot 4
node bot4.js
