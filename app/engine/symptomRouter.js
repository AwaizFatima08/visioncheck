// VisionCheck — Symptom Router
// app/engine/symptomRouter.js
//
// Maps selected symptoms to the correct ordered test queue.
// Used by SymptomSelectorScreen (Path A).

// Test identifiers — must match screen names in AppNavigator
export const TESTS = {
  DISTANCE:    'TestDistance',
  NEAR:        'TestNear',
  ASTIGMATISM: 'TestAstigmatism',
  CONTRAST:    'TestContrast',
  AMSLER:      'TestAmsler',
  COLOR:       'TestColor',
};

// Standard test order — maintained across all paths
export const TEST_ORDER = [
  TESTS.DISTANCE,
  TESTS.NEAR,
  TESTS.ASTIGMATISM,
  TESTS.CONTRAST,
  TESTS.AMSLER,
  TESTS.COLOR,
];

// Symptom key → tests recommended
const SYMPTOM_MAP = {
  far:         [TESTS.DISTANCE],
  near:        [TESTS.NEAR],
  blurry:      [TESTS.DISTANCE, TESTS.NEAR, TESTS.ASTIGMATISM],
  wavy:        [TESTS.AMSLER],
  colours:     [TESTS.CONTRAST, TESTS.COLOR],
  colour_diff: [TESTS.COLOR],
  tired:       [TESTS.NEAR, TESTS.CONTRAST],
  one_eye:     [TESTS.DISTANCE, TESTS.NEAR, TESTS.ASTIGMATISM, TESTS.CONTRAST, TESTS.AMSLER, TESTS.COLOR],
};

/**
 * Returns deduplicated, correctly ordered test queue for selected symptoms
 * @param {string[]} selectedSymptoms - array of symptom keys
 * @returns {string[]} ordered array of test screen names
 */
export const getRecommendedTests = (selectedSymptoms) => {
  const recommended = new Set();
  selectedSymptoms.forEach(symptom => {
    const tests = SYMPTOM_MAP[symptom] || [];
    tests.forEach(t => recommended.add(t));
  });
  // Return in standard order — never random
  return TEST_ORDER.filter(t => recommended.has(t));
};

/**
 * Returns the next test screen name from the queue
 * Returns null if no more tests
 * @param {string[]} testQueue - full queue
 * @param {string} currentTest - current screen name
 * @returns {string|null}
 */
export const getNextTest = (testQueue, currentTest) => {
  const idx = testQueue.indexOf(currentTest);
  if (idx === -1 || idx >= testQueue.length - 1) return null;
  return testQueue[idx + 1];
};

/**
 * Returns progress info for the progress bar
 * @param {string[]} testQueue
 * @param {string} currentTest
 * @returns {{ current: number, total: number }}
 */
export const getTestProgress = (testQueue, currentTest) => {
  const idx = testQueue.indexOf(currentTest);
  return {
    current: idx === -1 ? 0 : idx,
    total:   testQueue.length,
  };
};
