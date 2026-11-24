// VisionCheck — DPI Calculator
// app/engine/dpiCalc.js
//
// Converts physical measurements (cm, mm) to React Native dp
// so test visuals are physically accurate on any Android screen.
//
// Android defines 1 dp as 1/160 inch, but phones report a rounded density
// bucket, so real size can be off by 5-15%. The card-calibration screen
// stores a correction factor that is applied here.
//
// USAGE:
// import { cmToDp, mmToDp, TEST_SIZES } from '../engine/dpiCalc';

import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const estimatedDPI = PixelRatio.get() * 160;

let calibrationScale = 1;

// ─── Core conversions ─────────────────────────────────────────────────────────

export const cmToDp = (cm) => {
  const inches = cm / 2.54;
  const pixels = inches * estimatedDPI;
  return (pixels / PixelRatio.get()) * calibrationScale;
};

export const mmToDp = (mm) => cmToDp(mm / 10);

// Caps dp at maxPercent of screen width — prevents overflow on small screens
export const safeDp = (dp, maxPercent = 0.9) =>
  Math.min(dp, SCREEN_WIDTH * maxPercent);

export const getScreenInfo = () => ({
  screenWidth:  SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  pixelRatio:   PixelRatio.get(),
  estimatedDPI,
});

export const getCalibrationScale = () => calibrationScale;

// ─── Tumbling-E geometry ──────────────────────────────────────────────────────
// A 20/20 optotype subtends 5 arcminutes; a 20/D optotype subtends 5*D/20.
// The E is drawn as a 5x5 grid, so each stroke is 1/5 of its height.

export const TEST_DISTANCE_CM = 40;
const SNELLEN_DENOMINATORS = [200, 100, 70, 50, 40, 30, 20];
// A stroke thinner than this many physical pixels cannot be drawn reliably.
const MIN_STROKE_PX = 2;

export const optotypeHeightMm = (denominator, distanceCm = TEST_DISTANCE_CM) => {
  const arcmin = (5 * denominator) / 20;
  return distanceCm * 10 * Math.tan((arcmin / 60) * (Math.PI / 180));
};

const buildSnellenRows = () =>
  SNELLEN_DENOMINATORS
    .map((den) => {
      const heightDp = mmToDp(optotypeHeightMm(den));
      return {
        acuity:   `20/${den}`,
        den,
        heightDp,
        strokePx: (heightDp / 5) * PixelRatio.get(),
      };
    })
    .filter((row) => row.strokePx >= MIN_STROKE_PX);

// ─── Precomputed test sizes ───────────────────────────────────────────────────
// Rebuilt in place when calibration changes, so screens that read
// TEST_SIZES while rendering pick up the new values.

const buildSizes = () => ({

  // Amsler: 10×10 grid, 1cm squares at 30cm
  amslerGridTotal: safeDp(cmToDp(10)),
  amslerSquare:    safeDp(cmToDp(10)) / 10,

  // Astigmatism fan: 8cm diameter
  fanChartDiameter: safeDp(cmToDp(8)),

  // Tumbling-E rows at 40 cm, finest rows dropped if this screen cannot draw them
  snellen: buildSnellenRows(),

  // Contrast test letters: 11 mm tall (about 1.6 degrees at 40 cm); font size from cap height 0.72 em
  contrastLetter: mmToDp(11) / 0.72,

  // Near vision rows at 30cm
  near: [
    { jaeger: 'J10', heightDp: mmToDp(5.0)  * 0.85, text: 'The quick brown fox jumps over the lazy dog.' },
    { jaeger: 'J5',  heightDp: mmToDp(3.5)  * 0.85, text: 'She sells seashells by the seashore on sunny days.' },
    { jaeger: 'J3',  heightDp: mmToDp(2.5)  * 0.85, text: 'Pack my box with five dozen liquor jugs carefully.' },
    { jaeger: 'J1',  heightDp: mmToDp(1.75) * 0.85, text: 'How vexingly quick daft zebras jump over the fence.' },
  ],
});

export const TEST_SIZES = buildSizes();

export const applyCalibration = (scale) => {
  const value = Number(scale);
  if (!Number.isFinite(value) || value <= 0) return;
  calibrationScale = Math.min(1.6, Math.max(0.6, value));
  Object.assign(TEST_SIZES, buildSizes());
};
