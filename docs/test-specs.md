# VisionCheck — Test Specifications

Clinical reference for developers building each test screen.
All sizes must be rendered using cmToDp() from app/engine/dpiCalc.js

---

## Test 1 — Distance Vision / دور کے نظر کا ٹیسٹ

**Checks for:** Myopia (short-sightedness)  
**Viewing distance:** 40 cm (arm's length)  
**Eyes:** Right eye first, then left eye separately  
**Age adjustment:** None — same for all bands

**Visual — Snellen-style chart:**

| Row | Acuity | Letter height | Letters |
|-----|--------|---------------|---------|
| 1 | 20/200 | 29.0 mm | E |
| 2 | 20/100 | 14.5 mm | F P |
| 3 | 20/70 | 10.1 mm | T O Z |
| 4 | 20/50 | 7.3 mm | L P E D |
| 5 | 20/40 | 5.8 mm | P E C F |
| 6 | 20/30 | 4.4 mm | E D F C Z |
| 7 | 20/20 | 2.9 mm | F E L O P Z D |

Font: monospace. Letter spacing generous. Black on white.

**Response options:**
- Rows 6–7 clearly read → Normal (green)
- Row 4–5 only → Mild (yellow)
- Row 1–3 only → Moderate (red)
- Everything blurry → Significant (red)

---

## Test 2 — Near Vision / قریب کے نظر کا ٹیسٹ

**Checks for:** Hyperopia (long-sightedness), Presbyopia  
**Viewing distance:** 30 cm (reading distance)  
**Eyes:** Right eye first, then left eye separately  
**Age adjustment:** YES — see alert logic in alertLogic.js

**Visual — Jaeger-equivalent reading chart:**

| Row | Jaeger | Height | Sample text |
|-----|--------|--------|-------------|
| 1 | J10 | 5.0 mm | The quick brown fox jumps over the lazy dog. |
| 2 | J5 | 3.5 mm | She sells seashells by the seashore on sunny days. |
| 3 | J3 | 2.5 mm | Pack my box with five dozen liquor jugs carefully. |
| 4 | J1 | 1.75 mm | How vexingly quick daft zebras jump over the wooden fence. |

**Response options:**
- All 4 rows → Normal
- Rows 1–3 → Mild
- Rows 1–2 → Moderate
- Row 1 only or blurry → Significant

**Age adjustment for near test:**
- young band: any difficulty → flag
- middle band: rows 1–2 only → yellow (presbyopia onset normal at 40)
- senior band: rows 1–3 only → yellow (presbyopia expected)

---

## Test 3 — Astigmatism / لکیروں کا ٹیسٹ

**Checks for:** Astigmatism (uneven corneal curvature)  
**Viewing distance:** 40 cm  
**Eyes:** Right eye first, then left eye separately  
**Age adjustment:** None

**Visual — Starburst / fan chart:**
- 12 lines radiating from a centre dot
- Lines at 0°, 15°, 30°, 45°, 60°, 75°, 90°, 105°, 120°, 135°, 150°, 165°
- All lines same thickness and darkness
- Centre dot: 4mm diameter
- Chart diameter: 8 cm total
- Black on white background

**Response options:**
- All lines equal → Normal (green)
- Some lines slightly different → Mild (yellow)
- Some lines clearly darker or blurrier → Flag (red)
- Unsure → Yellow (mention to doctor)

---

## Test 4 — Contrast Sensitivity / دھندلا پن کا ٹیسٹ

**Checks for:** Early cataracts, glaucoma indicators  
**Viewing distance:** 30 cm  
**Eyes:** Both eyes together  
**Age adjustment:** senior band → moderate finding flagged more strongly

**Visual — Faded text chart:**
- Same text at 4 opacity levels
- Level 1: 85% opacity (high contrast)
- Level 2: 45% opacity (medium contrast)
- Level 3: 20% opacity (low contrast)
- Level 4: 10% opacity (very low contrast)
- Font size: consistent 16px equivalent, monospace
- Text: "VISION CHECK" or similar short string
- Background: pure white

**Response options:**
- All 4 levels → Normal (green)
- Levels 1–3 → Mild (yellow)
- Levels 1–2 only → Moderate (red)
- Level 1 only → Significant (red)

---

## Test 5 — Amsler Grid / جالی کا ٹیسٹ

**Checks for:** Macular degeneration, central vision distortion  
**Viewing distance:** 30 cm  
**Eyes:** Right eye first, then left eye separately  
**Age adjustment:** senior band — always recommended, result weighted more heavily

**IMPORTANT:** Any abnormal finding → URGENT alert. Overrides all other results.

**Visual — Amsler grid:**
- 10 × 10 grid of squares
- Each square must be physically 1 cm × 1 cm at 30 cm viewing distance
- Use getAmslerGridSize() and getAmslerSquareSize() from dpiCalc.js
- Grid total size: 10 cm × 10 cm
- Centre dot: clearly visible, 3mm diameter
- Black lines on white background
- Line thickness: 0.5px to 1px

**Instructions critical:**
- User must fix gaze on centre dot only
- Do NOT let eye wander
- Note any distortion in peripheral grid while looking at centre

**Response options:**
- All lines straight and complete → Normal (green)
- Any wavy or bent lines → URGENT
- Any blank or missing areas → URGENT
- Any distortion or unevenness → URGENT

---

## Test 6 — Colour Vision / رنگوں کا ٹیسٹ

**Checks for:** Colour blindness (red-green, blue-yellow)  
**Viewing distance:** Normal (no specific distance)  
**Eyes:** Both eyes together  
**Age adjustment:** None

**Visual — Simplified Ishihara-style plates:**
3 plates. Each plate: circle of dots, number hidden within.

Note: True Ishihara plates are copyrighted.
VisionCheck uses simplified dot-pattern plates designed to approximate
the same function without reproducing copyrighted material.

| Plate | Background | Number | Tests |
|-------|-----------|--------|-------|
| 1 | Red-orange dots | 6 | Red-green deficiency |
| 2 | Green dots | 29 | Red-green deficiency |
| 3 | Blue dots | 45 | Blue-yellow deficiency |

**Scoring:**
- 3/3 correct → Normal (green)
- 2/3 correct → Mild (yellow)  
- 0–1/3 correct → Colour deficiency likely (red)

---

## DPI calibration — applies to all tests

All physical dimensions above must go through dpiCalc.js.
Never use hardcoded pixel sizes.

```javascript
import { cmToDp, mmToDp } from '../engine/dpiCalc';

// Example: 1cm Amsler square
const squareSize = cmToDp(1);

// Example: 29mm Snellen row 1 letter
const fontSize = mmToDp(29) * 0.85;
```

The 0.85 factor on font sizes accounts for React Native font metric differences.
Test on at least 2 different Android screen densities before release.
