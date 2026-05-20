// VisionCheck — PDF Generator
// app/utils/pdfGenerator.js
//
// Generates a formatted HTML report and converts to PDF using expo-print.
// One clean page — doctor-friendly format.
// Bilingual: English and Urdu content based on language param.

import * as Print from 'expo-print';
import { ALERT } from '../engine/alertLogic';

// ─── Alert colours for HTML ───────────────────────────────────────────────────
const ALERT_CSS = {
  [ALERT.GREEN]:  { bg: '#EAF3DE', text: '#3B6D11', border: '#C0DD97', label: { en: 'Normal',   ur: 'معمول'   } },
  [ALERT.YELLOW]: { bg: '#FAEEDA', text: '#854F0B', border: '#FAC775', label: { en: 'Mild',     ur: 'معمولی'  } },
  [ALERT.RED]:    { bg: '#FAECE7', text: '#993C1D', border: '#F5C4B3', label: { en: 'See Doctor', ur: 'ڈاکٹر دیکھیں' } },
  [ALERT.URGENT]: { bg: '#FCEBEB', text: '#A32D2D', border: '#F7C1C1', label: { en: 'Urgent',   ur: 'فوری'    } },
};

const TEST_LABELS = {
  en: { distance: 'Distance Vision', near: 'Near Vision', astigmatism: 'Astigmatism', contrast: 'Contrast Sensitivity', amsler: 'Amsler Grid (Macular)', color: 'Colour Vision' },
  ur: { distance: 'دور کے نظر کا ٹیسٹ', near: 'قریب کے نظر کا ٹیسٹ', astigmatism: 'لکیروں کا ٹیسٹ', contrast: 'دھندلا پن کا ٹیسٹ', amsler: 'جالی کا ٹیسٹ', color: 'رنگوں کا ٹیسٹ' },
};

const AGE_BAND_LABELS = {
  en: { child: 'Under 13', young: '13–40 years', middle: '40–60 years', senior: 'Over 60 years' },
  ur: { child: '۱۳ سال سے کم', young: '۱۳ سے ۴۰ سال', middle: '۴۰ سے ۶۰ سال', senior: '۶۰ سال سے زیادہ' },
};

const OVERALL_TITLES = {
  en: {
    [ALERT.GREEN]:  'No significant concerns found',
    [ALERT.YELLOW]: 'Some mild concerns noticed',
    [ALERT.RED]:    'Please see an eye doctor',
    [ALERT.URGENT]: 'Urgent — please see a doctor within 24–48 hours',
  },
  ur: {
    [ALERT.GREEN]:  'کوئی قابلِ ذکر تشویش نہیں',
    [ALERT.YELLOW]: 'کچھ معمولی نتائج نوٹ کیے گئے',
    [ALERT.RED]:    'براہ کرم آنکھوں کے ڈاکٹر سے ملیں',
    [ALERT.URGENT]: 'فوری — ۲۴ سے ۴۸ گھنٹوں میں ڈاکٹر سے ملیں',
  },
};

// ─── Get worst alert from a test result ──────────────────────────────────────
const getTestWorstAlert = (result) => {
  const levels = [result.alertR, result.alertL, result.alert].filter(Boolean);
  if (levels.includes(ALERT.URGENT)) return ALERT.URGENT;
  if (levels.includes(ALERT.RED))    return ALERT.RED;
  if (levels.includes(ALERT.YELLOW)) return ALERT.YELLOW;
  return ALERT.GREEN;
};

// ─── Build test rows HTML ─────────────────────────────────────────────────────
const buildTestRows = (assessmentResults, language) => {
  const labels = TEST_LABELS[language] || TEST_LABELS.en;
  const isUrdu = language === 'ur';

  return Object.entries(assessmentResults).map(([testName, result]) => {
    const worst = getTestWorstAlert(result);
    const cs    = ALERT_CSS[worst];
    const label = cs.label[language] || cs.label.en;
    const tName = labels[testName] || testName;

    let eyeRows = '';
    if (result.alertR) {
      const rcs = ALERT_CSS[result.alertR];
      const lcs = ALERT_CSS[result.alertL];
      eyeRows = `
        <div class="eye-row">
          <span>${isUrdu ? '👁 دائیں آنکھ' : '👁 Right Eye'}</span>
          <span class="pill" style="background:${rcs.bg};color:${rcs.text};border:1px solid ${rcs.border}">
            ${rcs.label[language] || rcs.label.en}
          </span>
        </div>
        <div class="eye-row">
          <span>${isUrdu ? '👁 بائیں آنکھ' : '👁 Left Eye'}</span>
          <span class="pill" style="background:${lcs.bg};color:${lcs.text};border:1px solid ${lcs.border}">
            ${lcs.label[language] || lcs.label.en}
          </span>
        </div>`;
    }

    if (result.eye === 'both') {
      eyeRows = `<div class="eye-row"><span>${isUrdu ? 'دونوں آنکھیں' : 'Both eyes'}</span></div>`;
    }

    if (testName === 'color' && result.correctCount !== undefined) {
      eyeRows += `<div class="eye-row"><span>${isUrdu ? 'درست جوابات' : 'Correct answers'}: ${result.correctCount}/${result.totalPlates}</span></div>`;
    }

    return `
      <div class="test-block">
        <div class="test-header">
          <span class="test-name">${tName}</span>
          <span class="pill" style="background:${cs.bg};color:${cs.text};border:1px solid ${cs.border}">${label}</span>
        </div>
        ${eyeRows}
      </div>`;
  }).join('');
};

// ─── Main HTML template ───────────────────────────────────────────────────────
const buildHTML = (assessmentResults, overallAlert, language, ageBand) => {
  const isUrdu      = language === 'ur';
  const dir         = isUrdu ? 'rtl' : 'ltr';
  const cs          = ALERT_CSS[overallAlert];
  const date        = new Date().toLocaleDateString(isUrdu ? 'ur-PK' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const ageBandLabel = (AGE_BAND_LABELS[language] || AGE_BAND_LABELS.en)[ageBand] || ageBand;
  const overallTitle = (OVERALL_TITLES[language] || OVERALL_TITLES.en)[overallAlert];
  const testRows     = buildTestRows(assessmentResults, language);

  return `
<!DOCTYPE html>
<html dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ${isUrdu ? "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', Arial" : "Arial, sans-serif"};
      font-size: 13px;
      color: #1A1C1E;
      background: #fff;
      padding: 32px;
      direction: ${dir};
    }

    /* Header */
    .header { border-bottom: 2px solid #1A6FD4; padding-bottom: 16px; margin-bottom: 20px; }
    .app-name { font-size: 22px; font-weight: 800; color: #1A6FD4; }
    .app-urdu { font-size: 16px; color: #5A5D63; margin-top: 2px; }
    .meta { margin-top: 10px; font-size: 12px; color: #5A5D63; }
    .meta span { margin-${isUrdu ? 'left' : 'right'}: 16px; }

    /* Overall alert */
    .overall-banner {
      background: ${cs.bg};
      border: 1.5px solid ${cs.border};
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 20px;
    }
    .overall-title { font-size: 16px; font-weight: 700; color: ${cs.text}; margin-bottom: 4px; }
    .overall-sub   { font-size: 12px; color: ${cs.text}; line-height: 1.6; }

    /* Urgent box */
    .urgent-box { background: #FCEBEB; border: 1px solid #F7C1C1; border-radius: 8px; padding: 12px; margin-bottom: 20px; }
    .urgent-text { color: #A32D2D; font-weight: 600; font-size: 13px; line-height: 1.6; }

    /* Tests */
    .section-label { font-size: 11px; font-weight: 700; color: #9EA3AB; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px; }
    .test-block    { border: 1px solid #E2E4E8; border-radius: 8px; padding: 12px; margin-bottom: 8px; }
    .test-header   { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .test-name     { font-weight: 600; font-size: 13px; }
    .eye-row       { display: flex; justify-content: space-between; font-size: 12px; color: #5A5D63; padding: 3px 0; }
    .pill          { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 20px; }

    /* Footer */
    .footer { margin-top: 28px; padding-top: 14px; border-top: 1px solid #E2E4E8; }
    .footer-title { font-weight: 700; margin-bottom: 6px; font-size: 13px; }
    .footer-text  { font-size: 11px; color: #9EA3AB; line-height: 1.7; }
    .show-doctor  { font-size: 13px; font-weight: 700; color: #1A6FD4; text-align: center; margin-top: 16px; padding: 10px; border: 1.5px solid #1A6FD4; border-radius: 8px; }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="app-name">VisionCheck</div>
    <div class="app-urdu">نظر کا معائنہ</div>
    <div class="meta">
      <span>📅 ${date}</span>
      <span>👤 ${isUrdu ? 'عمر' : 'Age group'}: ${ageBandLabel}</span>
    </div>
  </div>

  <!-- Overall result -->
  <div class="overall-banner">
    <div class="overall-title">${overallTitle}</div>
  </div>

  ${overallAlert === ALERT.URGENT ? `
  <div class="urgent-box">
    <div class="urgent-text">
      🚨 ${isUrdu
        ? 'براہ کرم آج یا کل ماہرِ امراضِ چشم سے ملیں۔ دیر نہ کریں۔'
        : 'Please see an ophthalmologist today or tomorrow. Do not delay.'}
    </div>
  </div>` : ''}

  <!-- Test results -->
  <div class="section-label">${isUrdu ? 'ہر ٹیسٹ کا نتیجہ' : 'Results by test'}</div>
  ${testRows}

  <!-- Footer -->
  <div class="footer">
    <div class="footer-title">${isUrdu ? 'اہم اعلان' : 'Important Notice'}</div>
    <div class="footer-text">
      ${isUrdu
        ? 'یہ نتائج طبی تشخیص نہیں ہیں۔ VisionCheck ایک خود معائنہ کا آلہ ہے۔ یہ رپورٹ ڈاکٹر کو دکھائیں اور پیشہ ورانہ معائنہ کروائیں۔'
        : 'These results are not a medical diagnosis. VisionCheck is a self-screening tool only. Please show this report to your ophthalmologist or optometrist and get a professional eye examination.'}
    </div>
    <div class="show-doctor">
      ${isUrdu ? '👁 یہ رپورٹ اپنے ڈاکٹر کو دکھائیں' : '👁 Please show this report to your eye doctor'}
    </div>
  </div>

</body>
</html>`;
};

// ─── Exported function ────────────────────────────────────────────────────────
/**
 * Generates PDF from assessment results
 * @returns {Promise<string>} URI of generated PDF file
 */
export const generatePDF = async (assessmentResults, overallAlert, language, ageBand) => {
  const html = buildHTML(assessmentResults, overallAlert, language, ageBand);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  return uri;
};
