# Play Store screenshots

Captured automatically from the real running app (react-native-web build,
driven headlessly with Puppeteer against Chrome — same component tree and
styling as the native app, not a mockup) at 786×1704px effective resolution
(393×852 viewport, 2x device scale), which satisfies Play Store's screenshot
spec (2–8 images, 320–3840px per side, PNG/JPG).

All 14 are in `docs/play-store/screenshots/`. Play Console wants a curated
set, not all of them — recommended upload order (8 shown, English-first
since that's the primary store listing locale, with 3 Urdu shots to prove
real bilingual support rather than a token toggle):

1. `03_home.png` — the core value prop: "specific complaint" vs "full eye
   check" paths
2. `08_test_color.png` — an actual clinical test in progress (also proves
   the colour-plate legibility fix)
3. `09_final_summary.png` — the alert banner + per-test results + "see a
   doctor" guidance, the app's key differentiator
4. `10_history.png` — on-device history, reinforces the offline/privacy story
5. `05_symptom_selector.png` — shows the guided-routing concept
6. `11_settings.png` — language switch + clear-history, privacy reassurance
7. `13_home_urdu.png` — real bilingual support (Nastaliq rendering)
8. `14_test_near_urdu.png` — Urdu reading test, the most font-sensitive
   screen in the app

The remaining 6 (`01_language_select`, `02_disclaimer`, `04_age_band`,
`06_recommended_tests`, `07_pretest_setup`, `12_disclaimer_urdu`) are there
if you want a longer gallery or prefer a different flow order — swap freely,
nothing about the recommended-8 list above is load-bearing.

## Known gap
These are web-rendered, not native-device pixels — visually accurate (same
React component styles) but not a substitute for the real-device pass this
report keeps flagging as the top remaining priority (DPI/font-fallback
behavior across actual OEM skins can only be confirmed on the S23 Ultra /
Tab S9 FE / Oppo Reno 14F). If you'd rather use real device screenshots
instead, the shot list above still tells you which 8 screens to capture.
