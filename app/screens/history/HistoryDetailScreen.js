// VisionCheck — History Detail Screen
// app/screens/history/HistoryDetailScreen.js
//
// Shows full detail of one past assessment.
// Loads assessment + all test results from local SQLite.
// Options to download PDF or share via WhatsApp.
// Bilingual — English and Urdu.

import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getAssessmentById, getTestResultsForAssessment } from '../../database/db';
import { ALERT, ALERT_STYLE, getOverallAlert } from '../../engine/alertLogic';
import { formatDate, ageBandLabel } from '../../utils/dateFormatter';
import { generateAndSharePDF, shareAsText } from '../../utils/shareResults';

const TEST_LABELS = {
  en: {
    distance: 'Distance Vision', near: 'Near Vision',
    astigmatism: 'Astigmatism', contrast: 'Contrast Sensitivity',
    amsler: 'Amsler Grid', color: 'Colour Vision',
  },
  ur: {
    distance: 'دور کے نظر', near: 'قریب کے نظر',
    astigmatism: 'لکیروں کا ٹیسٹ', contrast: 'دھندلا پن',
    amsler: 'جالی کا ٹیسٹ', color: 'رنگوں کا ٹیسٹ',
  },
};

const EYE_LABELS = {
  en: { R: '👁 Right Eye', L: '👁 Left Eye', both: '👁 Both Eyes' },
  ur: { R: '👁 دائیں آنکھ', L: '👁 بائیں آنکھ', both: '👁 دونوں آنکھیں' },
};

const HistoryDetailScreen = ({ navigation, route }) => {
  const { assessmentId, language: routeLang } = route.params;
  const [language,    setLanguage]    = useState(routeLang || 'en');
  const [assessment,  setAssessment]  = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [exporting,   setExporting]   = useState(false);

  const isUrdu = language === 'ur';

  useEffect(() => {
    loadDetail();
  }, []);

  const loadDetail = async () => {
    try {
      const a = await getAssessmentById(assessmentId);
      const r = await getTestResultsForAssessment(assessmentId);
      if (a) {
        setAssessment(a);
        setLanguage(a.language || routeLang || 'en');
      }
      setTestResults(r);
    } catch (err) {
      console.error('History detail load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Rebuild assessmentResults object from flat DB rows for PDF generator
  const buildAssessmentResults = () => {
    const results = {};
    testResults.forEach(row => {
      if (!results[row.test_name]) results[row.test_name] = {};
      if (row.eye === 'R')    { results[row.test_name].alertR = row.alert_level; results[row.test_name].responseR = row.response; }
      if (row.eye === 'L')    { results[row.test_name].alertL = row.alert_level; results[row.test_name].responseL = row.response; }
      if (row.eye === 'both') { results[row.test_name].alert  = row.alert_level; results[row.test_name].response  = row.response; results[row.test_name].eye = 'both'; }
    });
    return results;
  };

  const handleDownloadPDF = async () => {
    setExporting(true);
    try {
      const results = buildAssessmentResults();
      await generateAndSharePDF(results, assessment.overall_alert, language, assessment.age_band);
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleShareWhatsApp = async () => {
    setExporting(true);
    try {
      const results = buildAssessmentResults();
      await shareAsText(results, assessment.overall_alert, language, assessment.age_band);
    } catch (err) {
      console.error('Share error:', err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#1A6FD4" />
          <Text style={styles.loadingText}>
            {isUrdu ? 'لوڈ ہو رہا ہے...' : 'Loading...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!assessment) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>
            {isUrdu ? 'نتائج نہیں ملے' : 'Assessment not found'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const overallAlert = assessment.overall_alert || ALERT.GREEN;
  const overallStyle = ALERT_STYLE[overallAlert];
  const labels       = TEST_LABELS[language] || TEST_LABELS.en;
  const eyeLabels    = EYE_LABELS[language]  || EYE_LABELS.en;

  // Group test results by test name
  const grouped = {};
  testResults.forEach(row => {
    if (!grouped[row.test_name]) grouped[row.test_name] = [];
    grouped[row.test_name].push(row);
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Feather
            name={isUrdu ? 'chevron-right' : 'chevron-left'}
            size={22}
            color="#1A6FD4"
          />
          <Text style={styles.backBtnText}>
            {isUrdu ? 'واپس' : 'Back'}
          </Text>
        </TouchableOpacity>

        {/* Date and meta */}
        <Text style={[styles.dateLabel, isUrdu && styles.rtl]}>
          {formatDate(assessment.date, language)}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Feather name="user" size={12} color="#9EA3AB" />
            <Text style={styles.metaChipText}>
              {ageBandLabel(assessment.age_band, language)}
            </Text>
          </View>
          <View style={styles.metaChip}>
            <Feather name="globe" size={12} color="#9EA3AB" />
            <Text style={styles.metaChipText}>
              {assessment.language === 'ur' ? 'اردو' : 'English'}
            </Text>
          </View>
        </View>

        {/* Overall alert banner */}
        <View style={[styles.overallBanner, { backgroundColor: overallStyle.bg, borderColor: overallStyle.border }]}>
          <Feather name={overallStyle.icon} size={24} color={overallStyle.text} />
          <Text style={[styles.overallTitle, { color: overallStyle.text }, isUrdu && styles.rtl]}>
            {getOverallLabel(overallAlert, isUrdu)}
          </Text>
        </View>

        {/* Urgent note */}
        {overallAlert === ALERT.URGENT && (
          <View style={styles.urgentBox}>
            <Text style={styles.urgentIcon}>🚨</Text>
            <Text style={[styles.urgentText, isUrdu && styles.rtl]}>
              {isUrdu
                ? 'یہ معائنہ فوری ڈاکٹر سے ملنے کی ضرورت ظاہر کرتا ہے'
                : 'This assessment indicated an urgent need to see a doctor'}
            </Text>
          </View>
        )}

        {/* Per-test results */}
        <Text style={[styles.sectionLabel, isUrdu && styles.rtl]}>
          {isUrdu ? 'ہر ٹیسٹ کا نتیجہ' : 'Results by test'}
        </Text>

        {Object.entries(grouped).map(([testName, rows]) => {
          const testAlerts = rows.map(r => r.alert_level).filter(Boolean);
          const worst      = getOverallAlert(testAlerts);
          const ts         = ALERT_STYLE[worst];

          return (
            <View key={testName} style={styles.testCard}>
              {/* Test name + overall pill */}
              <View style={styles.testCardHeader}>
                <Text style={[styles.testCardName, isUrdu && styles.rtl]}>
                  {labels[testName] || testName}
                </Text>
                <View style={[styles.pill, { backgroundColor: ts.bg, borderColor: ts.border }]}>
                  <Feather name={ts.icon} size={11} color={ts.text} />
                  <Text style={[styles.pillText, { color: ts.text }]}>
                    {getAlertLabel(worst, isUrdu)}
                  </Text>
                </View>
              </View>

              {/* Per-eye rows */}
              {rows.map((row, i) => {
                const rs = ALERT_STYLE[row.alert_level] || ALERT_STYLE[ALERT.GREEN];
                return (
                  <View key={i} style={[styles.eyeRow, i === rows.length - 1 && styles.eyeRowLast]}>
                    <Text style={[styles.eyeLabel, isUrdu && styles.rtl]}>
                      {eyeLabels[row.eye] || row.eye}
                    </Text>
                    <View style={[styles.pill, { backgroundColor: rs.bg, borderColor: rs.border }]}>
                      <Text style={[styles.pillText, { color: rs.text }]}>
                        {getAlertLabel(row.alert_level, isUrdu)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })}

        {/* Action buttons */}
        <Text style={[styles.sectionLabel, isUrdu && styles.rtl]}>
          {isUrdu ? 'نتائج شیئر کریں' : 'Share results'}
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

        {/* Disclaimer */}
        <Text style={[styles.disclaimer, isUrdu && styles.rtl]}>
          {isUrdu
            ? 'یہ نتائج طبی تشخیص نہیں ہیں۔ ڈاکٹر سے تصدیق ضروری ہے۔'
            : 'These results are not a medical diagnosis. Professional confirmation required.'}
        </Text>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Label helpers ────────────────────────────────────────────────────────────
const getOverallLabel = (alert, isUrdu) => ({
  green:  isUrdu ? '✓ کوئی قابلِ ذکر تشویش نہیں' : '✓ No significant concerns',
  yellow: isUrdu ? '⚠ کچھ معمولی نتائج'          : '⚠ Some mild concerns',
  red:    isUrdu ? '✗ ڈاکٹر سے ملیں'              : '✗ Please see a doctor',
  urgent: isUrdu ? '🚨 فوری ڈاکٹر سے ملیں'        : '🚨 Urgent — see a doctor',
})[alert] || alert;

const getAlertLabel = (alert, isUrdu) => ({
  green:  isUrdu ? 'معمول'  : 'Normal',
  yellow: isUrdu ? 'معمولی' : 'Mild',
  red:    isUrdu ? 'دیکھیں' : 'See doctor',
  urgent: isUrdu ? 'فوری'   : 'Urgent',
})[alert] || alert;

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#F5F6F8' },
  content: { padding: 20, paddingTop: 12 },
  rtl:     { textAlign: 'right', writingDirection: 'rtl' },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#9EA3AB' },

  backBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  backBtnText: { fontSize: 15, color: '#1A6FD4', fontWeight: '500' },

  dateLabel:   { fontSize: 20, fontWeight: '700', color: '#1A1C1E', marginBottom: 8 },

  metaRow:     { flexDirection: 'row', gap: 8, marginBottom: 16 },
  metaChip:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E4E8', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  metaChipText:{ fontSize: 12, color: '#5A5D63' },

  overallBanner:  { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12 },
  overallTitle:   { fontSize: 16, fontWeight: '700', flex: 1, lineHeight: 24 },

  urgentBox:   { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#FCEBEB', borderRadius: 12, borderWidth: 1, borderColor: '#F7C1C1', padding: 14, marginBottom: 16 },
  urgentIcon:  { fontSize: 18 },
  urgentText:  { flex: 1, fontSize: 13, color: '#A32D2D', fontWeight: '600', lineHeight: 20 },

  sectionLabel:{ fontSize: 12, fontWeight: '600', color: '#9EA3AB', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 16 },

  testCard:       { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E4E8', padding: 14, marginBottom: 10 },
  testCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  testCardName:   { fontSize: 14, fontWeight: '600', color: '#1A1C1E', flex: 1 },

  eyeRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#F5F6F8' },
  eyeRowLast: { borderBottomWidth: 0 },
  eyeLabel:   { fontSize: 13, color: '#5A5D63', flex: 1 },

  pill:     { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  pillText: { fontSize: 11, fontWeight: '600' },

  primaryBtn:     { backgroundColor: '#1A6FD4', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  btnIcon:        { fontSize: 18 },

  secondaryBtn:     { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E4E8', paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  secondaryBtnText: { color: '#1A1C1E', fontSize: 15, fontWeight: '500' },

  disclaimer: { fontSize: 11, color: '#C0C3CA', textAlign: 'center', marginTop: 20, lineHeight: 16 },
});

export default HistoryDetailScreen;
