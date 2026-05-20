// VisionCheck — Individual Test Result Screen
// app/screens/results/TestResultScreen.js
//
// Shown after each individual test completes.
// Shows what was found, plain language explanation, alert level.
// Urgent results (Amsler) show a prominent warning with doctor instruction.
// Bilingual — English and Urdu.

import React, { useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  ScrollView, StyleSheet, SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ALERT, ALERT_STYLE } from '../../engine/alertLogic';
import { getNextTest, getTestProgress } from '../../engine/symptomRouter';
import { speakPrompt } from '../../audio/speech';

// ─── Plain language explanations per test and alert level ────────────────────
const EXPLANATIONS = {
  en: {
    distance: {
      green:  { title: 'Distance vision appears normal',     body: 'You were able to read small letters at arm\'s length. This suggests your distance vision is within normal range.' },
      yellow: { title: 'Slight difficulty at distance',      body: 'You had some difficulty reading smaller letters. This may suggest mild short-sightedness (myopia). Worth checking with a doctor.' },
      red:    { title: 'Difficulty seeing at distance',      body: 'You could only read larger letters at arm\'s length. This suggests possible short-sightedness (myopia). Please see an eye doctor.' },
    },
    near: {
      green:  { title: 'Near vision appears normal',         body: 'You were able to read small text at reading distance. Your near vision is within normal range.' },
      yellow: { title: 'Slight difficulty reading close up', body: 'You had some difficulty with smaller text. This may suggest long-sightedness (hyperopia) or age-related reading difficulty (presbyopia).' },
      red:    { title: 'Difficulty reading close up',        body: 'You could only read larger text clearly. This may suggest long-sightedness or presbyopia. Please see an eye doctor.' },
    },
    astigmatism: {
      green:  { title: 'No astigmatism signs found',         body: 'All lines on the fan chart appeared equally dark and sharp. This suggests no significant astigmatism.' },
      yellow: { title: 'Slight unevenness noticed',          body: 'Some lines appeared slightly different. This may suggest mild astigmatism. Worth discussing with an eye doctor.' },
      red:    { title: 'Possible astigmatism detected',      body: 'Some lines appeared clearly darker or blurrier than others. This is a common sign of astigmatism. Please see an eye doctor.' },
    },
    contrast: {
      green:  { title: 'Contrast sensitivity appears normal', body: 'You could read all levels of faded text. Your ability to see in low contrast conditions appears normal.' },
      yellow: { title: 'Mild contrast difficulty',            body: 'You had some difficulty with fainter text. This can be an early sign of cataracts or other conditions. Worth checking.' },
      red:    { title: 'Reduced contrast sensitivity',        body: 'You could only read strongly contrasted text. This may suggest cataracts or other eye conditions. Please see an eye doctor.' },
    },
    amsler: {
      green:  { title: 'Central vision appears normal',      body: 'The Amsler grid appeared straight and complete. This suggests no obvious central vision distortion.' },
      yellow: { title: 'Some unevenness noticed',            body: 'Some slight irregularities were noticed. Discuss this with your eye doctor at your next visit.' },
      urgent: { title: 'Please see a doctor urgently',       body: 'The grid appeared wavy, distorted, or had missing areas. This can be a sign of macular degeneration or other serious conditions affecting the centre of your vision. Please see an eye doctor within 24 to 48 hours. Do not delay.' },
    },
    color: {
      green:  { title: 'Colour vision appears normal',       body: 'You identified all colour plates correctly. Your colour vision appears normal.' },
      yellow: { title: 'Possible mild colour difficulty',    body: 'You missed one plate. This may suggest a mild colour vision deficiency. Worth discussing with an eye doctor.' },
      red:    { title: 'Colour vision deficiency likely',    body: 'You missed two or more plates. This suggests a colour vision deficiency (colour blindness). An eye doctor can assess this more precisely.' },
    },
  },
  ur: {
    distance: {
      green:  { title: 'دور کی نظر معمول کے مطابق ہے',         body: 'آپ نے بازو کی لمبائی پر چھوٹے حروف پڑھ لیے۔ اس سے لگتا ہے کہ آپ کی دور کی نظر ٹھیک ہے۔' },
      yellow: { title: 'دور کی نظر میں معمولی دشواری',          body: 'آپ کو چھوٹے حروف پڑھنے میں کچھ تکلیف ہوئی۔ یہ ہلکی دور کی نظر کمزوری (myopia) کی علامت ہو سکتی ہے۔' },
      red:    { title: 'دور کی نظر میں دشواری',                 body: 'آپ صرف بڑے حروف پڑھ سکے۔ یہ دور کی نظر کمزوری (myopia) کی علامت ہو سکتی ہے۔ براہ کرم آنکھوں کے ڈاکٹر سے ملیں۔' },
    },
    near: {
      green:  { title: 'قریب کی نظر معمول کے مطابق ہے',        body: 'آپ نے پڑھنے کی دوری پر چھوٹا متن پڑھ لیا۔ آپ کی قریب کی نظر ٹھیک ہے۔' },
      yellow: { title: 'قریب پڑھنے میں معمولی دشواری',          body: 'آپ کو چھوٹے متن میں کچھ تکلیف ہوئی۔ یہ دور کی نظر (hyperopia) یا عمر کے ساتھ آنے والی پڑھنے کی کمزوری (presbyopia) ہو سکتی ہے۔' },
      red:    { title: 'قریب پڑھنے میں دشواری',                 body: 'آپ صرف بڑا متن صاف پڑھ سکے۔ یہ hyperopia یا presbyopia کی علامت ہو سکتی ہے۔ براہ کرم ڈاکٹر سے ملیں۔' },
    },
    astigmatism: {
      green:  { title: 'لکیروں کے ٹیسٹ میں کوئی مسئلہ نہیں',  body: 'جالی کی تمام لکیریں یکساں گہری اور صاف نظر آئیں۔ اس سے لگتا ہے کہ کوئی قابلِ ذکر astigmatism نہیں ہے۔' },
      yellow: { title: 'لکیروں میں معمولی فرق نظر آیا',        body: 'کچھ لکیریں تھوڑی مختلف نظر آئیں۔ یہ ہلکے astigmatism کی علامت ہو سکتی ہے۔ ڈاکٹر سے ذکر کریں۔' },
      red:    { title: 'ممکنہ astigmatism کی علامت',            body: 'کچھ لکیریں واضح طور پر زیادہ گہری یا دھندلی نظر آئیں۔ یہ astigmatism کی عام علامت ہے۔ ڈاکٹر سے ملیں۔' },
    },
    contrast: {
      green:  { title: 'دھندلا پن کا ٹیسٹ معمول کے مطابق',    body: 'آپ نے تمام سطحوں کا متن پڑھ لیا۔ آپ کی contrast sensitivity ٹھیک ہے۔' },
      yellow: { title: 'دھندلا پن میں معمولی دشواری',           body: 'آپ کو ہلکے متن میں کچھ تکلیف ہوئی۔ یہ موتیا (cataract) کی ابتدائی علامت ہو سکتی ہے۔' },
      red:    { title: 'دھندلا پن میں واضح دشواری',             body: 'آپ صرف گہرے متن میں پڑھ سکے۔ یہ موتیا یا دوسری آنکھ کی بیماری کی علامت ہو سکتی ہے۔ ڈاکٹر سے ملیں۔' },
    },
    amsler: {
      green:  { title: 'مرکزی نظر معمول کے مطابق ہے',          body: 'جالی کی تمام لکیریں سیدھی اور مکمل نظر آئیں۔ مرکزی نظر میں کوئی واضح مسئلہ نہیں۔' },
      yellow: { title: 'معمولی بے قاعدگی نوٹ کی گئی',          body: 'کچھ معمولی بے قاعدگی نظر آئی۔ اگلے ڈاکٹر کے دورے میں ذکر کریں۔' },
      urgent: { title: 'فوری ڈاکٹر سے ملیں',                   body: 'جالی کی لکیریں ٹیڑھی، لہردار یا کچھ جگہیں غائب نظر آئیں۔ یہ آنکھ کے مرکز کی بیماری (macular degeneration) کی علامت ہو سکتی ہے۔ براہ کرم ۲۴ سے ۴۸ گھنٹوں میں ڈاکٹر سے ملیں۔ دیر نہ کریں۔' },
    },
    color: {
      green:  { title: 'رنگوں کی پہچان معمول کے مطابق',        body: 'آپ نے تمام رنگوں کی تصاویر درست پہچانیں۔ آپ کی رنگوں کی پہچان ٹھیک ہے۔' },
      yellow: { title: 'رنگوں میں معمولی دشواری',               body: 'آپ ایک تصویر نہ پہچان سکے۔ یہ ہلکی رنگ پہچاننے کی کمزوری کی علامت ہو سکتی ہے۔' },
      red:    { title: 'رنگوں کی پہچان میں کمزوری ممکن',       body: 'آپ دو یا زیادہ تصویریں نہ پہچان سکے۔ یہ color blindness کی علامت ہو سکتی ہے۔ ڈاکٹر سے تصدیق کروائیں۔' },
    },
  },
};

// Get explanation — urgent overrides red for amsler
const getExplanation = (testName, alertLevel, language) => {
  const lang     = EXPLANATIONS[language] || EXPLANATIONS.en;
  const testExp  = lang[testName] || lang.distance;
  const level    = alertLevel === ALERT.URGENT ? 'urgent' : alertLevel;
  return testExp[level] || testExp.green;
};

// Human-readable test names
const TEST_LABELS = {
  en: {
    distance:    'Distance Vision',
    near:        'Near Vision',
    astigmatism: 'Astigmatism Check',
    contrast:    'Contrast Sensitivity',
    amsler:      'Amsler Grid',
    color:       'Colour Vision',
  },
  ur: {
    distance:    'دور کے نظر کا ٹیسٹ',
    near:        'قریب کے نظر کا ٹیسٹ',
    astigmatism: 'لکیروں کا ٹیسٹ',
    contrast:    'دھندلا پن کا ٹیسٹ',
    amsler:      'جالی کا ٹیسٹ',
    color:       'رنگوں کا ٹیسٹ',
  },
};

const TestResultScreen = ({ navigation, route }) => {
  const {
    language, ageBand, testQueue,
    assessmentResults, currentTest,
  } = route.params;

  const isUrdu   = language === 'ur';
  const result   = assessmentResults[currentTest];
  const progress = getTestProgress(testQueue, currentTest);

  // Determine overall alert for this test
  const alertLevels = [
    result?.alertR,
    result?.alertL,
    result?.alert,
    result?.diffAlert,
  ].filter(Boolean);

  const worstAlert = alertLevels.includes(ALERT.URGENT) ? ALERT.URGENT
    : alertLevels.includes(ALERT.RED)    ? ALERT.RED
    : alertLevels.includes(ALERT.YELLOW) ? ALERT.YELLOW
    : ALERT.GREEN;

  const style      = ALERT_STYLE[worstAlert];
  const explanation = getExplanation(currentTest, worstAlert, language);
  const testLabel  = (TEST_LABELS[language] || TEST_LABELS.en)[currentTest];
  const nextTest   = getNextTest(testQueue, currentTest);

  // Speak result on load
  useEffect(() => {
    setTimeout(() => {
      speakPrompt(explanation.title + '. ' + explanation.body, language);
    }, 500);
  }, []);

  const handleNext = () => {
    if (nextTest) {
      navigation.navigate(nextTest, { language, ageBand, testQueue, assessmentResults });
    } else {
      navigation.navigate('FinalSummary', { language, ageBand, assessmentResults });
    }
  };

  const isUrgent = worstAlert === ALERT.URGENT;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Progress */}
        <View style={styles.progressRow}>
          {testQueue.map((_, i) => (
            <View key={i} style={[
              styles.progressDot,
              i <= progress.current  && styles.progressDone,
              i === progress.current && styles.progressCurrent,
            ]} />
          ))}
        </View>

        {/* Test name label */}
        <Text style={[styles.testLabel, isUrdu && styles.rtl]}>{testLabel}</Text>

        {/* Alert banner */}
        <View style={[styles.alertBanner, { backgroundColor: style.bg, borderColor: style.border }]}>
          <View style={styles.alertTitleRow}>
            <Feather name={style.icon} size={22} color={style.text} />
            <Text style={[styles.alertTitle, { color: style.text }, isUrdu && styles.rtl]}>
              {explanation.title}
            </Text>
          </View>
          <Text style={[styles.alertBody, { color: style.text }, isUrdu && styles.rtl]}>
            {explanation.body}
          </Text>
        </View>

        {/* Urgent — prominent doctor instruction */}
        {isUrgent && (
          <View style={styles.urgentBox}>
            <Text style={styles.urgentIcon}>🚨</Text>
            <Text style={[styles.urgentText, isUrdu && styles.rtl]}>
              {isUrdu
                ? 'براہ کرم آج یا کل ماہرِ امراضِ چشم سے ملیں۔ دیر نہ کریں۔'
                : 'Please see an ophthalmologist today or tomorrow. Do not delay.'}
            </Text>
          </View>
        )}

        {/* Per-eye breakdown — if test had separate eyes */}
        {result?.alertR && result?.alertL && (
          <View style={styles.eyeBreakdown}>
            <Text style={[styles.eyeBreakdownTitle, isUrdu && styles.rtl]}>
              {isUrdu ? 'آنکھوں کے مطابق نتائج' : 'Results by eye'}
            </Text>
            <EyeRow
              label={isUrdu ? '👁 دائیں آنکھ' : '👁 Right Eye'}
              alertLevel={result.alertR}
              isUrdu={isUrdu}
            />
            <EyeRow
              label={isUrdu ? '👁 بائیں آنکھ' : '👁 Left Eye'}
              alertLevel={result.alertL}
              isUrdu={isUrdu}
            />
            {result.diffAlert && (
              <View style={styles.diffNote}>
                <Feather name="alert-circle" size={14} color="#854F0B" />
                <Text style={[styles.diffNoteText, isUrdu && styles.rtl]}>
                  {isUrdu
                    ? 'دونوں آنکھوں کے درمیان واضح فرق — ڈاکٹر کو بتائیں'
                    : 'Significant difference between eyes — mention to your doctor'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Colour test score */}
        {currentTest === 'color' && result?.correctCount !== undefined && (
          <View style={styles.scoreBox}>
            <Text style={[styles.scoreLabel, isUrdu && styles.rtl]}>
              {isUrdu ? 'درست جوابات' : 'Correct answers'}
            </Text>
            <Text style={styles.scoreValue}>
              {result.correctCount} / {result.totalPlates}
            </Text>
          </View>
        )}

        {/* Audio replay */}
        <TouchableOpacity
          style={styles.audioBtn}
          onPress={() => speakPrompt(explanation.title + '. ' + explanation.body, language)}
        >
          <Feather name="volume-2" size={16} color="#1A6FD4" />
          <Text style={styles.audioBtnText}>
            {isUrdu ? 'دوبارہ سنیں' : 'Replay result'}
          </Text>
        </TouchableOpacity>

        {/* Next button */}
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.nextBtnText}>
            {nextTest
              ? (isUrdu ? 'اگلا ٹیسٹ ←' : 'Next test →')
              : (isUrdu ? 'حتمی نتائج دیکھیں ←' : 'View final summary →')}
          </Text>
        </TouchableOpacity>

        {/* Disclaimer reminder */}
        <Text style={[styles.disclaimer, isUrdu && styles.rtl]}>
          {isUrdu
            ? 'یہ طبی تشخیص نہیں ہے — ڈاکٹر سے تصدیق ضروری ہے'
            : 'This is not a medical diagnosis — professional confirmation required'}
        </Text>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Eye Row Component ────────────────────────────────────────────────────────
const EyeRow = ({ label, alertLevel, isUrdu }) => {
  const style = ALERT_STYLE[alertLevel] || ALERT_STYLE[ALERT.GREEN];
  return (
    <View style={eyeRowStyles.row}>
      <Text style={[eyeRowStyles.label, isUrdu && { textAlign: 'right' }]}>{label}</Text>
      <View style={[eyeRowStyles.pill, { backgroundColor: style.bg, borderColor: style.border }]}>
        <Feather name={style.icon} size={12} color={style.text} />
        <Text style={[eyeRowStyles.pillText, { color: style.text }]}>
          {alertLevel.toUpperCase()}
        </Text>
      </View>
    </View>
  );
};

const eyeRowStyles = StyleSheet.create({
  row:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E2E4E8' },
  label:    { fontSize: 14, color: '#1A1C1E', flex: 1 },
  pill:     { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  pillText: { fontSize: 11, fontWeight: '600' },
});

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#F5F6F8' },
  content: { padding: 20, paddingTop: 16 },
  rtl:     { textAlign: 'right', writingDirection: 'rtl' },

  progressRow:     { flexDirection: 'row', gap: 5, marginBottom: 16 },
  progressDot:     { flex: 1, height: 3, borderRadius: 2, backgroundColor: '#E2E4E8' },
  progressDone:    { backgroundColor: '#3B6D11' },
  progressCurrent: { backgroundColor: '#1A6FD4' },

  testLabel: { fontSize: 13, fontWeight: '600', color: '#9EA3AB', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },

  alertBanner: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12 },
  alertTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  alertTitle: { fontSize: 17, fontWeight: '700', flex: 1, lineHeight: 24 },
  alertBody:  { fontSize: 14, lineHeight: 22 },

  urgentBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#FCEBEB', borderRadius: 12, borderWidth: 1, borderColor: '#F7C1C1', padding: 14, marginBottom: 12 },
  urgentIcon:{ fontSize: 20 },
  urgentText:{ flex: 1, fontSize: 14, color: '#A32D2D', fontWeight: '600', lineHeight: 22 },

  eyeBreakdown:      { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E4E8', padding: 14, marginBottom: 12 },
  eyeBreakdownTitle: { fontSize: 13, fontWeight: '600', color: '#5A5D63', marginBottom: 8 },

  diffNote:     { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 8, backgroundColor: '#FAEEDA', borderRadius: 8, padding: 10 },
  diffNoteText: { flex: 1, fontSize: 12, color: '#854F0B', lineHeight: 18 },

  scoreBox:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E4E8', padding: 14, marginBottom: 12 },
  scoreLabel: { fontSize: 14, color: '#1A1C1E', fontWeight: '500' },
  scoreValue: { fontSize: 22, fontWeight: '700', color: '#1A6FD4' },

  audioBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginBottom: 16, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#E8F1FB', borderRadius: 20 },
  audioBtnText: { fontSize: 13, color: '#1A6FD4', fontWeight: '500' },

  nextBtn:     { backgroundColor: '#1A6FD4', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginBottom: 12 },
  nextBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

  disclaimer: { fontSize: 11, color: '#9EA3AB', textAlign: 'center', lineHeight: 16 },
});

export default TestResultScreen;
