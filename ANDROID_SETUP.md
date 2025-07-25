# Running When2Meet on Android

## Prerequisites

1. **Install Android Studio**
   - Download from https://developer.android.com/studio
   - Install Android SDK and platform tools

2. **Install Expo CLI**
   ```bash
   npm install -g @expo/cli
   ```

3. **Setup Android Environment**
   - Add Android SDK to your PATH
   - Enable Developer Options on your Android device
   - Enable USB Debugging

## Running the App

### Option 1: Using Expo Go (Recommended for Development)

1. **Install Expo Go on your Android device**
   - Download from Google Play Store

2. **Start the development server**
   ```bash
   cd app
   npm start
   ```

3. **Connect your device**
   - Scan the QR code with Expo Go app
   - Or connect via USB and press 'a' to run on Android

### Option 2: Building APK (For Production)

1. **Build development APK**
   ```bash
   cd app
   npx expo build:android
   ```

2. **Install on device**
   - Download the APK from Expo
   - Install on your Android device

### Option 3: Local Development Build

1. **Prerequisites**
   - Android Studio installed
   - Android device connected via USB or emulator running

2. **Create development build**
   ```bash
   cd app
   npx expo run:android
   ```

## Troubleshooting

### Common Issues:

1. **Metro bundler issues**
   ```bash
   npx expo start --clear
   ```

2. **Package version conflicts**
   ```bash
   npx expo install --fix
   ```

3. **Android build issues**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx expo run:android
   ```

4. **USB device not detected**
   - Enable Developer Options
   - Enable USB Debugging
   - Install device-specific USB drivers

## App Features on Android

- ✅ AsyncStorage data persistence
- ✅ Team management and member roles
- ✅ Availability event creation
- ✅ Drag-and-drop time selection
- ✅ Real-time response statistics
- ✅ Calendar integration
- ✅ Professional UI (no emojis)
- ✅ Offline-first functionality

## Performance Notes

- All data is stored locally using AsyncStorage
- No internet connection required after initial app load
- Smooth navigation between tabs
- Optimized for Android Material Design principles