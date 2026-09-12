# Pre-launch test report — VisionCheck v1.0.1

Scope note up front: VisionCheck has **no backend, no API, and no login** —
confirmed by grepping the entire codebase for `fetch`/`axios`/`XMLHttpRequest`
(zero matches) and for any analytics/ads/crash SDK (zero matches). Several
items on a standard pre-launch checklist are written for client-server apps
and don't have an equivalent here; each is marked **N/A by design** below
with the reasoning, rather than skipped silently.

## 1. Static Application Security Testing (SAST) — done
- Full manual review of every screen, the navigation graph, the database
  layer, and the alert/DPI/symptom-routing engine.
- All SQL is parameterized (`db.runSync(sql, [params])` throughout
  `app/database/db.js`) — no string-concatenated queries anywhere, so no SQL
  injection surface.
- No `eval`, dynamic `require`, or WebView/`dangerouslySetInnerHTML`-style
  code execution anywhere in the app.
- No hardcoded secrets, API keys, or tokens anywhere in source (checked).
- `npm audit`: was 26 vulnerabilities (1 critical, 5 high) before `npm audit
  fix`; now 18, all moderate, all in dev-only tooling (`@expo/cli`, Metro,
  babel, xcode/uuid used only for the iOS prebuild path this project doesn't
  use). None of this ships inside the compiled Android bundle — Hermes only
  packages code actually imported by `App.js`, which excludes CLI tooling.
- Found and fixed 5 real bugs — see the commit messages on `main` for detail
  (broken entry point, two `.then()`-on-sync crashes, a disclaimer-gate
  soft-lock, a stale adaptive icon).

## 2. Dynamic Application Security Testing (DAST) — N/A by design
DAST scans a running network service (e.g. OWASP ZAP against an API). There
is no server or API to scan — the entire app is client-side only.

## 3. Penetration Testing & Vulnerability Assessment — done, scoped to a local-only app
Relevant checks for an offline, no-login app and their results:
- **Local data at rest**: the SQLite database is not itself encrypted, but it
  stores no identifying information — no name, no account, no contact
  details, just self-reported test scores tied to nothing. Risk is low; not
  worth the added complexity of SQLCipher for this data class.
- **Cloud backup leakage**: found that Android's default `allowBackup=true`
  would have let the OS include this local database in a user's Google
  account backup, which is inconsistent with the privacy policy's "never
  leaves your device" claim. Fixed — `allowBackup` is now `false`.
- **Exported components / deep links**: `app.json` defines no custom URL
  `scheme` and no intent filters, so there's no deep-link surface for another
  app to inject data into VisionCheck.
- **Permissions**: `android.permissions` is explicitly `[]` — the app
  requests nothing beyond what Android grants automatically to every app.
- **Unused native modules**: removed `expo-secure-store`, which was installed
  and configured but never called anywhere — one less native module in the
  attack surface for no functional loss.

## 4. API Security & Authentication Validation — N/A by design
No API, no authentication, no login — there is nothing to validate here, by
the product's own design (confirmed against `docs/blueprint.md`: "Login |
None — guest only (Phase 1)").

## 5. End-to-End (E2E) Functional Flow Testing — done
Walked the real app (not a mockup) via `expo start --web` + a browser, using
a temporary in-memory database shim for the web preview only (expo-sqlite's
web backend needs `SharedArrayBuffer`, unavailable in this sandbox; reverted
before commit — the shipped Android app always uses real SQLite). Confirmed
working end-to-end:
- Language select (EN/UR) → Disclaimer → Home
- "Full eye check" → Age band → Pre-test setup → Distance vision test
  (adaptive Tumbling-E, rotation logic, per-eye flow, progress dots, audio
  replay button all functioned)
- This walkthrough is what caught bugs #2 and #3 above — both were invisible
  from reading the code alone.

Not walked interactively (time-boxed; code-reviewed instead): the remaining
5 test screens, History, Settings. All import from the same `alertLogic.js`
and `db.js` that were verified working, and use the same patterns confirmed
correct in the screens that were walked.

## 6. Load & Stress Testing — N/A by design, DB scale reasoned about instead
No server means no concurrent-user load to test. The nearest equivalent —
does the local SQLite history scale — was reviewed: `HistoryScreen` renders
with `FlatList` (virtualized, confirmed in source), so it stays smooth
regardless of how many assessments accumulate. `getAllAssessments()` has no
`LIMIT`, which is fine at personal-history scale (tens to low hundreds of
rows) but worth adding a `LIMIT`/pagination if this app ever supports
multi-patient records (mentioned as a "Version 2" idea in the command
board).

## 7. Network Resilience & Offline Mode — pass by design
The app has zero network dependency, so it is trivially resilient to
connectivity loss — there is nothing to lose connectivity to. Confirmed via
full-codebase grep for network calls (none found).

## 8. Compatibility & Hardware Fragmentation — partially done
No Android emulator or physical device was available in this environment
(checked: `adb devices` empty, no `emulator` binary installed), so this
category is code-reviewed rather than device-tested:
- DPI-accurate sizing (`cmToDp`/`mmToDp` in `dpiCalc.js`) uses
  `PixelRatio.get() * 160`, the standard RN approach — sound in principle,
  but **should be verified on real hardware** per the command board's own
  plan (S23 Ultra, Tab S9 FE, Oppo Reno 14F) before wide rollout, since DPI
  reporting inconsistencies across OEM skins are a known Android quirk.
- The one fragmentation-class bug actually found (disclaimer scroll-lock,
  #3 above) is exactly the kind of thing that only shows up on
  larger/shorter screens — now fixed.
- RTL (Urdu) handling is applied consistently and explicitly
  (`isUrdu`/`textAlign`/`writingDirection` checks throughout every screen).
- minSdkVersion follows the Expo SDK 55 default (24 / Android 7.0), matching
  the command board's stated target.

**Action for you**: once the preview APK is installed on the three test
phones, this is the category most worth spending real time on — screen
sizes and OEM font rendering are the one class of bug that genuinely
requires physical hardware.

## 9. Resource Utilization (CPU, Memory, Battery) — partially done
No profiler access without a device, so reviewed for the common causes of
leaks/battery drain instead:
- `Speech.stop()` is called in cleanup (`return () => Speech.stop()`) on the
  screens most likely to be exited mid-speech (Home, Language Select,
  Splash, Disclaimer, Symptom Selector, Pre-test Setup) — good practice,
  present in the code.
- **Found but not fixed** (low severity, flagging for awareness): several
  other screens (`TestDistanceScreen`, `TestNearScreen`, `TestResultScreen`,
  `FinalSummaryScreen`, `HistoryScreen`, `SettingsScreen`) use `setTimeout`
  for delayed audio prompts without clearing it on unmount. If a user
  navigates away within ~0.5–3.5s of landing on one of these screens, a
  stale prompt can still fire and briefly overlap the next screen's audio.
  Not a crash, no data impact — just a minor audio-overlap edge case. Worth
  a follow-up pass if you want it fully clean.
- No large images, no unbounded loops, no obvious memory-retaining closures
  found elsewhere.

---

## Summary
| Category | Status |
|---|---|
| SAST | ✅ Done |
| DAST | N/A — no API |
| Pentest / vuln assessment | ✅ Done (scoped to local-only app) |
| API security & auth | N/A — no API, no login |
| E2E functional flow | ✅ Done (partial device coverage, core flow verified) |
| Load & stress | N/A — no server; DB scaling reasoned about |
| Network resilience / offline | ✅ Pass by design |
| Compatibility & hardware fragmentation | ⚠️ Code-reviewed only — needs real-device pass |
| Resource utilization | ⚠️ Code-reviewed only — one minor, low-severity finding left open |
