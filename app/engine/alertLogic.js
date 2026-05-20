// VisionCheck — Alert Logic
// app/engine/alertLogic.js
//
// Single source of truth for all alert level decisions.
// Every test result passes through here.
//
// ALERT LEVELS:
//   green  — no concern
//   yellow — mild, see doctor within weeks
//   red    — moderate, see doctor this week
//   urgent — Amsler abnormality, see doctor within 24-48 hours

export const ALERT = {
  GREEN:  'green',
  YELLOW: 'yellow',
  RED:    'red',
  URGENT: 'urgent',
};

// ─── Per-test alert rules ─────────────────────────────────────────────────────

export const getDistanceAlert = (response) => {
  switch (response) {
    case 'rows_6_7':  return ALERT.GREEN;
    case 'rows_4_5':  return ALERT.YELLOW;
    case 'rows_1_3':  return ALERT.RED;
    case 'blurry':    return ALERT.RED;
    default:          return ALERT.YELLOW;
  }
};

// Age-adjusted — presbyopia is expected at 40+ so near difficulty is weighted differently
export const getNearAlert = (response, ageBand) => {
  switch (response) {
    case 'all_4':
      return ALERT.GREEN;
    case 'rows_1_3':
      return (ageBand === 'middle' || ageBand === 'senior') ? ALERT.GREEN : ALERT.YELLOW;
    case 'rows_1_2':
      return ageBand === 'senior' ? ALERT.YELLOW : ALERT.RED;
    case 'row_1_only':
      return ALERT.RED;
    default:
      return ALERT.YELLOW;
  }
};

export const getAstigAlert = (response) => {
  switch (response) {
    case 'all_equal':    return ALERT.GREEN;
    case 'slight_diff':  return ALERT.YELLOW;
    case 'some_darker':  return ALERT.RED;
    case 'some_blurry':  return ALERT.RED;
    case 'unsure':       return ALERT.YELLOW;
    default:             return ALERT.YELLOW;
  }
};

export const getContrastAlert = (response) => {
  switch (response) {
    case 'all_4':   return ALERT.GREEN;
    case 'top_3':   return ALERT.YELLOW;
    case 'top_2':   return ALERT.RED;
    case 'top_1':   return ALERT.RED;
    default:        return ALERT.YELLOW;
  }
};

// Any Amsler abnormality is URGENT — overrides all other results
export const getAmslerAlert = (response) => {
  switch (response) {
    case 'all_straight': return ALERT.GREEN;
    case 'wavy':         return ALERT.URGENT;
    case 'missing':      return ALERT.URGENT;
    case 'distorted':    return ALERT.URGENT;
    default:             return ALERT.YELLOW;
  }
};

export const getColorAlert = (correctCount, totalPlates) => {
  const ratio = correctCount / totalPlates;
  if (ratio === 1)    return ALERT.GREEN;
  if (ratio >= 0.66)  return ALERT.YELLOW;
  return ALERT.RED;
};

// ─── Overall alert — takes array of all individual alert levels ───────────────
// Urgent always wins. Then Red. Then Yellow. Then Green.
export const getOverallAlert = (alertLevels) => {
  if (!alertLevels || alertLevels.length === 0) return ALERT.GREEN;
  if (alertLevels.includes(ALERT.URGENT))        return ALERT.URGENT;
  if (alertLevels.includes(ALERT.RED))           return ALERT.RED;
  if (alertLevels.includes(ALERT.YELLOW))        return ALERT.YELLOW;
  return ALERT.GREEN;
};

// ─── Eye difference check ─────────────────────────────────────────────────────
// Large gap between two eyes → Red regardless of individual scores
export const checkEyeDifference = (alertR, alertL) => {
  const rank = { green: 0, yellow: 1, red: 2, urgent: 3 };
  const diff = Math.abs((rank[alertR] || 0) - (rank[alertL] || 0));
  return diff >= 2 ? ALERT.RED : null; // null means no difference concern
};

// ─── UI colours and icons per alert level ─────────────────────────────────────
export const ALERT_STYLE = {
  [ALERT.GREEN]: {
    bg:     '#EAF3DE',
    text:   '#3B6D11',
    border: '#C0DD97',
    icon:   'check-circle',
  },
  [ALERT.YELLOW]: {
    bg:     '#FAEEDA',
    text:   '#854F0B',
    border: '#FAC775',
    icon:   'alert-circle',
  },
  [ALERT.RED]: {
    bg:     '#FAECE7',
    text:   '#993C1D',
    border: '#F5C4B3',
    icon:   'x-circle',
  },
  [ALERT.URGENT]: {
    bg:     '#FCEBEB',
    text:   '#A32D2D',
    border: '#F7C1C1',
    icon:   'alert-triangle',
  },
};
