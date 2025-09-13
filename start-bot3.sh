#!/bin/bash

echo "🚀 Starting Bot 3..."
echo "📱 Bot 3: Ultimate Self Bot (2025 Edition)"
echo "🔥 OWNS CHOTI ADVANCE"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📝 Please create .env file with BOT3_TOKEN=your_token_here"
    exit 1
fi

# Check if BOT3_TOKEN is set
if ! grep -q "BOT3_TOKEN" .env; then
    echo "❌ BOT3_TOKEN not found in .env file!"
    echo "📝 Please add BOT3_TOKEN=your_token_here to .env file"
    exit 1
fi

echo "✅ Environment variables loaded"
echo "🔄 Starting Bot 3..."

# Start bot 3
node bot3.js
