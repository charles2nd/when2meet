name: "When2Meet Availability Scheduler PRP"
description: |

## Purpose
Implement a comprehensive When2Meet-style availability scheduler integrated into the existing When2meet gaming team management app. This feature allows team members to collaboratively find optimal meeting times through an interactive drag-and-drop availability grid with real-time synchronization.

## Core Principles
1. **Real-time Collaboration**: Multiple users can simultaneously view and edit availability
2. **Mobile-first Design**: Touch-optimized interface with drag selection
3. **Gaming Integration**: Seamlessly integrated with existing team and calendar systems
4. **Performance**: Efficient Firebase synchronization and responsive UI
5. **Follow CLAUDE.md**: Strict adherence to existing codebase conventions

---

## Goal
Build a When2Meet-style availability scheduler that allows gaming teams to:
- Create scheduling events with customizable time slots
- Select availability using intuitive drag-and-drop interface
- View real-time availability updates from all team members
- Automatically integrate with existing team calendar and roles
- Generate optimal meeting times based on team availability

## Why
- **Eliminates scheduling friction**: No more back-and-forth messages to find meeting times
- **Increases team coordination**: Visual availability overview improves scheduling efficiency
- **Enhances existing app**: Builds on established team management and calendar features
- **Real-time collaboration**: Instant updates when team members change availability
- **Gaming-specific integration**: Connects with team roles (Coach, IGL) and event types

## What
A complete availability scheduling system with:

### Core Features
- **Event Creation**: Quick setup with name, dates, and time ranges
- **Interactive Grid**: Drag-and-drop availability selection interface
- **Real-time Updates**: Live synchronization of all team member availability
- **Visual Analytics**: Color-coded time slots showing participant count
- **Team Integration**: Synced with existing team roles and calendar events
- **Share System**: Unique links for team member access

### User Experience
- **Left Panel**: Individual availability selection grid
- **Right Panel**: Aggregated team availability with visual indicators
- **Color Coding**: Green (all available) → Yellow (most available) → Red (few available)
- **Touch Optimized**: Mobile-first drag selection with gesture support

### Success Criteria
- [ ] Users can create scheduling events with custom time slots
- [ ] Drag-and-drop interface works smoothly on mobile devices
- [ ] Real-time updates sync instantly across all connected users
- [ ] Team availability aggregation displays correctly with color coding
- [ ] Integration with existing team system maintains data consistency
- [ ] Performance remains smooth with 10+ concurrent users

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window

- url: https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pan-gesture/
  why: React Native Gesture Handler for implementing drag selection
  critical: Performance is significantly better than PanResponder
  
- url: https://firebase.google.com/docs/firestore/real-time_queries_at_scale
  why: Real-time collaboration patterns and scalability considerations
  section: Building collaborative features with Firestore listeners
  critical: Handle concurrent writes and conflict resolution

- url: https://github.com/bibekg/react-schedule-selector
  why: Web-based When2Meet implementation patterns
  critical: Study data structures and selection algorithms
  note: This is React web - adapt patterns for React Native

- url: https://stackoverflow.com/questions/67552795/is-a-drag-multi-select-type-of-selection-on-multiple-views-possible-in-react-n
  why: React Native drag-multi-select implementation challenges
  critical: Touch event limitations and coordinate tracking solutions

- url: https://firebase.google.com/docs/firestore/manage-data/structure-data
  why: Data structure patterns for collaborative applications
  section: Best practices for real-time collaboration data models

- file: app/services/firebase.ts
  why: Existing Firebase configuration and authentication patterns
  
- file: app/services/calendar.ts
  why: Calendar integration patterns and event management
  
- file: app/hooks/useCalendar.ts
  why: Calendar state management and real-time data patterns
  
- file: app/hooks/useTeam.ts
  why: Team management and member role handling
  
- file: app/utils/types.ts
  why: Existing TypeScript interfaces for User, Team, CalendarEvent
```

### Current Codebase Structure
```bash
app/
├── (tabs)/
│   ├── meet/
│   │   ├── index.tsx         # Calendar screen - ADD availability button
│   │   ├── event.tsx         # Event details - EXTEND for availability
│   │   └── _layout.tsx       # Navigation structure
│   ├── groups/
│   │   ├── index.tsx         # Teams list - LINK to availability
│   │   └── [teamId]/
├── services/
│   ├── firebase.ts           # Firebase config - EXTEND for availability
│   ├── calendar.ts           # Event management - EXTEND for availability
│   └── teams.ts              # Team operations - REUSE for participants
├── hooks/
│   ├── useCalendar.ts        # Calendar state - EXTEND for availability
│   ├── useTeam.ts            # Team state - REUSE for participants
│   └── useAuth.ts            # Authentication - REUSE for user context
├── utils/
│   ├── types.ts              # Interfaces - EXTEND for availability types
│   ├── constants.ts          # Colors/spacing - REUSE for grid styling
│   └── helpers.ts            # Utilities - EXTEND for time calculations
└── components/               # ADD new availability components
```

### Desired Codebase Structure (New Files)
```bash
app/
├── (tabs)/meet/
│   └── availability/
│       ├── [eventId].tsx         # Main availability scheduler screen
│       └── create.tsx            # Create new availability event
├── services/
│   └── availability.ts           # Availability-specific Firebase operations
├── hooks/
│   └── useAvailability.ts        # Availability state management
├── components/
│   └── availability/
│       ├── AvailabilityGrid.tsx  # Main grid component
│       ├── TimeSlotCell.tsx      # Individual time slot
│       ├── GestureHandler.tsx    # Drag selection logic
│       ├── ParticipantList.tsx   # Team member availability
│       └── SummaryView.tsx       # Aggregated availability display
└── utils/
    ├── availabilityHelpers.ts    # Time slot calculations and utilities
    └── gestureUtils.ts           # Touch coordinate and selection helpers
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: React Native touch limitations
// Unlike web, touch events don't fire on elements they pass over
// Must use coordinate mapping to detect which cells are under touch

// CRITICAL: Gesture Handler vs PanResponder
// react-native-gesture-handler provides better performance
// PanResponder has timing issues with rapid state updates

// CRITICAL: Firestore real-time listeners
// Must handle connection states and offline scenarios
// Avoid excessive reads with proper query optimization

// CRITICAL: Time zone handling
// All times stored in UTC, displayed in user's local timezone
// Use date-fns for consistent time calculations

// CRITICAL: Concurrent writes in Firestore
// Use transaction updates for availability modifications
// Handle optimistic updates with conflict resolution
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// Core availability data structures for Firebase Firestore
export interface AvailabilityEvent {
  id: string;
  teamId: string;
  title: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  
  // Time configuration
  startDate: Date;
  endDate: Date;
  timeSlots: TimeSlot[];
  timeZone: string;
  
  // Participation
  participants: string[];           // User IDs
  responses: AvailabilityResponse[]; // Individual availability
  
  // Settings
  isRecurring: boolean;
  allowAnonymous: boolean;
  shareableLink: string;
  status: 'active' | 'closed' | 'archived';
}

export interface TimeSlot {
  id: string;
  startTime: string;    // "09:00" format
  endTime: string;      // "09:30" format
  date: string;         // "2025-01-15" format
}

export interface AvailabilityResponse {
  userId: string;
  userName: string;
  availableSlots: string[];  // Array of TimeSlot IDs
  lastUpdated: Date;
  isAnonymous: boolean;
}

export interface AvailabilityAnalytics {
  eventId: string;
  optimalSlots: OptimalTimeSlot[];
  participationSummary: ParticipationSummary;
  lastCalculated: Date;
}

export interface OptimalTimeSlot {
  timeSlot: TimeSlot;
  availableCount: number;
  availableUsers: string[];
  conflictingUsers: string[];
  score: number;  // 0-1, higher is better
}
```

### List of Tasks (Implementation Order)

```yaml
Task 1: "Extend TypeScript interfaces and Firebase collections"
MODIFY app/utils/types.ts:
  - ADD AvailabilityEvent, TimeSlot, AvailabilityResponse interfaces
  - EXTEND CalendarEvent to reference availability events
  - ADD availability-specific types

CREATE app/services/availability.ts:
  - MIRROR pattern from: app/services/calendar.ts
  - IMPLEMENT CRUD operations for availability events
  - ADD real-time listeners for collaborative updates
  - HANDLE conflict resolution and optimistic updates

Task 2: "Create availability state management hook"
CREATE app/hooks/useAvailability.ts:
  - MIRROR pattern from: app/hooks/useCalendar.ts
  - IMPLEMENT real-time availability sync
  - HANDLE participant management
  - ADD availability analytics calculations

Task 3: "Build core availability grid components"
CREATE app/components/availability/AvailabilityGrid.tsx:
  - IMPLEMENT responsive grid layout
  - HANDLE time slot rendering
  - INTEGRATE with gesture system
  - ADD visual feedback for selections

CREATE app/components/availability/TimeSlotCell.tsx:
  - IMPLEMENT individual cell component
  - HANDLE selection states (available/unavailable/partial)
  - ADD color coding based on participant count
  - OPTIMIZE for performance with React.memo

Task 4: "Implement touch gesture handling system"
CREATE app/components/availability/GestureHandler.tsx:
  - IMPLEMENT pan gesture recognition
  - HANDLE coordinate-to-cell mapping
  - MANAGE multi-selection during drag
  - ADD haptic feedback for mobile

CREATE app/utils/gestureUtils.ts:
  - IMPLEMENT coordinate calculation utilities
  - HANDLE grid position mapping
  - ADD selection path tracking
  - MANAGE touch state optimization

Task 5: "Build participant and summary views"
CREATE app/components/availability/ParticipantList.tsx:
  - DISPLAY team member availability
  - SHOW individual response status
  - HANDLE participant filtering
  - ADD user presence indicators

CREATE app/components/availability/SummaryView.tsx:
  - CALCULATE optimal time slots
  - DISPLAY color-coded availability heatmap
  - SHOW participation statistics
  - GENERATE scheduling recommendations

Task 6: "Create availability event screens"
CREATE app/(tabs)/meet/availability/create.tsx:
  - IMPLEMENT event creation form
  - HANDLE date/time range selection
  - ADD team member invitation
  - INTEGRATE with existing calendar

CREATE app/(tabs)/meet/availability/[eventId].tsx:
  - IMPLEMENT main availability interface
  - COMBINE grid + participant views
  - HANDLE real-time updates
  - ADD sharing functionality

Task 7: "Integrate with existing calendar and team systems"
MODIFY app/(tabs)/meet/index.tsx:
  - ADD "Schedule Availability" button
  - LINK to availability event creation
  - DISPLAY availability events in calendar

MODIFY app/(tabs)/meet/event.tsx:
  - ADD availability event integration
  - SHOW optimal times from availability
  - LINK calendar events to availability

Task 8: "Add Firebase Firestore collections and security rules"
CREATE firestore.rules:
  - ADD availability collections security
  - HANDLE team member permissions
  - PROTECT against unauthorized access

EXTEND Firebase collections:
  - ADD /availability-events/{eventId}
  - ADD /availability-responses/{eventId}/responses/{userId}
  - ADD /availability-analytics/{eventId}

Task 9: "Implement sharing and notification system"
EXTEND app/services/availability.ts:
  - ADD shareable link generation
  - IMPLEMENT email/SMS sharing
  - HANDLE anonymous participant access
  - ADD notification triggers

Task 10: "Add comprehensive testing and optimization"
CREATE __tests__/availability/:
  - ADD component unit tests
  - ADD service integration tests
  - ADD gesture handling tests
  - ADD real-time sync tests
```

### Task 3 Pseudocode: Core Grid Component
```typescript
// app/components/availability/AvailabilityGrid.tsx
export const AvailabilityGrid: React.FC<Props> = ({ 
  timeSlots, 
  userSelection, 
  onSelectionChange,
  participantData 
}) => {
  // CRITICAL: Use Gesture Handler for performance
  const gesture = Gesture.Pan()
    .onStart((event) => {
      // PATTERN: Convert touch coordinates to grid position
      const cellPosition = coordinateToCell(event.x, event.y);
      setSelectionStart(cellPosition);
      setIsSelecting(true);
    })
    .onUpdate((event) => {
      // GOTCHA: Must track which cells are under current touch
      const currentCell = coordinateToCell(event.x, event.y);
      updateSelection(selectionStart, currentCell);
    })
    .onEnd(() => {
      // PATTERN: Commit selection to Firebase
      commitSelectionToFirebase(currentSelection);
      setIsSelecting(false);
    });

  // PATTERN: Real-time updates from other participants
  useEffect(() => {
    const unsubscribe = onAvailabilityUpdate(eventId, (data) => {
      // CRITICAL: Merge remote changes with local state
      mergeRemoteAvailability(data);
    });
    return unsubscribe;
  }, [eventId]);

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.gridContainer}>
        {timeSlots.map((slot, index) => (
          <TimeSlotCell
            key={slot.id}
            timeSlot={slot}
            isSelected={userSelection.includes(slot.id)}
            participantCount={getParticipantCount(slot.id)}
            onPress={() => toggleSingleSelection(slot.id)}
          />
        ))}
      </View>
    </GestureDetector>
  );
};
```

### Task 4 Pseudocode: Gesture Handling
```typescript
// app/utils/gestureUtils.ts
export function coordinateToCell(x: number, y: number, gridLayout: GridLayout): CellPosition {
  // CRITICAL: Account for scroll offset and header height
  const adjustedY = y - gridLayout.headerHeight + gridLayout.scrollOffset;
  
  // PATTERN: Calculate row and column from coordinates
  const column = Math.floor(x / gridLayout.cellWidth);
  const row = Math.floor(adjustedY / gridLayout.cellHeight);
  
  // GOTCHA: Validate bounds to prevent index errors
  return {
    column: Math.max(0, Math.min(column, gridLayout.maxColumns - 1)),
    row: Math.max(0, Math.min(row, gridLayout.maxRows - 1))
  };
}

export function getSelectionPath(start: CellPosition, end: CellPosition): CellPosition[] {
  // PATTERN: Create rectangular selection from start to end
  const path: CellPosition[] = [];
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);
  const minCol = Math.min(start.column, end.column);
  const maxCol = Math.max(start.column, end.column);
  
  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      path.push({ row, column: col });
    }
  }
  return path;
}
```

### Integration Points
```yaml
FIREBASE COLLECTIONS:
  - collection: "availability-events"
    security: "Team members can read/write their team's events"
    indexes: "teamId, createdAt, status"
  
  - collection: "availability-responses" 
    subcollection: "eventId/responses/userId"
    security: "Users can only modify their own responses"
    realtime: "Listen for changes to aggregate view"

EXISTING INTEGRATION:
  - extend: app/services/calendar.ts
    method: "createEvent() to link availability results"
  
  - extend: app/hooks/useTeam.ts
    method: "getTeamMembers() for participant lists"
  
  - extend: app/(tabs)/meet/index.tsx
    ui: "Add availability button to calendar header"

NAVIGATION:
  - add: app/(tabs)/meet/availability/[eventId].tsx
  - route: "/meet/availability/create" for new events
  - route: "/meet/availability/{eventId}" for editing
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
cd app && npm run lint                    # ESLint check
cd app && npm run type-check             # TypeScript validation

# Expected: No errors. If errors, READ carefully and fix code.
```

### Level 2: Component Unit Tests
```typescript
// CREATE __tests__/availability/AvailabilityGrid.test.tsx
describe('AvailabilityGrid', () => {
  test('renders time slots correctly', () => {
    const timeSlots = generateMockTimeSlots();
    render(<AvailabilityGrid timeSlots={timeSlots} />);
    expect(screen.getByText('9:00 AM')).toBeInTheDocument();
  });

  test('handles drag selection', async () => {
    const onSelectionChange = jest.fn();
    render(<AvailabilityGrid onSelectionChange={onSelectionChange} />);
    
    // Simulate pan gesture
    fireEvent(screen.getByTestId('grid'), 'onPanGestureEvent', {
      nativeEvent: { x: 100, y: 100 }
    });
    
    expect(onSelectionChange).toHaveBeenCalled();
  });

  test('displays participant availability correctly', () => {
    const participantData = generateMockParticipants();
    render(<AvailabilityGrid participantData={participantData} />);
    
    // Check color coding based on participant count
    expect(screen.getByTestId('slot-high-availability')).toHaveStyle({
      backgroundColor: COLORS.success
    });
  });
});
```

```bash
# Run and iterate until passing:
cd app && npm test availability/
# If failing: Read error, understand root cause, fix code, re-run
```

### Level 3: Firebase Integration Test
```bash
# Start Firebase emulator
cd app && npm run firebase:emulator

# Test real-time collaboration
cd app && npm run test:integration -- availability
# Expected: Real-time updates work between multiple clients

# Manual test with Expo
cd app && npm start
# Navigate to /meet/availability/create
# Create event, invite team members, test drag selection
# Expected: Real-time updates visible immediately
```

### Level 4: Performance Test
```bash
# Test with multiple concurrent users
cd app && npm run test:performance -- availability
# Expected: <100ms response time for gesture updates
# Expected: <500ms for Firebase sync updates

# Test memory usage during long sessions
# Expected: No memory leaks during extended use
```

## Final Validation Checklist
- [ ] All tests pass: `cd app && npm test`
- [ ] No linting errors: `cd app && npm run lint`
- [ ] No type errors: `cd app && npm run type-check`
- [ ] Gesture selection works smoothly on mobile
- [ ] Real-time updates sync across multiple devices
- [ ] Team integration maintains data consistency
- [ ] Performance remains acceptable with 10+ users
- [ ] Accessibility features work with screen readers
- [ ] Offline/online state handled gracefully

---

## Anti-Patterns to Avoid
- ❌ Don't use PanResponder - use react-native-gesture-handler instead
- ❌ Don't store selection state only locally - sync with Firebase immediately  
- ❌ Don't ignore coordinate boundary checking - will cause crashes
- ❌ Don't update Firebase on every gesture move - batch updates for performance
- ❌ Don't forget optimistic updates - UI should feel instant
- ❌ Don't hardcode time zones - always use user's local timezone
- ❌ Don't skip conflict resolution - handle concurrent edits gracefully
- ❌ Don't ignore loading/error states - provide clear user feedback

## Success Metrics
- **Technical**: 95% gesture accuracy, <100ms UI response, <500ms sync time
- **User Experience**: Intuitive drag selection, clear availability visualization
- **Integration**: Seamless connection with existing team and calendar features
- **Performance**: Smooth operation with 20+ team members and 100+ time slots

**PRP Confidence Score: 8/10** - High confidence due to comprehensive context, detailed implementation plan, and thorough validation strategy. Main risks are gesture handling complexity and real-time collaboration edge cases, but these are well-documented with mitigation strategies.