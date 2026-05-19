// VisionCheck — Test Engine
// DPI-aware sizing so tests are physically accurate on any Android screen

import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── DPI helpers ─────────────────────────────────────────────────────────────

// Convert physical centimetres to React Native density-independent pixels
// This ensures a 1cm element is actually 1cm on any screen
export const cmToDp = (cm) => {
  const dpi = PixelRatio.get() * 160; // approximate screen DPI
  const inches = cm / 2.54;
  const pixels = inches * dpi;
  return pixels / PixelRatio.get();
};

// Convert physical millimetres to dp
export const mmToDp = (mm) => cmToDp(mm / 10);

// Screen dimensions in dp
export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

// ─── Snellen chart sizing ─────────────────────────────────────────────────────
// Standard: 20/20 letter subtends 5 arcminutes at test distance
// For phone at 40cm, 20/20 letter height ≈ 5.8mm
// We scale rows from 20/200 (largest) down to 20/20 (smallest)

export const snellenRows = [
  { label: 'Row 1', acuity: '20/200', heightMm: 29.0, text: 'E' },
  { label: 'Row 2', acuity: '20/100', heightMm: 14.5, text: 'F P' },
  { label: 'Row 3', acuity: '20/70',  heightMm: 10.1, text: 'T O Z' },
  { label: 'Row 4', acuity: '20/50',  heightMm: 7.3,  text: 'L P E D' },
  { label: 'Row 5', acuity: '20/40',  heightMm: 5.8,  text: 'P E C F' },
  { label: 'Row 6', acuity: '20/30',  heightMm: 4.4,  text: 'E D F C Z' },
  { label: 'Row 7', acuity: '20/20',  heightMm: 2.9,  text: 'F E L O P Z D' },
];

// Returns font size in dp for each Snellen row
export const getSnellenFontSize = (heightMm) => {
  return mmToDp(heightMm) * 0.85; // 0.85 factor accounts for font metrics
};

// ─── Near vision text sizing ──────────────────────────────────────────────────
// Standard Jaeger chart equivalents at 30cm reading distance

export const nearVisionRows = [
  { label: 'Row 1', jaeger: 'J10', heightMm: 5.0,  text: 'The quick brown fox jumps over the lazy dog.' },
  { label: 'Row 2', jaeger: 'J5',  heightMm: 3.5,  text: 'She sells seashells by the seashore on sunny days.' },
  { label: 'Row 3', jaeger: 'J3',  heightMm: 2.5,  text: 'Pack my box with five dozen liquor jugs carefully.' },
  { label: 'Row 4', jaeger: 'J1',  heightMm: 1.75, text: 'How vexingly quick daft zebras jump over the wooden fence today.' },
];

export const getNearFontSize = (heightMm) => {
  return mmToDp(heightMm) * 0.85;
};

// ─── Amsler grid sizing ───────────────────────────────────────────────────────
// Standard: 10x10 grid, each square = 1cm at 30cm viewing distance
// Grid total = 10cm x 10cm at 30cm

export const getAmslerGridSize = () => {
  const gridCm = 10; // total grid is 10cm x 10cm
  const gridDp = cmToDp(gridCm);
  // Cap at 90% of screen width to ensure it fits
  const maxSize = screenWidth * 0.9;
  return Math.min(gridDp, maxSize);
};

export const getAmslerSquareSize = () => {
  return getAmslerGridSize() / 10;
};

// ─── Fan chart sizing ─────────────────────────────────────────────────────────
export const getFanChartSize = () => {
  return Math.min(screenWidth * 0.85, cmToDp(8));
};

// ─── Alert level logic ────────────────────────────────────────────────────────

export const ALERT = {
  GREEN: 'green',
  YELLOW: 'yellow',
  RED: 'red',
  URGENT: 'urgent',
};

// Map individual test responses to alert levels
export const getDistanceAlert = (response) => {
  switch (response) {
    case 'all_clear':  return ALERT.GREEN;
    case 'most_clear': return ALERT.YELLOW;
    case 'some_clear': return ALERT.RED;
    case 'blurry':     return ALERT.RED;
    default:           return ALERT.YELLOW;
  }
};

export const getNearAlert = (response, ageBand) => {
  // Age-adjusted — mild difficulty at 40+ may be normal presbyopia onset
  switch (response) {
    case 'all_clear':
      return ALERT.GREEN;
    case 'most_clear':
      return ageBand === 'middle' || ageBand === 'senior' ? ALERT.GREEN : ALERT.YELLOW;
    case 'some_clear':
      return ageBand === 'senior' ? ALERT.YELLOW : ALERT.RED;
    case 'blurry':
      return ALERT.RED;
    default:
      return ALERT.YELLOW;
  }
};

export const getAstigAlert = (response) => {
  switch (response) {
    case 'all_equal':    return ALERT.GREEN;
    case 'some_darker':  return ALERT.YELLOW;
    case 'some_blurry':  return ALERT.RED;
    case 'unsure':       return ALERT.YELLOW;
    default:             return ALERT.YELLOW;
  }
};

export const getContrastAlert = (response) => {
  switch (response) {
    case 'all_clear':  return ALERT.GREEN;
    case 'most_clear': return ALERT.YELLOW;
    case 'some_clear': return ALERT.RED;
    case 'blurry':     return ALERT.RED;
    default:           return ALERT.YELLOW;
  }
};

export const getAmslerAlert = (response) => {
  // Any Amsler abnormality is urgent — overrides everything else
  switch (response) {
    case 'all_straight': return ALERT.GREEN;
    case 'wavy':         return ALERT.URGENT;
    case 'missing':      return ALERT.URGENT;
    case 'distorted':    return ALERT.URGENT;
    default:             return ALERT.YELLOW;
  }
};

export const getColorAlert = (score, total) => {
  const ratio = score / total;
  if (ratio === 1)   return ALERT.GREEN;
  if (ratio >= 0.66) return ALERT.YELLOW;
  return ALERT.RED;
};

// ─── Overall alert — takes array of individual alert levels ──────────────────
export const getOverallAlert = (alertLevels) => {
  if (alertLevels.includes(ALERT.URGENT)) return ALERT.URGENT;
  if (alertLevels.includes(ALERT.RED))    return ALERT.RED;
  if (alertLevels.includes(ALERT.YELLOW)) return ALERT.YELLOW;
  return ALERT.GREEN;
};

// ─── Symptom to test mapping ──────────────────────────────────────────────────
export const symptomToTests = {
  far:        ['distance'],
  near:       ['near'],
  blurry:     ['distance', 'near', 'astigmatism'],
  wavy:       ['amsler'],           // routed to urgent test first
  colours:    ['contrast', 'color'],
  colour_diff:['color'],
  tired:      ['near', 'contrast'],
  one_eye:    ['distance', 'near', 'astigmatism', 'contrast', 'amsler', 'color'],
};

// Get deduplicated ordered test list from selected symptoms
export const getRecommendedTests = (selectedSymptoms) => {
  const testOrder = ['distance', 'near', 'astigmatism', 'contrast', 'amsler', 'color'];
  const recommended = new Set();

  selectedSymptoms.forEach(symptom => {
    const tests = symptomToTests[symptom] || [];
    tests.forEach(t => recommended.add(t));
  });

  // Return in standard order
  return testOrder.filter(t => recommended.has(t));
};

// ─── Alert colours for UI ─────────────────────────────────────────────────────
export const alertColors = {
  [ALERT.GREEN]:  { bg: '#EAF3DE', text: '#3B6D11', border: '#C0DD97' },
  [ALERT.YELLOW]: { bg: '#FAEEDA', text: '#854F0B', border: '#FAC775' },
  [ALERT.RED]:    { bg: '#FAECE7', text: '#993C1D', border: '#F5C4B3' },
  [ALERT.URGENT]: { bg: '#FCEBEB', text: '#A32D2D', border: '#F7C1C1' },
};

export const alertIcons = {
  [ALERT.GREEN]:  'check-circle',
  [ALERT.YELLOW]: 'alert-circle',
  [ALERT.RED]:    'x-circle',
  [ALERT.URGENT]: 'alert-triangle',
};
