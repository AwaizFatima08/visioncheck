// VisionCheck — Colour Vision Test Screen
// app/screens/tests/TestColorScreen.js
//
// Both eyes together. 3 colour plates shown one at a time.
// User selects which number they see, or "no number".
// Score tallied across all 3 plates.

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import ColorPlate, { COLOR_PLATES } from '../../components/charts/ColorPlate';
import { getColorAlert } from '../../engine/alertLogic';
import { getNextTest, getTestProgress } from '../../engine/symptomRouter';
import { strings } from '../../i18n/strings';

const TestColorScreen = ({ navigation, route }) => {
  const { language, ageBand, testQueue, assessmentResults = {} } = route.params;
  const s        = strings[language];
  const isUrdu   = language === 'ur';
  const progress = getTestProgress(testQueue, 'TestColor');

  const [plateIndex, setPlateIndex]   = useState(0);
  const [correctCount, setCorrect]    = useState(0);
  const [responses, setResponses]     = useState([]);

  const currentPlate = COLOR_PLATES[plateIndex];
  const totalPlates  = COLOR_PLATES.length;

  // Build answer options for current plate
  // Correct answer + 3 distractors including "no number"
  const getOptions = (plate) => {
    const opts = [
      { key: plate.number,  label: plate.number },
      { key: 'no_number',   label: isUrdu ? 'کوئی نمبر نظر نہیں آتا' : 'No number visible' },
    ];
    // Add two plausible wrong numbers
    const wrong = { '6': ['8', '0'], '29': ['21', '70'], '45': ['43', '15'] };
    (wrong[plate.number] || []).forEach(n => opts.push({ key: n, label: n }));
    // Shuffle options
    return opts.sort(() => Math.random() - 0.5);
  };

  const handleAnswer = (chosenKey) => {
    const isCorrect = chosenKey === currentPlate.number;
    const newCorrect = correctCount + (isCorrect ? 1 : 0);
    const newResponses = [...responses, { plate: plateIndex, chosen: chosenKey, correct: isCorrect }];

    if (plateIndex < totalPlates - 1) {
      setCorrect(newCorrect);
      setResponses(newResponses);
      setPlateIndex(plateIndex + 1);
    } else {
      // All plates done
      const alert = getColorAlert(newCorrect, totalPlates);
      const testResult = {
        testName:    'color',
        correctCount: newCorrect,
        totalPlates,
        responses:   newResponses,
        alert,
        eye:         'both',
      };

      const updatedResults = { ...assessmentResults, color: testResult };
      const nextTest       = getNextTest(testQueue, 'TestColor');

      if (nextTest) {
        navigation.navigate(nextTest, { language, ageBand, testQueue, assessmentResults: updatedResults });
      } else {
        navigation.navigate('FinalSummary', { language, ageBand, assessmentResults: updatedResults });
      }
    }
  };

  const options = getOptions(currentPlate);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.progressRow}>
          {testQueue.map((_, i) => (
            <View key={i} style={[styles.progressDot, i < progress.current && styles.progressDone, i === progress.current && styles.progressCurrent]} />
          ))}
        </View>

        <Text style={[styles.testName, isUrdu && styles.rtl]}>
          {isUrdu ? s.test_color_name : 'Colour Vision Test'}
        </Text>

        {/* Both eyes open */}
        <View style={styles.bothEyesBadge}>
          <Feather name="eye" size={16} color="#3B6D11" />
          <Text style={styles.bothEyesText}>
            {isUrdu ? 'دونوں آنکھیں کھلی رکھیں' : 'Keep BOTH eyes open'}
          </Text>
        </View>

        {/* Plate counter */}
        <Text style={[styles.plateCounter, isUrdu && styles.rtl]}>
          {isUrdu
            ? `تصویر ${plateIndex + 1} از ${totalPlates}`
            : `Plate ${plateIndex + 1} of ${totalPlates}`}
        </Text>

        {/* Plate dots indicator */}
        <View style={styles.plateDotsRow}>
          {COLOR_PLATES.map((_, i) => (
            <View key={i} style={[styles.plateDot, i === plateIndex && styles.plateDotActive, i < plateIndex && styles.plateDotDone]} />
          ))}
        </View>

        {/* Colour plate */}
        <View style={styles.plateWrap}>
          <ColorPlate plateIndex={plateIndex} />
        </View>

        {/* Question */}
        <Text style={[styles.responsePrompt, isUrdu && styles.rtl]}>
          {isUrdu ? 'آپ کو دائرے میں کون سا نمبر نظر آتا ہے؟' : 'What number do you see in the circle?'}
        </Text>

        {/* Answer options */}
        <View style={styles.optionsGrid}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={styles.optionBtn}
              onPress={() => handleAnswer(opt.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.optionLabel, isUrdu && styles.rtl]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

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
  bothEyesBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EAF3DE', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
  bothEyesText: { fontSize: 13, color: '#3B6D11', flex: 1, fontWeight: '600' },
  plateCounter: { fontSize: 13, color: '#5A5D63', marginBottom: 6 },
  plateDotsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  plateDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E2E4E8' },
  plateDotActive: { backgroundColor: '#1A6FD4' },
  plateDotDone: { backgroundColor: '#3B6D11' },
  plateWrap: { alignItems: 'center', marginVertical: 8 },
  responsePrompt: { fontSize: 14, color: '#1A1C1E', marginTop: 12, marginBottom: 10, fontWeight: '500' },
  optionsGrid: { gap: 8 },
  optionBtn: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E4E8', paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center' },
  optionLabel: { fontSize: 16, fontWeight: '600', color: '#1A1C1E' },
});

export default TestColorScreen;
