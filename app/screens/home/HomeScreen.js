// VisionCheck — Home Screen (Sprint 6 — audio wired)
// app/screens/home/HomeScreen.js
//
// Speaks greeting + subtitle on load.
// Audio replay button in header.

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useFocusEffect } from '@react-navigation/native';
import { strings } from '../../i18n/strings';
import { getSetting } from '../../database/db';

const speak = (text, lang, onDone) => {
  Speech.stop();
  Speech.speak(text, { language: lang === 'ur' ? 'ur-PK' : 'en-US', rate: 0.85, onDone: onDone || (() => {}), onError: () => {} });
};

const HomeScreen = ({ navigation, route }) => {
  const [language, setLanguage] = useState(route.params?.language || 'en');
  const isUrdu = language === 'ur';

  useFocusEffect(
    useCallback(() => {
      getSetting('language').then(l => { if (l) setLanguage(l); });
    }, [])
  );

  const s = strings[language];

  const speakWelcome = (lang) => {
    const text = strings[lang];
    speak(text.home_greeting + '. ' + text.home_subtitle, lang);
  };

  useEffect(() => {
    const timer = setTimeout(() => speakWelcome(language), 400);
    return () => { clearTimeout(timer); Speech.stop(); };
  }, [language]);

  const startWithComplaint = () => {
    speak(isUrdu ? 'علامت منتخب کریں' : 'Select your symptom', language);
    navigation.navigate('AgeBand', {
      language,
      nextScreen: 'SymptomSelector',
      nextParams: { language },
    });
  };

  const startFullCheck = () => {
    speak(isUrdu ? 'مکمل معائنہ شروع ہو رہا ہے' : 'Starting full eye check', language);
    navigation.navigate('AgeBand', {
      language,
      nextScreen: 'PreTestSetup',
      nextParams: { language, testQueue: ['TestDistance','TestNear','TestAstigmatism','TestContrast','TestAmsler','TestColor'] },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.greeting, isUrdu && styles.rtl]}>{s.home_greeting}</Text>
            <Text style={[styles.subtitle, isUrdu && styles.rtl]}>{s.home_subtitle}</Text>
          </View>
          <View style={styles.topRight}>
            {/* Audio replay */}
            <TouchableOpacity style={styles.iconBtn} onPress={() => speakWelcome(language)}>
              <Feather name="volume-2" size={20} color="#1A6FD4" />
            </TouchableOpacity>
            {/* App icon */}
            <View style={styles.logoWrap}>
              <Feather name="eye" size={22} color="#1A6FD4" />
            </View>
          </View>
        </View>

        {/* Guest banner */}
        <View style={styles.guestBanner}>
          <Feather name="info" size={14} color="#5A5D63" />
          <Text style={[styles.guestText, isUrdu && styles.rtl]}>{s.home_guest_banner}</Text>
        </View>

        {/* Path A — Complaint */}
        <TouchableOpacity style={styles.mainCard} onPress={startWithComplaint} activeOpacity={0.85}>
          <View style={[styles.cardIcon, { backgroundColor:'#E8F4F0' }]}>
            <Text style={styles.cardIconEmoji}>🔍</Text>
          </View>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, isUrdu && styles.rtl]}>{s.home_start_complaint}</Text>
            <Text style={[styles.cardSub, isUrdu && styles.rtl]}>{s.home_start_complaint_sub}</Text>
          </View>
          <Feather name={isUrdu ? 'chevron-left' : 'chevron-right'} size={20} color="#C0C3CA" />
        </TouchableOpacity>

        {/* Path B — Full check */}
        <TouchableOpacity style={[styles.mainCard, styles.primaryCard]} onPress={startFullCheck} activeOpacity={0.85}>
          <View style={[styles.cardIcon, { backgroundColor:'rgba(255,255,255,0.22)' }]}>
            <Text style={styles.cardIconEmoji}>👁</Text>
          </View>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, styles.cardTitleWhite, isUrdu && styles.rtl]}>{s.home_start_full}</Text>
            <Text style={[styles.cardSub, styles.cardSubWhite, isUrdu && styles.rtl]}>{s.home_start_full_sub}</Text>
          </View>
          <Feather name={isUrdu ? 'chevron-left' : 'chevron-right'} size={20} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>

        {/* Tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={[styles.tipText, isUrdu && styles.rtl]}>
            {isUrdu
              ? 'بہترین نتائج کے لیے اچھی روشنی میں ٹیسٹ دیں اور اسکرین کی روشنی زیادہ سے زیادہ رکھیں'
              : 'For best results test in good lighting with screen brightness at maximum'}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:           { flex:1, backgroundColor:'#F5F6F8' },
  content:        { padding:20, paddingTop:52 },
  rtl:            { textAlign:'right', writingDirection:'rtl' },
  topBar:         { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 },
  topRight:       { flexDirection:'row', alignItems:'center', gap:10 },
  greeting:       { fontSize:26, fontWeight:'800', color:'#1A1C1E' },
  subtitle:       { fontSize:14, color:'#5A5D63', marginTop:3 },
  iconBtn:        { width:36, height:36, borderRadius:18, backgroundColor:'#E8F1FB', alignItems:'center', justifyContent:'center' },
  logoWrap:       { width:44, height:44, borderRadius:14, backgroundColor:'#E8F1FB', alignItems:'center', justifyContent:'center' },
  guestBanner:    { flexDirection:'row', alignItems:'flex-start', gap:6, backgroundColor:'#F0F1F3', borderRadius:8, padding:10, marginBottom:16 },
  guestText:      { flex:1, fontSize:12, color:'#5A5D63', lineHeight:17 },
  mainCard:       { flexDirection:'row', alignItems:'center', gap:14, backgroundColor:'#FFFFFF', borderRadius:16, borderWidth:1, borderColor:'#E2E4E8', padding:16, marginVertical:6 },
  primaryCard:    { backgroundColor:'#1A6FD4', borderColor:'#1A6FD4' },
  cardIcon:       { width:48, height:48, borderRadius:12, alignItems:'center', justifyContent:'center' },
  cardIconEmoji:  { fontSize:22 },
  cardText:       { flex:1 },
  cardTitle:      { fontSize:15, fontWeight:'700', color:'#1A1C1E' },
  cardTitleWhite: { color:'#fff' },
  cardSub:        { fontSize:12, color:'#5A5D63', marginTop:2, lineHeight:17 },
  cardSubWhite:   { color:'rgba(255,255,255,0.75)' },
  tipCard:        { flexDirection:'row', gap:8, alignItems:'flex-start', backgroundColor:'#E8F1FB', borderRadius:10, padding:12, marginTop:10 },
  tipIcon:        { fontSize:16 },
  tipText:        { flex:1, fontSize:12, color:'#1A6FD4', lineHeight:18 },
});

export default HomeScreen;
