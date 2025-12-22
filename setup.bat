@echo off
REM CivicEcho - Setup Script for Windows
REM This script helps you quickly set up CivicEcho locally

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                   CivicEcho Setup Script                      ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check Node.js
echo [1/6] Checking Node.js installation...
where node >nul 2>nul
if errorlevel 1 (
    echo ⚠ Node.js not found. Please install from https://nodejs.org
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✓ Node.js %NODE_VERSION% found
echo.

REM Backend Setup
echo [2/6] Setting up Backend...
if not exist "backend" (
    echo ⚠ backend directory not found
    exit /b 1
)

cd backend
if not exist ".env" (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo ⚠ Please update backend\.env with your credentials
)

if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
)
echo ✓ Backend setup complete
cd ..
echo.

REM Frontend Setup
echo [3/6] Setting up Frontend...
if not exist "frontend" (
    echo ⚠ frontend directory not found
    exit /b 1
)

cd frontend
if not exist ".env" (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo ⚠ Please update frontend\.env with your credentials
)

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)
echo ✓ Frontend setup complete
cd ..
echo.

REM Firebase Service Account
echo [4/6] Checking Firebase Service Account...
if not exist "backend\config\serviceAccountKey.json" (
    echo ⚠ Firebase service account key not found
    echo Please download from: Firebase Console ^> Project Settings ^> Service Accounts
    echo Save as: backend\config\serviceAccountKey.json
)
echo.

REM Docker Check
echo [5/6] Checking Docker (optional)...
where docker >nul 2>nul
if errorlevel 1 (
    echo ℹ Docker not found (optional for local development)
) else (
    for /f "tokens=*" %%i in ('docker --version') do set DOCKER_VERSION=%%i
    echo ✓ !DOCKER_VERSION! found
    echo You can use: docker-compose up
)
echo.

REM Summary
echo [6/6] Setup Summary
echo ════════════════════════════════════════════════════════════════
echo.
echo ✓ Installation complete!
echo.
echo Next steps:
echo ════════════════════════════════════════════════════════════════
echo.
echo 1. Configure environment variables:
echo    notepad backend\.env
echo    notepad frontend\.env
echo.
echo 2. Download Firebase service account key:
echo    Firebase Console ^> Project Settings ^> Service Accounts
echo    Save to: backend\config\serviceAccountKey.json
echo.
echo 3. Start the backend (Command Prompt 1):
echo    cd backend ^& npm run dev
echo.
echo 4. Start the frontend (Command Prompt 2):
echo    cd frontend ^& npm run dev
echo.
echo 5. Open your browser:
echo    http://localhost:5173
echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo For more help, see:
echo   • QUICKSTART.md - Quick start guide
echo   • docs\ENVIRONMENT_SETUP.md - Environment variables
echo   • docs\DEPLOYMENT.md - Deployment guide
echo.
echo Happy hacking! 🚀
echo.

endlocal
