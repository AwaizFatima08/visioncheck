// VisionCheck — in-app review prompt
// app/utils/reviewPrompt.js
//
// Asks for a Play Store review once, after the third completed check, and only
// when the result was green or yellow, never after a worrying result.

import * as StoreReview from 'expo-store-review';
import { getSetting, setSetting, getAllAssessments } from '../database/db';
import { ALERT } from '../engine/alertLogic';

export const maybeAskForReview = async (overallAlert) => {
  try {
    if (overallAlert !== ALERT.GREEN && overallAlert !== ALERT.YELLOW) return;
    if (getSetting('review_asked') === '1') return;
    if (getAllAssessments().length < 3) return;
    if (!(await StoreReview.isAvailableAsync())) return;
    setSetting('review_asked', '1');
    setTimeout(() => { StoreReview.requestReview().catch(() => {}); }, 3000);
  } catch (err) {
    // A failed prompt must never affect the result screen.
  }
};
