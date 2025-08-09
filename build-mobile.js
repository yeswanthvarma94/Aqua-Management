#!/usr/bin/env node

/**
 * Mobile Build Script for Aqua Data Manager
 * This script automates the mobile build process for both Android and iOS
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
  log(`\n🔧 ${description}...`, 'blue');
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed successfully`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    console.error(error.message);
    return false;
  }
}

function checkPrerequisites() {
  log('\n🔍 Checking prerequisites...', 'cyan');
  
  // Check Node.js
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    log(`✅ Node.js: ${nodeVersion}`, 'green');
  } catch {
    log('❌ Node.js not found. Please install Node.js 18 or higher', 'red');
    return false;
  }

  // Check npm
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    log(`✅ npm: v${npmVersion}`, 'green');
  } catch {
    log('❌ npm not found', 'red');
    return false;
  }

  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    log('❌ package.json not found. Are you in the project directory?', 'red');
    return false;
  }

  return true;
}

function checkEnvironment() {
  log('\n🌍 Checking environment configuration...', 'cyan');
  
  if (!fs.existsSync('.env')) {
    log('⚠️  .env file not found. Creating template...', 'yellow');
    const envTemplate = `# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Weather API (optional)
VITE_WEATHER_API_KEY=your_weather_api_key_here
`;
    fs.writeFileSync('.env', envTemplate);
    log('📝 .env template created. Please configure your environment variables.', 'yellow');
    return false;
  }
  
  log('✅ Environment file found', 'green');
  return true;
}

function buildWeb() {
  log('\n🌐 Building web application...', 'cyan');
  return execCommand('npm run build', 'Web build');
}

function syncCapacitor() {
  log('\n📱 Syncing with Capacitor...', 'cyan');
  return execCommand('npx cap sync', 'Capacitor sync');
}

function buildAndroid() {
  log('\n🤖 Preparing Android build...', 'cyan');
  
  if (!fs.existsSync('android')) {
    log('📱 Adding Android platform...', 'blue');
    if (!execCommand('npx cap add android', 'Add Android platform')) {
      return false;
    }
  }
  
  if (!syncCapacitor()) return false;
  
  log('\n🚀 Opening Android Studio...', 'magenta');
  log('In Android Studio:', 'yellow');
  log('1. Wait for Gradle sync to complete', 'yellow');
  log('2. Select your device/emulator', 'yellow');
  log('3. Click the Run button (green triangle)', 'yellow');
  
  execCommand('npx cap open android', 'Open Android Studio');
  return true;
}

function buildIOS() {
  log('\n🍎 Preparing iOS build...', 'cyan');
  
  // Check if running on macOS
  if (process.platform !== 'darwin') {
    log('❌ iOS builds are only supported on macOS', 'red');
    return false;
  }
  
  if (!fs.existsSync('ios')) {
    log('📱 Adding iOS platform...', 'blue');
    if (!execCommand('npx cap add ios', 'Add iOS platform')) {
      return false;
    }
  }
  
  if (!syncCapacitor()) return false;
  
  log('\n🚀 Opening Xcode...', 'magenta');
  log('In Xcode:', 'yellow');
  log('1. Select your device/simulator', 'yellow');
  log('2. Click the Run button (play icon)', 'yellow');
  
  execCommand('npx cap open ios', 'Open Xcode');
  return true;
}

function showHelp() {
  log('\n📖 Aqua Data Manager - Mobile Build Script', 'cyan');
  log('\nUsage: node build-mobile.js [command]', 'white');
  log('\nCommands:', 'yellow');
  log('  setup     - Install dependencies and setup project', 'white');
  log('  web       - Build web application only', 'white');
  log('  android   - Build and open Android project', 'white');
  log('  ios       - Build and open iOS project (macOS only)', 'white');
  log('  both      - Build for both Android and iOS', 'white');
  log('  help      - Show this help message', 'white');
  log('\nExamples:', 'yellow');
  log('  node build-mobile.js setup', 'white');
  log('  node build-mobile.js android', 'white');
  log('  node build-mobile.js ios', 'white');
}

function main() {
  const command = process.argv[2];
  
  log('🚀 Aqua Data Manager - Mobile Build Tool', 'magenta');
  log('==========================================', 'magenta');
  
  if (!command || command === 'help') {
    showHelp();
    return;
  }
  
  if (!checkPrerequisites()) {
    process.exit(1);
  }
  
  switch (command) {
    case 'setup':
      log('\n📦 Setting up project...', 'cyan');
      if (!execCommand('npm install', 'Install dependencies')) {
        process.exit(1);
      }
      checkEnvironment();
      log('\n✅ Setup completed! Run "node build-mobile.js android" or "node build-mobile.js ios" to build.', 'green');
      break;
      
    case 'web':
      if (!buildWeb()) {
        process.exit(1);
      }
      log('\n✅ Web build completed!', 'green');
      break;
      
    case 'android':
      if (!checkEnvironment()) {
        log('\n⚠️  Please configure your environment variables in .env file first.', 'yellow');
        process.exit(1);
      }
      if (!buildWeb() || !buildAndroid()) {
        process.exit(1);
      }
      break;
      
    case 'ios':
      if (!checkEnvironment()) {
        log('\n⚠️  Please configure your environment variables in .env file first.', 'yellow');
        process.exit(1);
      }
      if (!buildWeb() || !buildIOS()) {
        process.exit(1);
      }
      break;
      
    case 'both':
      if (!checkEnvironment()) {
        log('\n⚠️  Please configure your environment variables in .env file first.', 'yellow');
        process.exit(1);
      }
      if (!buildWeb()) {
        process.exit(1);
      }
      buildAndroid();
      if (process.platform === 'darwin') {
        buildIOS();
      } else {
        log('\n⚠️  iOS build skipped (requires macOS)', 'yellow');
      }
      break;
      
    default:
      log(`❌ Unknown command: ${command}`, 'red');
      showHelp();
      process.exit(1);
  }
}

// Run the script
main();
