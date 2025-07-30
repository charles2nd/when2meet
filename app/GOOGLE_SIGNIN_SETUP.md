# Google Sign-In Setup Guide

This guide will help you configure Google Sign-In for the When2Meet mobile application.

## Current Status

❌ **Google Sign-In is NOT configured** - You need to set up Firebase and Google Services files.

The app currently shows this error:
```
ERROR  Google Sign-In Error: [Error: Google Sign-In not configured for mobile yet]
```

## ⚠️ IMPORTANT: iOS-Specific Configuration Required

For iOS, you MUST complete these additional steps or Google Sign-In will not work.

## Setup Steps

### 1. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create one if needed)
3. Go to **Authentication** → **Sign-in method**
4. Click on **Google** provider
5. Click **Enable**
6. Note down the **Web client ID** (you'll need this later)

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Google Web Client ID:
   ```
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-actual-web-client-id.apps.googleusercontent.com
   ```

### 3. Download Google Services Files

#### For Android (google-services.json):
1. In Firebase Console, go to **Project Settings** → **General**
2. Under **Your apps**, find your Android app or click **Add app**
3. Package name should be: `com.when2meet.app`
4. Download `google-services.json`
5. Replace the placeholder file in your project root

#### For iOS (GoogleService-Info.plist):
1. In Firebase Console, go to **Project Settings** → **General**
2. Under **Your apps**, find your iOS app or click **Add app**
3. Bundle ID should be: `com.when2meet.app`
4. Download `GoogleService-Info.plist`
5. Replace the placeholder file in your project root
6. **CRITICAL**: Open the downloaded `GoogleService-Info.plist` file
7. Find the `REVERSED_CLIENT_ID` value (looks like: `com.googleusercontent.apps.123456789-abc123def456...`)
8. Copy this value and update `app.json`:
   ```json
   "ios": {
     "config": {
       "googleSignIn": {
         "reservedClientId": "YOUR_ACTUAL_REVERSED_CLIENT_ID_HERE"
       }
     },
     "infoPlist": {
       "CFBundleURLTypes": [
         {
           "CFBundleURLSchemes": ["YOUR_ACTUAL_REVERSED_CLIENT_ID_HERE"]
         }
       ]
     }
   }
   ```

### 4. iOS URL Scheme Configuration

For iOS to properly handle Google Sign-In redirects, you MUST:

1. **Update app.json** with your actual `REVERSED_CLIENT_ID` from the GoogleService-Info.plist file
2. **The REVERSED_CLIENT_ID** is critical - without it, iOS can't handle the OAuth redirect
3. **Example**: If your REVERSED_CLIENT_ID is `com.googleusercontent.apps.123456789-abc123def456`, replace both instances in app.json

### 5. Rebuild the App

After making these changes, you need to rebuild the app:

```bash
# Clear cache and rebuild
npx expo start --clear

# For iOS simulator (after configuring REVERSED_CLIENT_ID)
npx expo run:ios

# For production build
eas build --platform all --profile production
```

## Troubleshooting

### Common Issues:

1. **"Google Sign-In not configured for mobile yet"**
   - This means the setup steps above haven't been completed
   - Make sure you have proper `google-services.json` and `GoogleService-Info.plist` files
   - **For iOS**: Verify that `REVERSED_CLIENT_ID` is correctly set in app.json

2. **"SIGN_IN_CANCELLED"**
   - User cancelled the Google Sign-In flow
   - This is normal user behavior

3. **"PLAY_SERVICES_NOT_AVAILABLE"** (Android only)
   - Google Play Services not installed or outdated
   - Install/update Google Play Services on the device

4. **"IN_PROGRESS"**
   - Google Sign-In already in progress
   - Wait for current sign-in to complete

### Verification Steps:

1. Check that `google-services.json` has real values (not placeholder)
2. Check that `GoogleService-Info.plist` has real values (not placeholder)
3. Verify your `.env` file has the correct Web Client ID
4. **CRITICAL FOR iOS**: Verify `app.json` has the correct `REVERSED_CLIENT_ID` from your GoogleService-Info.plist
5. Make sure you've rebuilt the app after making changes
6. Test on actual device or simulator after rebuilding

## Files Created/Modified:

- ✅ **Package installed**: `@react-native-google-signin/google-signin`
- ✅ **App.json updated**: Added Google Sign-In plugin and Google Services file references
- ✅ **Firebase service updated**: Added mobile Google Sign-In implementation with improved error handling
- ✅ **iOS Configuration**: Added URL scheme configuration for iOS OAuth redirects
- ✅ **Placeholder files created**: `google-services.json` and `GoogleService-Info.plist`
- ✅ **Environment example updated**: Added Google Web Client ID configuration

## Next Steps:

1. **CRITICAL FOR iOS**: Get your real `GoogleService-Info.plist` and update `app.json` with the correct `REVERSED_CLIENT_ID`
2. Get real `google-services.json` for Android
3. Add your Web Client ID to `.env` file
4. Rebuild the app completely
5. Test Google Sign-In on both Android and iOS

## Quick Setup Summary for iOS:

1. Download `GoogleService-Info.plist` from Firebase Console
2. Find `REVERSED_CLIENT_ID` in that file
3. Replace `YOUR_REVERSED_CLIENT_ID` in `app.json` with the actual value
4. Run `npx expo run:ios` to rebuild

---

**Note**: The app currently falls back to demo authentication when Google Sign-In fails, so you can continue using the app while setting up Google Sign-In.