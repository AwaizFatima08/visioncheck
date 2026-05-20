// VisionCheck — Share Results
// app/utils/shareResults.js
//
// Two sharing methods:
// 1. generateAndSharePDF — generates PDF and opens share sheet (save or share)
// 2. shareAsText — plain text summary for WhatsApp
//
// Both handle errors gracefully — user always sees feedback.

import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import { generatePDF } from './pdfGenerator';
import { ALERT } from '../engine/alertLogic';

// ─── Test labels for text summary ────────────────────────────────────────────
const TEST_LABELS = {
  en: { distance: 'Distance Vision', near: 'Near Vision', astigmatism: 'Astigmatism', contrast: 'Contrast Sensitivity', amsler: 'Amsler Grid', color: 'Colour Vision' },
  ur: { distance: 'دور کی نظر', near: 'قریب کی نظر', astigmatism: 'لکیروں کا ٹیسٹ', contrast: 'دھندلا پن', amsler: 'جالی کا ٹیسٹ', color: 'رنگوں کا ٹیسٹ' },
};

const ALERT_LABELS = {
  en: { green: 'Normal', yellow: 'Mild concern', red: 'See doctor', urgent: 'URGENT' },
  ur: { green: 'معمول', yellow: 'معمولی', red: 'ڈاکٹر دیکھیں', urgent: 'فوری' },
};

const getTestWorstAlert = (result) => {
  const levels = [result.alertR, result.alertL, result.alert].filter(Boolean);
  if (levels.includes(ALERT.URGENT)) return ALERT.URGENT;
  if (levels.includes(ALERT.RED))    return ALERT.RED;
  if (levels.includes(ALERT.YELLOW)) return ALERT.YELLOW;
  return ALERT.GREEN;
};

// ─── PDF — generate and open share sheet ─────────────────────────────────────
export const generateAndSharePDF = async (assessmentResults, overallAlert, language, ageBand) => {
  const isUrdu = language === 'ur';

  try {
    // Generate PDF
    const pdfUri = await generatePDF(assessmentResults, overallAlert, language, ageBand);

    // Copy to a named file in documents directory
    const date     = new Date().toISOString().split('T')[0];
    const fileName = `VisionCheck_${date}.pdf`;
    const destUri  = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.copyAsync({ from: pdfUri, to: destUri });

    // Check sharing is available
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      Alert.alert(
        isUrdu ? 'شیئرنگ دستیاب نہیں' : 'Sharing not available',
        isUrdu ? 'فائل محفوظ ہو گئی: ' + fileName : 'File saved as: ' + fileName,
      );
      return;
    }

    // Open share sheet — user can save to downloads or share to any app
    await Sharing.shareAsync(destUri, {
      mimeType:  'application/pdf',
      dialogTitle: isUrdu ? 'رپورٹ شیئر کریں' : 'Share VisionCheck Report',
      UTI:       'com.adobe.pdf',
    });

  } catch (err) {
    console.error('PDF share error:', err);
    Alert.alert(
      isUrdu ? 'خرابی' : 'Error',
      isUrdu ? 'PDF بنانے میں مسئلہ ہوا۔ دوبارہ کوشش کریں۔' : 'Could not generate PDF. Please try again.',
    );
  }
};

// ─── Plain text summary for WhatsApp ─────────────────────────────────────────
export const shareAsText = async (assessmentResults, overallAlert, language, ageBand) => {
  const isUrdu  = language === 'ur';
  const labels  = TEST_LABELS[language] || TEST_LABELS.en;
  const aLabels = ALERT_LABELS[language] || ALERT_LABELS.en;
  const date    = new Date().toLocaleDateString(isUrdu ? 'ur-PK' : 'en-GB');

  const overallLabel = {
    en: { green: 'No significant concerns', yellow: 'Mild concerns noted', red: 'Please see a doctor', urgent: 'URGENT — see doctor within 24-48 hours' },
    ur: { green: 'کوئی قابلِ ذکر تشویش نہیں', yellow: 'کچھ معمولی نتائج', red: 'ڈاکٹر سے ملیں', urgent: 'فوری — ۲۴ سے ۴۸ گھنٹوں میں ڈاکٹر سے ملیں' },
  };

  // Build text lines
  const lines = [];

  if (isUrdu) {
    lines.push('👁 VisionCheck — نظر کا معائنہ');
    lines.push(`📅 تاریخ: ${date}`);
    lines.push('');
    lines.push(`مجموعی نتیجہ: ${(overallLabel.ur)[overallAlert] || ''}`);
    lines.push('');
    lines.push('ہر ٹیسٹ کا نتیجہ:');
    Object.entries(assessmentResults).forEach(([testName, result]) => {
      const worst = getTestWorstAlert(result);
      lines.push(`• ${labels[testName] || testName}: ${aLabels[worst] || worst}`);
      if (result.alertR) {
        lines.push(`  دائیں آنکھ: ${(ALERT_LABELS.ur)[result.alertR] || result.alertR}`);
        lines.push(`  بائیں آنکھ: ${(ALERT_LABELS.ur)[result.alertL] || result.alertL}`);
      }
    });
    lines.push('');
    lines.push('⚠️ یہ طبی تشخیص نہیں ہے۔ اپنے ڈاکٹر سے تصدیق کروائیں۔');
  } else {
    lines.push('👁 VisionCheck — Vision Self-Assessment');
    lines.push(`📅 Date: ${date}`);
    lines.push('');
    lines.push(`Overall result: ${(overallLabel.en)[overallAlert] || ''}`);
    lines.push('');
    lines.push('Results by test:');
    Object.entries(assessmentResults).forEach(([testName, result]) => {
      const worst = getTestWorstAlert(result);
      lines.push(`• ${labels[testName] || testName}: ${aLabels[worst] || worst}`);
      if (result.alertR) {
        lines.push(`  Right eye: ${(ALERT_LABELS.en)[result.alertR] || result.alertR}`);
        lines.push(`  Left eye:  ${(ALERT_LABELS.en)[result.alertL] || result.alertL}`);
      }
    });
    lines.push('');
    lines.push('⚠️ This is not a medical diagnosis. Please confirm with your eye doctor.');
  }

  const text = lines.join('\n');

  try {
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      Alert.alert('', text); // fallback — show text in alert
      return;
    }

    // Write text to temp file and share
    const tmpUri = `${FileSystem.cacheDirectory}visioncheck_result.txt`;
    await FileSystem.writeAsStringAsync(tmpUri, text, { encoding: FileSystem.EncodingType.UTF8 });

    await Sharing.shareAsync(tmpUri, {
      mimeType:    'text/plain',
      dialogTitle: isUrdu ? 'واٹس ایپ پر شیئر کریں' : 'Share via WhatsApp',
    });
  } catch (err) {
    console.error('Text share error:', err);
    Alert.alert('', text); // fallback — show text
  }
};
