#!/bin/bash

echo "Setting up NoMoney project..."

# Check prerequisites
echo "Checking prerequisites..."
if ! command -v dotnet &> /dev/null; then
    echo " .NET SDK not found. Please install .NET 8.0 SDK"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo " Node.js not found. Please install Node.js 18+"
    exit 1
fi

echo "Prerequisites check passed"

# Install Angular CLI globally if not present
if ! command -v ng &> /dev/null; then
    echo " Installing Angular CLI globally..."
    npm install -g @angular/cli@latest
fi

# Backend setup
echo "Setting up backend..."
cd backend
echo " Restoring NuGet packages..."
dotnet restore
if [ $? -ne 0 ]; then
    echo " Failed to restore backend packages"
    exit 1
fi

echo "Building backend..."
dotnet build
if [ $? -ne 0 ]; then
    echo " Failed to build backend"
    exit 1
fi

echo "Backend setup complete!"

# Frontend setup
echo "Setting up frontend..."
cd ../frontend
echo " Installing npm dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo " Failed to install frontend dependencies"
    exit 1
fi

echo "Frontend setup complete!"

# Install root dependencies for dev scripts
echo "Installing root dependencies..."
cd ..
npm install

echo "Setup complete!"
echo ""
echo "To start development:"
echo "   npm run dev          # Start both frontend and backend"
echo "   npm run backend      # Start only backend (https://localhost:7001)"
echo "   npm run frontend     # Start only frontend (http://localhost:4200)"
echo ""
echo "Other commands:"
echo "   npm run build        # Build both projects"
echo "   npm run test         # Run tests"
