# How to Find Your Google OAuth Client ID

## Method 1: From GoogleService-Info.plist (Easiest)

1. **Download from Firebase Console**:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project
   - Click the gear icon → **Project Settings**
   - Scroll to "Your apps" section
   - Under iOS app, click **Download GoogleService-Info.plist**

2. **Open the file and find REVERSED_CLIENT_ID**:
   ```xml
   <key>REVERSED_CLIENT_ID</key>
   <string>com.googleusercontent.apps.445362077095-abcd1234efgh5678ijkl9012mnop3456</string>
   ```
   Copy this entire string including `com.googleusercontent.apps.`

## Method 2: From Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project from the dropdown
3. Navigate to **APIs & Services → Credentials**
4. Look for **OAuth 2.0 Client IDs** section
5. Find the iOS client (should show your bundle ID: com.when2meet.app)
6. Click on it to see details
7. The Client ID will be shown as: `445362077095-abcd1234efgh5678ijkl9012mnop3456.apps.googleusercontent.com`
8. For the URL scheme, prepend with `com.googleusercontent.apps.` and use only the first part

## Method 3: From Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication → Sign-in method**
4. Click on **Google** provider
5. Expand the "Web SDK configuration" section
6. You'll see the Web client ID, but for iOS you need to check the downloaded plist file

## What the ID looks like

The complete iOS URL scheme should look like:
```
com.googleusercontent.apps.445362077095-abcd1234efgh5678ijkl9012mnop3456
```

Where:
- `445362077095` is your project number
- The rest is a unique identifier for your iOS OAuth client

## Important Notes

- This is NOT your Apple App ID (like SWSL7LXCU5)
- This is NOT just "docmaillouwhen2meet" 
- It must start with `com.googleusercontent.apps.`
- It's typically 50-70 characters long total