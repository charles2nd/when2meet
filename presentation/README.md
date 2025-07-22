# When2meet - Gaming Team Management Platform

A React Native/Expo presentation app showcasing the When2meet concept - the ultimate solution for gaming team coordination and management.

## 🎥 Demo Video

https://github.com/user-attachments/assets/your-video-id-here

*Full app demonstration showing all features in action*

## 🎯 Features

### 📅 Meet Tab - Team Calendar
- Interactive monthly calendar view
- Event type indicators (Game Day, Practice, Scrim, Tournament, Day Off)
- Event details with participant counts
- Upcoming events overview
- Add event functionality (demo)

### 👥 Groups Tab - Team Management & Chat
- Team overview with statistics
- Real-time chat simulation
- Member management
- Team profiles with gaming stats
- Online member indicators

### 👤 Profile Tab - User Dashboard
- User profile with gaming accounts integration
- Live stats from gaming platforms (mock data)
- Gaming account linking (Steam, Faceit, ESEA)
- Team membership overview
- Activity summary

## 🚀 Tech Stack

- **Framework**: React Native with Expo SDK 53
- **Navigation**: Expo Router v5
- **Language**: TypeScript (strict mode)
- **Styling**: React Native StyleSheet with custom design system
- **State Management**: React hooks
- **Icons**: Expo Vector Icons
- **Development**: ESLint, Prettier, hot reloading

## 🎨 Design System

### Color Palette
- **Primary**: Purple (#8B5CF6) - Gaming theme
- **Secondary**: Blue (#3B82F6)  
- **Accent**: Pink (#EC4899)
- **Dark Theme**: Black/Dark Gray backgrounds
- **Gaming Aesthetic**: Gradients, shadows, modern UI

### Typography
- System fonts optimized for React Native
- Hierarchical text sizing
- Gaming-inspired visual elements

## 📱 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)

### Installation
```bash
# Navigate to presentation folder
cd presentation

# Install dependencies  
npm install

# Start development server
npm start
# or
npx expo start
```

### Development Commands
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Code formatting
npm run format

# Platform-specific builds
npm run ios      # iOS simulator
npm run android  # Android emulator  
npm run web      # Web browser
```

## 📊 Mock Data

The app uses comprehensive mock data to demonstrate features:

- **Teams**: CS:GO and VALORANT team examples
- **Users**: Gaming profiles with stats
- **Events**: Tournament, practice, scrim schedules
- **Chat**: Realistic team communications
- **Stats**: Faceit/Steam-style gaming statistics

## 🏗️ Project Structure

```
presentation/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── meet.tsx       # Calendar functionality
│   │   ├── groups.tsx     # Team management & chat
│   │   └── profile.tsx    # User profile & stats
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components (future)
├── utils/                 # Core utilities
│   ├── types.ts          # TypeScript interfaces
│   ├── constants.ts      # App constants & theme
│   ├── helpers.ts        # Utility functions
│   └── mockData.ts       # Demo data
├── assets/               # Images, icons, fonts
└── ...config files
```

## 🎮 Key Concepts Demonstrated

### Problem Solved
Gaming teams currently use multiple fragmented apps:
- Discord for communication
- Google Calendar for scheduling  
- WhatsApp for quick messages
- Various gaming platforms for stats
- Email for coordination

### When2meet Solution
**One centralized platform** providing:
- Unified team calendar with gaming-specific event types
- Integrated team chat with media support
- Gaming platform integration (Steam, Faceit, ESEA)
- Team statistics and performance tracking
- Mobile-first design for on-the-go coordination

### Target Audience
- Esports teams (CS:GO, VALORANT, LoL, Dota 2)
- Casual gaming groups
- Tournament organizers
- Gaming community managers

## 🔮 Future Enhancements

The presentation demonstrates core concepts. A production version would include:

- Real Firebase backend integration
- Live gaming API connections (tracker.gg, Steam API)
- Push notifications for events
- Video/voice calling integration
- Tournament bracket management
- Advanced team analytics
- Cross-platform synchronization

## 📝 Development Notes

- **No Emojis**: Following project guidelines, no emojis are used in the UI
- **TypeScript Strict**: Full type safety throughout the codebase
- **Performance**: Optimized FlatLists and efficient rendering
- **Accessibility**: Screen reader support and proper contrast
- **Responsive**: Works on various screen sizes

## 🎯 Business Value

When2meet addresses the #1 pain point for gaming teams: **coordination fragmentation**. By centralizing scheduling, communication, and performance tracking, teams can focus on what matters - winning games.

---

*Built with ❤️ for the gaming community*