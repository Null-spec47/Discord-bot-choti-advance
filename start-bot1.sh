#!/bin/bash

echo "🚀 Starting Bot 1..."
echo "📱 Bot 1: Ultimate Self Bot (2025 Edition)"
echo "🔥 OWNS CHOTI ADVANCE"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📝 Please create .env file with BOT1_TOKEN=your_token_here"
    exit 1
fi

# Check if BOT1_TOKEN is set
if ! grep -q "BOT1_TOKEN" .env; then
    echo "❌ BOT1_TOKEN not found in .env file!"
    echo "📝 Please add BOT1_TOKEN=your_token_here to .env file"
    exit 1
fi

echo "✅ Environment variables loaded"
echo "🔄 Starting Bot 1..."

# Start bot 1
node bot1.js
