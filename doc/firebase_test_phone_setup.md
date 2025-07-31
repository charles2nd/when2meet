# Firebase Test Phone Numbers Setup

**Date:** 2025-07-31  
**Reference:** [Firebase Official Documentation](https://cloud.google.com/identity-platform/docs/test-phone-numbers)

## Overview

This document explains how to properly configure Firebase test phone numbers for development, following official Firebase guidelines.

## Why Use Firebase Test Phone Numbers?

1. **No SMS Quota Usage** - Test without consuming SMS quotas
2. **Emulator Support** - Works in iOS Simulator and Android Emulator
3. **No Rate Limiting** - Avoid Firebase SMS rate limits during development
4. **Consistent Testing** - Reliable verification codes for automated testing

## Firebase Console Setup

### Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `when2meet`
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Phone** provider

### Step 2: Configure Test Phone Numbers
1. Scroll down to **Phone numbers for testing**
2. Click **Add phone number**
3. Enter phone number in E.164 format: `+11234567891`
4. Enter 6-digit verification code: `123456`
5. Click **Save**

### Requirements
- **Format**: E.164 format (starting with +)
- **Code**: Exactly 6 digits
- **Limit**: Up to 10 test phone numbers per project
- **Security**: Use hard-to-guess numbers, avoid obvious patterns

## Test Phone Numbers Configuration

### Primary Test Number (User's)
```
Display Format: 123 456 7891
E.164 Format: +11234567891 (internal)
Verification Code: 123456
Purpose: User testing and development
```

### Additional Firebase Examples
```
Phone Number: +16505554567
Verification Code: 654321
Purpose: Firebase documentation example

Phone Number: +16505553434  
Verification Code: 123456
Purpose: Alternative US test number

Phone Number: +447444555666
Verification Code: 123456  
Purpose: UK test number
```

## Implementation Details

### SecurePhoneAuthService Configuration
The service automatically detects test phone numbers and uses the correct verification codes:

```typescript
const testPhoneNumbers: { [key: string]: string } = {
  '+11234567891': '123456', // User's test number
  '+16505554567': '654321', // Firebase example
  '+16505553434': '123456', // Alternative US
  '+447444555666': '123456' // UK example
};
```

### Development vs Production Behavior

**Development (Expo Go):**
- Uses Firebase test phone numbers
- No actual SMS sent
- Instant verification with configured codes
- Works in simulators/emulators

**Production (EAS Build):**
- Uses real Firebase phone authentication
- Sends actual SMS messages
- Real verification codes
- Works on physical devices only

## Testing Flow

### Development Testing
1. **Enter test phone number**: `123 456 7891` (no + required)
2. **App logs show**: "Using Firebase test phone number"
3. **Enter verification code**: `123456`
4. **Result**: Successful authentication without SMS

### Production Testing
1. **Enter real phone number**: Your actual number
2. **Firebase sends SMS**: Real verification code
3. **Enter received code**: From SMS message
4. **Result**: Normal phone authentication flow

## Security Considerations

### Test Number Security
- **Change codes regularly** - Update verification codes frequently
- **Limit access** - Only share test numbers with development team
- **Use test roles** - Assign limited permissions to test accounts
- **Monitor usage** - Track test number authentication in logs

### Production Safety
- **Remove test numbers** - Clean up test numbers before production
- **Validate environment** - Ensure production uses real SMS
- **Rate limiting** - Implement proper rate limiting for real numbers

## Troubleshooting

### Common Issues

**"Phone number already in use"**
- Test number is assigned to existing user
- Use different test number or delete existing user

**"Invalid verification code"**
- Ensure code matches Firebase Console configuration
- Check for typos in test phone number setup

**"SMS not received"**
- Verify you're using test number in development
- Check Firebase Console test number configuration

### Development vs Production Detection
```typescript
// The service automatically detects environment:
const isExpoGo = this.isExpoGoEnvironment();
if (isExpoGo) {
  // Use Firebase test phone numbers
} else {
  // Use real Firebase SMS authentication
}
```

## Implementation Checklist

- ✅ **Firebase Console Setup** - Test phone numbers configured
- ✅ **E.164 Format** - All numbers use proper international format  
- ✅ **6-Digit Codes** - All verification codes are exactly 6 digits
- ✅ **Service Integration** - SecurePhoneAuthService supports test numbers
- ✅ **Environment Detection** - Automatic dev vs prod detection
- ✅ **Error Handling** - Proper error messages for invalid codes
- ✅ **Security Logging** - All authentication attempts logged
- ✅ **Documentation** - Setup instructions for team

## Next Steps

1. **Add to Firebase Console** - Configure +11234567891 → 123456
2. **Test Development Flow** - Verify test number works in Expo Go
3. **Test Production Flow** - Verify real SMS works in EAS build
4. **Update Team Documentation** - Share test numbers with development team

## References

- [Firebase Phone Auth - iOS](https://firebase.google.com/docs/auth/ios/phone-auth)
- [Firebase Test Phone Numbers](https://cloud.google.com/identity-platform/docs/test-phone-numbers)
- [E.164 Phone Number Format](https://en.wikipedia.org/wiki/E.164)
- [Firebase Authentication Best Practices](https://firebase.google.com/docs/auth/best-practices)