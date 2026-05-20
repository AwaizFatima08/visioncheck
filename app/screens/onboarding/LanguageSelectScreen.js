// VisionCheck — Language Select Screen (Sprint 6 — audio wired)
// app/screens/onboarding/LanguageSelectScreen.js
//
// Speaks prompt in English then Urdu on load.
// Speaks confirmation when language is selected.

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { setSetting } from '../../database/db';

const speak = (text, lang, onDone) => {
  Speech.stop();
  Speech.speak(text, { language: lang, rate: 0.85, onDone: onDone || (() => {}), onError: () => {} });
};

const LanguageSelectScreen = ({ navigation }) => {

  useEffect(() => {
    // Speak in English first, then Urdu
    speak('Choose your language.', 'en-US', () => {
      setTimeout(() => speak('اپنی زبان منتخب کریں۔', 'ur-PK'), 600);
    });
    return () => Speech.stop();
  }, []);

  const selectLanguage = async (lang) => {
    const confirmText = lang === 'ur'
      ? 'اردو منتخب کی گئی۔'
      : 'English selected.';
    speak(confirmText, lang === 'ur' ? 'ur-PK' : 'en-US');
    await setSetting('language', lang);
    navigation.replace('Disclaimer', { language: lang });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F6F8" />
      <View style={styles.iconWrap}>
        <Feather name="eye" size={40} color="#1A6FD4" />
      </View>
      <Text style={styles.appName}>VisionCheck</Text>
      <Text style={styles.prompt}>Choose your language</Text>
      <Text style={styles.promptUrdu}>اپنی زبان منتخب کریں</Text>

      <TouchableOpacity style={styles.langBtn} onPress={() => selectLanguage('en')} activeOpacity={0.8}>
        <Text style={styles.langBtnText}>English</Text>
        <Text style={styles.langBtnSub}>Continue in English</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.langBtn, styles.langBtnUrdu]} onPress={() => selectLanguage('ur')} activeOpacity={0.8}>
        <Text style={[styles.langBtnText, styles.urduText]}>اردو</Text>
        <Text style={[styles.langBtnSub, styles.urduText]}>اردو میں جاری رکھیں</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container:    { flex:1, backgroundColor:'#F5F6F8', alignItems:'center', justifyContent:'center', padding:28 },
  iconWrap:     { width:72, height:72, borderRadius:20, backgroundColor:'#E8F1FB', alignItems:'center', justifyContent:'center', marginBottom:16 },
  appName:      { fontSize:28, fontWeight:'800', color:'#1A1C1E', marginBottom:24 },
  prompt:       { fontSize:16, color:'#5A5D63', marginBottom:4 },
  promptUrdu:   { fontSize:16, color:'#5A5D63', marginBottom:32 },
  langBtn:      { width:'100%', backgroundColor:'#FFFFFF', borderRadius:14, borderWidth:1, borderColor:'#E2E4E8', paddingVertical:18, paddingHorizontal:20, alignItems:'center', marginVertical:8 },
  langBtnUrdu:  { backgroundColor:'#E8F1FB', borderColor:'#1A6FD4' },
  langBtnText:  { fontSize:20, fontWeight:'700', color:'#1A1C1E' },
  langBtnSub:   { fontSize:13, color:'#5A5D63', marginTop:3 },
  urduText:     { color:'#1A6FD4' },
});

export default LanguageSelectScreen;
