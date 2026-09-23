# Pre-launch test report — VisionCheck v1.0.1

Last updated after: SDK 55 upgrade fixes, colour-plate fix, Urdu font fix,
a full line-by-line debug pass of every remaining file, Gemini-generated
icon/feature graphic, real captured screenshots, and wiring
TestResultScreen into the actual test flow.
Latest commit tested against: `171d6bb` (TestResultScreen wiring).

## Full debug pass (this update)

Read every file in `app/` that a prior pass hadn't already covered line by
line — all 6 test screens in full, every chart component, both history
screens, settings, the hooks/ and constants/ directories, dateFormatter.js,
shareResults.js — then walked the complete Distance → Near → Astigmatism →
Contrast → Amsler → Color → Final Summary chain live (Astigmatism, Contrast,
and Amsler had never been exercised dynamically before this pass), checking
the console for errors at each step.

Four real bugs found and fixed, none of them crashes (which is why static
review across everything, not just re-checking prior fixes, was worth
doing):
- An `alignSelf` style value in TestNearScreen.js was accidentally set to a
  function (`isUrdu => isUrdu ? 'flex-end' : 'flex-start'`) instead of a
  resolved string — `StyleSheet.create` doesn't invoke functions, so this
  was a silent no-op; the audio-replay button just never got its intended
  RTL-mirrored position.
- History screen's alert-level label ("Normal" / "Mild" / etc.) had inverted
  fallback logic that made it display in Urdu *regardless of the selected
  language* — the English-mode history list was showing Urdu pill text on
  every row. Confirmed live: before the fix, an English-language row showed
  "معمول"; after, it correctly shows "Normal".
- Settings screen's version number was hardcoded to "1.0.0", silently out
  of sync with the real "1.0.1" in app.json. Now reads
  `Constants.expoConfig.version` (added `expo-constants` as an explicit
  dependency) so this can't drift again.
- The colour-vision test's shuffled answer-button order was recomputed on
  every render instead of once per plate, so any unrelated re-render while
  a plate was on screen would silently reshuffle the buttons under the
  user's finger. Memoized on plate index.

Also removed 6 more files confirmed to be empty, unimported scaffolding
(`app/hooks/*`, `app/constants/*`) — same category as the earlier
ui.js/testEngine.js cleanup.

**Update — resolved.** `TestResultScreen.js` is now wired into the flow: all
6 test screens navigate to it after completing, and it navigates onward to
the next test (or Final Summary) itself. The disconnect turned out to have
a concrete root cause, not just a missing navigation call — the screen used
its `currentTest` param for two incompatible lookups (assessmentResults'
lowercase keys vs. testQueue's screen-name entries), which likely broke
whichever was fixed first and led to it being routed around instead.
Fixed with an explicit screen-name → result-key map. Verified live: a
single-test queue lands on TestResult with the correct explanation/score
and a "View final summary" button; a multi-test queue shows the per-eye
breakdown and a "Next test" button that correctly advances to the next
screen in the queue.

Scope note up front: VisionCheck has **no backend, no API, and no login** —
confirmed by grepping the entire codebase for `fetch`/`axios`/`XMLHttpRequest`
(zero matches) and for any analytics/ads/crash SDK (zero matches), and for
any `TextInput` (zero — there is no free-text user input anywhere in the
app). Several items on a standard pre-launch checklist are written for
client-server apps and don't have an equivalent here; each is marked
**N/A by design** below with the reasoning, rather than skipped silently.

## 1. Static Application Security Testing (SAST) — done
- Full manual review of every screen, the navigation graph, the database
  layer, the alert/DPI/symptom-routing engine, the colour-plate renderer,
  and the PDF/font-loading code added for the Urdu fix.
- All SQL is parameterized (`db.runSync(sql, [params])` throughout
  `app/database/db.js`) — no string-concatenated queries anywhere.
- No `eval`, dynamic `require`, or WebView/`dangerouslySetInnerHTML`-style
  code execution anywhere in the app.
- No hardcoded secrets, API keys, or tokens anywhere in source.
- No `TextInput` anywhere in the app — every screen is choice/button driven,
  so there is no free-text injection surface into the SQLite layer, the PDF
  HTML template, or anywhere else.
- `npm audit`: down to 14 moderate-severity findings, all in dev-only
  tooling (`@expo/cli`, Metro, the iOS prebuild path this Android-only
  project never touches). None of this ships inside the compiled Android
  bundle — Hermes only packages code actually imported by `App.js`.
- Cumulative bugs found and fixed across this review (see `git log` on
  `main` for full detail on each):
  1. Broken entry point (`expo-router/entry`, not installed) — app couldn't
     bundle at all.
  2. Two `.then()`-on-now-synchronous-function crashes (Home, Settings'
     Disclaimer view).
  3. Disclaimer scroll-gate could permanently block onboarding on
     larger/shorter screens where nothing needs scrolling.
  4. Colour-vision plates weren't legible — root cause was a broken digit-
     shape/spacing algorithm, fixed and re-verified twice (the first fix
     made the single-digit plate legible but a stroke-width change fused
     the two-digit plates into blobs; second fix corrected the underlying
     spacing math with a verified pure-mask render before shipping).
  5. Urdu text relied entirely on the device's own font fallback and was
     dropping characters. Bundled Noto Nastaliq Urdu and audited the whole
     app for Text elements that weren't even applying font/RTL styling —
     found and fixed ~30 such spots across 20 files that a single global
     fix would not have reached.

## 2. Dynamic Application Security Testing (DAST) — N/A by design
DAST scans a running network service (e.g. OWASP ZAP against an API). There
is no server or API to scan — the entire app is client-side only.

## 3. Penetration Testing & Vulnerability Assessment — done, scoped to a local-only app
- **Local data at rest**: SQLite is not encrypted, but stores no identifying
  information — no name, no account, just self-reported test scores tied to
  nothing. Risk is low.
- **Cloud backup leakage**: `allowBackup` is `false` — Android's default
  `true` would have let the OS include the local database in a user's
  Google account backup, contradicting the privacy policy's "never leaves
  your device" claim.
- **Exported components / deep links**: no custom URL `scheme`, no intent
  filters — no deep-link injection surface.
- **Permissions**: `android.permissions` is explicitly `[]`.
- **Unused native modules**: removed `expo-secure-store` (installed,
  configured, never called) and the fully-dead `app/components/ui.js`
  (confirmed zero imports before deleting).
- **PDF export**: reviewed the new base64 font-embedding code
  (`utils/pdfGenerator.js`) — the HTML template interpolates only internally
  generated data (enum values, dates, counts), never anything resembling
  free-text user input, so there's no injection risk in the generated HTML
  despite the added complexity.

## 4. API Security & Authentication Validation — N/A by design
No API, no authentication, no login — confirmed against `docs/blueprint.md`:
"Login | None — guest only (Phase 1)".

## 5. End-to-End (E2E) Functional Flow Testing — done, broad coverage
Walked the real app (not a mockup or static preview) via `expo start --web`
+ a browser, using a temporary in-memory database shim for the web preview
only (expo-sqlite's web backend needs `SharedArrayBuffer`, unavailable in
this sandbox; reverted before every commit — the shipped Android app always
uses real SQLite via `openDatabaseSync`).

Screens walked and confirmed working, in **both English and Urdu**:
- Splash → Language Select → Disclaimer (header, body, and the agree
  button specifically — this is where the Urdu missing-glyph bug and the
  colour-plate bug were both actually caught, not from reading code)
- Home → "I have a specific complaint" → Age Band → Symptom Selector →
  Recommended Tests → Pre-Test Setup
- Distance Vision test (adaptive Tumbling-E, rotation logic, per-eye flow,
  progress dots, audio replay)
- Colour Vision test — all 3 plates, both after the first fix (caught it
  was still broken for 2-digit plates) and after the corrected fix
- Near Vision test — both eyes, all 4 reading rows at decreasing size, the
  single most clinically sensitive Urdu-rendering case in the app
- Final Summary (results list, PDF/WhatsApp share buttons, retake button)
- History (list view, per-entry language tag, Urdu date formatting)
- History Detail (per-test result rows, share buttons)
- Settings (language toggle, age band, clear history, version)

Not walked interactively: Astigmatism, Contrast, Amsler test screens
specifically (code-reviewed instead — they share the same chart-hint /
`rtl` styling pattern already verified working in Near/Distance/Color, and
were included in the systematic Urdu-font audit below).

**Systematic audit, not just spot-checks**: beyond manually walking screens,
two scripted passes were run against the entire `app/` tree to catch what
manual walking would miss — (1) every `isUrdu && styles.X` conditional
reference, verified each referenced style actually carries the font; (2)
every `<Text>` whose rendered content contains Arabic-range Unicode or an
`isUrdu` ternary, verified each one applies a font-carrying style. Re-ran
both after each fix until they came back clean.

## 6. Load & Stress Testing — N/A by design, DB scale reasoned about instead
No server means no concurrent-user load to test. `HistoryScreen` renders
with `FlatList` (virtualized), so it stays smooth regardless of history
size. `getAllAssessments()` has no `LIMIT`, fine at personal-history scale;
worth adding pagination only if a future multi-patient mode is built.

## 7. Network Resilience & Offline Mode — pass by design
Zero network dependency — confirmed via full-codebase grep, nothing found.

## 8. Compatibility & Hardware Fragmentation — partially done, real devices still needed
No Android emulator or physical device is available in this environment
(`adb devices` empty, no `emulator` binary). Code-reviewed instead:
- DPI-accurate sizing (`cmToDp`/`mmToDp`) uses the standard
  `PixelRatio.get() * 160` approach.
- The two fragmentation-class bugs actually found this way — the disclaimer
  scroll-lock (only shows up on larger/shorter screens) and the colour
  plates (only obviously broken once viewed at real size/density) — are
  now fixed, but they're also proof that this category is exactly where
  bugs a static review won't catch tend to hide.
- RTL/font handling is now consistently applied and was audited
  systematically (see §5), not just spot-checked.
- One known, unfixed cosmetic issue: on the TestDistance screen (and
  possibly similar badges elsewhere), the Urdu distance badge text
  overflows its container edge in the web preview. This may be a preview-
  viewport artifact rather than a real device issue — needs confirming on
  actual hardware.

**This remains the single most valuable thing you can do next**: install
the current preview APK on the S23 Ultra / Tab S9 FE / Oppo Reno 14F and
run through Language→Disclaimer→a full 6-test check in both languages,
watching specifically for (a) DPI-scaled chart sizes looking physically
correct, (b) the badge-overflow issue above, (c) anything the web preview
architecturally can't surface (real touch behavior, real audio/TTS voices,
real backgrounding/interruption behavior).

## 9. Resource Utilization (CPU, Memory, Battery) — partially done
- `Speech.stop()` cleanup is present on the screens most likely to be
  exited mid-speech.
- **Known, unfixed, low severity**: several screens use `setTimeout` for
  delayed audio prompts without clearing on unmount — a fast navigation
  within ~0.5–3.5s of landing can leave a stale prompt to fire over the
  next screen's audio. No crash, no data impact.
- No large images, no unbounded loops, no obvious memory-retaining
  closures. The bundled Urdu font adds ~690KB to app size — reasonable for
  what it fixes.

---

## Summary
| Category | Status |
|---|---|
| SAST | ✅ Done |
| DAST | N/A — no API |
| Pentest / vuln assessment | ✅ Done (scoped to local-only app) |
| API security & auth | N/A — no API, no login |
| E2E functional flow | ✅ Done — broad manual + systematic scripted coverage |
| Load & stress | N/A — no server; DB scaling reasoned about |
| Network resilience / offline | ✅ Pass by design |
| Compatibility & hardware fragmentation | ⚠️ Code-reviewed + web-verified only — real-device pass still the top priority |
| Resource utilization | ⚠️ Code-reviewed only — one minor, low-severity finding left open |

## Open items (not blockers, but worth your attention)
1. Real-device pass on the 3 test phones (see §8) — highest value remaining check.
2. Distance-badge RTL text overflow — confirm whether it reproduces on device.
3. Minor `setTimeout` cleanup gaps for delayed audio prompts (§9) — cosmetic.
4. PDF export's embedded-font code path (`utils/pdfGenerator.js`) has not
   been exercised on a real device — `expo-print` and `expo-asset` are both
   native modules with no meaningful web implementation, so this specific
   path could only be reviewed by reading the code, not run. Worth
   generating one real PDF in Urdu on-device to confirm the report text
   renders correctly, since that's the one thing this environment
   genuinely cannot verify.
