Gamer Meets WebApp — Claude AI Setup
⚙️ General Overview
Built with Expo, React Native, and TypeScript

Designed for easy deployment to iOS and Android

Backend: Firebase (Auth + Firestore)

Phone number is the only login method and serves as user ID

Clean, modern UI with persistent footer navigation (3 tabs: Meet, Conversations/Groups, Profile)

No emojis allowed anywhere in the app

NO MOCK DATA - All data must come from Firebase infrastructure only

Modular architecture by feature, optimized for team handoff

🔄 Project Awareness & Workflow
Read PLANNING.md at the start of any session to understand architecture, UI rules, and database structure

Avoid large monolithic components – split into smaller reusable ones

🧪 Testing & Debugging
Write at least 1 test per screen or utility using jest or expo-jest

Include tests for:

expected use

edge case

failure case

Keep tests under /__tests__ directory, mirrored by feature

✅ Task Completion
Mark completed tasks in TASK.md immediately after finishing

If you discover new bugs or missing logic, add them to the “Discovered During Work” section in TASK.md

🧩 Style & Conventions
Use strict TypeScript

Use PascalCase for components, camelCase for functions/variables

Use named exports over default

Lint and format code with eslint + prettier

Document components and utils with JSDoc-like comments

Ensure props are typed properly and use React.FC where appropriate

📚 Documentation & Maintainability
Update README.md if:

New features are added

Dependencies or setup changes

Comment non-obvious logic

Use inline // Reason: for any unconventional code or design decisions

🧠 AI Behavior Guidelines
Never invent or guess missing components — ask first

Stick strictly to React Native / Firebase libraries

Never reference non-existing files, modules, or paths

Never delete or overwrite existing code unless the task explicitly says so or it’s part of the task scope

Deployment
Production builds: eas build -p android or -p ios

Make sure it also can run on the web

Easy OTA updates with Expo

Firebase config lives in services/firebase.ts

React Native doc https://reactnative.dev/