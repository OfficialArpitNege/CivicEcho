#!/bin/bash

# CivicEcho - Setup Script
# This script helps you quickly set up CivicEcho locally

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                   CivicEcho Setup Script                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${BLUE}[1/6]${NC} Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠ Node.js not found. Please install Node.js 16+ from https://nodejs.org${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) found${NC}"
echo ""

# Backend Setup
echo -e "${BLUE}[2/6]${NC} Setting up Backend..."
if [ ! -d "backend" ]; then
    echo -e "${YELLOW}⚠ backend directory not found${NC}"
    exit 1
fi

cd backend
if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}⚠ Please update backend/.env with your credentials${NC}"
fi

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi
echo -e "${GREEN}✓ Backend setup complete${NC}"
cd ..
echo ""

# Frontend Setup
echo -e "${BLUE}[3/6]${NC} Setting up Frontend..."
if [ ! -d "frontend" ]; then
    echo -e "${YELLOW}⚠ frontend directory not found${NC}"
    exit 1
fi

cd frontend
if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}⚠ Please update frontend/.env with your credentials${NC}"
fi

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi
echo -e "${GREEN}✓ Frontend setup complete${NC}"
cd ..
echo ""

# Firebase Service Account
echo -e "${BLUE}[4/6]${NC} Checking Firebase Service Account..."
if [ ! -f "backend/config/serviceAccountKey.json" ]; then
    echo -e "${YELLOW}⚠ Firebase service account key not found${NC}"
    echo "Please download from: Firebase Console → Project Settings → Service Accounts"
    echo "Save as: backend/config/serviceAccountKey.json"
fi
echo ""

# Docker Check
echo -e "${BLUE}[5/6]${NC} Checking Docker (optional)..."
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker $(docker --version) found${NC}"
    echo "You can use: docker-compose up"
else
    echo -e "${YELLOW}ℹ Docker not found (optional for local development)${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}[6/6]${NC} Setup Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✓ Installation complete!${NC}"
echo ""
echo "Next steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Configure environment variables:"
echo -e "   ${YELLOW}nano backend/.env${NC}"
echo -e "   ${YELLOW}nano frontend/.env${NC}"
echo ""
echo "2. Download Firebase service account key:"
echo "   Firebase Console → Project Settings → Service Accounts"
echo "   Save to: backend/config/serviceAccountKey.json"
echo ""
echo "3. Start the backend (Terminal 1):"
echo -e "   ${YELLOW}cd backend && npm run dev${NC}"
echo ""
echo "4. Start the frontend (Terminal 2):"
echo -e "   ${YELLOW}cd frontend && npm run dev${NC}"
echo ""
echo "5. Open your browser:"
echo "   http://localhost:5173"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "For more help, see:"
echo "  • QUICKSTART.md - Quick start guide"
echo "  • docs/ENVIRONMENT_SETUP.md - Environment variables"
echo "  • docs/DEPLOYMENT.md - Deployment guide"
echo ""
echo -e "${GREEN}Happy hacking! 🚀${NC}"
