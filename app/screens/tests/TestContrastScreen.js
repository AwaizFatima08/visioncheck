// VisionCheck — Contrast Sensitivity Test Screen
// app/screens/tests/TestContrastScreen.js
//
// Both eyes together — no eye separation needed.
// Pelli-Robson style: triplets of letters at falling contrast, tapped on a keypad.
// Viewing distance: 40cm.

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import ContrastChart from '../../components/charts/ContrastChart';
import { getContrastAlert } from '../../engine/alertLogic';
import { getTestProgress } from '../../engine/symptomRouter';
import { speakPrompt } from '../../audio/speech';
import { strings } from '../../i18n/strings';
import {
  CONTRAST_LEVELS, SLOAN_LETTERS, randomTriplet, countCorrect, logCSToResponse,
} from '../../engine/contrastLogic';

const TestContrastScreen = ({ navigation, route }) => {
  const { language, ageBand, testQueue, assessmentResults = {} } = route.params;
  const s        = strings[language];
  const isUrdu   = language === 'ur';
  const progress = getTestProgress(testQueue, 'TestContrast');
  const last     = CONTRAST_LEVELS.length - 1;

  const [level,   setLevel]   = useState(0);
  const [letters, setLetters] = useState(() => randomTriplet());
  const [entered, setEntered] = useState([]);

  const instruction = isUrdu
    ? 'تینوں حروف بائیں سے دائیں پڑھیں اور نیچے سے دبائیں۔ حروف آہستہ آہستہ ہلکے ہوتے جائیں گے۔'
    : 'Read the three letters left to right and tap them below. The letters get fainter each time.';

  useEffect(() => {
    const timer = setTimeout(() => speakPrompt(instruction, language), 500);
    return () => clearTimeout(timer);
  }, []);

  const finish = (passedIndex) => {
    const logcs    = passedIndex >= 0 ? CONTRAST_LEVELS[passedIndex].logCS : null;
    const response = logCSToResponse(logcs, ageBand);
    const testResult = {
      testName: 'contrast',
      response,
      alert:    getContrastAlert(response),
      eye:      'both',
      details:  passedIndex >= 0
        ? { logcs, ceiling: passedIndex === last }
        : { below: true },
    };
    navigation.navigate('TestResult', {
      language, ageBand, testQueue,
      assessmentResults: { ...assessmentResults, contrast: testResult },
      currentTest: 'TestContrast',
    });
  };

  // Two of three letters correct passes a level, as in the Pelli-Robson chart
  const evaluate = (answer) => {
    if (countCorrect(letters, answer) >= 2) {
      if (level >= last) { finish(last); return; }
      setLevel(level + 1);
      setLetters(randomTriplet(letters));
      setEntered([]);
    } else {
      finish(level - 1);
    }
  };

  const tapLetter = (letter) => {
    const next = [...entered, letter];
    if (next.length < 3) { setEntered(next); return; }
    evaluate(next);
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
          <Text style={[styles.distanceText, isUrdu && styles.rtl]}>
            {isUrdu ? 'فون کو آنکھوں سے ۴۰ سینٹی میٹر دور رکھیں، اسکرین کی روشنی زیادہ سے زیادہ' : 'Hold the phone about 40 cm away, screen brightness at maximum'}
          </Text>
        </View>

        <View style={styles.bothEyesBadge}>
          <Feather name="eye" size={16} color="#3B6D11" />
          <Text style={[styles.bothEyesText, isUrdu && styles.rtl]}>
            {isUrdu ? 'دونوں آنکھیں کھلی رکھیں' : 'Keep BOTH eyes open'}
          </Text>
        </View>

        <ContrastChart letters={letters} color={CONTRAST_LEVELS[level].color} />

        <Text style={[styles.stepNote, isUrdu && styles.rtl]}>
          {isUrdu ? `مرحلہ ${level + 1} از ${CONTRAST_LEVELS.length}` : `Step ${level + 1} of ${CONTRAST_LEVELS.length}`}
        </Text>

        <View style={styles.slotRow}>
          {[0, 1, 2].map(i => (
            <View key={i} style={styles.slot}>
              <Text style={styles.slotText}>{entered[i] || ''}</Text>
            </View>
          ))}
        </View>

        <View style={styles.keypad}>
          {SLOAN_LETTERS.map(letter => (
            <TouchableOpacity key={letter} style={styles.key} onPress={() => tapLetter(letter)} activeOpacity={0.7}>
              <Text style={styles.keyText}>{letter}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, entered.length === 0 && styles.actionBtnOff]}
            onPress={() => setEntered(entered.slice(0, -1))}
            disabled={entered.length === 0}
            activeOpacity={0.8}
          >
            <Text style={[styles.actionText, isUrdu && styles.urduFont]}>{isUrdu ? 'مٹائیں' : 'Undo'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.cantSeeBtn]} onPress={() => evaluate(entered)} activeOpacity={0.8}>
            <Text style={[styles.actionText, styles.cantSeeText, isUrdu && styles.urduFont]}>
              {isUrdu ? 'نظر نہیں آ رہا' : "Can't see them"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F6F8' },
  content: { padding: 20, paddingTop: 16 },
  rtl: { textAlign: 'right', writingDirection: 'rtl', fontFamily: 'NotoNastaliqUrdu' },
  progressRow: { flexDirection: 'row', gap: 5, marginBottom: 16 },
  progressDot: { flex: 1, height: 3, borderRadius: 2, backgroundColor: '#E2E4E8' },
  progressDone: { backgroundColor: '#3B6D11' },
  progressCurrent: { backgroundColor: '#1A6FD4' },
  testName: { fontSize: 20, fontWeight: '700', color: '#1A1C1E', marginBottom: 12 },
  distanceBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E8F1FB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8 },
  distanceText: { fontSize: 13, color: '#1A6FD4', flex: 1, fontWeight: '500' },
  bothEyesBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EAF3DE', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
  bothEyesText: { fontSize: 13, color: '#3B6D11', flex: 1, fontWeight: '600' },
  stepNote: { fontSize: 11, color: '#9EA3AB', textAlign: 'center', marginTop: -6, marginBottom: 8 },
  slotRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 12 },
  slot: { width: 52, height: 52, borderRadius: 10, borderWidth: 1.5, borderColor: '#1A6FD4', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  slotText: { fontSize: 24, fontWeight: '700', color: '#1A1C1E' },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 12 },
  key: { width: 56, height: 52, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E4E8', alignItems: 'center', justifyContent: 'center' },
  keyText: { fontSize: 20, fontWeight: '700', color: '#1A6FD4' },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#E2E4E8', alignItems: 'center' },
  actionBtnOff: { opacity: 0.4 },
  cantSeeBtn: { backgroundColor: '#FAEEDA' },
  actionText: { fontSize: 14, fontWeight: '600', color: '#1A1C1E' },
  cantSeeText: { color: '#854F0B' },
  urduFont: { fontFamily: 'NotoNastaliqUrdu' },
  responsePrompt: { fontSize: 14, color: '#1A1C1E', marginTop: 8, marginBottom: 8, fontWeight: '500' },
  choiceBtn: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E4E8', padding: 14, marginVertical: 4 },
  choiceLabel: { fontSize: 14, fontWeight: '500', color: '#1A1C1E' },
  choiceSub: { fontSize: 12, color: '#9EA3AB', marginTop: 2 },
});

export default TestContrastScreen;
