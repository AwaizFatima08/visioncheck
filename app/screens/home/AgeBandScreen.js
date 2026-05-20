// VisionCheck — Age Band Screen (Sprint 6 — audio wired)
// app/screens/home/AgeBandScreen.js
//
// Speaks age group selection prompt on load.
// Speaks selected band name on tap.

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { strings } from '../../i18n/strings';

const speak = (text, lang, onDone) => {
  Speech.stop();
  Speech.speak(text, { language: lang === 'ur' ? 'ur-PK' : 'en-US', rate: 0.85, onDone: onDone || (() => {}), onError: () => {} });
};

const BANDS = {
  en: [
    { key:'child',  label:'Under 13',     icon:'🧒', note:'This app is designed for adults. For children\'s vision, please visit a paediatric eye specialist.' },
    { key:'young',  label:'13 – 40 years', icon:'👤', note:null },
    { key:'middle', label:'40 – 60 years', icon:'👔', note:null },
    { key:'senior', label:'Over 60 years', icon:'🧓', note:null },
  ],
  ur: [
    { key:'child',  label:'۱۳ سال سے کم',     icon:'🧒', note:'یہ ایپ بڑوں کے لیے بنائی گئی ہے۔ بچوں کی بینائی کے لیے بچوں کے آنکھوں کے ماہر سے ملیں۔' },
    { key:'young',  label:'۱۳ سے ۴۰ سال',     icon:'👤', note:null },
    { key:'middle', label:'۴۰ سے ۶۰ سال',     icon:'👔', note:null },
    { key:'senior', label:'۶۰ سال سے زیادہ',  icon:'🧓', note:null },
  ],
};

const AgeBandScreen = ({ navigation, route }) => {
  const { language, nextScreen, nextParams } = route.params;
  const s      = strings[language];
  const isUrdu = language === 'ur';
  const bands  = BANDS[language] || BANDS.en;

  useEffect(() => {
    speak(s.age_band_prompt, language);
    return () => Speech.stop();
  }, []);

  const selectBand = (band) => {
    if (band.key === 'child') {
      speak(band.note, language);
      Alert.alert('', band.note);
      return;
    }
    speak(band.label, language);
    navigation.navigate(nextScreen, { ...nextParams, ageBand: band.key, language });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Back + audio */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name={isUrdu ? 'chevron-right' : 'chevron-left'} size={22} color="#1A6FD4" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => speak(s.age_band_prompt, language)} style={styles.audioBtn}>
            <Feather name="volume-2" size={20} color="#1A6FD4" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.title, isUrdu && styles.rtl]}>{s.age_band_title}</Text>
        <Text style={[styles.subtitle, isUrdu && styles.rtl]}>{s.age_band_subtitle}</Text>
        <Text style={[styles.prompt, isUrdu && styles.rtl]}>{s.age_band_prompt}</Text>

        {bands.map(band => (
          <TouchableOpacity
            key={band.key}
            style={styles.bandBtn}
            onPress={() => selectBand(band)}
            activeOpacity={0.8}
          >
            <Text style={styles.bandIcon}>{band.icon}</Text>
            <Text style={[styles.bandLabel, isUrdu && styles.rtl]}>{band.label}</Text>
            <Feather name={isUrdu ? 'chevron-left' : 'chevron-right'} size={18} color="#C0C3CA" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:     { flex:1, backgroundColor:'#F5F6F8' },
  content:  { padding:20, paddingTop:16 },
  rtl:      { textAlign:'right', writingDirection:'rtl' },
  topBar:   { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:20, marginTop:28 },
  backBtn:  { padding:4 },
  audioBtn: { padding:4 },
  title:    { fontSize:22, fontWeight:'700', color:'#1A1C1E', marginBottom:6 },
  subtitle: { fontSize:14, color:'#5A5D63', marginBottom:4, lineHeight:20 },
  prompt:   { fontSize:15, fontWeight:'600', color:'#1A1C1E', marginTop:16, marginBottom:12 },
  bandBtn:  { flexDirection:'row', alignItems:'center', gap:14, backgroundColor:'#FFFFFF', borderRadius:14, borderWidth:1, borderColor:'#E2E4E8', paddingVertical:16, paddingHorizontal:18, marginVertical:6 },
  bandIcon: { fontSize:24 },
  bandLabel:{ flex:1, fontSize:16, fontWeight:'500', color:'#1A1C1E' },
});

export default AgeBandScreen;
