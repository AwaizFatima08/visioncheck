# VisionCheck — Sprint Log

---

## Sprint 1 — Foundation
**Status:** ✅ Complete  
**Files delivered:**

| File | Description |
|------|-------------|
| app/i18n/strings.js | All English + Urdu strings |
| app/database/db.js | SQLite helpers — settings, assessments, results |
| app/engine/testEngine.js | DPI calc, alert logic, symptom routing |
| app/audio/speech.js | expo-speech bilingual helpers |
| app/components/ui.js | Shared UI components |
| app/navigation/AppNavigator.js | Full navigation structure |
| app/screens/Sprint1Screens.js | Splash, Language, Disclaimer, AgeBand, Home, SymptomSelector, PreTestSetup |
| package.json | All dependencies |
| app.json | Expo config |
| README.md | Developer setup guide |

**Notes:**
- Sprint 1 screens are combined in Sprint1Screens.js
- From Sprint 2 onwards each screen is its own file in the correct folder
- DPI calculation engine is complete and must be used by all test screens

---

## Sprint 2 — Test screens
**Status:** 🔜 Not started

**Planned files:**
- app/screens/tests/TestDistanceScreen.js
- app/screens/tests/TestNearScreen.js
- app/screens/tests/TestAstigmatismScreen.js
- app/screens/tests/TestContrastScreen.js
- app/screens/tests/TestAmslerScreen.js
- app/screens/tests/TestColorScreen.js
- app/components/charts/SnellenChart.js
- app/components/charts/NearVisionChart.js
- app/components/charts/AmslerGrid.js
- app/components/charts/AstigmatismFan.js
- app/components/charts/ContrastChart.js
- app/components/charts/ColorPlate.js

---

## Sprint 3 — Results + PDF export
**Status:** 🔜 Not started

**Planned files:**
- app/screens/results/TestResultScreen.js
- app/screens/results/FinalSummaryScreen.js
- app/utils/pdfGenerator.js
- app/utils/shareResults.js

---

## Sprint 4 — History
**Status:** 🔜 Not started

**Planned files:**
- app/screens/history/HistoryScreen.js
- app/screens/history/HistoryDetailScreen.js
- app/utils/dateFormatter.js

---

## Sprint 5 — Audio
**Status:** 🔜 Not started

**Planned work:**
- Wire expo-speech to all test instruction screens
- Wire to result screens
- Test Urdu voice on physical Android devices

---

## Sprint 6 — Settings + polish
**Status:** 🔜 Not started

**Planned files:**
- app/screens/settings/SettingsScreen.js
- app/screens/settings/DisclaimerViewScreen.js

---

## Sprint 7 — Build + Play Store
**Status:** 🔜 Not started

**Planned work:**
- eas build --platform android
- Play Store listing text + screenshots
- Privacy policy page
- Submit for review
