#!/bin/bash

echo "🚀 Starting Bot 5..."
echo "📱 Bot 5: Ultimate Self Bot (2025 Edition)"
echo "🔥 OWNS CHOTI ADVANCE"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📝 Please create .env file with BOT5_TOKEN=your_token_here"
    exit 1
fi

# Check if BOT5_TOKEN is set
if ! grep -q "BOT5_TOKEN" .env; then
    echo "❌ BOT5_TOKEN not found in .env file!"
    echo "📝 Please add BOT5_TOKEN=your_token_here to .env file"
    exit 1
fi

echo "✅ Environment variables loaded"
echo "🔄 Starting Bot 5..."

# Start bot 5
node bot5.js
