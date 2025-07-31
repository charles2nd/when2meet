# Firebase Security Configuration

## SECURITY CRITICAL - READ CAREFULLY

This document explains how to properly configure Firebase credentials without exposing sensitive API keys in version control.

## Environment Variables Setup

### Required Environment Variables

Add these to your `.env` file (which is gitignored):

```bash
# Firebase Configuration - REQUIRED
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456789

# Google Sign-In Configuration
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
```

### Getting Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > General
4. Under "Your apps", find your web app configuration
5. Copy each value to your `.env` file

## Google Services Files

### For iOS Development

1. In Firebase Console, go to Project Settings > General
2. Under "Your apps", click on iOS app
3. Download `GoogleService-Info.plist`
4. Replace the template file `GoogleService-Info.plist` with your real file
5. **NEVER commit the real file to git**

### For Android Development

1. In Firebase Console, go to Project Settings > General
2. Under "Your apps", click on Android app
3. Download `google-services.json`
4. Replace the template file `google-services.json` with your real file
5. **NEVER commit the real file to git**

## Security Rules Applied

The following security measures have been implemented:

### 1. Environment Variable Validation
- Firebase service now validates all required environment variables
- App will not start without proper configuration
- Clear error messages for missing variables

### 2. Firestore Security Rules
- Replaced wide-open rules with authentication-based access
- Users can only access their own data
- Group members can only access group-related data
- Proper role-based permissions for admins

### 3. Credential Protection
- No hardcoded API keys in source code
- Template files provided for Google Services files
- Real credential files are gitignored
- Clear documentation for setup

## Development vs Production

### Development
- Use `.env` file for local development
- Template Google Services files for basic testing
- Real files for full functionality testing

### Production (EAS Build)
- Use EAS Build secrets for environment variables
- Upload real Google Services files via EAS CLI
- Never include real credentials in repository

## Verification

To verify security setup:

1. Check that `.env` file exists and contains all required variables
2. Verify real Google Services files are not committed to git
3. Ensure Firebase service validates environment variables
4. Test app startup to confirm proper configuration

## Common Issues

### Missing Environment Variables
**Error:** `Missing required environment variables`
**Solution:** Add all required variables to `.env` file

### Google Sign-In Not Working
**Error:** Google authentication fails
**Solution:** 
1. Verify `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in `.env`
2. Replace template Google Services files with real ones
3. Ensure bundle IDs match in Firebase Console

### Firestore Permission Denied
**Error:** `permission-denied` in Firestore operations
**Solution:** 
1. Verify user is authenticated
2. Check Firestore security rules are deployed
3. Ensure user has proper group membership

## References

- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/basics)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [EAS Build Secrets](https://docs.expo.dev/build-reference/variables/)