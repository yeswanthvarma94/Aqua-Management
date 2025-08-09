@echo off
echo ========================================
echo  Aqua Data Manager - Mobile Setup
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo.
    echo Please download and install Node.js from: https://nodejs.org/
    echo After installation, restart this script.
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js is installed
node --version

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not available
    pause
    exit /b 1
)

echo ✅ npm is available
npm --version

echo.
echo 📦 Installing project dependencies...
echo This may take a few minutes...
echo.

npm install

if %errorlevel% neq 0 (
    echo.
    echo ❌ Failed to install dependencies
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!
echo.

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating environment configuration file...
    echo # Supabase Configuration > .env
    echo VITE_SUPABASE_URL=your_supabase_url_here >> .env
    echo VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here >> .env
    echo. >> .env
    echo # Weather API (optional) >> .env
    echo VITE_WEATHER_API_KEY=your_weather_api_key_here >> .env
    echo.
    echo ⚠️  Environment file created (.env)
    echo Please configure your Supabase credentials in the .env file
    echo.
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo Next steps:
echo 1. Configure your environment variables in .env file
echo 2. Run one of these commands:
echo.
echo    For Android: node build-mobile.js android
echo    For iOS:     node build-mobile.js ios (macOS only)
echo    For help:    node build-mobile.js help
echo.
echo Prerequisites for mobile development:
echo - Android Studio (for Android builds)
echo - Xcode (for iOS builds - macOS only)
echo.
pause
