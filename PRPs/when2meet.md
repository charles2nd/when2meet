name: "When2meet - Gaming Team Management Platform"
description: |

## Purpose
Build a comprehensive React Native/Expo mobile application for gaming teams to centralize scheduling, communication, and team management. The app addresses the fragmentation problem where players use multiple apps by providing an all-in-one solution.

## Core Principles
1. **Context is King**: Include ALL necessary React Native, Expo, and Firebase documentation
2. **Validation Loops**: Provide executable tests and linting that work with Expo
3. **Mobile-First**: Design for iOS/Android with web compatibility
4. **Real-Time**: Leverage Firebase for instant synchronization
5. **Global rules**: Follow all rules in CLAUDE.md (no emojis, TypeScript, modular architecture)

---

## Goal
Create a production-ready mobile application that allows gaming teams to:
- Schedule games, practices, scrims, and tournaments
- Manage team profiles and member roles
- Communicate through real-time chat with media sharing
- Store and organize team files/videos
- Integrate with gaming platforms (Steam, ESEA, Faceit)
- Stay updated with game news and patches

## Why
- **Business value**: Solves fragmentation - teams currently use Discord + Google Calendar + WhatsApp + various gaming platforms
- **User impact**: Single source of truth for team coordination
- **Market need**: Esports teams lack dedicated management tools
- **Competitive advantage**: Gaming-specific features not found in generic team apps

## What
A React Native mobile application with:
- Phone number authentication (no email/password)
- Three-tab navigation: Meet (calendar), Groups (chat/teams), Profile
- Real-time synchronization across all devices
- Media storage and streaming capabilities
- External gaming platform integrations

### Success Criteria
- [ ] Phone auth working with Firebase
- [ ] Calendar with event types (game, practice, scrim, tournament, day off)
- [ ] Team creation with custom profiles and member management
- [ ] Real-time chat with photo/video support
- [ ] File management system for team content
- [ ] Basic integration with at least one gaming platform
- [ ] News feed for game updates
- [ ] Runs on iOS, Android, and web

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://docs.expo.dev/get-started/create-a-project/
  why: Expo project setup, file structure, and development workflow
  
- url: https://reactnative.dev/docs/getting-started
  why: React Native fundamentals, components, and patterns
  
- url: https://docs.expo.dev/guides/using-firebase/
  why: Firebase integration with Expo, authentication setup
  
- url: https://firebase.google.com/docs/auth/web/phone-auth
  why: Phone authentication implementation details
  
- url: https://firebase.google.com/docs/firestore/quickstart
  why: Firestore database structure and real-time listeners
  
- url: https://docs.expo.dev/router/introduction/
  why: Expo Router for navigation between screens
  
- url: https://docs.expo.dev/versions/latest/sdk/calendar/
  why: Calendar integration for device calendars
  
- url: https://firebase.google.com/docs/storage/web/start
  why: Firebase Storage for media files
  
- url: https://docs.expo.dev/versions/latest/sdk/media-library/
  why: Media handling in React Native
  
- url: https://steamcommunity.com/dev
  why: Steam Web API documentation for integration
  
- url: https://developers.faceit.com/docs/
  why: Faceit API for CS stats integration
```

### Current Codebase tree
```bash
.
├── .claude/
│   ├── commands/
│   └── settings.local.json
├── PRPs/
│   ├── templates/
│   └── EXAMPLE_multi_agent_prp.md
├── CLAUDE.md
├── feature_1.md
├── LICENSE
└── README.md
```

### Desired Codebase tree with files to be added
```bash
.
├── app/                          # Expo Router app directory
│   ├── (auth)/                   # Auth flow screens
│   │   ├── _layout.tsx           # Auth layout
│   │   ├── phone.tsx            # Phone number input
│   │   └── verify.tsx           # OTP verification
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── _layout.tsx          # Tab layout with 3 tabs
│   │   ├── meet/                # Calendar tab
│   │   │   ├── index.tsx        # Calendar view
│   │   │   └── event.tsx        # Event details/creation
│   │   ├── groups/              # Teams/Chat tab
│   │   │   ├── index.tsx        # Teams list
│   │   │   ├── [teamId]/        # Dynamic team routes
│   │   │   │   ├── index.tsx   # Team chat
│   │   │   │   └── settings.tsx # Team settings
│   │   │   └── create.tsx       # Create team
│   │   └── profile/             # Profile tab
│   │       ├── index.tsx        # User profile
│   │       └── settings.tsx     # App settings
│   ├── _layout.tsx              # Root layout
│   └── index.tsx                # Entry point
├── components/                   # Reusable components
│   ├── calendar/
│   │   ├── EventCard.tsx
│   │   ├── CalendarView.tsx
│   │   └── EventTypeSelector.tsx
│   ├── chat/
│   │   ├── MessageBubble.tsx
│   │   ├── MessageInput.tsx
│   │   └── MediaPicker.tsx
│   ├── teams/
│   │   ├── TeamCard.tsx
│   │   ├── MemberList.tsx
│   │   └── TeamProfile.tsx
│   └── common/
│       ├── LoadingScreen.tsx
│       ├── ErrorBoundary.tsx
│       └── PhoneInput.tsx
├── services/                     # Backend services
│   ├── firebase.ts              # Firebase initialization
│   ├── auth.ts                  # Authentication service
│   ├── database.ts              # Firestore operations
│   ├── storage.ts               # Media storage
│   └── gaming/                  # Gaming platform integrations
│       ├── steam.ts
│       ├── faceit.ts
│       └── esea.ts
├── utils/                        # Utility functions
│   ├── constants.ts             # App constants
│   ├── types.ts                 # TypeScript types
│   └── helpers.ts               # Helper functions
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts               # Auth state hook
│   ├── useTeam.ts               # Team data hook
│   ├── useCalendar.ts           # Calendar operations
│   └── useChat.ts               # Chat functionality
├── __tests__/                    # Test files
│   ├── components/
│   ├── services/
│   └── utils/
├── assets/                       # Images, fonts, etc.
├── app.json                      # Expo configuration
├── babel.config.js              # Babel configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
├── .env.example                 # Environment variables template
├── .eslintrc.js                 # ESLint configuration
├── .prettierrc                  # Prettier configuration
├── firebase.json                # Firebase configuration
├── firestore.rules              # Security rules
└── README.md                    # Updated documentation
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: Expo SDK 50+ requires specific Firebase setup
// CRITICAL: Phone auth requires reCAPTCHA setup for web
// CRITICAL: Firebase Auth persistence must be configured for React Native
// CRITICAL: Firestore offline persistence has limitations on mobile
// CRITICAL: Large media files should use Firebase Storage, not Firestore
// CRITICAL: React Native doesn't support all web APIs
// CRITICAL: Steam API requires server-side proxy due to CORS
// CRITICAL: Use SecureStore for sensitive data, not AsyncStorage
// CRITICAL: Navigation state must be properly typed with TypeScript
// CRITICAL: Always use Firebase batch operations for multiple writes
```

## Implementation Blueprint

### Data models and structure

```typescript
// utils/types.ts - Core TypeScript interfaces

export interface User {
  id: string; // Phone number
  displayName: string;
  avatar?: string;
  teams: string[];
  steamId?: string;
  faceitId?: string;
  eseaId?: string;
  createdAt: Date;
  lastActive: Date;
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  description: string;
  game: GameType;
  members: TeamMember[];
  createdBy: string;
  createdAt: Date;
  links: TeamLink[];
  stats: TeamStats;
}

export interface TeamMember {
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface CalendarEvent {
  id: string;
  teamId: string;
  type: 'game' | 'practice' | 'scrim' | 'tournament' | 'day_off' | 'check_in';
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  recurring?: RecurringPattern;
  participants: string[];
  createdBy: string;
}

export interface ChatMessage {
  id: string;
  teamId: string;
  senderId: string;
  content: string;
  media?: MediaAttachment[];
  reactions: MessageReaction[];
  createdAt: Date;
  editedAt?: Date;
}

export interface MediaAttachment {
  type: 'photo' | 'video' | 'file';
  url: string;
  thumbnailUrl?: string;
  name: string;
  size: number;
}
```

### List of tasks to be completed to fulfill the PRP

```yaml
Task 1: Initialize Expo Project and Configure TypeScript
CREATE new Expo project:
  - Use Expo SDK 50+
  - Configure TypeScript strictly
  - Set up ESLint and Prettier
  - Configure Expo Router

Task 2: Set Up Firebase and Authentication
CREATE services/firebase.ts:
  - Initialize Firebase app
  - Configure auth persistence
  - Set up phone auth with reCAPTCHA
CREATE services/auth.ts:
  - Phone number sign in
  - OTP verification
  - Auth state management
CREATE app/(auth)/* screens:
  - Phone input screen
  - Verification screen
  - Auth flow navigation

Task 3: Implement Navigation Structure
CREATE app/(tabs)/_layout.tsx:
  - Bottom tab navigator with 3 tabs
  - Proper TypeScript typing
  - Auth state protection
CREATE navigation screens:
  - Meet tab structure
  - Groups tab structure  
  - Profile tab structure

Task 4: Build User Profile System
CREATE services/database.ts:
  - User CRUD operations
  - Real-time user presence
CREATE profile screens:
  - Profile display
  - Profile editing
  - Settings management

Task 5: Implement Team Management
CREATE team-related services:
  - Team creation
  - Member management
  - Role-based permissions
CREATE team screens:
  - Team list view
  - Team creation flow
  - Team settings/profile

Task 6: Build Calendar Functionality  
CREATE calendar components:
  - Monthly/weekly views
  - Event creation forms
  - Event type selection
CREATE calendar services:
  - Event CRUD operations
  - Recurring event logic
  - Notification scheduling

Task 7: Implement Chat System
CREATE chat components:
  - Message list with virtualization
  - Message input with media
  - Real-time updates
CREATE chat services:
  - Message sending/receiving
  - Media upload to Storage
  - Reaction system

Task 8: Add File Management
CREATE file management system:
  - File upload to Storage
  - File organization by team
  - Video player integration
  - File sharing capabilities

Task 9: Integrate Gaming Platforms
CREATE gaming integrations:
  - Steam API proxy setup
  - Faceit API integration
  - Stats display components
  - Profile linking flow

Task 10: Implement News Feed
CREATE news system:
  - RSS/API integration for game news
  - Patch notes parsing
  - Tournament updates
  - Team activity feed

Task 11: Add Testing Suite
CREATE comprehensive tests:
  - Component unit tests
  - Service integration tests
  - Navigation flow tests
  - Firebase rules tests

Task 12: Production Setup
CONFIGURE production:
  - Environment variables
  - Firebase security rules
  - Performance monitoring
  - Build optimization
```

### Per task pseudocode

```typescript
// Task 2: Firebase Phone Auth
// services/auth.ts
import auth from '@react-native-firebase/auth';
import { Alert } from 'react-native';

export async function signInWithPhoneNumber(phoneNumber: string) {
  // PATTERN: Validate phone number format
  const formattedNumber = formatPhoneNumber(phoneNumber);
  
  try {
    // CRITICAL: Returns confirmation object for OTP
    const confirmation = await auth().signInWithPhoneNumber(formattedNumber);
    // Store confirmation for verification step
    return confirmation;
  } catch (error) {
    // GOTCHA: Different error codes for different scenarios
    handleAuthError(error);
  }
}

// Task 6: Calendar Event Creation
// hooks/useCalendar.ts
export function useCalendar(teamId: string) {
  const createEvent = useCallback(async (event: Partial<CalendarEvent>) => {
    // PATTERN: Always validate required fields
    if (!event.type || !event.title || !event.startTime) {
      throw new Error('Missing required fields');
    }
    
    // CRITICAL: Use server timestamp for consistency
    const newEvent = {
      ...event,
      teamId,
      createdAt: firestore.FieldValue.serverTimestamp(),
      createdBy: auth().currentUser?.uid,
    };
    
    // PATTERN: Batch operations for related updates
    const batch = firestore().batch();
    const eventRef = firestore().collection('events').doc();
    batch.set(eventRef, newEvent);
    
    // Update team activity
    const teamRef = firestore().collection('teams').doc(teamId);
    batch.update(teamRef, {
      lastActivity: firestore.FieldValue.serverTimestamp(),
    });
    
    await batch.commit();
    
    // PATTERN: Schedule local notification
    await scheduleEventNotification(eventRef.id, newEvent);
  }, [teamId]);
  
  return { createEvent };
}

// Task 7: Real-time Chat
// hooks/useChat.ts
export function useChat(teamId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  useEffect(() => {
    // PATTERN: Real-time listener with pagination
    const unsubscribe = firestore()
      .collection('messages')
      .where('teamId', '==', teamId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .onSnapshot((snapshot) => {
        // GOTCHA: Handle offline changes
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // CRITICAL: Convert timestamps
          createdAt: doc.data().createdAt?.toDate(),
        })) as ChatMessage[];
        
        setMessages(messages.reverse());
      });
      
    return unsubscribe;
  }, [teamId]);
  
  const sendMessage = async (content: string, media?: File[]) => {
    // PATTERN: Upload media first
    const mediaUrls = await uploadMedia(media);
    
    // CRITICAL: Optimistic update for UX
    const tempMessage = createOptimisticMessage(content, mediaUrls);
    setMessages(prev => [...prev, tempMessage]);
    
    try {
      await firestore().collection('messages').add({
        teamId,
        content,
        media: mediaUrls,
        senderId: auth().currentUser?.uid,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      // Rollback optimistic update
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      throw error;
    }
  };
  
  return { messages, sendMessage };
}
```

### Integration Points
```yaml
FIREBASE:
  - project setup: Firebase Console > Create Project
  - auth setup: Enable Phone Authentication
  - database: Create Firestore database (production mode)
  - storage: Enable Firebase Storage
  - rules: Deploy security rules file
  
EXPO:
  - plugins: Add firebase plugin to app.json
  - env vars: Use expo-constants for configuration
  - build: Configure google-services.json/plist
  
EXTERNAL APIS:
  - Steam: Requires API key from steamcommunity.com/dev
  - Faceit: OAuth app registration required
  - ESEA: Contact for API access
  
PUSH NOTIFICATIONS:
  - expo-notifications setup
  - FCM configuration for Android
  - APNs setup for iOS
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# TypeScript and linting checks
npx tsc --noEmit              # Type checking
npx eslint . --fix             # ESLint with auto-fix
npx prettier --write .         # Format code

# Expected: No errors. Fix any issues before proceeding.
```

### Level 2: Unit Tests
```typescript
// __tests__/services/auth.test.ts
describe('Authentication', () => {
  it('validates phone number format', async () => {
    const invalid = '+1234';
    await expect(signInWithPhoneNumber(invalid)).rejects.toThrow();
  });
  
  it('handles auth errors gracefully', async () => {
    // Mock Firebase auth error
    auth().signInWithPhoneNumber = jest.fn().mockRejectedValue(
      new Error('auth/too-many-requests')
    );
    
    const result = await signInWithPhoneNumber('+1234567890');
    expect(Alert.alert).toHaveBeenCalledWith('Too many attempts');
  });
});

// __tests__/components/calendar/EventCard.test.tsx
describe('EventCard', () => {
  it('displays correct event type icon', () => {
    const event = mockEvent({ type: 'tournament' });
    const { getByTestId } = render(<EventCard event={event} />);
    expect(getByTestId('event-icon-tournament')).toBeTruthy();
  });
  
  it('formats time correctly', () => {
    const event = mockEvent({ 
      startTime: new Date('2024-01-01T15:00:00')
    });
    const { getByText } = render(<EventCard event={event} />);
    expect(getByText('3:00 PM')).toBeTruthy();
  });
});
```

```bash
# Run tests
npm test -- --coverage

# If failing: Debug specific test, fix implementation
```

### Level 3: Integration Testing
```bash
# Start development server
expo start

# Test authentication flow:
# 1. Enter phone number
# 2. Receive OTP (check Firebase Auth dashboard)
# 3. Verify successful login
# 4. Check user document created in Firestore

# Test team creation:
# 1. Navigate to Groups > Create Team
# 2. Fill in team details
# 3. Verify team appears in list
# 4. Check Firestore for team document

# Test real-time chat:
# 1. Open team chat on two devices
# 2. Send message from device A
# 3. Verify instant appearance on device B
# 4. Test media upload
```

### Level 4: Firebase Security Rules Testing
```javascript
// firestore.rules.test.js
const testing = require('@firebase/testing');

describe('Firestore Security Rules', () => {
  it('allows authenticated users to read their teams', async () => {
    const db = getAuthedFirestore({ uid: 'user123' });
    const team = db.collection('teams').doc('team123');
    await firebase.assertSucceeds(team.get());
  });
  
  it('prevents unauthorized team access', async () => {
    const db = getAuthedFirestore({ uid: 'user456' });
    const team = db.collection('teams').doc('team123');
    await firebase.assertFails(team.get());
  });
});
```

## Final Validation Checklist
- [ ] Phone authentication working on iOS/Android/Web
- [ ] Tab navigation properly configured
- [ ] Calendar events creating and displaying correctly
- [ ] Teams can be created with custom profiles
- [ ] Real-time chat functioning with media support
- [ ] Files uploading to Firebase Storage
- [ ] At least one gaming integration working
- [ ] News feed displaying game updates
- [ ] All TypeScript errors resolved
- [ ] ESLint passing with no errors
- [ ] Test coverage above 70%
- [ ] Firebase security rules tested
- [ ] App builds successfully for all platforms
- [ ] Performance acceptable (< 3s initial load)
- [ ] README includes setup instructions

---

## Anti-Patterns to Avoid
- ❌ Don't store sensitive data in AsyncStorage - use SecureStore
- ❌ Don't use Firebase Admin SDK in client code
- ❌ Don't store large media in Firestore - use Storage
- ❌ Don't skip Firebase security rules
- ❌ Don't use synchronous storage operations
- ❌ Don't hardcode API keys - use environment variables
- ❌ Don't forget to handle offline scenarios
- ❌ Don't use any emojis in the app (per CLAUDE.md)
- ❌ Don't create files over 500 lines
- ❌ Don't use default exports - use named exports

## Confidence Score: 8/10

High confidence due to:
- Clear requirements and existing project guidelines
- Well-documented technologies (React Native, Firebase, Expo)
- Modular architecture allowing incremental development
- Strong typing with TypeScript

Slight uncertainty on:
- Gaming platform API availability/restrictions
- Performance with large media files
- Offline sync complexity with Firestore

The implementation should proceed smoothly with careful attention to Firebase configuration and proper error handling throughout.