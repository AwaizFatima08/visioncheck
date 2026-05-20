// VisionCheck — Amsler Grid Test Screen
// app/screens/tests/TestAmslerScreen.js
//
// Tests each eye separately for macular degeneration and central vision distortion.
// ANY abnormal response triggers URGENT alert — overrides all other results.
// Viewing distance: 30cm.

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AmslerGrid from '../../components/charts/AmslerGrid';
import { getAmslerAlert, ALERT, checkEyeDifference } from '../../engine/alertLogic';
import { getNextTest, getTestProgress } from '../../engine/symptomRouter';
import { strings } from '../../i18n/strings';

const EYES = ['R', 'L'];

const RESPONSES = [
  { key: 'all_straight', labelEn: 'All lines straight and complete', labelUr: 'تمام لکیریں سیدھی اور مکمل ہیں',       sub: 'Normal' },
  { key: 'wavy',         labelEn: 'Some lines appear wavy or bent',  labelUr: 'کچھ لکیریں لہردار یا ٹیڑھی لگتی ہیں',  sub: 'Seek urgent review' },
  { key: 'missing',      labelEn: 'Some areas appear blank/missing', labelUr: 'کچھ جگہیں خالی یا غائب لگتی ہیں',       sub: 'Seek urgent review' },
  { key: 'distorted',    labelEn: 'Lines appear uneven or distorted',labelUr: 'لکیریں بے قاعدہ یا مسخ شدہ لگتی ہیں',   sub: 'Seek urgent review' },
];

const TestAmslerScreen = ({ navigation, route }) => {
  const { language, ageBand, testQueue, assessmentResults = {} } = route.params;
  const s        = strings[language];
  const isUrdu   = language === 'ur';
  const progress = getTestProgress(testQueue, 'TestAmsler');

  const [eyeStep, setEyeStep] = useState(0);
  const [resultR, setResultR] = useState(null);
  const currentEye            = EYES[eyeStep];

  const handleResponse = (responseKey) => {
    const alertForThis = getAmslerAlert(responseKey);

    // If URGENT on first eye — stop immediately, show urgent warning
    if (alertForThis === ALERT.URGENT && eyeStep === 0) {
      const testResult = {
        testName:  'amsler',
        responseR: responseKey,
        responseL: null,
        alertR:    ALERT.URGENT,
        alertL:    null,
        diffAlert: null,
        stoppedEarly: true,
      };
      const updatedResults = { ...assessmentResults, amsler: testResult };
      navigateNext(updatedResults);
      return;
    }

    if (eyeStep === 0) {
      setResultR(responseKey);
      setEyeStep(1);
    } else {
      const alertR    = getAmslerAlert(resultR);
      const alertL    = alertForThis;
      const diffAlert = checkEyeDifference(alertR, alertL);

      const testResult = {
        testName:  'amsler',
        responseR: resultR, responseL: responseKey,
        alertR, alertL, diffAlert,
      };

      const updatedResults = { ...assessmentResults, amsler: testResult };
      navigateNext(updatedResults);
    }
  };

  const navigateNext = (updatedResults) => {
    const nextTest = getNextTest(testQueue, 'TestAmsler');
    if (nextTest) {
      navigation.navigate(nextTest, { language, ageBand, testQueue, assessmentResults: updatedResults });
    } else {
      navigation.navigate('FinalSummary', { language, ageBand, assessmentResults: updatedResults });
    }
  };

  const eyeLabel   = currentEye === 'R' ? (isUrdu ? 'دائیں آنکھ' : 'Right Eye') : (isUrdu ? 'بائیں آنکھ' : 'Left Eye');
  const coverLabel = currentEye === 'R' ? (isUrdu ? 'بائیں آنکھ ڈھانپیں' : 'Cover your LEFT eye') : (isUrdu ? 'دائیں آنکھ ڈھانپیں' : 'Cover your RIGHT eye');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.progressRow}>
          {testQueue.map((_, i) => (
            <View key={i} style={[styles.progressDot, i < progress.current && styles.progressDone, i === progress.current && styles.progressCurrent]} />
          ))}
        </View>

        <View style={styles.eyeStepRow}>
          {EYES.map((eye, i) => (
            <View key={eye} style={[styles.eyeStep, i === eyeStep && styles.eyeStepActive]}>
              <Text style={[styles.eyeStepText, i === eyeStep && styles.eyeStepTextActive]}>
                {eye === 'R' ? (isUrdu ? 'دائیں' : 'Right') : (isUrdu ? 'بائیں' : 'Left')}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.testName, isUrdu && styles.rtl]}>
          {isUrdu ? s.test_amsler_name : 'Amsler Grid Test'}
        </Text>

        {/* Urgent warning banner */}
        <View style={styles.urgentBanner}>
          <Feather name="alert-triangle" size={16} color="#A32D2D" />
          <Text style={[styles.urgentText, isUrdu && styles.rtl]}>
            {isUrdu
              ? 'اگر لکیریں ٹیڑھی، لہردار یا غائب نظر آئیں تو فوری ڈاکٹر سے ملیں'
              : 'If any lines appear wavy, bent, or missing — see a doctor urgently'}
          </Text>
        </View>

        <View style={styles.distanceBadge}>
          <Feather name="smartphone" size={16} color="#1A6FD4" />
          <Text style={styles.distanceText}>
            {isUrdu ? 'فون کو پڑھنے کی دوری پر رکھیں — ۳۰ سینٹی میٹر' : 'Hold phone at reading distance — 30 cm'}
          </Text>
        </View>

        <View style={styles.coverBadge}>
          <Feather name="eye-off" size={16} color="#854F0B" />
          <Text style={styles.coverText}>{coverLabel}</Text>
        </View>

        <Text style={[styles.currentEyeLabel, isUrdu && styles.rtl]}>
          {isUrdu ? `ٹیسٹ: ${eyeLabel}` : `Testing: ${eyeLabel}`}
        </Text>

        <AmslerGrid />

        <Text style={[styles.responsePrompt, isUrdu && styles.rtl]}>
          {isUrdu
            ? 'درمیانی نقطے کو دیکھتے ہوئے جالی کیسی نظر آئی؟'
            : 'While staring at the centre dot, what did you see?'}
        </Text>

        {RESPONSES.map((r) => (
          <TouchableOpacity
            key={r.key}
            style={[styles.choiceBtn, r.key !== 'all_straight' && styles.choiceBtnWarn]}
            onPress={() => handleResponse(r.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.choiceLabel, isUrdu && styles.rtl]}>{isUrdu ? r.labelUr : r.labelEn}</Text>
            <Text style={[styles.choiceSub, r.key !== 'all_straight' && styles.choiceSubWarn]}>{r.sub}</Text>
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
  eyeStepRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  eyeStep: { flex: 1, paddingVertical: 6, borderRadius: 8, backgroundColor: '#E2E4E8', alignItems: 'center' },
  eyeStepActive: { backgroundColor: '#1A6FD4' },
  eyeStepText: { fontSize: 13, fontWeight: '500', color: '#5A5D63' },
  eyeStepTextActive: { color: '#FFFFFF' },
  testName: { fontSize: 20, fontWeight: '700', color: '#1A1C1E', marginBottom: 10 },
  urgentBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#FCEBEB', borderRadius: 8, borderWidth: 1, borderColor: '#F7C1C1', paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8 },
  urgentText: { fontSize: 12, color: '#A32D2D', flex: 1, lineHeight: 18, fontWeight: '500' },
  distanceBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E8F1FB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8 },
  distanceText: { fontSize: 13, color: '#1A6FD4', flex: 1, fontWeight: '500' },
  coverBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FAEEDA', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
  coverText: { fontSize: 13, color: '#854F0B', flex: 1, fontWeight: '600' },
  currentEyeLabel: { fontSize: 15, fontWeight: '600', color: '#1A1C1E', marginBottom: 4 },
  responsePrompt: { fontSize: 14, color: '#1A1C1E', marginTop: 8, marginBottom: 8, fontWeight: '500' },
  choiceBtn: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E4E8', padding: 14, marginVertical: 4 },
  choiceBtnWarn: { borderColor: '#F7C1C1', backgroundColor: '#FEF8F8' },
  choiceLabel: { fontSize: 14, fontWeight: '500', color: '#1A1C1E' },
  choiceSub: { fontSize: 12, color: '#9EA3AB', marginTop: 2 },
  choiceSubWarn: { color: '#A32D2D' },
});

export default TestAmslerScreen;
