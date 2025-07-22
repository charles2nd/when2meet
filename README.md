# When2meet

<div align="center">
  <img src="presentation/assets/icon.png" alt="When2meet Logo" width="120" height="120">
  <h3>The ultimate gaming team management platform</h3>
  <p>Centralizing team coordination, communication, and performance tracking for esports teams</p>
</div>

---

## 📖 Overview

**When2meet** is a React Native mobile application designed to solve the fragmentation problem faced by gaming teams who currently use multiple apps (Discord, Google Calendar, WhatsApp, various gaming platforms) for coordination. 

This repository contains a **presentation demo** showcasing the core concepts and features of the When2meet platform.

### 🎥 Demo Video

[ScreenRecording_07-21-2025_19-45-15_1.mov](presentation/ScreenRecording_07-21-2025_19-45-15_1.mov)

*Full app demonstration showing all features in action*

---

## 🏃‍♂️ Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

```bash
npm install -g @expo/cli
```

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd when2meet
   ```

2. **Navigate to presentation folder**
   ```bash
   cd presentation
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   npx expo start
   ```

### Development Commands

```bash
# Start development server
npm start                 # Interactive menu
npm run web              # Web browser (recommended for demos)
npm run ios              # iOS simulator
npm run android          # Android emulator

# Code quality
npm run type-check       # TypeScript type checking
npm run lint             # ESLint linting
npm run format           # Prettier code formatting
```

---

## 🏗️ Project Structure

```
when2meet/
├── presentation/                    # Main demo application
│   ├── app/                        # Expo Router screens
│   │   ├── (tabs)/                # Tab navigation
│   │   │   ├── meet.tsx           # Calendar & events
│   │   │   ├── groups.tsx         # Team management & chat
│   │   │   └── profile.tsx        # User profile & stats
│   │   ├── _layout.tsx            # Root layout
│   │   └── index.tsx              # Entry point
│   ├── utils/                     # Core utilities
│   │   ├── types.ts               # TypeScript interfaces
│   │   ├── constants.ts           # App constants & theme
│   │   ├── helpers.ts             # Utility functions
│   │   └── mockData.ts            # Demo data
│   ├── assets/                    # Static assets
│   ├── package.json               # Dependencies
│   └── ...config files
├── PRPs/                          # Product Requirements Prompts
├── .claude/                       # AI assistant configuration
└── README.md                      # This file
```

---

## ✨ Features

### 📅 Meet Tab - Team Calendar
- **Interactive calendar** with monthly/weekly views
- **Gaming-specific events**: Games, Practice, Scrims, Tournaments, Day Off
- **Event management** with participant tracking
- **Upcoming events** overview and notifications
- **Event type indicators** with color coding

### 👥 Groups Tab - Team Management & Chat
- **Team overview** with statistics and member management
- **Real-time chat simulation** with message history
- **Member profiles** with roles and permissions
- **Team statistics** including win rates and rankings
- **Online status** indicators for team members

### 👤 Profile Tab - User Dashboard
- **User profiles** with customizable avatars and information
- **Gaming account integration** (Steam, Faceit, ESEA)
- **Live statistics** from gaming platforms
- **Team membership** overview with role indicators
- **Activity tracking** and performance metrics

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React Native with Expo SDK 53 |
| **Language** | TypeScript (strict mode) |
| **Navigation** | Expo Router v5 |
| **Styling** | React Native StyleSheet with custom design system |
| **State Management** | React Hooks |
| **Icons** | Expo Vector Icons |
| **Development Tools** | ESLint, Prettier, Metro Bundler |

---

## 🎨 Design System

### Color Palette
```typescript
Primary: #8B5CF6    // Purple - Gaming theme
Secondary: #3B82F6  // Blue
Accent: #EC4899     // Pink
Success: #10B981    // Green
Warning: #F59E0B    // Orange
Danger: #EF4444     // Red
Dark: #0F172A       // Dark background
Darker: #020617     // Darker background
```

### Typography
- **System fonts** optimized for React Native
- **Hierarchical sizing** for content organization
- **Gaming-inspired** visual elements and styling

---

## 🎮 Core Concepts

### The Problem
Gaming teams currently juggle multiple apps for coordination:
- **Discord** for communication
- **Google Calendar** for scheduling
- **WhatsApp** for quick messages
- **Steam/Faceit/ESEA** for stats
- **Email** for formal coordination

### Our Solution
**When2meet** provides a unified platform with:
- **Centralized scheduling** with gaming-specific event types
- **Integrated team chat** with media support
- **Gaming platform integration** for live stats
- **Performance tracking** and team analytics
- **Mobile-first design** for on-the-go coordination

### Target Audience
- **Esports teams** (CS:GO, VALORANT, League of Legends, Dota 2)
- **Casual gaming groups** and communities
- **Tournament organizers** and event managers
- **Gaming community managers** and coaches

---

## 📊 Mock Data & Demo Features

The presentation app includes comprehensive mock data:

| Category | Examples |
|----------|----------|
| **Teams** | Syko Team (CS:GO), Valorant Squad |
| **Players** | FreeZe, n0thing, shroud, stewie2k, tarik |
| **Events** | ESL Weekly Cup, Aim Training, Scrims |
| **Messages** | Realistic team communications |
| **Stats** | Faceit/Steam-style gaming statistics |

---

## 🚀 Production Roadmap

This presentation demonstrates core concepts. A production version would include:

### Backend Infrastructure
- **Firebase integration** for real-time data
- **Authentication system** with phone number verification
- **Cloud functions** for complex operations
- **Push notifications** for events and messages

### Gaming Platform APIs
- **tracker.gg integration** for live statistics
- **Steam API** for profile and game data
- **Faceit API** for competitive stats
- **ESEA API** for league information

### Advanced Features
- **Video/voice calling** integration
- **Tournament bracket** management
- **Advanced analytics** and performance insights
- **Cross-platform synchronization**
- **Team recruitment** and discovery

---

## 🔧 Development Guidelines

### Code Standards
- **TypeScript strict mode** enforced
- **ESLint** for code quality
- **Prettier** for consistent formatting
- **No emojis** in UI (per project guidelines)

### Performance
- **Optimized FlatLists** for large datasets
- **Efficient rendering** with proper key props
- **Memory management** for media content
- **Lazy loading** for improved startup times

### Accessibility
- **Screen reader support** throughout the app
- **Proper contrast ratios** for readability
- **Touch target sizing** following platform guidelines
- **Semantic labeling** for interactive elements

---

## 🤝 Contributing

This is a presentation demo. For contributions to the full platform:

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Team

**Client Concept**: FreeZe  
**Development**: Claude AI Assistant  
**Platform**: When2meet Gaming Team Management  

---

<div align="center">
  <p><strong>Built with ❤️ for the gaming community</strong></p>
  <p>Centralizing team coordination • Enhancing performance • Winning together</p>
</div>