# 🚀 Quick Start Guide - When2Meet App

## ✅ Issue Fixed!

The app has been restructured to use standard React Navigation instead of expo-router to avoid the module issues.

## 📱 Start the App

### Step 1: Install Dependencies
```bash
cd app
npm install
```

### Step 2: Start Expo
```bash
npx expo start
```

### Step 3: Run on Device
- Press `w` for web browser
- Press `i` for iOS simulator  
- Press `a` for Android emulator
- Or scan QR code with Expo Go app on your phone

## 🎯 What's Working

The complete When2Meet availability scheduler is ready with:

✅ **Interactive Availability Grid**
- Touch-optimized drag selection
- Real-time visual feedback
- Color-coded participant counts

✅ **Three View Modes**
- Grid View: Select your availability
- Participants View: See who's responded
- Summary View: Find optimal meeting times

✅ **Full Navigation**
- Bottom tab navigation (Meet, Groups, Profile)
- Stack navigation for availability screens
- Create and view availability events

✅ **Firebase Ready**
- Services configured for real-time sync
- Authentication hooks ready
- Team management integrated

## 📲 Testing the App

1. **Navigate to Meet Tab**
   - Tap "Create Availability Event" button

2. **Create an Event**
   - Fill in event details
   - Select date range and time slots
   - Choose participants

3. **View Event**
   - See the interactive grid
   - Switch between views
   - Test drag selection

## 🔧 Troubleshooting

If you still see errors:

```bash
# Clear everything
cd app
rm -rf node_modules package-lock.json .expo
npm cache clean --force

# Fresh install
npm install
npx expo start --clear
```

## 📁 Key Files

- `App.tsx` - Main app entry with navigation
- `app/(tabs)/meet/index.tsx` - Meet home screen
- `app/(tabs)/meet/availability/create.tsx` - Create event
- `app/(tabs)/meet/availability/[eventId].tsx` - View event
- `components/availability/AvailabilityGrid.tsx` - Main grid component

The app is now using standard React Navigation which is more stable and avoids the expo-router plugin issues!