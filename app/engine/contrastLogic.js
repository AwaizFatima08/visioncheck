// VisionCheck — Contrast sensitivity levels and scoring
// app/engine/contrastLogic.js
//
// Pelli-Robson style: triplets of letters at falling contrast, steps of 0.15
// log units. Letters are dark grey on white. An 8-bit screen cannot show every
// contrast exactly, so each level's grey is rounded and its score is computed
// from the contrast that is actually displayed.

export const SLOAN_LETTERS = ['C', 'D', 'H', 'K', 'N', 'O', 'R', 'S', 'V', 'Z'];

const FIRST_LOG_CS = 0.45;
const LOG_STEP     = 0.15;
const LEVEL_COUNT  = 9;   // 0.45 .. 1.65 (2.2% contrast, near the limit of an 8-bit display)

const srgbToLinear = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
const linearToSrgb = (l) => (l <= 0.0031308 ? 12.92 * l : 1.055 * Math.pow(l, 1 / 2.4) - 0.055);

const buildLevels = () =>
  Array.from({ length: LEVEL_COUNT }, (_, i) => {
    const target   = FIRST_LOG_CS + i * LOG_STEP;
    const contrast = Math.pow(10, -target);                 // Weber contrast on a white page
    const grey     = Math.round(linearToSrgb(1 - contrast) * 255);
    const shown    = 1 - srgbToLinear(grey / 255);          // contrast really displayed
    return {
      grey,
      color:  `rgb(${grey},${grey},${grey})`,
      logCS:  Math.round(-Math.log10(shown) * 100) / 100,
    };
  });

export const CONTRAST_LEVELS = buildLevels();

// Three different letters for one level
export const randomTriplet = (previous = []) => {
  const pool = SLOAN_LETTERS.filter(l => !previous.includes(l));
  const out  = [];
  while (out.length < 3) {
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (!out.includes(pick)) out.push(pick);
  }
  return out;
};

// Letters read correctly, in any order, each shown letter counted once
export const countCorrect = (shown, entered) => {
  const remaining = [...shown];
  let correct = 0;
  entered.forEach((l) => {
    const i = remaining.indexOf(l);
    if (i !== -1) { correct += 1; remaining.splice(i, 1); }
  });
  return correct;
};

// Pass marks sit on levels this display can really show (its top level is about 1.58).
// Older eyes lose some contrast sensitivity normally, so the mark is a little lower from 60.
export const greenThreshold = (ageBand) => (ageBand === 'senior' ? 1.36 : 1.45);

// Maps the score onto the existing alertLogic response keys
export const logCSToResponse = (logcs, ageBand) => {
  if (logcs == null) return 'top_1';
  const green = greenThreshold(ageBand);
  if (logcs >= green)       return 'all_4';
  if (logcs >= green - 0.3) return 'top_3';
  if (logcs >= green - 0.6) return 'top_2';
  return 'top_1';
};
