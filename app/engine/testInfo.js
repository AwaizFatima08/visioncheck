// VisionCheck — shared test labels and per-test detail text
// app/engine/testInfo.js
//
// One place for test names and for the extra detail each test records
// (acuity, marked Amsler cells, colour-vision type, ...). Details are stored
// as JSON in test_results.notes and shown on results, history, PDF and share.

export const TEST_LABELS = {
  en: {
    distance: 'Distance Vision', near: 'Near Vision', astigmatism: 'Astigmatism',
    duochrome: 'Red-Green Balance', contrast: 'Contrast Sensitivity',
    amsler: 'Amsler Grid', color: 'Colour Vision',
  },
  ur: {
    distance: 'دور کی نظر', near: 'قریب کی نظر', astigmatism: 'لکیروں کا ٹیسٹ',
    duochrome: 'سرخ-سبز توازن', contrast: 'دھندلا پن',
    amsler: 'جالی کا ٹیسٹ', color: 'رنگوں کا ٹیسٹ',
  },
};

export const encodeDetails = (details) => {
  if (!details || typeof details !== 'object') return null;
  try { return JSON.stringify(details); } catch { return null; }
};

export const decodeDetails = (notes) => {
  if (!notes || typeof notes !== 'string') return null;
  try {
    const parsed = JSON.parse(notes);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch { return null; }
};

const eyeName = (eye, isUrdu) =>
  eye === 'R' ? (isUrdu ? 'دائیں' : 'Right') : (isUrdu ? 'بائیں' : 'Left');

const SIDE_TEXT = {
  en: { red: 'red side clearer', green: 'green side clearer', equal: 'both equal', unsure: 'too blurry to tell' },
  ur: { red: 'سرخ طرف صاف', green: 'سبز طرف صاف', equal: 'دونوں برابر', unsure: 'فیصلہ نہیں ہو سکا' },
};

const COLOR_TYPE_TEXT = {
  en: {
    none:       'No colour vision difference found',
    protan:     'Pattern suggests red-weak (protan-type)',
    deutan:     'Pattern suggests green-weak (deutan-type)',
    redgreen:   'Red-green difficulty (type unclear)',
    blueyellow: 'Blue-yellow difficulty',
    unreliable: 'Could not read the control plate: retry in good light',
  },
  ur: {
    none:       'رنگوں میں کوئی فرق نہیں ملا',
    protan:     'پیٹرن سرخ رنگ کی کمزوری (protan) کی طرف اشارہ کرتا ہے',
    deutan:     'پیٹرن سبز رنگ کی کمزوری (deutan) کی طرف اشارہ کرتا ہے',
    redgreen:   'سرخ-سبز میں دشواری (قسم واضح نہیں)',
    blueyellow: 'نیلے-پیلے میں دشواری',
    unreliable: 'کنٹرول پلیٹ نہیں پڑھ سکے: اچھی روشنی میں دوبارہ کوشش کریں',
  },
};

const formatAcuity = (d) => {
  if (!d) return null;
  const acuity = d.acuity || '<20/200';
  return d.logmar == null ? acuity : `${acuity} (logMAR ${d.logmar.toFixed(2)})`;
};

// Returns an array of short human-readable lines for a test result, or [].
export const describeDetail = (testName, result, language) => {
  if (!result) return [];
  const isUrdu = language === 'ur';
  const lines = [];

  if (testName === 'distance') {
    ['R', 'L'].forEach((eye) => {
      const text = formatAcuity(result[`details${eye}`]);
      if (text) lines.push(`${eyeName(eye, isUrdu)}: ${text}`);
    });
  } else if (testName === 'amsler') {
    ['R', 'L'].forEach((eye) => {
      const d = result[`details${eye}`];
      if (d && Array.isArray(d.marks) && d.marks.length) {
        lines.push(isUrdu
          ? `${eyeName(eye, true)}: ${d.marks.length} حصے نشان زد`
          : `${eyeName(eye, false)}: ${d.marks.length} area${d.marks.length === 1 ? '' : 's'} marked`);
      }
    });
  } else if (testName === 'duochrome') {
    const table = SIDE_TEXT[isUrdu ? 'ur' : 'en'];
    ['R', 'L'].forEach((eye) => {
      const d = result[`details${eye}`];
      if (d && table[d.side]) lines.push(`${eyeName(eye, isUrdu)}: ${table[d.side]}`);
    });
  } else if (testName === 'contrast') {
    const d = result.details;
    if (d && d.logcs != null) {
      lines.push(isUrdu ? `کنٹراسٹ سکور: ${d.ceiling ? '≥ ' : ''}${d.logcs.toFixed(2)} logCS` : `Contrast score: ${d.ceiling ? '≥ ' : ''}${d.logcs.toFixed(2)} logCS`);
    } else if (d && d.below) {
      lines.push(isUrdu ? 'کنٹراسٹ سکور: 0.45 logCS سے کم' : 'Contrast score: below 0.45 logCS');
    }
  } else if (testName === 'color') {
    const d = result.details;
    const table = COLOR_TYPE_TEXT[isUrdu ? 'ur' : 'en'];
    if (d && table[d.type]) lines.push(table[d.type]);
    if (d && d.blueYellow && d.type !== 'blueyellow' && d.type !== 'unreliable') lines.push(table.blueyellow);
  }
  return lines;
};
