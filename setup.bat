@echo off
echo setting up

REM Check prerequisites
echo 📋 Checking prerequisites...
dotnet --version >nul 2>&1
if %errorlevel% neq 0 (
    echo .NET SDK not found. Please install .NET 8.0 SDK
    pause
    exit /b 1
)

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Install Angular CLI globally if not present
ng version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Angular CLI globally...
    npm install -g @angular/cli@latest
)

REM Backend setup
echo 🔧 Setting up backend...
cd backend
echo Restoring NuGet packages...
dotnet restore
if %errorlevel% neq 0 (
    echo Failed to restore backend packages
    pause
    exit /b 1
)

echo 🔨 Building backend...
dotnet build
if %errorlevel% neq 0 (
    echo Failed to build backend
    pause
    exit /b 1
)

echo Backend setup complete!

REM Frontend setup
echo 🔧 Setting up frontend...
cd ..\frontend
echo Installing npm dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo Frontend setup complete!

REM Install root dependencies for dev scripts
echo Installing root dependencies...
cd ..
npm install

echo Setup complete!
echo.
echo To start development:
echo    npm run dev          # Start both frontend and backend
echo    npm run backend      # Start only backend (https://localhost:7001)
echo    npm run frontend     # Start only frontend (http://localhost:4200)
echo.
echo Other commands:
echo    npm run build        # Build both projects
echo    npm run test         # Run tests
echo.
pause
