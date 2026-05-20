// VisionCheck — DPI Calculator
// app/engine/dpiCalc.js
//
// Converts physical measurements (cm, mm) to React Native dp
// so test visuals are physically accurate on any Android screen.
//
// USAGE:
// import { cmToDp, mmToDp, TEST_SIZES } from '../engine/dpiCalc';

import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// PixelRatio.get() × 160 gives approximate screen DPI
const estimatedDPI = PixelRatio.get() * 160;

// ─── Core conversions ─────────────────────────────────────────────────────────

export const cmToDp = (cm) => {
  const inches = cm / 2.54;
  const pixels = inches * estimatedDPI;
  return pixels / PixelRatio.get();
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

// ─── Precomputed test sizes ───────────────────────────────────────────────────
// Calculated once, reused by all test components

export const TEST_SIZES = {

  // Amsler: 10×10 grid, 1cm squares at 30cm
  amslerGridTotal: safeDp(cmToDp(10)),
  amslerSquare:    safeDp(cmToDp(10)) / 10,

  // Astigmatism fan: 8cm diameter
  fanChartDiameter: safeDp(cmToDp(8)),

  // Snellen rows at 40cm — 0.85 corrects for RN font metrics
  snellen: [
    { acuity: '20/200', heightDp: mmToDp(29.0) * 0.85, text: 'E',             rowLabel: 'Row 1' },
    { acuity: '20/100', heightDp: mmToDp(14.5) * 0.85, text: 'F P',           rowLabel: 'Row 2' },
    { acuity: '20/70',  heightDp: mmToDp(10.1) * 0.85, text: 'T O Z',         rowLabel: 'Row 3' },
    { acuity: '20/50',  heightDp: mmToDp(7.3)  * 0.85, text: 'L P E D',       rowLabel: 'Row 4' },
    { acuity: '20/40',  heightDp: mmToDp(5.8)  * 0.85, text: 'P E C F',       rowLabel: 'Row 5' },
    { acuity: '20/30',  heightDp: mmToDp(4.4)  * 0.85, text: 'E D F C Z',     rowLabel: 'Row 6' },
    { acuity: '20/20',  heightDp: mmToDp(2.9)  * 0.85, text: 'F E L O P Z D', rowLabel: 'Row 7' },
  ],

  // Near vision rows at 30cm
  near: [
    { jaeger: 'J10', heightDp: mmToDp(5.0)  * 0.85, text: 'The quick brown fox jumps over the lazy dog.' },
    { jaeger: 'J5',  heightDp: mmToDp(3.5)  * 0.85, text: 'She sells seashells by the seashore on sunny days.' },
    { jaeger: 'J3',  heightDp: mmToDp(2.5)  * 0.85, text: 'Pack my box with five dozen liquor jugs carefully.' },
    { jaeger: 'J1',  heightDp: mmToDp(1.75) * 0.85, text: 'How vexingly quick daft zebras jump over the fence.' },
  ],
};
