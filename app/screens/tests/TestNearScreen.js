// VisionCheck — Near Vision Test Screen
// app/screens/tests/TestNearScreen.js
//
// Language-aware: shows Urdu text chart when language='ur', English when 'en'.
// Tests each eye separately. Age-adjusted alert logic.
// Audio prompts on screen load in selected language.
// Viewing distance: 30cm.

import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  ScrollView, StyleSheet, SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import NearVisionChart from '../../components/charts/NearVisionChart';
import { getNearAlert, checkEyeDifference } from '../../engine/alertLogic';
import { getNextTest, getTestProgress } from '../../engine/symptomRouter';
import { speakEyePrompt, speakDistance, speakPrompt } from '../../audio/speech';
import { strings } from '../../i18n/strings';

const EYES = ['R', 'L'];

const RESPONSES = {
  en: [
    { key: 'all_4',      label: 'All 4 lines clearly read', icon: '✓✓✓✓', sub: 'Normal' },
    { key: 'rows_1_3',   label: 'Top 3 lines only',          icon: '✓✓✓ ·', sub: 'Slight difficulty' },
    { key: 'rows_1_2',   label: 'Top 2 lines only',          icon: '✓✓ · ·', sub: 'Moderate difficulty' },
    { key: 'row_1_only', label: 'Top line only or blurry',   icon: '✓ · · ·', sub: 'Significant difficulty' },
  ],
  ur: [
    { key: 'all_4',      label: 'چاروں لائنیں صاف پڑھیں',      icon: '✓✓✓✓', sub: 'معمول' },
    { key: 'rows_1_3',   label: 'صرف اوپر کی ۳ لائنیں',         icon: '✓✓✓ ·', sub: 'معمولی دشواری' },
    { key: 'rows_1_2',   label: 'صرف اوپر کی ۲ لائنیں',         icon: '✓✓ · ·', sub: 'درمیانی دشواری' },
    { key: 'row_1_only', label: 'صرف پہلی لائن یا سب دھندلا',  icon: '✓ · · ·', sub: 'زیادہ دشواری' },
  ],
};

const TestNearScreen = ({ navigation, route }) => {
  const { language, ageBand, testQueue, assessmentResults = {} } = route.params;
  const s        = strings[language];
  const isUrdu   = language === 'ur';
  const progress = getTestProgress(testQueue, 'TestNear');
  const responses = RESPONSES[language] || RESPONSES.en;

  const [eyeStep, setEyeStep] = useState(0);
  const [resultR, setResultR] = useState(null);
  const currentEye = EYES[eyeStep];

  // Audio on eye change
  useEffect(() => {
    const coverKey = currentEye === 'R' ? 'coverLeft' : 'coverRight';
    speakDistance('reading', language);
    setTimeout(() => speakEyePrompt(coverKey, language), 1800);
    setTimeout(() => {
      const prompt = isUrdu
        ? 'سب سے چھوٹا متن پڑھیں جو آپ کو صاف نظر آئے۔'
        : 'Read the smallest text you can clearly see.';
      speakPrompt(prompt, language);
    }, 3600);
  }, [eyeStep]);

  // Presbyopia context for 40+
  const showPresbyNote = ageBand === 'middle' || ageBand === 'senior';
  const presbyNote = isUrdu
    ? '۴۰ سال کے بعد قریب کا پڑھنا مشکل ہونا عام ہے'
    : 'Some near difficulty after age 40 is normal';

  const handleResponse = (responseKey) => {
    if (eyeStep === 0) {
      setResultR(responseKey);
      setEyeStep(1);
    } else {
      const alertR    = getNearAlert(resultR, ageBand);
      const alertL    = getNearAlert(responseKey, ageBand);
      const diffAlert = checkEyeDifference(alertR, alertL);

      const testResult = {
        testName:  'near',
        responseR: resultR, responseL: responseKey,
        alertR, alertL, diffAlert, ageBand,
      };

      const updatedResults = { ...assessmentResults, near: testResult };
      const nextTest       = getNextTest(testQueue, 'TestNear');

      if (nextTest) {
        navigation.navigate(nextTest, { language, ageBand, testQueue, assessmentResults: updatedResults });
      } else {
        navigation.navigate('FinalSummary', { language, ageBand, assessmentResults: updatedResults });
      }
    }
  };

  const eyeLabelR  = isUrdu ? 'دائیں آنکھ' : 'Right Eye';
  const eyeLabelL  = isUrdu ? 'بائیں آنکھ' : 'Left Eye';
  const eyeLabel   = currentEye === 'R' ? eyeLabelR : eyeLabelL;
  const coverLabel = currentEye === 'R'
    ? (isUrdu ? '👁 بائیں آنکھ ڈھانپیں' : '👁 Cover LEFT eye')
    : (isUrdu ? '👁 دائیں آنکھ ڈھانپیں' : '👁 Cover RIGHT eye');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Progress */}
        <View style={styles.progressRow}>
          {testQueue.map((_, i) => (
            <View key={i} style={[
              styles.progressDot,
              i < progress.current   && styles.progressDone,
              i === progress.current && styles.progressCurrent,
            ]} />
          ))}
        </View>

        {/* Eye step tabs */}
        <View style={styles.eyeStepRow}>
          {EYES.map((eye, i) => (
            <View key={eye} style={[styles.eyeStep, i === eyeStep && styles.eyeStepActive]}>
              <Text style={styles.eyeStepIcon}>👁</Text>
              <Text style={[styles.eyeStepText, i === eyeStep && styles.eyeStepTextActive]}>
                {eye === 'R' ? eyeLabelR : eyeLabelL}
              </Text>
            </View>
          ))}
        </View>

        {/* Test name */}
        <Text style={[styles.testName, isUrdu && styles.rtl]}>
          {isUrdu ? 'قریب کے نظر کا ٹیسٹ' : 'Near Vision Test'}
        </Text>

        {/* Distance badge */}
        <View style={styles.distanceBadge}>
          <Text style={styles.badgeIcon}>📱</Text>
          <Text style={styles.distanceText}>
            {isUrdu ? 'پڑھنے کی دوری — ۳۰ سینٹی میٹر' : 'Reading distance — 30 cm'}
          </Text>
        </View>

        {/* Cover eye badge */}
        <View style={styles.coverBadge}>
          <Text style={[styles.coverText, isUrdu && styles.rtl]}>{coverLabel}</Text>
        </View>

        {/* Presbyopia note */}
        {showPresbyNote && (
          <View style={styles.noteBadge}>
            <Text style={styles.noteIcon}>ℹ️</Text>
            <Text style={[styles.noteText, isUrdu && styles.rtl]}>{presbyNote}</Text>
          </View>
        )}

        {/* Current eye */}
        <Text style={[styles.currentEyeLabel, isUrdu && styles.rtl]}>
          {isUrdu ? `ٹیسٹ: ${eyeLabel}` : `Testing: ${eyeLabel}`}
        </Text>

        {/* Language-aware chart */}
        <NearVisionChart language={language} />

        {/* Audio replay */}
        <TouchableOpacity
          style={styles.audioBtn}
          onPress={() => {
            const p = isUrdu
              ? 'سب سے چھوٹا متن پڑھیں جو آپ کو صاف نظر آئے۔'
              : 'Read the smallest text you can clearly see.';
            speakPrompt(p, language);
          }}
        >
          <Feather name="volume-2" size={16} color="#1A6FD4" />
          <Text style={styles.audioBtnText}>
            {isUrdu ? 'دوبارہ سنیں' : 'Replay audio'}
          </Text>
        </TouchableOpacity>

        {/* Response prompt */}
        <Text style={[styles.responsePrompt, isUrdu && styles.rtl]}>
          {isUrdu ? 'سب سے چھوٹی لائن جو آپ نے صاف پڑھی:' : 'Smallest text read clearly:'}
        </Text>

        {/* Response buttons */}
        {responses.map((r) => (
          <TouchableOpacity
            key={r.key}
            style={styles.choiceBtn}
            onPress={() => handleResponse(r.key)}
            activeOpacity={0.8}
          >
            <View style={styles.choiceRow}>
              <Text style={styles.choiceIcon}>{r.icon}</Text>
              <View style={styles.choiceTextWrap}>
                <Text style={[styles.choiceLabel, isUrdu && styles.rtl]}>{r.label}</Text>
                <Text style={[styles.choiceSub, isUrdu && styles.rtl]}>{r.sub}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#F5F6F8' },
  content: { padding: 20, paddingTop: 16 },
  rtl:     { textAlign: 'right', writingDirection: 'rtl' },

  progressRow:     { flexDirection: 'row', gap: 5, marginBottom: 14 },
  progressDot:     { flex: 1, height: 3, borderRadius: 2, backgroundColor: '#E2E4E8' },
  progressDone:    { backgroundColor: '#3B6D11' },
  progressCurrent: { backgroundColor: '#1A6FD4' },

  eyeStepRow:        { flexDirection: 'row', gap: 8, marginBottom: 12 },
  eyeStep:           { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 10, backgroundColor: '#E2E4E8' },
  eyeStepActive:     { backgroundColor: '#1A6FD4' },
  eyeStepIcon:       { fontSize: 14 },
  eyeStepText:       { fontSize: 13, fontWeight: '500', color: '#5A5D63' },
  eyeStepTextActive: { color: '#FFFFFF' },

  testName:     { fontSize: 18, fontWeight: '700', color: '#1A1C1E', marginBottom: 10 },

  distanceBadge:{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E8F1FB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 6 },
  badgeIcon:    { fontSize: 16 },
  distanceText: { fontSize: 13, color: '#1A6FD4', flex: 1, fontWeight: '500' },

  coverBadge:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAEEDA', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 6 },
  coverText:    { fontSize: 13, color: '#854F0B', fontWeight: '600', flex: 1 },

  noteBadge:    { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#EAF3DE', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 6 },
  noteIcon:     { fontSize: 14 },
  noteText:     { fontSize: 12, color: '#3B6D11', flex: 1, lineHeight: 18 },

  currentEyeLabel: { fontSize: 14, fontWeight: '600', color: '#1A1C1E', marginBottom: 2 },

  audioBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: isUrdu => isUrdu ? 'flex-end' : 'flex-start', marginBottom: 10, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#E8F1FB', borderRadius: 20 },
  audioBtnText: { fontSize: 13, color: '#1A6FD4', fontWeight: '500' },

  responsePrompt: { fontSize: 14, fontWeight: '500', color: '#1A1C1E', marginBottom: 8 },

  choiceBtn:      { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E4E8', padding: 14, marginVertical: 4 },
  choiceRow:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  choiceIcon:     { fontSize: 14, color: '#3B6D11', width: 48 },
  choiceTextWrap: { flex: 1 },
  choiceLabel:    { fontSize: 14, fontWeight: '500', color: '#1A1C1E' },
  choiceSub:      { fontSize: 12, color: '#9EA3AB', marginTop: 2 },
});

export default TestNearScreen;
