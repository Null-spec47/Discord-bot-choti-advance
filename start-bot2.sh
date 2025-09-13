#!/bin/bash

echo "🚀 Starting Bot 2..."
echo "📱 Bot 2: Ultimate Self Bot (2025 Edition)"
echo "🔥 OWNS CHOTI ADVANCE"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📝 Please create .env file with BOT2_TOKEN=your_token_here"
    exit 1
fi

# Check if BOT2_TOKEN is set
if ! grep -q "BOT2_TOKEN" .env; then
    echo "❌ BOT2_TOKEN not found in .env file!"
    echo "📝 Please add BOT2_TOKEN=your_token_here to .env file"
    exit 1
fi

echo "✅ Environment variables loaded"
echo "🔄 Starting Bot 2..."

# Start bot 2
node bot2.js
