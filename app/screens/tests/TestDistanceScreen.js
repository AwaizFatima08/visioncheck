// VisionCheck — Distance Vision Test Screen (Tumbling E)
// app/screens/tests/TestDistanceScreen.js
//
// Tests each eye separately using the Tumbling E protocol.
// One E shown at a time, random rotation, user taps direction arrow.
// Correct → next smaller row. Wrong → record limit, move to next eye.
// Audio prompt plays on each new E in selected language.
// Viewing distance: 40cm (arm's length).

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import SnellenChart, {
  getRandomRotation,
  ROTATION_DIRECTIONS,
  ALL_ROTATIONS,
} from '../../components/charts/SnellenChart';
import { getDistanceAlert, checkEyeDifference } from '../../engine/alertLogic';
import { getNextTest, getTestProgress } from '../../engine/symptomRouter';
import { speakEPrompt, speakFeedback, speakEyePrompt, speakDistance } from '../../audio/speech';
import { strings } from '../../i18n/strings';

// Map row index to response key for alertLogic
const ROW_TO_RESPONSE = {
  6: 'rows_6_7',  // 20/20
  5: 'rows_6_7',  // 20/30
  4: 'rows_4_5',  // 20/40
  3: 'rows_4_5',  // 20/50
  2: 'rows_1_3',  // 20/70
  1: 'rows_1_3',  // 20/100
  0: 'blurry',    // 20/200 — could not even read largest
};

const EYES = ['R', 'L'];

const TestDistanceScreen = ({ navigation, route }) => {
  const { language, ageBand, testQueue, assessmentResults = {} } = route.params;
  const s        = strings[language];
  const isUrdu   = language === 'ur';
  const progress = getTestProgress(testQueue, 'TestDistance');

  const [eyeStep,   setEyeStep]   = useState(0);  // 0=Right, 1=Left
  const [rowIndex,  setRowIndex]  = useState(0);  // starts large, moves smaller
  const [rotation,  setRotation]  = useState(() => getRandomRotation());
  const [resultR,   setResultR]   = useState(null);
  const [feedback,  setFeedback]  = useState(null); // 'correct' | 'wrong' | null

  const currentEye = EYES[eyeStep];

  // Speak instructions when eye changes or row changes
  useEffect(() => {
    const coverKey = currentEye === 'R' ? 'coverLeft' : 'coverRight';
    speakDistance('arm', language);
    setTimeout(() => speakEyePrompt(coverKey, language), 1800);
    setTimeout(() => speakEPrompt(language), 3600);
  }, [eyeStep]);

  // Speak E prompt on each new row
  useEffect(() => {
    if (rowIndex > 0) {
      setTimeout(() => speakEPrompt(language), 400);
    }
  }, [rowIndex, rotation]);

  const handleDirection = useCallback((tappedRotation) => {
    const isCorrect = tappedRotation === rotation;
    speakFeedback(isCorrect, language);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    setTimeout(() => {
      setFeedback(null);

      if (isCorrect && rowIndex < 6) {
        // Correct — move to next smaller row with new random rotation
        setRowIndex(prev => prev + 1);
        setRotation(getRandomRotation());
      } else {
        // Wrong or reached smallest row — record limit
        const responseKey = isCorrect ? ROW_TO_RESPONSE[6] : ROW_TO_RESPONSE[Math.max(0, rowIndex - 1)];
        finishEye(responseKey);
      }
    }, 600);
  }, [rotation, rowIndex, eyeStep]);

  const finishEye = (responseKey) => {
    if (eyeStep === 0) {
      setResultR(responseKey);
      setEyeStep(1);
      setRowIndex(0);
      setRotation(getRandomRotation());
    } else {
      // Both eyes done
      const alertR    = getDistanceAlert(resultR);
      const alertL    = getDistanceAlert(responseKey);
      const diffAlert = checkEyeDifference(alertR, alertL);

      const testResult = {
        testName:  'distance',
        responseR: resultR,
        responseL: responseKey,
        alertR, alertL, diffAlert,
      };

      const updatedResults = { ...assessmentResults, distance: testResult };
      const nextTest       = getNextTest(testQueue, 'TestDistance');

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

  const questionLabel = isUrdu
    ? 'E کس طرف اشارہ کر رہا ہے؟'
    : 'Which direction is the E pointing?';

  return (
    <SafeAreaView style={styles.safe}>

      {/* Progress bar */}
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
            <Text style={styles.eyeStepIcon}>{eye === 'R' ? '👁' : '👁'}</Text>
            <Text style={[styles.eyeStepText, i === eyeStep && styles.eyeStepTextActive]}>
              {eye === 'R' ? eyeLabelR : eyeLabelL}
            </Text>
          </View>
        ))}
      </View>

      {/* Test name */}
      <Text style={[styles.testName, isUrdu && styles.rtl]}>
        {isUrdu ? 'دور کے نظر کا ٹیسٹ' : 'Distance Vision Test'}
      </Text>

      {/* Distance badge */}
      <View style={styles.distanceBadge}>
        <Text style={styles.badgeIcon}>📱</Text>
        <Text style={styles.distanceText}>
          {isUrdu ? 'فون کو بازو کی لمبائی پر رکھیں — ۴۰ سینٹی میٹر' : 'Arm\'s length — 40 cm'}
        </Text>
      </View>

      {/* Cover eye badge */}
      <View style={styles.coverBadge}>
        <Text style={[styles.coverText, isUrdu && styles.rtl]}>{coverLabel}</Text>
      </View>

      {/* Current eye label */}
      <Text style={[styles.currentEyeLabel, isUrdu && styles.rtl]}>
        {isUrdu ? `ٹیسٹ: ${eyeLabel}` : `Testing: ${eyeLabel}`}
      </Text>

      {/* Tumbling E chart */}
      <SnellenChart rowIndex={rowIndex} rotation={rotation} />

      {/* Feedback flash */}
      {feedback && (
        <View style={[styles.feedbackBadge, feedback === 'correct' ? styles.feedbackOk : styles.feedbackWrong]}>
          <Text style={styles.feedbackText}>
            {feedback === 'correct'
              ? (isUrdu ? '✓ درست' : '✓ Correct')
              : (isUrdu ? '↩ اگلا' : '↩ Moving on')}
          </Text>
        </View>
      )}

      {/* Direction question */}
      <Text style={[styles.questionLabel, isUrdu && styles.rtl]}>{questionLabel}</Text>

      {/* Direction buttons — 3x3 grid with centre blank */}
      <View style={styles.directionGrid}>
        {/* Top row */}
        <View style={styles.dirRow}>
          <View style={styles.dirBlank} />
          <DirectionBtn rotation={270} isUrdu={isUrdu} onPress={handleDirection} />
          <View style={styles.dirBlank} />
        </View>
        {/* Middle row */}
        <View style={styles.dirRow}>
          <DirectionBtn rotation={180} isUrdu={isUrdu} onPress={handleDirection} />
          <View style={styles.dirCenter}>
            <Text style={styles.dirCenterE}>E</Text>
          </View>
          <DirectionBtn rotation={0} isUrdu={isUrdu} onPress={handleDirection} />
        </View>
        {/* Bottom row */}
        <View style={styles.dirRow}>
          <View style={styles.dirBlank} />
          <DirectionBtn rotation={90} isUrdu={isUrdu} onPress={handleDirection} />
          <View style={styles.dirBlank} />
        </View>
      </View>

      {/* Audio replay button */}
      <TouchableOpacity style={styles.audioBtn} onPress={() => speakEPrompt(language)}>
        <Feather name="volume-2" size={18} color="#1A6FD4" />
        <Text style={styles.audioBtnText}>
          {isUrdu ? 'دوبارہ سنیں' : 'Replay audio'}
        </Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
};

// ─── Direction Button Component ───────────────────────────────────────────────
const DirectionBtn = ({ rotation, isUrdu, onPress }) => {
  const dir = ROTATION_DIRECTIONS[rotation];
  return (
    <TouchableOpacity
      style={styles.dirBtn}
      onPress={() => onPress(rotation)}
      activeOpacity={0.7}
    >
      <Text style={styles.dirArrow}>{dir.symbol}</Text>
      <Text style={[styles.dirLabel, isUrdu && styles.rtl]}>
        {isUrdu ? dir.labelUr : dir.labelEn}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#F5F6F8', padding: 16, paddingTop: 20 },
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

  testName:       { fontSize: 18, fontWeight: '700', color: '#1A1C1E', marginBottom: 10 },

  distanceBadge:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E8F1FB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 6 },
  badgeIcon:      { fontSize: 16 },
  distanceText:   { fontSize: 13, color: '#1A6FD4', flex: 1, fontWeight: '500' },

  coverBadge:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAEEDA', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8 },
  coverText:      { fontSize: 13, color: '#854F0B', fontWeight: '600', flex: 1 },

  currentEyeLabel:{ fontSize: 14, fontWeight: '600', color: '#1A1C1E', marginBottom: 2 },

  feedbackBadge:  { alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 6, borderRadius: 20, marginBottom: 6 },
  feedbackOk:     { backgroundColor: '#EAF3DE' },
  feedbackWrong:  { backgroundColor: '#FAEEDA' },
  feedbackText:   { fontSize: 14, fontWeight: '600', color: '#1A1C1E' },

  questionLabel:  { fontSize: 15, fontWeight: '600', color: '#1A1C1E', textAlign: 'center', marginBottom: 10 },

  // Direction grid — 3×3
  directionGrid:  { alignSelf: 'center', marginVertical: 4 },
  dirRow:         { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 },
  dirBlank:       { width: 80, height: 80 },
  dirCenter:      { width: 80, height: 80, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F6F8', borderRadius: 12 },
  dirCenterE:     { fontSize: 28, fontWeight: '700', color: '#C0C3CA' },

  dirBtn: {
    width: 80, height: 80,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#1A6FD4',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dirArrow: { fontSize: 26, color: '#1A6FD4' },
  dirLabel: { fontSize: 11, color: '#1A6FD4', fontWeight: '500' },

  audioBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'center', marginTop: 12,
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: '#E8F1FB', borderRadius: 20,
  },
  audioBtnText: { fontSize: 13, color: '#1A6FD4', fontWeight: '500' },
});

export default TestDistanceScreen;
