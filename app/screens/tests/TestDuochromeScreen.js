// VisionCheck — Duochrome (Red-Green Balance) Test Screen
// app/screens/tests/TestDuochromeScreen.js
//
// Tests each eye separately: which colour makes the black letters look sharper.
// A preference for red or green hints at a focus error (short- or long-sightedness).
// Never urgent on its own. Viewing distance: 40cm.

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import DuochromeChart from '../../components/charts/DuochromeChart';
import { getDuochromeAlert, checkEyeDifference } from '../../engine/alertLogic';
import { getTestProgress } from '../../engine/symptomRouter';
import { speakPrompt, speakEyePrompt } from '../../audio/speech';

const EYES = ['R', 'L'];

const RESPONSES = [
  { key: 'red',    labelEn: 'Letters look clearer on the RED side',   labelUr: 'سرخ طرف کے حروف زیادہ صاف ہیں' },
  { key: 'green',  labelEn: 'Letters look clearer on the GREEN side', labelUr: 'سبز طرف کے حروف زیادہ صاف ہیں' },
  { key: 'equal',  labelEn: 'Both sides look equally clear',          labelUr: 'دونوں طرف برابر صاف ہیں' },
  { key: 'unsure', labelEn: 'Too blurry to tell',                     labelUr: 'بہت دھندلا ہے، فیصلہ نہیں کر سکتا' },
];

const TestDuochromeScreen = ({ navigation, route }) => {
  const { language, ageBand, testQueue, assessmentResults = {} } = route.params;
  const isUrdu   = language === 'ur';
  const progress = getTestProgress(testQueue, 'TestDuochrome');

  const [eyeStep, setEyeStep] = useState(0);
  const [resultR, setResultR] = useState(null);
  const currentEye            = EYES[eyeStep];

  const question = isUrdu
    ? 'کس رنگ پر کالے حروف زیادہ تیز اور صاف نظر آتے ہیں؟'
    : 'On which colour do the black letters look sharper and clearer?';

  useEffect(() => {
    const coverKey = currentEye === 'R' ? 'coverLeft' : 'coverRight';
    speakEyePrompt(coverKey, language);
    const timer = setTimeout(() => speakPrompt(question, language), 1800);
    return () => clearTimeout(timer);
  }, [eyeStep]);

  const handleResponse = (key) => {
    if (eyeStep === 0) {
      setResultR(key);
      setEyeStep(1);
      return;
    }
    const alertR    = getDuochromeAlert(resultR);
    const alertL    = getDuochromeAlert(key);
    const testResult = {
      testName:  'duochrome',
      responseR: resultR,
      responseL: key,
      detailsR:  { side: resultR },
      detailsL:  { side: key },
      alertR, alertL,
      diffAlert: checkEyeDifference(alertR, alertL),
    };
    navigation.navigate('TestResult', {
      language, ageBand, testQueue,
      assessmentResults: { ...assessmentResults, duochrome: testResult },
      currentTest: 'TestDuochrome',
    });
  };

  const eyeLabel   = currentEye === 'R' ? (isUrdu ? 'دائیں آنکھ' : 'Right Eye') : (isUrdu ? 'بائیں آنکھ' : 'Left Eye');
  const coverLabel = currentEye === 'R'
    ? (isUrdu ? '👁 بائیں آنکھ ڈھانپیں' : '👁 Cover LEFT eye')
    : (isUrdu ? '👁 دائیں آنکھ ڈھانپیں' : '👁 Cover RIGHT eye');

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
              <Text style={[styles.eyeStepText, i === eyeStep && styles.eyeStepTextActive, isUrdu && styles.urduFont]}>
                {eye === 'R' ? (isUrdu ? 'دائیں' : 'Right') : (isUrdu ? 'بائیں' : 'Left')}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.testName, isUrdu && styles.rtl]}>
          {isUrdu ? 'سرخ-سبز توازن کا ٹیسٹ' : 'Red-Green Balance Test'}
        </Text>

        <View style={styles.distanceBadge}>
          <Feather name="smartphone" size={16} color="#1A6FD4" />
          <Text style={[styles.distanceText, isUrdu && styles.rtl]}>
            {isUrdu ? 'فون کو آنکھوں سے ۴۰ سینٹی میٹر دور رکھیں' : 'Hold the phone about 40 cm from your eyes'}
          </Text>
        </View>

        <View style={styles.coverBadge}>
          <Text style={[styles.coverText, isUrdu && styles.rtl]}>{coverLabel}</Text>
        </View>

        <Text style={[styles.currentEyeLabel, isUrdu && styles.rtl]}>
          {isUrdu ? `ٹیسٹ: ${eyeLabel}` : `Testing: ${eyeLabel}`}
        </Text>

        <DuochromeChart />

        <Text style={[styles.responsePrompt, isUrdu && styles.rtl]}>{question}</Text>

        {RESPONSES.map((r) => (
          <TouchableOpacity key={r.key} style={styles.choiceBtn} onPress={() => handleResponse(r.key)} activeOpacity={0.8}>
            <Text style={[styles.choiceLabel, isUrdu && styles.rtl]}>{isUrdu ? r.labelUr : r.labelEn}</Text>
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
  rtl: { textAlign: 'right', writingDirection: 'rtl', fontFamily: 'NotoNastaliqUrdu' },
  urduFont: { fontFamily: 'NotoNastaliqUrdu' },
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
  distanceBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E8F1FB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8 },
  distanceText: { fontSize: 13, color: '#1A6FD4', flex: 1, fontWeight: '500' },
  coverBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAEEDA', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
  coverText: { fontSize: 13, color: '#854F0B', flex: 1, fontWeight: '600' },
  currentEyeLabel: { fontSize: 15, fontWeight: '600', color: '#1A1C1E', marginBottom: 4 },
  responsePrompt: { fontSize: 14, color: '#1A1C1E', marginTop: 4, marginBottom: 8, fontWeight: '500' },
  choiceBtn: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E4E8', padding: 14, marginVertical: 4 },
  choiceLabel: { fontSize: 14, fontWeight: '500', color: '#1A1C1E' },
});

export default TestDuochromeScreen;
