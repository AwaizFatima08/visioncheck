// VisionCheck — Distance Vision Test Screen (Tumbling E)
// app/screens/tests/TestDistanceScreen.js
//
// Tests each eye separately using the Tumbling E protocol.
// One E shown at a time, random rotation, user taps direction arrow.
// Correct → next smaller row. Wrong or "can't see" → record limit, move to next eye.
// Audio prompt plays on each new E in selected language.
// Viewing distance: 40cm (elbow bent, closer than arm's length).

import React, { useState, useEffect } from 'react';
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
import { getTestProgress } from '../../engine/symptomRouter';
import { speakEPrompt, speakFeedback, speakEyePrompt, speakDistance } from '../../audio/speech';
import { strings } from '../../i18n/strings';
import { TEST_SIZES } from '../../engine/dpiCalc';

// Maps the finest row read (as its 20/D denominator) to the alertLogic response key.
// 20/40 or better is a pass. Key names are historical, the bands are by acuity.
const denToResponse = (den) => {
  if (den == null) return 'blurry';
  if (den <= 40)   return 'rows_6_7';
  if (den <= 70)   return 'rows_4_5';
  if (den <= 100)  return 'rows_1_3';
  return 'blurry';
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
  const [rowRight,  setRowRight]  = useState(0);    // correct answers on this row
  const [rowWrong,  setRowWrong]  = useState(0);    // wrong answers on this row
  const [answered,  setAnswered]  = useState(0);    // answers given for this eye

  const currentEye = EYES[eyeStep];

  // Speak instructions when eye changes
  useEffect(() => {
    const coverKey = currentEye === 'R' ? 'coverLeft' : 'coverRight';
    speakDistance('arm', language);
    setTimeout(() => speakEyePrompt(coverKey, language), 1800);
    setTimeout(() => speakEPrompt(language), 3600);
  }, [eyeStep]);

  // Speak the E prompt for every E after the first
  useEffect(() => {
    if (answered > 0) {
      setTimeout(() => speakEPrompt(language), 400);
    }
  }, [answered]);

  // A new E that never repeats the previous direction
  const nextRotation = () => {
    let r = getRandomRotation();
    while (r === rotation) r = getRandomRotation();
    return r;
  };

  // A row is passed with 2 correct and failed with 2 wrong (at most 3 Es per row),
  // which keeps a lucky guess or a single slip from deciding the result.
  const answer = (isCorrect) => {
    const rows = TEST_SIZES.snellen;
    const last = rows.length - 1;
    speakFeedback(isCorrect, language);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    setTimeout(() => {
      setFeedback(null);
      setAnswered(n => n + 1);
      const right = rowRight + (isCorrect ? 1 : 0);
      const wrong = rowWrong + (isCorrect ? 0 : 1);

      if (right >= 2 && rowIndex < last) {
        setRowIndex(rowIndex + 1);
        setRowRight(0);
        setRowWrong(0);
        setRotation(nextRotation());
      } else if (right >= 2 || wrong >= 2) {
        const passedIndex = right >= 2 ? rowIndex : rowIndex - 1;
        const den = passedIndex >= 0 ? rows[passedIndex].den : null;
        finishEye({
          responseKey: denToResponse(den),
          details: {
            acuity: den == null ? null : `20/${den}`,
            logmar: den == null ? null : Math.round(Math.log10(den / 20) * 100) / 100,
          },
        });
      } else {
        setRowRight(right);
        setRowWrong(wrong);
        setRotation(nextRotation());
      }
    }, 600);
  };

  const handleDirection = (tappedRotation) => answer(tappedRotation === rotation);

  const finishEye = ({ responseKey, details }) => {
    if (eyeStep === 0) {
      setResultR({ responseKey, details });
      setEyeStep(1);
      setRowIndex(0);
      setRowRight(0);
      setRowWrong(0);
      setAnswered(0);
      setRotation(getRandomRotation());
    } else {
      // Both eyes done
      const alertR    = getDistanceAlert(resultR.responseKey);
      const alertL    = getDistanceAlert(responseKey);
      const diffAlert = checkEyeDifference(alertR, alertL);

      const testResult = {
        testName:  'distance',
        responseR: resultR.responseKey,
        responseL: responseKey,
        detailsR:  resultR.details,
        detailsL:  details,
        alertR, alertL, diffAlert,
      };

      const updatedResults = { ...assessmentResults, distance: testResult };
      navigation.navigate('TestResult', {
        language, ageBand, testQueue, assessmentResults: updatedResults, currentTest: 'TestDistance',
      });
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
        <Text style={[styles.distanceText, isUrdu && styles.rtl]}>
          {isUrdu ? 'فون کو آنکھوں سے ۴۰ سینٹی میٹر دور رکھیں — کہنی موڑ لیں' : 'About 40 cm from your eyes — bend your elbow'}
        </Text>
      </View>

      {TEST_SIZES.snellen[TEST_SIZES.snellen.length - 1].den > 20 && (
        <Text style={[styles.floorNote, isUrdu && styles.rtl]}>
          {isUrdu
            ? `اس اسکرین پر سب سے باریک لائن ${TEST_SIZES.snellen[TEST_SIZES.snellen.length - 1].acuity} ہے`
            : `Finest row this screen can show: ${TEST_SIZES.snellen[TEST_SIZES.snellen.length - 1].acuity}`}
        </Text>
      )}

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
      <Text style={[styles.trialNote, isUrdu && styles.rtl]}>
        {isUrdu
          ? `حرف ${rowRight + rowWrong + 1} از ۳`
          : `Letter ${rowRight + rowWrong + 1} of up to 3 on this size`}
      </Text>

      {/* Feedback flash */}
      {feedback && (
        <View style={[styles.feedbackBadge, feedback === 'correct' ? styles.feedbackOk : styles.feedbackWrong]}>
          <Text style={[styles.feedbackText, isUrdu && styles.rtl]}>
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
          <TouchableOpacity style={styles.dirCenter} onPress={() => answer(false)} activeOpacity={0.7}>
            <Feather name="eye-off" size={20} color="#854F0B" />
            <Text style={[styles.cantSeeText, isUrdu && styles.rtl]}>
              {isUrdu ? 'نظر نہیں آیا' : "Can't see"}
            </Text>
          </TouchableOpacity>
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
        <Text style={[styles.audioBtnText, isUrdu && styles.rtl]}>
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
  rtl:     { textAlign: 'right', writingDirection: 'rtl', fontFamily: 'NotoNastaliqUrdu' },

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

  trialNote:      { fontSize: 11, color: '#9EA3AB', textAlign: 'center', marginTop: -6, marginBottom: 4 },
  floorNote:      { fontSize: 11, color: '#5A5D63', marginBottom: 6 },

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
  dirCenter:      { width: 80, height: 80, alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#FAEEDA', borderRadius: 12 },
  cantSeeText:    { fontSize: 11, fontWeight: '600', color: '#854F0B', textAlign: 'center' },

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
