# Play Console — Data Safety form answers

Based on a full review of the code: the app makes zero network requests
(no `fetch`/`axios`/`XMLHttpRequest` anywhere in the source), uses no
analytics/ads/crash-reporting SDKs, and has no login or account system.
Everything is stored in a local SQLite database (`app/database/db.js`) that
never leaves the device.

## Does your app collect or share any of the required user data types?
**No.**

Walk through the Play Console questionnaire with these answers:

| Question | Answer |
|---|---|
| Does your app collect or share any user data? | **No** |
| Is all user data encrypted in transit? | N/A — no data leaves the device |
| Do you provide a way for users to request data deletion? | Not applicable (nothing is collected off-device); on-device history can be erased any time via Settings → Clear History |

## Data types — every category should be left unchecked
- Location: not collected
- Personal info (name, email, address, etc.): not collected
- Financial info: not collected
- Health and fitness: not collected off-device (assessment results are stored
  **locally only**, never transmitted — Play Console's "Health info" collection
  question refers to data sent off the device, which does not happen here)
- Messages: not collected
- Photos/videos: not collected
- Audio: not collected (expo-speech only plays text-to-speech locally; it does
  not record or transmit audio)
- Files and docs: not collected (PDF/text summaries are generated locally and
  only leave the device if and when the user explicitly shares them via the
  OS share sheet, to a destination they choose)
- Calendar: not collected
- Contacts: not collected
- App activity / App info and performance / Device or other IDs: not collected
  (no analytics or crash reporting SDK is included)

## Security practices section
- "Data is encrypted in transit": mark **not applicable** or "No data
  collected" (no transmission occurs)
- "You can request data deletion": on-device only — describe as "Users can
  delete all locally stored data at any time from within the app (Settings →
  Clear History) or by uninstalling the app"
- "Committed to Play Families Policy" / target audience: app is not designed
  for or directed at children (see content-rating.md — under-13 users are
  routed to a "see a specialist" message rather than the self-test flow)
