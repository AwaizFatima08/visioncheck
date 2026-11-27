// VisionCheck — Eye health risk check
// app/screens/home/RiskCheckScreen.js
//
// Nine quick questions, then a suggested time between eye exams with reasons.
// Answers stay on the phone (settings table). General guidance only.

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { computeRisk } from '../../engine/riskLogic';
import { getSetting, setSetting } from '../../database/db';

const YES_NO = [
  { key: 'yes', en: 'Yes', ur: 'جی ہاں' },
  { key: 'no',  en: 'No',  ur: 'نہیں' },
];

const QUESTIONS = [
  { id: 'age', en: 'Your age group', ur: 'آپ کی عمر',
    options: [
      { key: 'under40', en: '13 – 39', ur: '۱۳ سے ۳۹' },
      { key: '40to54',  en: '40 – 54', ur: '۴۰ سے ۵۴' },
      { key: '55to64',  en: '55 – 64', ur: '۵۵ سے ۶۴' },
      { key: '65plus',  en: '65 or older', ur: '۶۵ یا اس سے زیادہ' },
    ] },
  { id: 'diabetes', en: 'Do you have diabetes?', ur: 'کیا آپ کو ذیابیطس (شوگر) ہے؟',
    options: [
      { key: 'no',     en: 'No',          ur: 'نہیں' },
      { key: 'type1',  en: 'Type 1',      ur: 'ٹائپ ۱' },
      { key: 'type2',  en: 'Type 2',      ur: 'ٹائپ ۲' },
      { key: 'unsure', en: 'Not sure',    ur: 'یقین نہیں' },
    ] },
  { id: 'bp', en: 'Do you have high blood pressure?', ur: 'کیا آپ کو بلڈ پریشر ہے؟', options: YES_NO },
  { id: 'glaucomaFamily', en: 'Has a parent or sibling had glaucoma?', ur: 'کیا والدین یا بہن بھائی کو گلوکوما (کالا پانی) ہوا ہے؟',
    options: [...YES_NO, { key: 'unsure', en: 'Not sure', ur: 'یقین نہیں' }] },
  { id: 'highMyopia', en: 'Do you wear very strong glasses for short-sight (thick lenses)?', ur: 'کیا آپ دور کی نظر کے لیے بہت موٹے شیشوں کی عینک پہنتے ہیں؟', options: YES_NO },
  { id: 'steroids', en: 'Do you take steroids long-term (tablets, inhalers or eye drops)?', ur: 'کیا آپ طویل عرصے سے سٹیرائیڈ (گولیاں، انہیلر یا آنکھ کے قطرے) لیتے ہیں؟', options: YES_NO },
  { id: 'injury', en: 'Have you had an eye injury or eye surgery?', ur: 'کیا آپ کی آنکھ میں چوٹ لگی یا آپریشن ہوا ہے؟', options: YES_NO },
  { id: 'smoker', en: 'Do you smoke?', ur: 'کیا آپ سگریٹ یا حقہ پیتے ہیں؟', options: YES_NO },
  { id: 'lastExam', en: 'When was your last full eye exam?', ur: 'آپ نے آخری بار آنکھوں کا مکمل معائنہ کب کروایا؟',
    options: [
      { key: 'under1', en: 'Within 1 year', ur: '۱ سال کے اندر' },
      { key: '1to2',   en: '1 – 2 years ago', ur: '۱ سے ۲ سال پہلے' },
      { key: 'over2',  en: 'More than 2 years ago', ur: '۲ سال سے زیادہ پہلے' },
      { key: 'never',  en: 'Never', ur: 'کبھی نہیں' },
    ] },
];

const loadSaved = () => {
  try {
    const raw = getSetting('risk_answers');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const RiskCheckScreen = ({ navigation, route }) => {
  const language = route.params?.language || 'en';
  const isUrdu   = language === 'ur';
  const [answers, setAnswers] = useState(loadSaved);
  const [result,  setResult]  = useState(null);

  const complete = QUESTIONS.every(q => answers[q.id]);

  const pick = (id, key) => setAnswers(prev => ({ ...prev, [id]: key }));

  const submit = () => {
    const r = computeRisk(answers);
    try {
      setSetting('risk_answers', JSON.stringify(answers));
      setSetting('risk_exam_months', String(r.months));
    } catch (err) {
      console.error('risk save error:', err);
    }
    setResult(r);
  };

  const startAmsler = () => navigation.navigate('AgeBand', {
    language,
    nextScreen: 'PreTestSetup',
    nextParams: { language, testQueue: ['TestAmsler'] },
  });

  if (result) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => setResult(null)} style={styles.backBtn}>
              <Feather name={isUrdu ? 'chevron-right' : 'chevron-left'} size={22} color="#1A6FD4" />
            </TouchableOpacity>
            <Text style={[styles.title, isUrdu && styles.rtl]}>{isUrdu ? 'آپ کا نتیجہ' : 'Your result'}</Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={[styles.resultLead, isUrdu && styles.rtl]}>
              {isUrdu ? 'مکمل آنکھوں کا معائنہ کروائیں' : 'Have a full eye exam'}
            </Text>
            <Text style={[styles.resultInterval, isUrdu && styles.rtl]}>
              {result.intervalLabel[isUrdu ? 'ur' : 'en']}
            </Text>
          </View>

          {result.overdue && (
            <View style={styles.overdueBox}>
              <Feather name="alert-circle" size={16} color="#854F0B" />
              <Text style={[styles.overdueText, isUrdu && styles.rtl]}>
                {isUrdu
                  ? 'آپ کا معائنہ شاید دیر سے ہے۔ آنکھوں کے ڈاکٹر سے وقت لیں۔'
                  : 'You may be overdue for an exam. Consider booking one with an eye doctor.'}
              </Text>
            </View>
          )}

          <Text style={[styles.sectionLabel, isUrdu && styles.rtl]}>{isUrdu ? 'وجوہات' : 'Why'}</Text>
          {result.reasons.map((r, i) => (
            <View key={i} style={styles.reasonRow}>
              <View style={styles.reasonDot} />
              <Text style={[styles.reasonText, isUrdu && styles.rtl]}>{isUrdu ? r.ur : r.en}</Text>
            </View>
          ))}

          {result.amslerMonthly && (
            <View style={styles.tipBox}>
              <Text style={[styles.tipText, isUrdu && styles.rtl]}>
                {isUrdu
                  ? 'آپ کے لیے ہر مہینے گھر پر جالی (Amsler) ٹیسٹ کرنا مفید ہے۔ یہ مرکزی نظر کی تبدیلی جلد پکڑتا ہے۔'
                  : 'For you, a monthly Amsler grid check at home is worthwhile. It can catch central vision changes early.'}
              </Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={startAmsler} activeOpacity={0.85}>
                <Text style={styles.primaryBtnText}>{isUrdu ? 'جالی ٹیسٹ شروع کریں' : 'Start Amsler grid check'}</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Reminders', { language })} activeOpacity={0.85}>
            <Text style={styles.secondaryBtnText}>{isUrdu ? '🔔 یاد دہانیاں سیٹ کریں' : '🔔 Set reminders'}</Text>
          </TouchableOpacity>

          <Text style={[styles.disclaimer, isUrdu && styles.rtl]}>
            {isUrdu
              ? 'یہ عمومی رہنمائی ہے، تشخیص نہیں۔ اپنے ڈاکٹر کا مشورہ سب سے مقدم ہے۔'
              : 'This is general guidance, not a diagnosis. Your own doctor\'s advice always comes first.'}
          </Text>
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name={isUrdu ? 'chevron-right' : 'chevron-left'} size={22} color="#1A6FD4" />
          </TouchableOpacity>
          <Text style={[styles.title, isUrdu && styles.rtl]}>{isUrdu ? 'آنکھوں کی صحت کا خطرہ' : 'Eye health risk check'}</Text>
        </View>
        <Text style={[styles.intro, isUrdu && styles.rtl]}>
          {isUrdu
            ? 'نو مختصر سوالات۔ آپ کے جواب صرف آپ کے فون پر رہتے ہیں۔'
            : 'Nine short questions. Your answers stay on your phone.'}
        </Text>

        {QUESTIONS.map((q) => (
          <View key={q.id} style={styles.qCard}>
            <Text style={[styles.qText, isUrdu && styles.rtl]}>{isUrdu ? q.ur : q.en}</Text>
            <View style={styles.optRow}>
              {q.options.map((o) => {
                const active = answers[q.id] === o.key;
                return (
                  <TouchableOpacity
                    key={o.key}
                    style={[styles.opt, active && styles.optActive]}
                    onPress={() => pick(q.id, o.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.optText, active && styles.optTextActive, isUrdu && styles.urduFont]}>
                      {isUrdu ? o.ur : o.en}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.primaryBtn, !complete && styles.btnOff]}
          onPress={submit}
          disabled={!complete}
          activeOpacity={0.85}
        >
          <Text style={[styles.primaryBtnText, isUrdu && styles.urduFont]}>{isUrdu ? 'میرا نتیجہ دیکھیں' : 'See my result'}</Text>
        </TouchableOpacity>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: '#F5F6F8' },
  content:  { padding: 20, paddingTop: 16 },
  rtl:      { textAlign: 'right', writingDirection: 'rtl', fontFamily: 'NotoNastaliqUrdu' },
  urduFont: { fontFamily: 'NotoNastaliqUrdu' },
  headerRow:{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  backBtn:  { padding: 4 },
  title:    { fontSize: 20, fontWeight: '700', color: '#1A1C1E', flex: 1 },
  intro:    { fontSize: 13, color: '#5A5D63', marginBottom: 12 },
  qCard:    { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E4E8', padding: 14, marginBottom: 10 },
  qText:    { fontSize: 14, fontWeight: '600', color: '#1A1C1E', marginBottom: 10, lineHeight: 20 },
  optRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opt:      { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5, borderColor: '#C0C3CA', backgroundColor: '#FFFFFF' },
  optActive:{ borderColor: '#1A6FD4', backgroundColor: '#E8F1FB' },
  optText:  { fontSize: 13, color: '#5A5D63', fontWeight: '500' },
  optTextActive: { color: '#1A6FD4', fontWeight: '700' },
  primaryBtn:     { backgroundColor: '#1A6FD4', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  btnOff:   { opacity: 0.4 },
  secondaryBtn:     { backgroundColor: '#E8F1FB', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 10 },
  secondaryBtnText: { color: '#1A6FD4', fontSize: 15, fontWeight: '600' },
  resultCard:    { backgroundColor: '#1A6FD4', borderRadius: 16, padding: 20, marginBottom: 12 },
  resultLead:    { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  resultInterval:{ color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginTop: 4 },
  overdueBox:    { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: '#FAEEDA', borderRadius: 10, padding: 12, marginBottom: 12 },
  overdueText:   { flex: 1, fontSize: 13, color: '#854F0B', fontWeight: '600', lineHeight: 19 },
  sectionLabel:  { fontSize: 12, fontWeight: '700', color: '#9EA3AB', textTransform: 'uppercase', marginTop: 4, marginBottom: 8 },
  reasonRow:     { flexDirection: 'row', gap: 10, marginBottom: 10 },
  reasonDot:     { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1A6FD4', marginTop: 6 },
  reasonText:    { flex: 1, fontSize: 14, color: '#1A1C1E', lineHeight: 21 },
  tipBox:        { backgroundColor: '#EAF3DE', borderRadius: 12, padding: 14, marginTop: 8 },
  tipText:       { fontSize: 13, color: '#3B6D11', lineHeight: 20, fontWeight: '500', marginBottom: 8 },
  disclaimer:    { fontSize: 11, color: '#9EA3AB', marginTop: 16, textAlign: 'center' },
});

export default RiskCheckScreen;
