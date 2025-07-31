# When2Meet - Core Project Direction

**Last Updated: 2025-01-31 14:45:00 UTC**  
**App Version: 1.0.0**  
**Framework: React Native + Expo**  
**Theme: Counter-Strike 2 Tactical Design**

---

## PROJECT OVERVIEW

When2Meet is a React Native mobile application built with Expo Framework for coordinating meeting times within groups. The app features a tactical Counter-Strike 2 inspired dark theme with orange/gold accents for a professional, gaming-aesthetic user experience.

## SPECIALIZED DEVELOPMENT AGENTS

The project utilizes specialized agents for different development tasks:

- **firebase-integration-specialist**: Firebase authentication, Firestore database operations, security rules, cloud services integration
- **react-native-expert**: React Native development, Expo Framework expertise, mobile UX/UI, cross-platform development  
- **security-audit-engineer**: Security reviews, vulnerability assessment, code auditing, production readiness validation
- **i18n-translator**: Internationalization, translation management, multilingual support, localization
- **ux-ui-standards-auditor**: UX/UI design review, accessibility compliance, mobile design patterns

These agents should be used via the Task tool for specialized development tasks requiring domain expertise.

---

## AUTHENTICATION SYSTEM

### Login Page (`/app/login.tsx` → `ModernLoginScreen.tsx`)
- **PRODUCTION-ONLY Secure CS2-themed login interface**
- **Features:**
  - **SECURE PHONE AUTHENTICATION** - Production Firebase SMS verification
  - Google Sign-In integration
  - **NO DEMO MODE** - Production security only
  - **Custom CS2 modals** replace iOS/Android Alert popups
  - Tactical gradient header with app branding
  - Comprehensive form validation and security error handling
  - **EAS Build compatibility** for production SMS
- **Flow:** All successful logins redirect to `/(tabs)/group`
- **Theme:** Full CS2 theme integration with custom modal components

### Authentication Context (`/contexts/AuthContext.tsx`)
- **Production Firebase authentication integration**
- **NO DEMO MODE - Production security only**
- **User state management with triggers**
- **Features:**
  - User persistence via AsyncStorage
  - Login/logout triggers for navigation  
  - Admin role detection
  - Automatic data loading on auth
  - **Secure phone authentication** with SMS verification
  - **Custom CS2-themed modals** instead of system alerts

---

## TAB NAVIGATION SYSTEM

### Dynamic Tab Layout (`/app/(tabs)/_layout.tsx`)
- **Conditional tab visibility based on group membership**
- **Tab Structure:**
  - **Users WITHOUT group:** 2 tabs (Group + Profile)
  - **Users WITH group:** 3 tabs (Calendar + Group + Profile)
- **Debug logging for group state tracking**

---

## PAGE STRUCTURE & FEATURES

### 1. GROUP PAGE (`/app/(tabs)/group.tsx` → `GroupScreen.tsx`)

**PRIMARY LANDING PAGE FOR ALL USERS**

#### Features:
- **No Group State (Default View):**
  - Create new group form with squad name input
  - Join existing group form with code input
  - CS2 tactical themed interface
  - Error handling and validation

- **Has Group State:**
  - Group information display
  - Member list and availability heatmap
  - can chat in the groupe (websokets)
  - Color-coded availability indicators
  
#### Buttons & Actions:
- **"CREATE NEW GROUP"** → Opens group creation form
- **"JOIN EXISTING GROUP"** → Opens group join form
- **"GO BACK"** → Cancels current form

### 2. CALENDAR PAGE (`/app/(tabs)/calendar.tsx` → `CalendarScreen.tsx`)

**ONLY VISIBLE TO GROUP MEMBERS**

#### Features:
- **Personal availability management**
- **Monthly date selection**
- **24-hour time slot grid**
- **Toggle-based availability setting**
- **Data persistence and synchronization**

#### Buttons & Actions:
- **Date buttons** → Select specific date for editing
- **Hour blocks** → Toggle availability for specific hours
- **"SAVE AVAILABILITY"** → Persist changes to storage
- **Auto-redirect** → Non-group members redirected to group page

#### Flow Control:
- **Entry Requirement:** Must have currentGroup
- **Auto-redirect:** Users without group → group page
- **State Management:** Real-time availability tracking
- **Availability heatmap** → 24-hour grid with member counts
- **LEGEND** from transparent to light green to dark green depending on member count 0 = transparent 1= light 2-3-4 darker ligth green 5+ dark green

### 3. PROFILE PAGE (`/app/(tabs)/profile.tsx` → `ProfileScreen.tsx`)

**USER ACCOUNT MANAGEMENT**

#### Features:
- **User information display**
- **Account settings**
- **Language preferences**
- **Logout functionality**

#### Buttons & Actions:
- **Logout button** → Clears session, redirects to login
- **Settings toggles** → Various user preferences
- **Profile editing** → Update user information

---

## THEME SYSTEM

### CS2 Theme Architecture (`/theme/`)

#### Core Files:
- **`cs2Theme.ts`** → Main color palette and design tokens
- **`commonStyles.ts`** → Reusable style patterns
- **`index.ts`** → Theme exports and backwards compatibility
- **`useTheme.ts`** → Theme hooks for components

#### Color Palette:
- **Primary:** #FF6B35 (Terrorist Orange)
- **Secondary:** #2196F3 (Counter-Terrorist Blue)  
- **Accent:** #FFD700 (CS2 Gold)
- **Background:** #1A1A1A (Tactical Dark)
- **Surface:** #2D2D2D (Panel/Card Background)
- **Text Primary:** #FFFFFF (High Contrast)
- **Text Secondary:** #B0B0B0 (Medium Gray)

#### Design Principles:
- **Tactical aesthetic** without decorative elements
- **Consistent spacing** using design tokens
- **Accessible contrast ratios**
- **Platform-specific adaptations**

---

## DATA ARCHITECTURE

### Storage Systems:
- **PRIMARY STORAGE:** LocalStorage service (AsyncStorage wrapper) for ALL data persistence
- **FUTURE:** Firebase for cloud synchronization (NOT IMPLEMENTED YET)
- **IMPORTANT:** Using ONLY LOCAL STORAGE for now - Firebase will be added later

### Data Models (`/models/`):
- **User.ts** → User account and preferences
- **Group.ts** → Group information and member management
- **Availability.ts** → Time slot availability data
- **SimpleAvailability.ts** → Simplified availability operations

### Context Providers:
- **AuthContext** → Firebase authentication state and user management
- **AppContext** → Application state, group operations, and local user data
- **IMPORTANT:** Two separate user states - AuthContext for Firebase auth, AppContext for app data
- **Profile Screen:** Now uses AuthContext for user display to fix "No user logged in" issue

---

## NAVIGATION FLOW

### Authentication Flow:
1. **App Launch** → Check authentication status
2. **Not Authenticated** → Redirect to `/login`
3. **Authenticated** → Redirect to `/(tabs)/group`

### Group Management Flow:
1. **New User Login** → Group page (2 tabs visible)
2. **Create/Join Group** → Success alert with calendar redirect
3. **Group Member** → Calendar tab becomes visible (3 tabs total)

### Data Flow:
1. **User Actions** → Update local state
2. **State Changes** → Persist to AsyncStorage
3. **Background Sync** → Upload to Firebase
4. **Cross-device** → Download latest data on app launch

---

## TECHNICAL SPECIFICATIONS

### Dependencies:
- **React Native:** 0.79.5
- **Expo:** ~53.0.20
- **Firebase:** ^10.14.1
- **React Navigation:** ^7.1.6
- **AsyncStorage:** ^2.1.2
- **Vector Icons:** ^14.1.0
- **Linear Gradient:** ^14.1.5

### Development Environment:
- **TypeScript** for type safety
- **Jest** for testing framework
- **Expo Router** for file-based navigation
- **ESLint/Prettier** for code formatting

---

## RECENT CHANGES LOG

### 2025-01-28 Session Updates:

#### Core Project Direction Implementation:
- **IMPLEMENTED:** Group chat with WebSocket real-time messaging
- **UPDATED:** Button text to match specifications (GO BACK instead of ABORT MISSION)
- **ADDED:** Availability heatmap legend with proper color coding (0=transparent, 1=light green, 2-4=darker light green, 5+=dark green)
- **ENHANCED:** Real-time connection status indicator in chat
- **CREATED:** WebSocketService for scalable real-time communication
- **FIXED:** ProfileScreen now properly displays user information from Auth/App contexts
- **FIXED:** Calendar tab visibility - now strictly shows only when user has a group with members
- **FIXED:** Profile screen authentication flow - removed double AuthGuard wrapping

#### Authentication Security Implementation:
- **CRITICAL FIX:** Added comprehensive authentication guards to prevent unauthenticated access
- **Enhanced:** Tab layout with authentication checking and loading states
- **Protected:** All screens (Group, Calendar, Profile) with AuthGuard component
- **Implemented:** Proper redirect logic for unauthenticated users
- **Added:** Loading states during authentication verification
- **Secured:** App content now completely blocked for non-authenticated users
- **FIREBASE TEST NUMBERS:** Implemented official Firebase test phone number support (+11234567891 → 123456)
- **COMPLIANCE:** Following Firebase official documentation for test phone authentication
- **DEVELOPMENT:** Proper environment detection (Expo Go vs EAS Build) for test vs real SMS

#### Theme System Overhaul:
- **Fixed:** Colors.text.secondary undefined error
- **Created:** Comprehensive CS2 theme architecture
- **Updated:** All screens to use centralized theme system
- **Added:** Backwards compatibility for existing code

#### Navigation Flow Improvements:
- **Fixed:** Login redirect → now goes to group page for all users
- **Implemented:** Conditional calendar tab visibility
- **Added:** Debug logging for group state tracking
- **Enhanced:** Group creation/join flow with proper redirects

#### User Experience Enhancements:
- **Improved:** Group creation alerts with direct calendar navigation
- **Added:** Error handling with try/catch blocks
- **Enhanced:** Form validation and user feedback
- **Streamlined:** Authentication flow with proper state management

#### Profile Screen Fix:
- **FIXED:** SimpleProfileScreen now properly displays logged-in user information
- **ISSUE:** Two separate user states existed - AuthContext (Firebase) and AppContext (local)
- **SOLUTION:** Modified SimpleProfileScreen to use AuthContext user instead of AppContext user
- **CLARIFIED:** Using ONLY LocalStorage for data persistence - Firebase sync to be added later

#### Complete Translation System Implementation:
- **COMPREHENSIVE FIX:** All screens now use complete translation system for multilingual support
- **ENHANCED:** Added 50+ new translation keys for previously hardcoded text
- **UPDATED SCREENS:** SimpleProfileScreen, GroupScreen, CalendarScreen, ModernLoginScreen
- **TRANSLATIONS:** Full English and French language support across entire app
- **ALERTS & MESSAGES:** All user-facing text now properly translates when language setting changes
- **FUNCTIONALITY:** Language switching in ProfileScreen now reflects across all app screens

#### Group Creation & Admin Role System:
- **TRANSLATION FIX:** Button "ESTABLISH SQUAD" now correctly translated to "CRÉER MON GROUPE" 
- **IMPROVED:** All group creation buttons use clear, user-friendly translations
- **IMPLEMENTED:** Local-only persistence for groups (removed Firebase dependencies as per requirements)
- **ADMIN SYSTEM:** Group creator automatically becomes admin with full privileges
- **USER SYNC:** AuthContext and AppContext now properly synchronized for user data
- **TAB REFRESH:** Calendar tab automatically appears when user creates/joins group
- **ROLE TRACKING:** Added isAdmin property to AppContext for role-based functionality
- **DATA FLOW:** Complete group creation flow - persist → set admin → refresh UI → show calendar

#### Real-Time Availability System (Latest):
- **INSTANT UPDATES:** Availability changes now auto-save immediately without manual save button
- **DYNAMIC HEATMAP:** Group heatmap refreshes instantly when any member updates availability
- **VISUAL FEEDBACK:** Added updating indicators and disabled states during sync operations
- **AUTO-SAVE UI:** Replaced manual save with auto-save notification and optional sync button
- **FOCUS REFRESH:** GroupScreen heatmap auto-refreshes when user switches between tabs
- **ERROR HANDLING:** Automatic rollback of changes if save operation fails
- **PERFORMANCE:** Optimized with loading states to prevent multiple simultaneous updates

#### Date Detail Page Enhancement (Latest):
- **TIME RANGE SELECTION:** Added "Set Time Range" functionality on dateDetail page
- **FROM/TO PICKERS:** Implemented scrollable time pickers for start and end times
- **VISUAL DISPLAY:** Shows current availability time range (e.g., "09:00 - 17:00")
- **DAY NAVIGATION:** Added left/right arrow buttons to navigate to previous/next day
- **MODAL UI:** Clean modal interface for setting "I will play from X to X" availability
- **AUTO-SAVE:** Time range selections automatically save and update user availability
- **INTEGRATION:** Fully integrated with existing availability system and local storage

#### Calendar Heatmap Color Fix (Latest):
- **FIXED COLOR MAPPING:** Corrected availability data structure mismatch
- **PROPER LEGEND COMPLIANCE:** 1 member = light green, 2-4 = medium green, 5+ = dark green
- **DATA STRUCTURE:** Fixed `availableSlots` vs `slots` field name inconsistency
- **HOUR COUNTING:** Fixed hour-specific availability counting logic
- **VISUAL IMPROVEMENTS:** Made colors more distinct and visible
- **DEBUGGING:** Added logging to verify correct availability counting

#### Header Management Fix (Latest):
- **ELIMINATED DOUBLE HEADERS:** Set global `headerShown: false` for all Stack screens
- **CLEAN NAVIGATION:** Only CS2-themed LinearGradient headers remain visible
- **CONSISTENT UI:** Removed white system headers with page names
- **GLOBAL CONFIGURATION:** Applied to all screens (tabs, modals, detail pages)
- **MAINTAINED STYLING:** Kept tactical dark theme headers with proper branding

#### Language System Stability Fix (Latest):
- **PERSISTENT LANGUAGE:** Added language persistence to LocalStorage for consistent experience
- **INITIALIZATION FIX:** Language loads from storage on app start before user sync
- **ERROR HANDLING:** Added try/catch blocks and fallbacks to prevent crashes
- **ASYNC SAFETY:** Made language changes async with proper error handling
- **FALLBACK SYSTEM:** Added English fallback if invalid language or missing keys
- **STATE MANAGEMENT:** Fixed language loading order to prevent sync conflicts
- **LOGOUT SAFETY:** Fixed logout function to preserve language preferences

#### App Launch Stability & Tab Visibility Fix (Latest):
- **INFINITE LOOP FIX:** Removed state updates from loadSavedData to prevent infinite loops
- **LOADING GUARDS:** Added loading state guards to prevent multiple simultaneous loads
- **CONTEXT OPTIMIZATION:** Used useMemo for AppContext value to prevent unnecessary re-renders
- **TAB VISIBILITY:** Fixed calendar tab showing for users without groups
- **MEMBERSHIP CHECK:** Added user membership validation for tab visibility
- **GROUP CLEARING:** Proper group state clearing when user has no group or logs out
- **DEBUG LOGGING:** Enhanced debugging for tab layout conditions

#### ProfileScreen Logout Fix (Latest):
- **COMPLETE CACHE CLEARING:** Fixed logout button to properly clear all session cache
- **SESSION MANAGER INTEGRATION:** Logout now uses comprehensive session clearing system
- **NAVIGATION FIX:** Added proper redirect to login page after logout completion
- **REDUNDANCY REMOVAL:** Removed duplicate cache clearing calls for cleaner code flow
- **ERROR HANDLING:** Added proper try/catch blocks for logout operations
- **COMPREHENSIVE CLEARING:** AuthContext signOut clears Firebase, SessionManager, AsyncStorage, and LocalStorage

#### Firebase Test Phone Number Implementation (Latest):
- **OFFICIAL COMPLIANCE:** Updated implementation to follow Firebase official documentation exactly
- **TEST PHONE CONFIG:** Added proper test phone number support (+11234567891 → 123456)
- **CONSOLE SETUP:** Created comprehensive Firebase Console configuration guide
- **ENVIRONMENT DETECTION:** Enhanced Expo Go vs EAS Build detection for dev vs prod
- **SECURITY LOGGING:** Added specific logging for test phone number authentication
- **DOCUMENTATION:** Created complete setup guide in `/doc/firebase_test_phone_setup.md`
- **TOAST NOTIFICATIONS:** Added CS2-themed toast system for better user feedback
- **ERROR HANDLING:** Improved phone validation with specific error messages and toast alerts

### 2025-01-31 Session Updates:

#### Group Modal Button Visibility Fix (Latest):
- **CRITICAL FIX:** Fixed CREATE and JOIN buttons not visible in "Manage Groups" modal
- **ROOT CAUSE:** Buttons were positioned inside ScrollView and obscured by modal layout
- **SOLUTION:** Moved action buttons outside ScrollView into fixed bottom container
- **STYLING:** Added `fixedActionButtons` style with proper spacing and background
- **ACCESSIBILITY:** Buttons now always visible and accessible regardless of content length
- **CS2 THEME:** Maintained tactical design with proper button gradients and icons
- **MOBILE UX:** Fixed bottom positioning ensures touch-friendly access on all screen sizes
- **TESTING:** Verified button visibility and interaction in both CREATE and JOIN modes
- **CODE QUALITY:** Cleaned up JSX structure and removed redundant ScrollView tags

---

## CURRENT STATUS

### Working Features:
- ✅ **SECURE Authentication system** with Firebase and comprehensive guards
- ✅ **Protected app content** - no access without authentication
- ✅ **Real-time group chat** with WebSocket integration and connection status
- ✅ **Availability heatmap with legend** - proper color coding system
- ✅ Dynamic tab navigation based on group membership
- ✅ Group creation and joining functionality  
- ✅ Calendar availability management
- ✅ CS2 theme system integration
- ✅ Offline-first data persistence
- ✅ Cross-platform compatibility

### Navigation Rules:
- **NOT LOGGED IN** → automatically redirected to login page (NO app content access)
- **All successful logins** → redirect to group page
- **Users without groups** → see only Group + Profile tabs
- **Users with groups** → see Calendar + Group + Profile tabs
- **Group creation/join success** → auto-redirect to calendar
- **Direct URL access** → blocked by AuthGuard if not authenticated

### Code Quality:
- **SECURITY:** Complete authentication protection with AuthGuard components
- **Theme Consistency:** All screens use centralized CS2 theme
- **Error Handling:** Comprehensive try/catch implementations
- **Type Safety:** Full TypeScript integration
- **Performance:** Optimized with React Native best practices

---

## NEXT DEVELOPMENT PRIORITIES

### Immediate Tasks:
1. **Test complete user flow** → Login → Group creation → Calendar access
2. **Verify theme consistency** across all screens and components
3. **Validate data persistence** → AsyncStorage and Firebase sync
4. **Check error handling** → Network failures and edge cases

### Future Enhancements:
1. **Group management features** → Member roles, permissions
2. **Advanced availability views** → Weekly, monthly summaries
3. **Push notifications** → Meeting reminders, group updates
4. **Export functionality** → Calendar integration, meeting scheduling

---

**File Management:** This document is updated with every significant change to maintain accurate project direction and implementation details.