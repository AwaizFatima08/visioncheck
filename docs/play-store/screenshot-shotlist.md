# Screenshot shot list for Play Store listing

I walked the app end-to-end in a browser-based preview during testing and
confirmed these screens render and function correctly, but I have no way to
export real device pixels to image files from this environment (no Android
emulator or physical device is attached here). Once the preview APK from
this build is installed on a phone (see below), capture these 8 screens with
the device's own screenshot function (Power + Volume Down on most Android
phones). Play Store requires 2–8 screenshots, 16:9 or 9:16, JPG/PNG, each
side between 320px and 3840px — a stock phone screenshot satisfies this with
no editing needed.

1. **Language Select** — first screen, shows the bilingual EN/UR picker with
   the eye+checkmark brand mark. Good first impression shot.
2. **Home dashboard** — "I have a specific complaint" / "Full eye check"
   cards. This is the core value prop, should be screenshot #1 or #2 in the
   listing order.
3. **Symptom Selector** (Path A) — shows the guided routing concept.
4. **A test in progress** — TestDistance or TestAmslerScreen mid-test (shows
   an actual chart, proves the "6 clinical tests" claim visually).
5. **Test result / Final Summary** — shows the green/yellow/red/urgent alert
   banner and the "see a doctor" guidance — the app's key differentiator.
6. **History screen** — shows local, on-device history list.
7. **Settings screen** — shows language switch + "Clear History" (reinforces
   the privacy/offline story for cautious users).
8. **Urdu language variant** of either Home or a test screen — demonstrates
   real bilingual support, not just a language toggle that does nothing.

Install the preview build once it finishes:
```bash
# EAS prints a QR code / download link when the build completes; or:
npx eas-cli build:list --platform android --limit 1
```
Download the APK from the link EAS gives you, sideload it onto the S23
Ultra / Tab S9 FE / Oppo Reno 14F, and shoot the 8 screens above in both
English and (for at least 2-3 of them) Urdu.
