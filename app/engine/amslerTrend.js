// VisionCheck — Amsler grid tracking
// app/engine/amslerTrend.js
//
// Compares the grid the user just marked with the last saved check for the
// same eye, so a change over time is visible. Wording stays neutral: a
// difference is something to mention to a doctor, not a diagnosis.

import { getTestHistory } from '../database/db';
import { decodeDetails } from './testInfo';
import { formatDate } from '../utils/dateFormatter';

const cellKey = ([r, c]) => `${r},${c}`;

export const getPreviousAmsler = (eye) => {
  const rows = getTestHistory('amsler').filter(r => r.eye === eye);
  if (rows.length === 0) return null;
  const last    = rows[rows.length - 1];
  const details = decodeDetails(last.notes);
  return {
    date:     last.date,
    abnormal: last.response !== 'all_straight',
    marks:    details && Array.isArray(details.marks) ? details.marks : null,
  };
};

export const compareMarks = (previousMarks, currentMarks) => {
  const before = new Set(previousMarks.map(cellKey));
  return {
    previousCount: previousMarks.length,
    currentCount:  currentMarks.length,
    newCells:      currentMarks.filter(m => !before.has(cellKey(m))).length,
  };
};

// One short line per eye that has an earlier saved check, in the chosen language.
export const amslerComparisonLines = (result, language) => {
  if (!result) return [];
  const isUrdu = language === 'ur';
  const lines  = [];

  ['R', 'L'].forEach((eye) => {
    const response = result[`response${eye}`];
    if (!response) return;
    const previous = getPreviousAmsler(eye);
    if (!previous) return;

    const current = (result[`details${eye}`] && result[`details${eye}`].marks) || [];
    const eyeLabel = eye === 'R' ? (isUrdu ? 'دائیں' : 'Right') : (isUrdu ? 'بائیں' : 'Left');
    const date = formatDate(previous.date, language);
    const nowAbnormal = response !== 'all_straight';

    if (!previous.abnormal && !nowAbnormal) {
      lines.push(isUrdu ? `${eyeLabel}: ${date} کے بعد کوئی تبدیلی نہیں` : `${eyeLabel}: no change since ${date}`);
    } else if (previous.marks) {
      const { previousCount, currentCount, newCells } = compareMarks(previous.marks, current);
      lines.push(isUrdu
        ? `${eyeLabel}: ${date} کو ${previousCount} نشان زد حصے، اب ${currentCount}${newCells ? ` (${newCells} نئے)` : ''}`
        : `${eyeLabel}: ${previousCount} marked area${previousCount === 1 ? '' : 's'} on ${date}, now ${currentCount}${newCells ? ` (${newCells} new)` : ''}`);
    } else {
      lines.push(isUrdu
        ? `${eyeLabel}: ${date} کو پچھلا نتیجہ ${previous.abnormal ? 'غیر معمولی' : 'معمول'} تھا`
        : `${eyeLabel}: last check on ${date} was ${previous.abnormal ? 'abnormal' : 'normal'}`);
    }
  });

  return lines;
};
