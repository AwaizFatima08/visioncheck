// VisionCheck — Symptom Selector Screen (Sprint 6 — audio wired)
// app/screens/home/SymptomSelectorScreen.js
//
// Speaks symptom prompt on load.
// Speaks symptom label when tapped (toggle feedback).
// Speaks recommendation count before proceeding.

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { strings } from '../../i18n/strings';
import { getRecommendedTests } from '../../engine/symptomRouter';

const speak = (text, lang) => {
  Speech.stop();
  Speech.speak(text, { language: lang === 'ur' ? 'ur-PK' : 'en-US', rate: 0.85, onError: () => {} });
};

const SYMPTOMS = {
  en: [
    { key:'far',         icon:'🔭', label:'I cannot see things far away' },
    { key:'near',        icon:'📖', label:'I cannot read close up' },
    { key:'blurry',      icon:'🌫️', label:'Everything looks blurry' },
    { key:'wavy',        icon:'〰️', label:'Lines look wavy or bent' },
    { key:'colours',     icon:'🎨', label:'Colours look washed out' },
    { key:'colour_diff', icon:'🔴', label:'I cannot tell colours apart' },
    { key:'tired',       icon:'😔', label:'My eyes tire quickly when reading' },
    { key:'one_eye',     icon:'👁️', label:'One eye feels different from the other' },
  ],
  ur: [
    { key:'far',         icon:'🔭', label:'دور کی چیزیں نہیں دکھتیں' },
    { key:'near',        icon:'📖', label:'قریب کا پڑھنا مشکل ہے' },
    { key:'blurry',      icon:'🌫️', label:'سب کچھ دھندلا لگتا ہے' },
    { key:'wavy',        icon:'〰️', label:'لکیریں ٹیڑھی یا موڑدار لگتی ہیں' },
    { key:'colours',     icon:'🎨', label:'رنگ پھیکے لگتے ہیں' },
    { key:'colour_diff', icon:'🔴', label:'رنگوں میں فرق نہیں پتہ چلتا' },
    { key:'tired',       icon:'😔', label:'پڑھتے وقت آنکھیں جلدی تھک جاتی ہیں' },
    { key:'one_eye',     icon:'👁️', label:'ایک آنکھ دوسری سے مختلف محسوس ہوتی ہے' },
  ],
};

const SymptomSelectorScreen = ({ navigation, route }) => {
  const { language, ageBand } = route.params;
  const s        = strings[language];
  const isUrdu   = language === 'ur';
  const symptoms = SYMPTOMS[language] || SYMPTOMS.en;
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setTimeout(() => speak(s.symptom_title + '. ' + s.symptom_subtitle, language), 400);
    return () => Speech.stop();
  }, []);

  const toggle = (symptom) => {
    speak(symptom.label, language);
    setSelected(prev =>
      prev.includes(symptom.key)
        ? prev.filter(k => k !== symptom.key)
        : [...prev, symptom.key]
    );
  };

  const proceed = () => {
    if (selected.length === 0) {
      speak(s.symptom_none, language);
      Alert.alert('', s.symptom_none);
      return;
    }
    const tests = getRecommendedTests(selected);
    const countText = isUrdu
      ? `${tests.length} ٹیسٹ تجویز کیے گئے`
      : `${tests.length} test${tests.length > 1 ? 's' : ''} recommended`;
    speak(countText, language);
    navigation.navigate('RecommendedTests', { language, ageBand, tests, symptoms: selected });
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
            <Text style={[styles.title, isUrdu && styles.rtl]}>{s.symptom_title}</Text>
            <Text style={[styles.subtitle, isUrdu && styles.rtl]}>{s.symptom_subtitle}</Text>
          </View>
          <TouchableOpacity onPress={() => speak(s.symptom_title + '. ' + s.symptom_subtitle, language)}>
            <Feather name="volume-2" size={20} color="#1A6FD4" />
          </TouchableOpacity>
        </View>

        {/* Symptom list */}
        {symptoms.map(sym => (
          <TouchableOpacity
            key={sym.key}
            style={[styles.symptomRow, selected.includes(sym.key) && styles.selectedRow]}
            onPress={() => toggle(sym)}
            activeOpacity={0.8}
          >
            <Text style={styles.symptomIcon}>{sym.icon}</Text>
            <Text style={[styles.symptomLabel, isUrdu && styles.rtl, selected.includes(sym.key) && styles.selectedLabel]}>
              {sym.label}
            </Text>
            {selected.includes(sym.key) && (
              <Feather name="check-circle" size={18} color="#1A6FD4" />
            )}
          </TouchableOpacity>
        ))}

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.confirmBtn} onPress={proceed} activeOpacity={0.85}>
          <Text style={styles.confirmBtnText}>{s.symptom_confirm}</Text>
          {selected.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{selected.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:             { flex:1, backgroundColor:'#F5F6F8' },
  content:          { padding:20, paddingTop:16 },
  rtl:              { textAlign:'right', writingDirection:'rtl' },
  headerRow:        { flexDirection:'row', alignItems:'flex-start', gap:10, marginTop:28, marginBottom:16 },
  headerText:       { flex:1 },
  title:            { fontSize:20, fontWeight:'700', color:'#1A1C1E' },
  subtitle:         { fontSize:13, color:'#9EA3AB', marginTop:3 },
  symptomRow:       { flexDirection:'row', alignItems:'center', gap:12, backgroundColor:'#FFFFFF', borderRadius:12, borderWidth:1, borderColor:'#E2E4E8', padding:14, marginVertical:5 },
  selectedRow:      { borderColor:'#1A6FD4', backgroundColor:'#E8F1FB' },
  symptomIcon:      { fontSize:20, width:28, textAlign:'center' },
  symptomLabel:     { flex:1, fontSize:14, color:'#1A1C1E' },
  selectedLabel:    { color:'#1A6FD4', fontWeight:'500' },
  bottomBar:        { position:'absolute', bottom:0, left:0, right:0, padding:16, backgroundColor:'#F5F6F8', borderTopWidth:1, borderTopColor:'#E2E4E8' },
  confirmBtn:       { backgroundColor:'#1A6FD4', borderRadius:12, paddingVertical:14, alignItems:'center', flexDirection:'row', justifyContent:'center', gap:10 },
  confirmBtnText:   { color:'#fff', fontSize:15, fontWeight:'600' },
  countBadge:       { backgroundColor:'rgba(255,255,255,0.3)', borderRadius:12, paddingHorizontal:8, paddingVertical:2 },
  countBadgeText:   { color:'#fff', fontSize:13, fontWeight:'700' },
});

export default SymptomSelectorScreen;
