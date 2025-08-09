# Mobile App Build Guide - Aqua Data Manager

This comprehensive guide will help you build the mobile application for both Android and iOS platforms.

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **Android Studio** (for Android builds)
   - Download from: https://developer.android.com/studio
   - Install Android SDK and set up environment variables

3. **Xcode** (for iOS builds - macOS only)
   - Install from Mac App Store
   - Install iOS Simulator

4. **Capacitor CLI**
   - Will be installed with project dependencies

## Project Setup

### 1. Install Dependencies

```bash
# Navigate to project directory
cd project

# Install all dependencies
npm install

# Install Capacitor CLI globally (optional)
npm install -g @capacitor/cli
```

### 2. Environment Configuration

Create a `.env` file in the project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Building the Mobile App

### Web Build (Required First)

```bash
# Build the web application
npm run build

# Preview the build (optional)
npm run preview
```

### Android Build

#### Option 1: Development Build

```bash
# Sync web assets with Android
npm run cap:sync

# Open Android Studio
npm run cap:open:android
```

In Android Studio:
1. Wait for Gradle sync to complete
2. Select your device/emulator
3. Click the "Run" button (green triangle)

#### Option 2: Production APK

```bash
# Build web assets
npm run build

# Sync with Android
npm run cap:sync

# Open Android Studio
npm run cap:open:android
```

In Android Studio:
1. Go to **Build > Generate Signed Bundle / APK**
2. Select **APK**
3. Create or select your keystore
4. Choose **Release** build variant
5. Click **Finish**

The APK will be generated in: `android/app/build/outputs/apk/release/`

### iOS Build (macOS only)

#### Option 1: Development Build

```bash
# Sync web assets with iOS
npm run cap:sync

# Open Xcode
npm run cap:open:ios
```

In Xcode:
1. Select your device/simulator
2. Click the "Run" button (play icon)

#### Option 2: Production Build

```bash
# Build web assets
npm run build

# Sync with iOS
npm run cap:sync

# Open Xcode
npm run cap:open:ios
```

In Xcode:
1. Select **Generic iOS Device** as target
2. Go to **Product > Archive**
3. Follow App Store Connect distribution process

## Quick Commands Reference

```bash
# Development workflow
npm run dev                    # Start development server
npm run build                  # Build for production
npm run cap:sync              # Sync web assets with native platforms

# Android commands
npm run cap:run:android       # Build and run on Android device
npm run cap:open:android      # Open Android Studio

# iOS commands  
npm run cap:run:ios          # Build and run on iOS device/simulator
npm run cap:open:ios         # Open Xcode
```

## App Features

### Mobile-Optimized UI
- Native-like interface with bottom navigation
- Pull-to-refresh functionality
- Responsive design for all screen sizes
- Haptic feedback support

### Native Integrations
- **Location Services**: Weather data and farm locations
- **Camera**: Tank monitoring and documentation
- **Network Detection**: Offline/online status
- **Push Notifications**: Feeding reminders and alerts
- **Haptic Feedback**: Enhanced user experience

### Key Mobile Screens
1. **Dashboard**: Farm overview with real-time metrics
2. **Tank Management**: Monitor individual tanks
3. **Feeding Scheduler**: Schedule and track feeding times
4. **Stock Manager**: Inventory management
5. **Expense Tracker**: Financial monitoring
6. **Settings**: Account and app preferences

## Troubleshooting

### Common Issues

#### Android Build Fails
- Ensure Android SDK is properly installed
- Check Gradle version compatibility
- Clear cache: `cd android && ./gradlew clean`

#### iOS Build Fails
- Verify Xcode is up to date
- Check iOS deployment target (minimum iOS 13.0)
- Clean build folder: **Product > Clean Build Folder**

#### Web Assets Not Syncing
```bash
# Force rebuild and sync
npm run build
npx cap sync --force
```

#### App Crashes on Startup
- Check console logs in Android Studio/Xcode
- Verify environment variables are set
- Ensure Supabase connection is working

### Performance Optimization

1. **Image Optimization**: Use WebP format when possible
2. **Bundle Size**: Monitor and optimize JavaScript bundles
3. **Memory Usage**: Profile the app using native tools
4. **Network Requests**: Implement proper caching strategies

## Testing

### Device Testing
- Test on multiple screen sizes and orientations
- Verify offline functionality
- Test native features (camera, location, haptics)
- Performance testing on low-end devices

### Production Checklist
- [ ] All environment variables configured
- [ ] App icons and splash screens added
- [ ] Push notification setup (if required)
- [ ] Analytics integration
- [ ] Crash reporting setup
- [ ] App store metadata prepared

## Support

For technical support or questions:
1. Check the troubleshooting section
2. Review Capacitor documentation: https://capacitorjs.com/docs
3. Check platform-specific guides for Android/iOS development

## Next Steps

1. **App Store Submission**: Prepare app store listings and screenshots
2. **Analytics**: Integrate analytics to track user behavior
3. **Push Notifications**: Set up Firebase for push notifications
4. **Crash Reporting**: Implement crash reporting (Sentry, Crashlytics)
5. **Updates**: Plan for over-the-air updates using Capacitor

---

**Note**: This application is designed for aquaculture management and includes features specific to fish and shrimp farming operations.
