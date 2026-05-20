// VisionCheck — Final Summary Screen
// app/screens/results/FinalSummaryScreen.js
//
// Shows combined results of all completed tests.
// Calculates overall alert level.
// Options: Download PDF, Share via WhatsApp, View history, Take again.
// Saves assessment to local SQLite database.
// Bilingual — English and Urdu.

import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity,
  ScrollView, StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ALERT, ALERT_STYLE, getOverallAlert } from '../../engine/alertLogic';
import { createAssessment, saveTestResult, completeAssessment } from '../../database/db';
import { generateAndSharePDF, shareAsText } from '../../utils/shareResults';
import { speakPrompt } from '../../audio/speech';

// ─── What to do next — per overall alert level ───────────────────────────────
const NEXT_STEPS = {
  en: {
    [ALERT.GREEN]:  'Your overall vision appears normal. A routine eye check every 2 years is still recommended even without symptoms.',
    [ALERT.YELLOW]: 'Some mild concerns were noted. We recommend booking an appointment with an ophthalmologist or optometrist within the next few weeks.',
    [ALERT.RED]:    'Your results suggest a vision problem that needs professional attention. Please visit an ophthalmologist this week.',
    [ALERT.URGENT]: 'One or more results require urgent attention. Please see an ophthalmologist or go to an eye clinic within 24 to 48 hours. Do not delay.',
  },
  ur: {
    [ALERT.GREEN]:  'آپ کی مجموعی نظر معمول کے مطابق لگتی ہے۔ پھر بھی ہر ۲ سال میں معمول کا معائنہ کروانے کا مشورہ ہے۔',
    [ALERT.YELLOW]: 'کچھ معمولی نتائج نوٹ کیے گئے۔ اگلے چند ہفتوں میں ماہرِ امراضِ چشم سے ملاقات کی تجویز ہے۔',
    [ALERT.RED]:    'آپ کے نتائج سے لگتا ہے کہ نظر میں کوئی مسئلہ ہے جس کے لیے پیشہ ورانہ توجہ ضروری ہے۔ براہ کرم اس ہفتے ڈاکٹر سے ملیں۔',
    [ALERT.URGENT]: 'ایک یا زیادہ نتائج فوری توجہ چاہتے ہیں۔ براہ کرم ۲۴ سے ۴۸ گھنٹوں میں ماہرِ امراضِ چشم سے ملیں۔ دیر نہ کریں۔',
  },
};

const TEST_LABELS = {
  en: { distance: 'Distance Vision', near: 'Near Vision', astigmatism: 'Astigmatism', contrast: 'Contrast Sensitivity', amsler: 'Amsler Grid', color: 'Colour Vision' },
  ur: { distance: 'دور کے نظر', near: 'قریب کے نظر', astigmatism: 'لکیروں کا ٹیسٹ', contrast: 'دھندلا پن', amsler: 'جالی کا ٹیسٹ', color: 'رنگوں کا ٹیسٹ' },
};

const FinalSummaryScreen = ({ navigation, route }) => {
  const { language, ageBand, assessmentResults } = route.params;
  const isUrdu = language === 'ur';
  const labels = TEST_LABELS[language] || TEST_LABELS.en;
  const nextSteps = NEXT_STEPS[language] || NEXT_STEPS.en;

  const [saving,    setSaving]    = useState(true);
  const [exporting, setExporting] = useState(false);
  const [assessmentId, setAssessmentId] = useState(null);

  // Collect all alert levels across all tests
  const allAlerts = Object.values(assessmentResults).flatMap(r =>
    [r.alertR, r.alertL, r.alert, r.diffAlert].filter(Boolean)
  );
  const overallAlert = getOverallAlert(allAlerts);
  const overallStyle = ALERT_STYLE[overallAlert];
  const nextStepText = nextSteps[overallAlert];
  const isUrgent     = overallAlert === ALERT.URGENT;

  // Save to local database on mount
  useEffect(() => {
    const saveToDb = async () => {
      try {
        const id = await createAssessment('completed', ageBand, language);
        // Save each test result
        for (const [testName, result] of Object.entries(assessmentResults)) {
          if (result.alertR) await saveTestResult(id, testName, 'R', result.responseR, result.alertR);
          if (result.alertL) await saveTestResult(id, testName, 'L', result.responseL, result.alertL);
          if (result.alert)  await saveTestResult(id, testName, 'both', result.response, result.alert);
        }
        await completeAssessment(id, overallAlert);
        setAssessmentId(id);
      } catch (err) {
        console.error('DB save error:', err);
      } finally {
        setSaving(false);
      }
    };
    saveToDb();

    // Speak summary on load
    setTimeout(() => {
      const title = isUrdu ? 'آپ کے مجموعی نتائج' : 'Your overall results';
      speakPrompt(title + '. ' + nextStepText, language);
    }, 800);
  }, []);

  const handleDownloadPDF = async () => {
    setExporting(true);
    try {
      await generateAndSharePDF(assessmentResults, overallAlert, language, ageBand, 'save');
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleShareWhatsApp = async () => {
    setExporting(true);
    try {
      await shareAsText(assessmentResults, overallAlert, language, ageBand);
    } catch (err) {
      console.error('Share error:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleRetake = () => {
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs', params: { language } }] });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Header */}
        <Text style={[styles.heading, isUrdu && styles.rtl]}>
          {isUrdu ? 'مجموعی نتائج' : 'Assessment Summary'}
        </Text>

        {/* Saving indicator */}
        {saving && (
          <View style={styles.savingRow}>
            <ActivityIndicator size="small" color="#1A6FD4" />
            <Text style={styles.savingText}>
              {isUrdu ? 'نتائج محفوظ ہو رہے ہیں...' : 'Saving results...'}
            </Text>
          </View>
        )}

        {/* Overall alert banner */}
        <View style={[styles.overallBanner, { backgroundColor: overallStyle.bg, borderColor: overallStyle.border }]}>
          <Feather name={overallStyle.icon} size={28} color={overallStyle.text} />
          <View style={styles.overallBannerText}>
            <Text style={[styles.overallTitle, { color: overallStyle.text }, isUrdu && styles.rtl]}>
              {isUrdu ? getOverallTitleUr(overallAlert) : getOverallTitleEn(overallAlert)}
            </Text>
            <Text style={[styles.overallBody, { color: overallStyle.text }, isUrdu && styles.rtl]}>
              {nextStepText}
            </Text>
          </View>
        </View>

        {/* Urgent call to action */}
        {isUrgent && (
          <View style={styles.urgentBox}>
            <Text style={styles.urgentIcon}>🚨</Text>
            <Text style={[styles.urgentText, isUrdu && styles.rtl]}>
              {isUrdu
                ? 'براہ کرم آج یا کل ماہرِ امراضِ چشم سے ملیں۔ یہ سنجیدہ معاملہ ہے۔'
                : 'Please see an ophthalmologist today or tomorrow. This is serious.'}
            </Text>
          </View>
        )}

        {/* Per-test results */}
        <Text style={[styles.sectionLabel, isUrdu && styles.rtl]}>
          {isUrdu ? 'ہر ٹیسٹ کا نتیجہ' : 'Results by test'}
        </Text>

        <View style={styles.resultsCard}>
          {Object.entries(assessmentResults).map(([testName, result], index, arr) => {
            const testAlerts = [result.alertR, result.alertL, result.alert].filter(Boolean);
            const worstTest  = getOverallAlert(testAlerts);
            const ts         = ALERT_STYLE[worstTest];

            return (
              <View key={testName} style={[styles.resultRow, index === arr.length - 1 && styles.resultRowLast]}>
                <Text style={[styles.resultTestName, isUrdu && styles.rtl]}>
                  {labels[testName] || testName}
                </Text>
                <View style={[styles.resultPill, { backgroundColor: ts.bg, borderColor: ts.border }]}>
                  <Feather name={ts.icon} size={11} color={ts.text} />
                  <Text style={[styles.resultPillText, { color: ts.text }]}>
                    {getAlertLabel(worstTest, isUrdu)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Action buttons */}
        <Text style={[styles.sectionLabel, isUrdu && styles.rtl]}>
          {isUrdu ? 'نتائج محفوظ کریں' : 'Save your results'}
        </Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleDownloadPDF}
          disabled={exporting}
          activeOpacity={0.85}
        >
          {exporting
            ? <ActivityIndicator color="#fff" size="small" />
            : <>
                <Text style={styles.btnIcon}>📄</Text>
                <Text style={styles.primaryBtnText}>
                  {isUrdu ? 'PDF ڈاؤن لوڈ کریں' : 'Download PDF'}
                </Text>
              </>
          }
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={handleShareWhatsApp}
          disabled={exporting}
          activeOpacity={0.85}
        >
          <Text style={styles.btnIcon}>📱</Text>
          <Text style={styles.secondaryBtnText}>
            {isUrdu ? 'واٹس ایپ پر شیئر کریں' : 'Share via WhatsApp'}
          </Text>
        </TouchableOpacity>

        {/* Audio replay */}
        <TouchableOpacity
          style={styles.audioBtn}
          onPress={() => speakPrompt(nextStepText, language)}
        >
          <Feather name="volume-2" size={16} color="#1A6FD4" />
          <Text style={styles.audioBtnText}>
            {isUrdu ? 'دوبارہ سنیں' : 'Replay summary'}
          </Text>
        </TouchableOpacity>

        {/* Retake */}
        <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake} activeOpacity={0.8}>
          <Feather name="refresh-cw" size={16} color="#5A5D63" />
          <Text style={styles.retakeBtnText}>
            {isUrdu ? 'دوبارہ ٹیسٹ دیں' : 'Take tests again'}
          </Text>
        </TouchableOpacity>

        {/* Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Text style={[styles.disclaimerText, isUrdu && styles.rtl]}>
            {isUrdu
              ? 'یہ نتائج طبی تشخیص نہیں ہیں۔ ڈاکٹر کو یہ رپورٹ دکھائیں اور پیشہ ورانہ معائنہ کروائیں۔'
              : 'These results are not a medical diagnosis. Please show this report to your eye doctor and get a professional examination.'}
          </Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Helper label functions ───────────────────────────────────────────────────
const getOverallTitleEn = (alert) => ({
  [ALERT.GREEN]:  '✓ No significant concerns found',
  [ALERT.YELLOW]: '⚠ Some mild concerns noticed',
  [ALERT.RED]:    '✗ Please see an eye doctor',
  [ALERT.URGENT]: '🚨 Urgent — see a doctor soon',
})[alert] || 'Assessment complete';

const getOverallTitleUr = (alert) => ({
  [ALERT.GREEN]:  '✓ کوئی قابلِ ذکر تشویش نہیں',
  [ALERT.YELLOW]: '⚠ کچھ معمولی نتائج نوٹ کیے گئے',
  [ALERT.RED]:    '✗ براہ کرم آنکھوں کے ڈاکٹر سے ملیں',
  [ALERT.URGENT]: '🚨 فوری — ڈاکٹر سے جلد ملیں',
})[alert] || 'معائنہ مکمل';

const getAlertLabel = (alert, isUrdu) => ({
  green:  isUrdu ? 'معمول' : 'Normal',
  yellow: isUrdu ? 'معمولی' : 'Mild',
  red:    isUrdu ? 'دیکھیں' : 'See doctor',
  urgent: isUrdu ? 'فوری' : 'Urgent',
})[alert] || alert;

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#F5F6F8' },
  content: { padding: 20, paddingTop: 24 },
  rtl:     { textAlign: 'right', writingDirection: 'rtl' },

  heading:    { fontSize: 24, fontWeight: '800', color: '#1A1C1E', marginBottom: 16 },

  savingRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  savingText: { fontSize: 13, color: '#9EA3AB' },

  overallBanner:     { borderRadius: 16, borderWidth: 1, padding: 18, flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 12 },
  overallBannerText: { flex: 1 },
  overallTitle:      { fontSize: 17, fontWeight: '700', marginBottom: 6, lineHeight: 24 },
  overallBody:       { fontSize: 14, lineHeight: 22 },

  urgentBox:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#FCEBEB', borderRadius: 12, borderWidth: 1, borderColor: '#F7C1C1', padding: 14, marginBottom: 16 },
  urgentIcon: { fontSize: 20 },
  urgentText: { flex: 1, fontSize: 14, color: '#A32D2D', fontWeight: '600', lineHeight: 22 },

  sectionLabel: { fontSize: 12, fontWeight: '600', color: '#9EA3AB', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 16 },

  resultsCard:    { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E2E4E8', paddingHorizontal: 16, marginBottom: 4 },
  resultRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E4E8' },
  resultRowLast:  { borderBottomWidth: 0 },
  resultTestName: { fontSize: 14, color: '#1A1C1E', flex: 1, fontWeight: '500' },
  resultPill:     { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  resultPillText: { fontSize: 11, fontWeight: '600' },

  primaryBtn:     { backgroundColor: '#1A6FD4', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  btnIcon:        { fontSize: 18 },

  secondaryBtn:     { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E4E8', paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  secondaryBtnText: { color: '#1A1C1E', fontSize: 15, fontWeight: '500' },

  audioBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 14, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#E8F1FB', borderRadius: 20 },
  audioBtnText: { fontSize: 13, color: '#1A6FD4', fontWeight: '500' },

  retakeBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, paddingVertical: 12 },
  retakeBtnText: { fontSize: 14, color: '#5A5D63' },

  disclaimerBox:  { backgroundColor: '#F5F6F8', borderRadius: 10, borderWidth: 1, borderColor: '#E2E4E8', padding: 12, marginTop: 16 },
  disclaimerText: { fontSize: 12, color: '#9EA3AB', lineHeight: 18, textAlign: 'center' },
});

export default FinalSummaryScreen;
