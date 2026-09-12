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
│   │   ├── onboarding/    ← Splash, LanguageSelect, Disclaimer
│   │   ├── home/          ← Home, AgeBand, SymptomSelector, RecommendedTests, PreTestSetup
│   │   ├── tests/         ← 6 test screens (Distance, Near, Astigmatism, Contrast, Amsler, Color)
│   │   ├── results/       ← TestResult, FinalSummary
│   │   ├── history/       ← History, HistoryDetail
│   │   └── settings/      ← Settings, DisclaimerView
│   ├── components/
│   │   ├── ui.js          ← All shared UI components
│   │   └── charts/        ← Test-specific chart visuals
│   ├── navigation/
│   │   └── AppNavigator.js  ← Full navigation structure
│   ├── i18n/
│   │   └── strings.js       ← All English + Urdu text
│   ├── database/
│   │   └── db.js            ← SQLite helpers (synchronous, expo-sqlite v15+)
│   ├── engine/
│   │   ├── dpiCalc.js        ← cm/mm → dp conversion, precomputed test sizes
│   │   ├── alertLogic.js     ← Alert level rules — single source of truth
│   │   └── symptomRouter.js  ← Symptom → test queue routing
│   └── audio/
│       └── speech.js         ← expo-speech helpers
├── assets/                ← icon.png, splash.png, adaptive-icon.png
├── App.js                 ← Entry point
├── app.json                ← Expo config
└── package.json
```

---

## Setup steps

### 1. Install dependencies
```bash
cd visioncheck
npm install
```

### 2. Run on device
```bash
# Start Expo dev server
npx expo start

# Scan QR code with Expo Go app on Android
# OR press 'a' to open in Android emulator
```

---

## Key files to understand first

1. `app/i18n/strings.js` — Every piece of text in the app. Add new strings here.
2. `app/engine/alertLogic.js` — Alert level rules per test, plus overall/eye-difference logic.
3. `app/engine/dpiCalc.js` — Physical-size (cm/mm) to dp conversion used by every test screen.
4. `app/database/db.js` — All local storage. Every read/write goes through here.
5. `app/components/ui.js` — Shared components. Use these, don't recreate them.

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
- All test sizing must use cmToDp()/mmToDp() from engine/dpiCalc.js — never use fixed pixel sizes
- RTL support: always check isUrdu(language) and apply textAlign and writingDirection
- Audio: always wrap speech calls in try/catch — audio is enhancement not dependency
