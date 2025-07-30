# Security Guidelines for When2Meet

## Environment Variables Security

### ✅ SECURE: What's Protected
- **All API keys are in `.env` file** - Never hardcoded in source code
- **`.env` is in `.gitignore`** - Will never be committed to version control
- **Proper EXPO_PUBLIC_ prefixes** - Only expose what's needed for client-side

### ⚠️ IMPORTANT: Current API Keys Status
The current `.env` file contains **PLACEHOLDER VALUES**. These need to be replaced with your actual Firebase project configuration:

```bash
# In .env file - REPLACE THESE VALUES:
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyAql7IABIXzReJDF2ZQkzofjSBEx_UE2DQ  # ← PLACEHOLDER
EXPO_PUBLIC_FIREBASE_PROJECT_ID=when2meet-87a7a                        # ← PLACEHOLDER
# ... etc
```

### 🔧 How to Get Real Values
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `when2meet-87a7a`
3. Click gear icon → Project Settings → General
4. Scroll to "Your apps" section
5. Copy the configuration values to your `.env` file

## File Protection Status

### Protected Files (✅ Secure)
```
.env                    # Environment variables
.env.*                  # All environment variants  
google-services.json    # Android Firebase config
GoogleService-Info.plist # iOS Firebase config
secrets.json           # Any secrets files
*.env                  # All .env files
```

### What's in Version Control (✅ Safe)
```
.env.example           # Template with placeholder values
SECURITY.md           # This security documentation
firebase.ts           # Code that READS from env vars (no secrets)
.gitignore            # File protection rules
```

## Environment Variables Explained

### EXPO_PUBLIC_ Prefix
Variables with this prefix are:
- ✅ Available in client-side code
- ✅ Bundled into the app
- ⚠️ Visible to end users (inspect app)
- 🎯 Used for: API endpoints, public config

### No Prefix
Variables without prefix are:
- ✅ Only available during build
- ✅ Not bundled into client app
- ✅ Hidden from end users
- 🎯 Used for: Server secrets, build config

## Security Best Practices

### ✅ DO:
- Keep `.env` in `.gitignore`
- Use `EXPO_PUBLIC_` for client-side values only
- Regularly rotate API keys
- Use different `.env` files for dev/staging/prod
- Document which keys are sensitive

### ❌ DON'T:
- Commit `.env` files to git
- Hardcode API keys in source code
- Share `.env` files in chat/email
- Use production keys in development
- Expose server secrets with `EXPO_PUBLIC_`

## Firebase Security Rules

### Current Status: ⚠️ TESTING MODE
Current Firestore rules allow public access for testing:
```javascript
// TESTING ONLY - NOT SECURE FOR PRODUCTION
allow read, write: if true;
```

### Production Rules (Recommended):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Group members can access group data
    match /groups/{groupId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.memberIds;
    }
  }
}
```

## Deployment Security Checklist

### Before Production:
- [ ] Replace all placeholder API keys with real values
- [ ] Update Firebase security rules to restrict access
- [ ] Enable Firebase Authentication
- [ ] Set up proper error logging (without exposing secrets)
- [ ] Configure CORS for your domain only
- [ ] Enable Firebase App Check (recommended)

### Environment Setup:
- [ ] `.env` file has real Firebase config
- [ ] `.env` is in `.gitignore`
- [ ] No hardcoded secrets in source code
- [ ] Different API keys for dev/staging/prod

## Emergency Response

### If API Keys Are Compromised:
1. **Immediately** rotate keys in Firebase Console
2. Update `.env` file with new keys
3. Redeploy application
4. Monitor Firebase usage for suspicious activity
5. Review Firebase security rules

### If `.env` Is Accidentally Committed:
1. **Immediately** remove from git history: `git filter-branch`
2. Rotate ALL API keys in the file
3. Update `.env` with new keys
4. Force push cleaned history
5. Notify team members to pull latest changes

## Contact & Support

- **Firebase Console**: https://console.firebase.google.com/project/when2meet-87a7a
- **Security Issues**: Contact project maintainer immediately
- **Key Rotation**: Can be done anytime in Firebase Console

---
**Last Updated**: 2025-01-28  
**Review Schedule**: Monthly  
**Next Review**: 2025-02-28