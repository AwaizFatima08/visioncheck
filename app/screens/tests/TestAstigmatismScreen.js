// VisionCheck — Astigmatism Test Screen
// app/screens/tests/TestAstigmatismScreen.js
//
// Tests each eye separately using the fan/starburst chart.
// User reports if any lines appear darker or blurrier than others.
// Viewing distance: 40cm.

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AstigmatismFan from '../../components/charts/AstigmatismFan';
import { getAstigAlert, checkEyeDifference } from '../../engine/alertLogic';
import { getNextTest, getTestProgress } from '../../engine/symptomRouter';
import { strings } from '../../i18n/strings';

const EYES = ['R', 'L'];

const RESPONSES = [
  { key: 'all_equal',   labelEn: 'All lines equally dark and sharp', labelUr: 'تمام لکیریں یکساں گہری اور صاف',   sub: 'Normal' },
  { key: 'slight_diff', labelEn: 'Slight difference between lines',   labelUr: 'لکیروں میں معمولی فرق',              sub: 'Mild concern' },
  { key: 'some_darker', labelEn: 'Some lines clearly darker',          labelUr: 'کچھ لکیریں واضح طور پر زیادہ گہری', sub: 'Possible astigmatism' },
  { key: 'some_blurry', labelEn: 'Some lines blurry or faded',         labelUr: 'کچھ لکیریں دھندلی یا مدھم',         sub: 'Possible astigmatism' },
  { key: 'unsure',      labelEn: 'Not sure',                           labelUr: 'مجھے یقین نہیں',                     sub: 'Mention to doctor' },
];

const TestAstigmatismScreen = ({ navigation, route }) => {
  const { language, ageBand, testQueue, assessmentResults = {} } = route.params;
  const s        = strings[language];
  const isUrdu   = language === 'ur';
  const progress = getTestProgress(testQueue, 'TestAstigmatism');

  const [eyeStep, setEyeStep] = useState(0);
  const [resultR, setResultR] = useState(null);
  const currentEye            = EYES[eyeStep];

  const handleResponse = (responseKey) => {
    if (eyeStep === 0) {
      setResultR(responseKey);
      setEyeStep(1);
    } else {
      const alertR    = getAstigAlert(resultR);
      const alertL    = getAstigAlert(responseKey);
      const diffAlert = checkEyeDifference(alertR, alertL);

      const testResult = {
        testName: 'astigmatism',
        responseR: resultR, responseL: responseKey,
        alertR, alertL, diffAlert,
      };

      const updatedResults = { ...assessmentResults, astigmatism: testResult };
      const nextTest       = getNextTest(testQueue, 'TestAstigmatism');

      if (nextTest) {
        navigation.navigate(nextTest, { language, ageBand, testQueue, assessmentResults: updatedResults });
      } else {
        navigation.navigate('FinalSummary', { language, ageBand, assessmentResults: updatedResults });
      }
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
          {isUrdu ? s.test_astig_name : 'Astigmatism Check'}
        </Text>

        <View style={styles.distanceBadge}>
          <Feather name="smartphone" size={16} color="#1A6FD4" />
          <Text style={styles.distanceText}>
            {isUrdu ? 'فون کو بازو کی لمبائی پر رکھیں — ۴۰ سینٹی میٹر' : 'Hold phone at arm\'s length — 40 cm'}
          </Text>
        </View>

        <View style={styles.coverBadge}>
          <Feather name="eye-off" size={16} color="#854F0B" />
          <Text style={styles.coverText}>{coverLabel}</Text>
        </View>

        <Text style={[styles.currentEyeLabel, isUrdu && styles.rtl]}>
          {isUrdu ? `ٹیسٹ: ${eyeLabel}` : `Testing: ${eyeLabel}`}
        </Text>

        <AstigmatismFan />

        <Text style={[styles.responsePrompt, isUrdu && styles.rtl]}>
          {isUrdu ? 'درمیانی نقطے کو دیکھ کر آپ نے کیا نوٹ کیا؟' : 'Staring at the centre dot, what do you notice?'}
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
  eyeStepRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  eyeStep: { flex: 1, paddingVertical: 6, borderRadius: 8, backgroundColor: '#E2E4E8', alignItems: 'center' },
  eyeStepActive: { backgroundColor: '#1A6FD4' },
  eyeStepText: { fontSize: 13, fontWeight: '500', color: '#5A5D63' },
  eyeStepTextActive: { color: '#FFFFFF' },
  testName: { fontSize: 20, fontWeight: '700', color: '#1A1C1E', marginBottom: 12 },
  distanceBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E8F1FB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8 },
  distanceText: { fontSize: 13, color: '#1A6FD4', flex: 1, fontWeight: '500' },
  coverBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FAEEDA', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
  coverText: { fontSize: 13, color: '#854F0B', flex: 1, fontWeight: '600' },
  currentEyeLabel: { fontSize: 15, fontWeight: '600', color: '#1A1C1E', marginBottom: 4 },
  responsePrompt: { fontSize: 14, color: '#1A1C1E', marginTop: 8, marginBottom: 8, fontWeight: '500' },
  choiceBtn: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E4E8', padding: 14, marginVertical: 4 },
  choiceLabel: { fontSize: 14, fontWeight: '500', color: '#1A1C1E' },
  choiceSub: { fontSize: 12, color: '#9EA3AB', marginTop: 2 },
});

export default TestAstigmatismScreen;
