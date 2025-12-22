@echo off
REM CivicEcho - OPTION C Quick Start Script (Windows)
REM Starts Firebase Emulator + Backend + Frontend

setlocal enabledelayedexpansion

echo.
echo 🚀 CivicEcho - OPTION C Launch Script
echo ======================================
echo.

REM Check prerequisites
echo 📋 Checking prerequisites...

where firebase >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Firebase CLI not found. Install with: npm install -g firebase-tools
    exit /b 1
)

where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Java not found. Install Java 11+ to run emulator
    exit /b 1
)

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found
    exit /b 1
)

echo ✅ Prerequisites found
echo.

REM Start Firebase Emulator
echo 🔥 Starting Firebase Emulator Suite...
echo     Auth Emulator:      http://localhost:9099
echo     Firestore Emulator: http://localhost:8080
echo     Emulator UI:        http://localhost:4000
echo.

start "Firebase Emulator" cmd /k "firebase emulators:start"

REM Wait for emulator to be ready
echo ⏳ Waiting for emulator to be ready (up to 30 seconds)...
setlocal enabledelayedexpansion
for /L %%i in (1,1,30) do (
    netstat -an | find "8080" >nul
    if !ERRORLEVEL! EQU 0 (
        netstat -an | find "9099" >nul
        if !ERRORLEVEL! EQU 0 (
            echo ✅ Emulator ready!
            goto emulator_ready
        )
    )
    timeout /t 1 /nobreak >nul
)

echo ❌ Emulator failed to start. Check that ports 8080, 9099 are free
exit /b 1

:emulator_ready
timeout /t 2 /nobreak >nul
echo.

REM Start Backend
echo 🖥️  Starting Backend (Port 8000)...
cd backend
start "Backend Server" cmd /k "npm run dev"

REM Wait for backend
echo ⏳ Waiting for backend to start (up to 10 seconds)...
for /L %%i in (1,1,10) do (
    netstat -an | find "8000" >nul
    if !ERRORLEVEL! EQU 0 (
        echo ✅ Backend ready!
        goto backend_ready
    )
    timeout /t 1 /nobreak >nul
)

echo ❌ Backend failed to start
exit /b 1

:backend_ready
timeout /t 2 /nobreak >nul
echo.

REM Start Frontend
echo ⚛️  Starting Frontend (Port 5173)...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"

REM Wait for frontend
echo ⏳ Waiting for frontend to start (up to 10 seconds)...
for /L %%i in (1,1,10) do (
    netstat -an | find "5173" >nul
    if !ERRORLEVEL! EQU 0 (
        echo ✅ Frontend ready!
        goto frontend_ready
    )
    timeout /t 1 /nobreak >nul
)

echo ❌ Frontend failed to start
exit /b 1

:frontend_ready
echo.
echo ================================
echo ✅ CivicEcho is running!
echo ================================
echo.
echo 📱 Frontend:   http://localhost:5173
echo 🖥️  Backend:    http://localhost:8000
echo 🔧 Emulator UI: http://localhost:4000
echo.
echo 🧪 Test Account:
echo    Email: test@civicecho.local
echo    Password: Test123!@#
echo.
echo 💡 Three terminal windows have been opened.
echo    Close any window to stop that service.
echo.
pause
