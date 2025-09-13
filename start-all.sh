#!/bin/bash
set -e
# start-all.sh - start web panel and bots using PM2
cd "$(dirname "$0")"

# Load environment variables from .env if present
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Install dependencies
if [ -f package.json ]; then
  echo "Installing npm dependencies..."
  npm install
fi

# Ensure logs directory exists
mkdir -p logs

# Install pm2 globally if not present
if ! command -v pm2 >/dev/null 2>&1; then
  echo "pm2 not found, installing globally... (you may need sudo)"
  npm install -g pm2
fi

# Start processes with ecosystem config
if [ -f ecosystem.config.js ]; then
  echo "Starting processes with PM2..."
  pm2 start ecosystem.config.js --env production || pm2 restart ecosystem.config.js --env production
  pm2 save
else
  echo "ecosystem.config.js not found. Starting individual processes..."
  # Attempt to start common files if present
  [ -f web-panel.js ] && pm2 start web-panel.js --name web-panel
  for i in 1 2 3 4 5 6; do
    [ -f "bot${i}.js" ] && pm2 start "bot${i}.js" --name "bot${i}"
  done
  pm2 save
fi

echo "Done. Use 'pm2 status' to check processes and 'pm2 logs' to tail logs."