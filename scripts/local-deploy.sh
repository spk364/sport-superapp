#!/bin/bash

# 🚀 Local Deployment Script for Fitness Apps

echo "🏗️  Building applications..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf apps/*/build

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build both applications
echo "🔨 Building client app..."
npm run client:build

echo "🔨 Building trainer app..."
npm run trainer:build

# Check if serve is installed
if ! command -v serve &> /dev/null; then
    echo "📦 Installing serve globally..."
    npm install -g serve
fi

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "🚀 Starting local servers..."
echo ""
echo "📱 Client App will be available at: http://localhost:3001"
echo "👨‍💼 Trainer App will be available at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers in background
serve -s apps/client-app/build -l 3001 &
CLIENT_PID=$!

serve -s apps/trainer-app/build -l 3000 &
TRAINER_PID=$!

# Wait for user to stop
wait

# Cleanup processes
kill $CLIENT_PID $TRAINER_PID 2>/dev/null 