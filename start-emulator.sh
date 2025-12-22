#!/bin/bash

# CivicEcho - OPTION C Quick Start Script
# Starts Firebase Emulator + Backend + Frontend

set -e

echo "🚀 CivicEcho - OPTION C Launch Script"
echo "======================================"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Install with: npm install -g firebase-tools"
    exit 1
fi

if ! command -v java &> /dev/null; then
    echo "❌ Java not found. Install Java 11+ to run emulator"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found"
    exit 1
fi

echo "✅ Prerequisites found"
echo ""

# Create function to handle cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    kill %1 2>/dev/null || true
    kill %2 2>/dev/null || true
    kill %3 2>/dev/null || true
}

trap cleanup EXIT INT TERM

# Change to project directory
cd "$(dirname "$0")"

# Start Firebase Emulator
echo "🔥 Starting Firebase Emulator Suite..."
echo "    Auth Emulator:     http://localhost:9099"
echo "    Firestore Emulator: http://localhost:8080"
echo "    Emulator UI:        http://localhost:4000"
echo ""

firebase emulators:start &
EMULATOR_PID=$!
EMULATOR_READY=false

# Wait for emulator to be ready
for i in {1..30}; do
    if nc -z localhost 8080 2>/dev/null && nc -z localhost 9099 2>/dev/null; then
        EMULATOR_READY=true
        echo "✅ Emulator ready!"
        break
    fi
    echo -n "."
    sleep 1
done

if [ "$EMULATOR_READY" = false ]; then
    echo ""
    echo "❌ Emulator failed to start. Check that ports 8080, 9099 are free"
    exit 1
fi

echo ""
sleep 2

# Start Backend
echo "🖥️  Starting Backend (Port 8000)..."
cd backend
npm run dev &
BACKEND_PID=$!

echo "⏳ Waiting for backend to start..."
for i in {1..10}; do
    if nc -z localhost 8000 2>/dev/null; then
        echo "✅ Backend ready!"
        break
    fi
    echo -n "."
    sleep 1
done

echo ""
sleep 2

# Start Frontend
echo "⚛️  Starting Frontend (Port 5173)..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "⏳ Waiting for frontend to start..."
for i in {1..10}; do
    if nc -z localhost 5173 2>/dev/null; then
        echo "✅ Frontend ready!"
        break
    fi
    echo -n "."
    sleep 1
done

echo ""
echo ""
echo "================================"
echo "✅ CivicEcho is running!"
echo "================================"
echo ""
echo "📱 Frontend:  http://localhost:5173"
echo "🖥️  Backend:   http://localhost:8000"
echo "🔧 Emulator UI: http://localhost:4000"
echo ""
echo "🧪 Test Account:"
echo "   Email: test@civicecho.local"
echo "   Password: Test123!@#"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for all background processes
wait
