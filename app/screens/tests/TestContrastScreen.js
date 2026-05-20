// VisionCheck — Contrast Sensitivity Test Screen
// app/screens/tests/TestContrastScreen.js
//
// Both eyes together — no eye separation needed.
// User reads faded text at 4 decreasing opacity levels.
// Viewing distance: 30cm.

import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import ContrastChart from '../../components/charts/ContrastChart';
import { getContrastAlert } from '../../engine/alertLogic';
import { getNextTest, getTestProgress } from '../../engine/symptomRouter';
import { strings } from '../../i18n/strings';

const RESPONSES = [
  { key: 'all_4',  labelEn: 'All 4 levels clearly read', labelUr: 'چاروں سطحیں صاف پڑھیں',    sub: 'Normal' },
  { key: 'top_3',  labelEn: 'Top 3 levels only',          labelUr: 'صرف اوپر کی ۳ سطحیں',      sub: 'Mild' },
  { key: 'top_2',  labelEn: 'Top 2 levels only',          labelUr: 'صرف اوپر کی ۲ سطحیں',      sub: 'Moderate' },
  { key: 'top_1',  labelEn: 'Top level only',              labelUr: 'صرف پہلی سطح',              sub: 'Significant' },
];

const TestContrastScreen = ({ navigation, route }) => {
  const { language, ageBand, testQueue, assessmentResults = {} } = route.params;
  const s        = strings[language];
  const isUrdu   = language === 'ur';
  const progress = getTestProgress(testQueue, 'TestContrast');

  const handleResponse = (responseKey) => {
    const alert      = getContrastAlert(responseKey);
    const testResult = {
      testName: 'contrast',
      response: responseKey,
      alert,
      eye: 'both',
    };

    const updatedResults = { ...assessmentResults, contrast: testResult };
    const nextTest       = getNextTest(testQueue, 'TestContrast');

    if (nextTest) {
      navigation.navigate(nextTest, { language, ageBand, testQueue, assessmentResults: updatedResults });
    } else {
      navigation.navigate('FinalSummary', { language, ageBand, assessmentResults: updatedResults });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.progressRow}>
          {testQueue.map((_, i) => (
            <View key={i} style={[styles.progressDot, i < progress.current && styles.progressDone, i === progress.current && styles.progressCurrent]} />
          ))}
        </View>

        <Text style={[styles.testName, isUrdu && styles.rtl]}>
          {isUrdu ? s.test_contrast_name : 'Contrast Sensitivity Test'}
        </Text>

        <View style={styles.distanceBadge}>
          <Feather name="smartphone" size={16} color="#1A6FD4" />
          <Text style={styles.distanceText}>
            {isUrdu ? 'فون کو پڑھنے کی دوری پر رکھیں — ۳۰ سینٹی میٹر' : 'Hold phone at reading distance — 30 cm'}
          </Text>
        </View>

        {/* Both eyes open — green badge */}
        <View style={styles.bothEyesBadge}>
          <Feather name="eye" size={16} color="#3B6D11" />
          <Text style={styles.bothEyesText}>
            {isUrdu ? 'دونوں آنکھیں کھلی رکھیں' : 'Keep BOTH eyes open'}
          </Text>
        </View>

        <ContrastChart />

        <Text style={[styles.responsePrompt, isUrdu && styles.rtl]}>
          {isUrdu ? 'آپ کتنی سطحیں صاف پڑھ سکے؟' : 'How many levels could you read clearly?'}
        </Text>

        {RESPONSES.map((r) => (
          <TouchableOpacity key={r.key} style={styles.choiceBtn} onPress={() => handleResponse(r.key)} activeOpacity={0.8}>
            <Text style={[styles.choiceLabel, isUrdu && styles.rtl]}>{isUrdu ? r.labelUr : r.labelEn}</Text>
            <Text style={styles.choiceSub}>{r.sub}</Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F6F8' },
  content: { padding: 20, paddingTop: 16 },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  progressRow: { flexDirection: 'row', gap: 5, marginBottom: 16 },
  progressDot: { flex: 1, height: 3, borderRadius: 2, backgroundColor: '#E2E4E8' },
  progressDone: { backgroundColor: '#3B6D11' },
  progressCurrent: { backgroundColor: '#1A6FD4' },
  testName: { fontSize: 20, fontWeight: '700', color: '#1A1C1E', marginBottom: 12 },
  distanceBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E8F1FB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8 },
  distanceText: { fontSize: 13, color: '#1A6FD4', flex: 1, fontWeight: '500' },
  bothEyesBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EAF3DE', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
  bothEyesText: { fontSize: 13, color: '#3B6D11', flex: 1, fontWeight: '600' },
  responsePrompt: { fontSize: 14, color: '#1A1C1E', marginTop: 8, marginBottom: 8, fontWeight: '500' },
  choiceBtn: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E4E8', padding: 14, marginVertical: 4 },
  choiceLabel: { fontSize: 14, fontWeight: '500', color: '#1A1C1E' },
  choiceSub: { fontSize: 12, color: '#9EA3AB', marginTop: 2 },
});

export default TestContrastScreen;
