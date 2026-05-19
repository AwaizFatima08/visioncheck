# VisionCheck — Project Blueprint
# نظر کا معائنہ

**Version:** 1.0  
**Last updated:** 2025  
**GitHub:** https://github.com/awaizfatima08/visioncheck  
**Primary path:** /mnt/storage/projects/visioncheck  
**Backup path:** /mnt/storage/project_backups/visioncheck

---

## App identity

| Item | Value |
|------|-------|
| App name | VisionCheck |
| Urdu label | نظر کا معائنہ |
| Bundle ID | com.visioncheck.app |
| Platform | Android only (Phase 1) |
| Framework | React Native (Expo) |
| Backend | None — fully local (Phase 1) |
| Database | expo-sqlite — on device |
| Audio | expo-speech — Urdu + English TTS |
| Export | expo-print + expo-sharing |
| Login | None — guest only (Phase 1) |
| Languages | English + Urdu |
| Cost to run | Zero (Phase 1) |

---

## Purpose

A self-screening tool that helps users notice potential vision changes
before visiting an ophthalmologist or optometrist.

NOT a medical device. NOT a diagnostic tool.
Results are for personal awareness only.

---

## Phase plan

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Core tests, local storage, guest mode, export | 🔨 Building |
| 2 | Firebase login, cloud sync, test history across devices | 🔜 |
| 3 | Doctor directory — city based, self-registration | 🔜 |
| 4 | Play Store publication | 🔜 |

---

## The 6 tests

| # | Name (EN) | نام (UR) | Checks | Eyes | Distance |
|---|-----------|----------|--------|------|----------|
| 1 | Distance Vision | دور کے نظر کا ٹیسٹ | Myopia | R then L | 40 cm |
| 2 | Near Vision | قریب کے نظر کا ٹیسٹ | Hyperopia, Presbyopia | R then L | 30 cm |
| 3 | Astigmatism | لکیروں کا ٹیسٹ | Astigmatism | R then L | 40 cm |
| 4 | Contrast Sensitivity | دھندلا پن کا ٹیسٹ | Cataracts, early glaucoma | Both | 30 cm |
| 5 | Amsler Grid | جالی کا ٹیسٹ | Macular degeneration | R then L | 30 cm |
| 6 | Colour Vision | رنگوں کا ٹیسٹ | Colour blindness | Both | Normal |

---

## Age bands

| Band | Age | Clinical note |
|------|-----|---------------|
| child | Under 13 | App not designed for children — redirect to specialist |
| young | 13–40 | Myopia, hyperopia primary concerns |
| middle | 40–60 | Presbyopia becomes relevant — near results adjusted |
| senior | 60+ | Amsler always recommended — cataract, AMD higher risk |

Age band is asked before each assessment session, not at first launch.

---

## Symptom to test routing

| Symptom | Tests recommended |
|---------|-------------------|
| Cannot see far | Distance |
| Cannot read close | Near |
| Everything blurry | Distance + Near + Astigmatism |
| Lines look wavy | Amsler (urgent flag) |
| Colours washed out | Contrast + Colour |
| Cannot tell colours | Colour |
| Eyes tire reading | Near + Contrast |
| One eye different | All 6 tests |

---

## Alert levels

| Level | Trigger | Action |
|-------|---------|--------|
| 🟢 Green | All tests normal | Routine check every 2 years |
| 🟡 Yellow | 1–2 mild findings | See a doctor within a few weeks |
| 🔴 Red | Any moderate finding, or 2+ mild | See a doctor this week |
| 🚨 Urgent | Any Amsler abnormality | See a doctor within 24–48 hours |

Amsler urgent overrides all other results.
Large difference between two eyes → Red regardless of individual scores.

---

## Navigation structure

```
Splash
  └── Language Select (EN / UR)
        └── Disclaimer (scroll to activate agree)
              └── Home Dashboard (tab bar)
                    ├── Tab: Home
                    │     ├── Path A: Symptom Selector
                    │     │     └── Recommended Tests screen
                    │     │           └── Age Band
                    │     │                 └── Pre-test Setup
                    │     │                       └── Test flow (one at a time)
                    │     │                             └── Individual Result
                    │     │                                   └── Final Summary
                    │     └── Path B: Full Check
                    │           └── Age Band
                    │                 └── Pre-test Setup
                    │                       └── All 6 tests
                    │                             └── Final Summary
                    ├── Tab: History
                    │     └── History Detail
                    └── Tab: Settings
                          └── Disclaimer View
```

---

## Download / export format

PDF one page:
- VisionCheck header + نظر کا معائنہ
- Date and time
- Age band
- Each test result in plain language with alert level
- Overall alert with recommendation
- Disclaimer footer
- "Please show this to your eye doctor"

Share options:
- Save to phone (Downloads folder)
- Share via WhatsApp

---

## Sprint plan

| Sprint | Deliverable |
|--------|-------------|
| 1 | Project structure + all config + i18n + database + engine + Sprint 1 screens |
| 2 | All 6 test screens with DPI-calibrated visuals |
| 3 | Individual result screens + Final summary + PDF export |
| 4 | History screens |
| 5 | Audio prompts wired to all screens |
| 6 | Settings screen + polish pass |
| 7 | Android APK build + Play Store prep |

---

## Team

| Person | Role |
|--------|------|
| (App owner) | Product decisions, testing |
| Awaiz Fatima | Developer — React Native |
| GitHub | awaizfatima08/visioncheck |

---

## Disclaimer text (approved)

### English
VisionCheck is a self-screening tool designed to help you notice potential
vision changes before consulting an eye care professional. It is NOT a medical
device and does NOT provide a medical diagnosis. Results are for personal
awareness only and do not replace a professional eye examination. Listing of
doctors in the directory is based on self-registration and has not been
independently verified. Users contact listed practitioners at their own
discretion and risk. If you experience sudden vision loss, severe eye pain,
or flashes of light — do not use this app. Seek emergency medical attention
immediately.

### Urdu
یہ ایپلیکیشن ایک خود معائنہ کا آلہ ہے جو آپ کو کسی ماہرِ امراضِ چشم سے ملنے
سے پہلے اپنی بینائی میں ممکنہ تبدیلیوں کو جاننے میں مدد دیتا ہے۔ یہ کوئی
طبی آلہ نہیں ہے اور نہ ہی یہ کوئی طبی تشخیص فراہم کرتا ہے۔ نتائج صرف ذاتی
آگاہی کے لیے ہیں۔ اگر آپ کو اچانک بینائی میں کمی، آنکھ میں شدید درد، یا
روشنی کی چمک محسوس ہو تو فوری طبی امداد حاصل کریں۔
