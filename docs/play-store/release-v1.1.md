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
- Short description (72/80): `Free eye test at home: 6 vision checks in English & Urdu. Works offline.`
- In the full description, replace the PRIVATE BY DESIGN block with:
```
PRIVATE BY DESIGN
• Every test works offline — no internet needed.
• No account, no sign-up, no analytics.
• Your test answers and results are never uploaded. They stay on your phone.
• Free, supported by small banner ads on the Home and History screens only — never during a test or on a result. Ads are non-personalised.
```
- Screenshot 6 caption: `Your results stay on your phone` (was "100% offline. Nothing leaves your phone").

## 4. Store listing changes (Urdu)
- Short description (78/80): `گھر پر مفت آنکھوں کا ٹیسٹ: 6 آسان چیک، اردو آواز کے ساتھ۔ آف لائن بھی چلتی ہے۔`
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
English:
```
• Free, with small banner ads on the Home and History screens only — never during a test or on a result
• Ads are non-personalised; your results never leave your phone
• Every test still works offline
• Under-the-hood improvements
```
Urdu:
```
• ایپ مفت ہے، صرف ہوم اور ہسٹری اسکرین پر چھوٹے بینر اشتہارات — ٹیسٹ یا نتیجے کے دوران کبھی نہیں
• اشتہارات ذاتی نوعیت کے نہیں؛ آپ کے نتائج آپ کے فون سے باہر نہیں جاتے
• ہر ٹیسٹ اب بھی بغیر انٹرنیٹ چلتا ہے
• ایپ کی کارکردگی میں بہتری
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
