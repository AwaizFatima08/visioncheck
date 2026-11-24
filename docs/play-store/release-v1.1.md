# v1.1.0 (versionCode 3) — ads release checklist and copy

Do these in Play Console BEFORE or WITH the release, and only publish the website
changes (branch `release/v1.1`) once this version is live, so the policy, store listing
and app never disagree.

## 1. Play Console → App content
1. **Ads:** "Does your app contain ads?" → **Yes**.
2. **Data safety** (answers below). Submit before the release goes to review.
3. **Advertising ID declaration:** "Does your app use advertising ID?" → **Yes**, purpose
   **Advertising or marketing** (the AdMob SDK adds the AD_ID permission itself).
4. **Content rating:** re-run the questionnaire. Ads are shown, no other answers change.
5. **Target audience:** keep **13+** (do NOT select child age groups, which would force
   Families-policy ad rules). The app already routes under-13 users away from the tests.

## 2. Data safety answers (per Google's AdMob disclosure page, SDK data table)
Collected AND shared with Google (AdMob), required for the app to function, encrypted in
transit (TLS), purposes: **Advertising or marketing**, **Analytics**, **Fraud prevention,
security, and compliance**.

| Play data type | Why |
|---|---|
| Location → Approximate location | IP address, used to estimate general location |
| App activity → App interactions | taps, app launch, video views |
| App info and performance → Diagnostics | app launch time, hang rate, energy use |
| Device or other IDs | Android advertising ID, app set ID |

Everything else stays **not collected**. In particular: Health info and fitness are NOT
collected or shared, because test answers and results never leave the device.
Data deletion: users can reset or delete the advertising ID in Android Settings → Privacy →
Ads; on-device history is erasable in Settings → Clear all history.

## 3. Store listing changes (English)
- Short description (72/80): `Free eye test at home: 7 vision checks in English & Urdu. Works offline.`
- In the full description, replace the PRIVATE BY DESIGN block with:
```
PRIVATE BY DESIGN
• Every test works offline — no internet needed.
• No account, no sign-up, no analytics.
• Your test answers and results are never uploaded. They stay on your phone.
• Free, supported by small banner ads on the Home and History screens only — never during a test or on a result. Ads are non-personalised.
```
- Screenshot 6 caption: `Your results stay on your phone` (was "100% offline. Nothing leaves your phone").

- In the full description, replace the "6 EYE TESTS IN ONE APP" block with:
```
7 EYE TESTS IN ONE APP
• Distance vision (true-size tumbling-E chart at 40 cm, with screen calibration)
• Red-green balance (duochrome) for short- or long-sighted tendency
• Near vision / reading test
• Astigmatism test
• Contrast sensitivity (Pelli-Robson style letters)
• Amsler grid (macular check), mark distortions and track changes
• Colour vision test (colour blindness screening, with red-weak / green-weak pattern)

PLUS
• Eye health risk check: how often to have an eye exam, based on your age, diabetes and other risks
• Trend charts of your results over time
• Optional reminders: monthly Amsler check, yearly eye exam
```
(and "6 standard eye tests" in screenshot 3's caption becomes "7 standard eye tests")

## 4. Store listing changes (Urdu)
- Short description (78/80): `گھر پر مفت آنکھوں کا ٹیسٹ: 7 آسان چیک، اردو آواز کے ساتھ۔ آف لائن بھی چلتی ہے۔`
- Replace the "آپ کی پرائیویسی محفوظ" block with:
```
آپ کی پرائیویسی محفوظ
• ہر ٹیسٹ بغیر انٹرنیٹ چلتا ہے۔
• نہ اکاؤنٹ، نہ سائن اپ، نہ اینالیٹکس۔
• آپ کے جوابات اور نتائج کبھی اپ لوڈ نہیں ہوتے، صرف آپ کے فون پر رہتے ہیں۔
• ایپ مفت ہے اور صرف ہوم اور ہسٹری اسکرین پر چھوٹے بینر اشتہارات دکھاتی ہے — ٹیسٹ یا نتیجے کے دوران کبھی نہیں۔ اشتہارات ذاتی نوعیت کے نہیں ہوتے۔
```
- Screenshot 6 caption: `آپ کے نتائج صرف آپ کے فون پر`

## 5. Release notes ("What's new", 500 max)
English (420 characters):
```
• New: Red-Green Balance test, eye-health risk check, trend charts, optional reminders
• Distance test now uses true clinical letter sizes at 40 cm, with screen calibration and logMAR scores
• Amsler grid: mark distorted areas and compare with your last check
• Improved contrast and colour tests
• Free, with small banner ads on Home and History only, never during a test or result
• Your results never leave your phone
```
Urdu (413 characters):
```
• نیا: سرخ-سبز توازن کا ٹیسٹ، آنکھوں کی صحت کا رسک چیک، رجحان کے چارٹ، اختیاری یاد دہانیاں
• دور کی نظر کا ٹیسٹ اب ۴۰ سینٹی میٹر پر اصل طبی حروف کے سائز میں ہے، اسکرین ناپنے کی سہولت کے ساتھ
• جالی ٹیسٹ: بگڑے حصے نشان زد کریں اور پچھلے نتیجے سے موازنہ کریں
• کنٹراسٹ اور رنگوں کے ٹیسٹ بہتر
• مفت، صرف ہوم اور ہسٹری پر چھوٹے بینر اشتہارات، ٹیسٹ یا نتیجے کے دوران کبھی نہیں
• آپ کے نتائج آپ کے فون سے باہر نہیں جاتے
```

## 6. AdMob console follow-ups
- App `VisionCheck: Eye Test Offline` must show status **Ready**. Ad serving is limited
  while review is "Getting ready" (usually 2–3 days).
- Open **Apps → Set up app-ads.txt** and run the check. `docs/app-ads.txt` is published at
  the root of the site on the Play listing's developer-website domain; if the listing points
  at a different domain, put the same line there:
  `google.com, pub-2087846699268567, DIRECT, f08c47fec0942fa0`
- **Privacy & messaging**: create/confirm a consent (GDPR) message so the UMP form shows in
  the EEA/UK, and a US state regulations message if offered.
- **Blocking controls → Sensitive categories**: review and block anything unsuitable for a
  health app (e.g. dating, gambling, medical-treatment claims).

## 7. Build
- Production AAB: `eas build --platform android --profile production` (the production
  profile sets `EXPO_PUBLIC_ADS_LIVE=true`, which switches the app to the live ad units).
- Preview APKs always show Google test ads, so testing them never risks the live account.
- Do NOT tap live ads on your own phone. Use the preview APK for all testing.

## 8. Verification status (read before releasing)
Checked in a desktop-browser build (react-native-web) with a seeded in-memory database:
distance 3-trial scoring and logMAR, duochrome, Pelli-Robson-style contrast, Amsler marking and
comparison, colour plates (also viewed through a protan/deutan simulation), risk check,
trends, saving and reloading every detail through history. Android JS bundle compiles.

NOT verifiable without a phone, so check these on the S23 Ultra, Tab S9 FE and Oppo Reno 14F
using a **preview APK** (test ads only):
1. E size: hold a ruler to the screen after calibrating; the 20/200 E should be 5.8 mm tall.
2. Calibration screen: a bank card's short edge (54 mm) should fit between the two lines.
3. "Finest row this screen can show" note: expect 20/20 or 20/30 on the phones, 20/40 on the tablet.
4. Contrast letters at full brightness: the first steps should be easy, the last faint.
5. Colour plates on each screen (AMOLED vs LCD): numbers readable; the control plate always.
6. Amsler marking: taps land on the intended squares.
7. Reminders: switching one on shows the notification permission prompt; a reminder fires
   (temporarily set the device clock or schedule one a few minutes ahead to test).
8. Ads: a test banner appears on Home and History, none on test or result screens, and the
   consent form appears on a device set to an EEA region (or use UMP debug geography).
9. PDF export in Urdu includes the new detail lines (acuity, marks, colour pattern).
10. Review prompt: appears only after the third completed check with a green or yellow result.
