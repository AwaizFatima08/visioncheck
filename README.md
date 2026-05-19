# VisionCheck — نظر کا معائنہ
## Developer Setup Guide

---

## What is this

VisionCheck is an Android vision self-assessment app built with React Native (Expo).
It runs entirely offline — no backend, no login, all data stored locally on the device.

---

## Prerequisites

- Node.js 18 or higher
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- Android Studio (for emulator) OR a physical Android device with Expo Go installed

---

## Project structure

```
visioncheck/
├── app/
│   ├── screens/
│   │   ├── Sprint1Screens.js     ← Splash, Language, Disclaimer, AgeBand, Home,
│   │   │                            SymptomSelector, PreTestSetup
│   │   ├── HistoryScreen.js      ← Sprint 4
│   │   ├── HistoryDetailScreen.js
│   │   ├── SettingsScreen.js
│   │   ├── FinalSummaryScreen.js ← Sprint 3
│   │   └── tests/                ← Sprint 2
│   │       ├── TestDistanceScreen.js
│   │       ├── TestNearScreen.js
│   │       ├── TestAstigmatismScreen.js
│   │       ├── TestContrastScreen.js
│   │       ├── TestAmslerScreen.js
│   │       ├── TestColorScreen.js
│   │       └── TestResultScreen.js
│   ├── components/
│   │   └── ui.js                 ← All shared UI components
│   ├── navigation/
│   │   └── AppNavigator.js       ← Full navigation structure
│   ├── i18n/
│   │   └── strings.js            ← All English + Urdu text
│   ├── database/
│   │   └── db.js                 ← SQLite helpers
│   ├── engine/
│   │   └── testEngine.js         ← DPI logic, alert rules, symptom routing
│   └── audio/
│       └── speech.js             ← expo-speech helpers
├── assets/                       ← Add icon.png, splash.png, adaptive-icon.png
├── App.js                        ← Entry point
├── app.json                      ← Expo config
└── package.json
```

---

## Setup steps

### 1. Install dependencies
```bash
cd visioncheck
npm install
```

### 2. Create App.js entry point
```javascript
import AppNavigator from './app/navigation/AppNavigator';
import { initDatabase } from './app/database/db';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    initDatabase().catch(console.error);
  }, []);
  return <AppNavigator />;
}
```

### 3. Add placeholder assets
Place these in /assets:
- icon.png (1024x1024)
- splash.png (1284x2778)
- adaptive-icon.png (1024x1024)
Use any placeholder image for now.

### 4. Run on device
```bash
# Start Expo dev server
expo start

# Scan QR code with Expo Go app on Android
# OR press 'a' to open in Android emulator
```

---

## Sprint status

| Sprint | Screens | Status |
|--------|---------|--------|
| 1 | Splash, Language, Disclaimer, AgeBand, Home, SymptomSelector, PreTestSetup | ✅ Built |
| 2 | All 6 test screens | 🔜 Next |
| 3 | Final summary + PDF export | 🔜 |
| 4 | History screens | 🔜 |
| 5 | Audio prompts wired to all screens | 🔜 |

---

## Key files to understand first

1. `app/i18n/strings.js` — Every piece of text in the app. Add new strings here.
2. `app/engine/testEngine.js` — Alert logic, DPI calculations, symptom routing.
3. `app/database/db.js` — All local storage. Every read/write goes through here.
4. `app/components/ui.js` — Shared components. Use these, don't recreate them.

---

## Adding a new language

1. Add a new key to `strings.js` (e.g. `pa` for Punjabi)
2. Add the language option to `LanguageSelectScreen`
3. Add voice language code to `speech.js` VOICE_LANG object

---

## Building APK for Android

```bash
# Configure EAS
eas login
eas build:configure

# Build APK (preview build — installable APK)
eas build --platform android --profile preview
```

---

## Notes for the developer

- All text must go through i18n/strings.js — never hardcode text in screens
- All data must go through database/db.js — never use AsyncStorage directly
- All test sizing must use cmToDp() from testEngine.js — never use fixed pixel sizes
- RTL support: always check isUrdu(language) and apply textAlign and writingDirection
- Audio: always wrap speech calls in try/catch — audio is enhancement not dependency
