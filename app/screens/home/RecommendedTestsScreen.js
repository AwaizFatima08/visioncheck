// VisionCheck — Recommended Tests Screen (Sprint 6 — audio wired)
// app/screens/home/RecommendedTestsScreen.js
//
// Shows recommended tests based on symptoms selected.
// Speaks test list on load.
// Option to run recommended tests or all 6.

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { strings } from '../../i18n/strings';

const speak = (text, lang, onDone) => {
  Speech.stop();
  Speech.speak(text, { language: lang === 'ur' ? 'ur-PK' : 'en-US', rate: 0.85, onDone: onDone || (() => {}), onError: () => {} });
};

const ALL_TESTS = ['TestDistance','TestNear','TestAstigmatism','TestContrast','TestAmsler','TestColor'];

const TEST_META = {
  en: {
    TestDistance:    { icon:'🔭', name:'Distance Vision',      sub:'Short-sightedness check' },
    TestNear:        { icon:'📖', name:'Near Vision',           sub:'Long-sightedness & presbyopia' },
    TestAstigmatism: { icon:'〰️', name:'Astigmatism Check',    sub:'Uneven lens curvature' },
    TestContrast:    { icon:'🌫️', name:'Contrast Sensitivity', sub:'Early cataracts indicator' },
    TestAmsler:      { icon:'⊞',  name:'Amsler Grid',           sub:'Central vision & macular health' },
    TestColor:       { icon:'🎨', name:'Colour Vision',         sub:'Colour blindness check' },
  },
  ur: {
    TestDistance:    { icon:'🔭', name:'دور کے نظر کا ٹیسٹ',    sub:'دور کی نظر کمزوری' },
    TestNear:        { icon:'📖', name:'قریب کے نظر کا ٹیسٹ',   sub:'قریب کی نظر اور presbyopia' },
    TestAstigmatism: { icon:'〰️', name:'لکیروں کا ٹیسٹ',       sub:'آنکھ کے عدسے کی بے قاعدگی' },
    TestContrast:    { icon:'🌫️', name:'دھندلا پن کا ٹیسٹ',    sub:'موتیے کی ابتدائی علامت' },
    TestAmsler:      { icon:'⊞',  name:'جالی کا ٹیسٹ',          sub:'مرکزی نظر کی صحت' },
    TestColor:       { icon:'🎨', name:'رنگوں کا ٹیسٹ',          sub:'رنگ پہچاننے کی صلاحیت' },
  },
};

const RecommendedTestsScreen = ({ navigation, route }) => {
  const { language, ageBand, tests, symptoms } = route.params;
  const s      = strings[language];
  const isUrdu = language === 'ur';
  const meta   = TEST_META[language] || TEST_META.en;

  useEffect(() => {
    const countText = isUrdu
      ? `آپ کے لیے ${tests.length} ٹیسٹ تجویز کیے گئے ہیں۔`
      : `${tests.length} test${tests.length > 1 ? 's' : ''} recommended for you.`;
    const namesList = tests.map(t => (meta[t] || {}).name || t).join('. ');
    setTimeout(() => {
      speak(s.recommended_title + '. ' + countText, language, () => {
        setTimeout(() => speak(namesList, language), 800);
      });
    }, 400);
    return () => Speech.stop();
  }, []);

  const startRecommended = () => {
    speak(isUrdu ? 'ٹیسٹ شروع ہو رہے ہیں۔' : 'Starting recommended tests.', language);
    navigation.navigate('PreTestSetup', { language, ageBand, testQueue: tests });
  };

  const startAll = () => {
    speak(isUrdu ? 'تمام ٹیسٹ شروع ہو رہے ہیں۔' : 'Starting all tests.', language);
    navigation.navigate('PreTestSetup', { language, ageBand, testQueue: ALL_TESTS });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name={isUrdu ? 'chevron-right' : 'chevron-left'} size={22} color="#1A6FD4" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={[styles.title, isUrdu && styles.rtl]}>{s.recommended_title}</Text>
            <Text style={[styles.subtitle, isUrdu && styles.rtl]}>{s.recommended_subtitle}</Text>
          </View>
          <TouchableOpacity onPress={() => speak(s.recommended_title, language)}>
            <Feather name="volume-2" size={20} color="#1A6FD4" />
          </TouchableOpacity>
        </View>

        {/* Recommended test list */}
        {tests.map((testKey, i) => {
          const m = meta[testKey] || { icon:'👁', name: testKey, sub:'' };
          return (
            <View key={testKey} style={styles.testRow}>
              <View style={styles.testNumber}>
                <Text style={styles.testNum}>{i + 1}</Text>
              </View>
              <Text style={styles.testIcon}>{m.icon}</Text>
              <View style={styles.testText}>
                <Text style={[styles.testName, isUrdu && styles.rtl]}>{m.name}</Text>
                <Text style={[styles.testSub, isUrdu && styles.rtl]}>{m.sub}</Text>
              </View>
            </View>
          );
        })}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={startRecommended} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>{s.recommended_start}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={startAll} activeOpacity={0.8}>
            <Text style={[styles.secondaryBtnText, isUrdu && styles.rtl]}>{s.recommended_run_all}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:           { flex:1, backgroundColor:'#F5F6F8' },
  content:        { padding:20, paddingTop:16 },
  rtl:            { textAlign:'right', writingDirection:'rtl' },
  headerRow:      { flexDirection:'row', alignItems:'flex-start', gap:10, marginTop:28, marginBottom:16 },
  headerText:     { flex:1 },
  title:          { fontSize:20, fontWeight:'700', color:'#1A1C1E' },
  subtitle:       { fontSize:13, color:'#9EA3AB', marginTop:3 },
  testRow:        { flexDirection:'row', alignItems:'center', gap:12, backgroundColor:'#FFFFFF', borderRadius:12, borderWidth:1, borderColor:'#E2E4E8', padding:14, marginVertical:5 },
  testNumber:     { width:24, height:24, borderRadius:12, backgroundColor:'#E8F1FB', alignItems:'center', justifyContent:'center' },
  testNum:        { fontSize:12, fontWeight:'700', color:'#1A6FD4' },
  testIcon:       { fontSize:20, width:28, textAlign:'center' },
  testText:       { flex:1 },
  testName:       { fontSize:14, fontWeight:'600', color:'#1A1C1E' },
  testSub:        { fontSize:12, color:'#9EA3AB', marginTop:2 },
  actions:        { marginTop:20 },
  primaryBtn:     { backgroundColor:'#1A6FD4', borderRadius:12, paddingVertical:15, alignItems:'center', marginBottom:10 },
  primaryBtnText: { color:'#fff', fontSize:15, fontWeight:'600' },
  secondaryBtn:   { backgroundColor:'#FFFFFF', borderRadius:12, borderWidth:1, borderColor:'#E2E4E8', paddingVertical:13, alignItems:'center' },
  secondaryBtnText:{ fontSize:14, color:'#5A5D63' },
});

export default RecommendedTestsScreen;
