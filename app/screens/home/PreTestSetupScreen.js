// VisionCheck — Pre-Test Setup Screen (Sprint 6 — audio wired)
// app/screens/home/PreTestSetupScreen.js
//
// Speaks all 4 setup instructions in sequence on load.
// Each instruction spoken with a short pause between.
// Replay button speaks all 4 again.

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { strings } from '../../i18n/strings';

const speak = (text, lang, onDone) => {
  Speech.stop();
  Speech.speak(text, { language: lang === 'ur' ? 'ur-PK' : 'en-US', rate: 0.82, onDone: onDone || (() => {}), onError: () => {} });
};

// Speaks instructions one at a time with pauses between
const speakInSequence = (instructions, lang, index = 0) => {
  if (index >= instructions.length) return;
  speak(instructions[index], lang, () => {
    setTimeout(() => speakInSequence(instructions, lang, index + 1), 700);
  });
};

const SETUP_STEPS = {
  en: [
    { icon:'👓', title:'Remove glasses or contact lenses',  sub:'Test your natural unaided vision' },
    { icon:'☀️', title:'Set screen brightness to maximum',   sub:'Full brightness gives accurate results' },
    { icon:'💡', title:'Find a well-lit room',               sub:'No glare or reflections on screen' },
    { icon:'🤚', title:'Cover one eye with your palm',        sub:'Do not press on the eye' },
  ],
  ur: [
    { icon:'👓', title:'عینک یا کانٹیکٹ لینز اتار دیں',    sub:'اپنی قدرتی بینائی جانچیں' },
    { icon:'☀️', title:'اسکرین کی روشنی زیادہ سے زیادہ کریں', sub:'پوری روشنی سے درست نتائج ملتے ہیں' },
    { icon:'💡', title:'روشن کمرے میں بیٹھیں',              sub:'اسکرین پر چمک یا عکس نہ ہو' },
    { icon:'🤚', title:'ایک آنکھ ہتھیلی سے ڈھانپیں',        sub:'آنکھ پر دباؤ نہ ڈالیں' },
  ],
};

const PreTestSetupScreen = ({ navigation, route }) => {
  const { language, ageBand, testQueue } = route.params;
  const s      = strings[language];
  const isUrdu = language === 'ur';
  const steps  = SETUP_STEPS[language] || SETUP_STEPS.en;

  const speakAll = () => {
    const instructions = steps.map(st => st.title + '. ' + st.sub);
    speakInSequence(instructions, language);
  };

  useEffect(() => {
    // Speak heading then all instructions
    setTimeout(() => {
      speak(s.setup_title, language, () => {
        setTimeout(() => speakAll(), 800);
      });
    }, 500);
    return () => Speech.stop();
  }, []);

  const getFirstTestScreen = () => {
    const queue = Array.isArray(testQueue) ? testQueue : ['TestDistance','TestNear','TestAstigmatism','TestContrast','TestAmsler','TestColor'];
    return queue[0] || 'TestDistance';
  };

  const proceed = () => {
    speak(isUrdu ? 'ٹیسٹ شروع ہو رہا ہے۔' : 'Starting tests.', language);
    const firstTest = getFirstTestScreen();
    const queue     = Array.isArray(testQueue) ? testQueue : ['TestDistance','TestNear','TestAstigmatism','TestContrast','TestAmsler','TestColor'];
    navigation.navigate(firstTest, {
      language, ageBand,
      testQueue: queue,
      assessmentResults: {},
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name={isUrdu ? 'chevron-right' : 'chevron-left'} size={22} color="#1A6FD4" />
          </TouchableOpacity>
          <Text style={[styles.title, isUrdu && styles.rtl]}>{s.setup_title}</Text>
          <TouchableOpacity onPress={speakAll} style={styles.audioBtn}>
            <Feather name="volume-2" size={20} color="#1A6FD4" />
          </TouchableOpacity>
        </View>

        {/* Steps */}
        {steps.map((step, i) => (
          <TouchableOpacity
            key={i}
            style={styles.stepCard}
            onPress={() => speak(step.title + '. ' + step.sub, language)}
            activeOpacity={0.7}
          >
            <View style={styles.stepNumber}>
              <Text style={styles.stepNum}>{i + 1}</Text>
            </View>
            <Text style={styles.stepIcon}>{step.icon}</Text>
            <View style={styles.stepText}>
              <Text style={[styles.stepTitle, isUrdu && styles.rtl]}>{step.title}</Text>
              <Text style={[styles.stepSub, isUrdu && styles.rtl]}>{step.sub}</Text>
            </View>
            {/* Tap to hear icon */}
            <Feather name="volume-1" size={14} color="#C0C3CA" />
          </TouchableOpacity>
        ))}

        <Text style={[styles.tapHint, isUrdu && styles.rtl]}>
          {isUrdu ? '⬆ کسی بھی قدم کو دبائیں سننے کے لیے' : '⬆ Tap any step to hear it again'}
        </Text>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.readyBtn} onPress={proceed} activeOpacity={0.85}>
          <Text style={styles.readyIcon}>▶</Text>
          <Text style={styles.readyBtnText}>{s.setup_ready}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:       { flex:1, backgroundColor:'#F5F6F8' },
  content:    { padding:20, paddingTop:16 },
  rtl:        { textAlign:'right', writingDirection:'rtl' },
  headerRow:  { flexDirection:'row', alignItems:'center', gap:10, marginTop:28, marginBottom:20 },
  title:      { flex:1, fontSize:20, fontWeight:'700', color:'#1A1C1E' },
  audioBtn:   { padding:4 },
  stepCard:   { flexDirection:'row', alignItems:'flex-start', gap:12, backgroundColor:'#FFFFFF', borderRadius:14, borderWidth:1, borderColor:'#E2E4E8', padding:14, marginVertical:5 },
  stepNumber: { width:24, height:24, borderRadius:12, backgroundColor:'#E8F1FB', alignItems:'center', justifyContent:'center', marginTop:2 },
  stepNum:    { fontSize:12, fontWeight:'700', color:'#1A6FD4' },
  stepIcon:   { fontSize:22, width:30, textAlign:'center', marginTop:2 },
  stepText:   { flex:1 },
  stepTitle:  { fontSize:14, fontWeight:'600', color:'#1A1C1E' },
  stepSub:    { fontSize:12, color:'#9EA3AB', marginTop:2, lineHeight:18 },
  tapHint:    { fontSize:11, color:'#C0C3CA', textAlign:'center', marginTop:12 },
  bottomBar:  { position:'absolute', bottom:0, left:0, right:0, padding:16, backgroundColor:'#F5F6F8', borderTopWidth:1, borderTopColor:'#E2E4E8' },
  readyBtn:   { backgroundColor:'#1A6FD4', borderRadius:12, paddingVertical:14, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10 },
  readyIcon:  { fontSize:16, color:'#fff' },
  readyBtnText:{ color:'#fff', fontSize:16, fontWeight:'600' },
});

export default PreTestSetupScreen;
