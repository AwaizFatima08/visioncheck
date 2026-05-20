// VisionCheck — Splash Screen (Sprint 6 — audio wired)
// app/screens/onboarding/SplashScreen.js

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { getSetting } from '../../database/db';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    Speech.speak('VisionCheck. نظر کا معائنہ۔', {
      language: 'en-US', rate: 0.85, onError: () => {},
    });
    const timer = setTimeout(async () => {
      try {
        const lang       = await getSetting('language');
        const disclaimer = await getSetting('disclaimer_accepted');
        if (!lang)                    navigation.replace('LanguageSelect');
        else if (disclaimer !== 'true') navigation.replace('Disclaimer', { language: lang });
        else                          navigation.replace('MainTabs', { language: lang });
      } catch { navigation.replace('LanguageSelect'); }
    }, 2500);
    return () => { clearTimeout(timer); Speech.stop(); };
  }, []);

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A6FD4" />
      <View style={s.iconWrap}><Feather name="eye" size={56} color="#fff" /></View>
      <Text style={s.appName}>VisionCheck</Text>
      <Text style={s.urduLabel}>نظر کا معائنہ</Text>
      <Text style={s.tagline}>Your personal vision screening tool</Text>
      <Text style={s.taglineUr}>آپ کا ذاتی نظر جانچنے کا آلہ</Text>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#1A6FD4', alignItems:'center', justifyContent:'center', padding:32 },
  iconWrap:  { width:100, height:100, borderRadius:28, backgroundColor:'rgba(255,255,255,0.18)', alignItems:'center', justifyContent:'center', marginBottom:24 },
  appName:   { fontSize:34, fontWeight:'800', color:'#fff', letterSpacing:0.5 },
  urduLabel: { fontSize:22, color:'rgba(255,255,255,0.85)', marginTop:6, marginBottom:16 },
  tagline:   { fontSize:13, color:'rgba(255,255,255,0.65)', textAlign:'center' },
  taglineUr: { fontSize:13, color:'rgba(255,255,255,0.55)', textAlign:'center', marginTop:4 },
});

export default SplashScreen;
