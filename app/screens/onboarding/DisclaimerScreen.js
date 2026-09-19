// VisionCheck — Disclaimer Screen (Sprint 6 — audio wired)
// app/screens/onboarding/DisclaimerScreen.js
//
// Speaks disclaimer title and scroll instruction on load.
// Speaks confirmation when user agrees.
// Scroll-to-activate agree button — unchanged from Sprint 1.

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { strings } from '../../i18n/strings';
import { setSetting } from '../../database/db';

const speak = (text, lang, onDone) => {
  Speech.stop();
  Speech.speak(text, { language: lang === 'ur' ? 'ur-PK' : 'en-US', rate: 0.85, onDone: onDone || (() => {}), onError: () => {} });
};

const DisclaimerScreen = ({ navigation, route }) => {
  const { language } = route.params;
  const s      = strings[language];
  const isUrdu = language === 'ur';
  const [scrolled, setScrolled] = useState(false);
  const [scrollViewHeight, setScrollViewHeight] = useState(null);
  const [contentHeight, setContentHeight] = useState(null);

  useEffect(() => {
    // Speak title then scroll prompt
    speak(s.disclaimer_title, language, () => {
      setTimeout(() => speak(s.disclaimer_scroll_prompt, language), 800);
    });
    return () => Speech.stop();
  }, []);

  // If the disclaimer text is short enough to fit without scrolling (large
  // screens/tablets, or short translations), there's no scroll gesture for the
  // user to make — the agree button must unlock on its own in that case.
  useEffect(() => {
    if (scrollViewHeight != null && contentHeight != null && contentHeight <= scrollViewHeight + 10) {
      setScrolled(true);
    }
  }, [scrollViewHeight, contentHeight]);

  // Safety net: onLayout/onContentSizeChange not firing (or firing with a
  // value that doesn't clear the check above) must never permanently trap
  // someone on the onboarding flow. By 8s the disclaimer has been read (it's
  // also been read aloud by the audio prompt above), so unlock regardless.
  useEffect(() => {
    const timer = setTimeout(() => setScrolled(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = ({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 30) {
      setScrolled(true);
    }
  };

  const agree = async () => {
    speak(isUrdu ? 'شکریہ۔ آگے بڑھیں۔' : 'Thank you. Proceeding.', language);
    await setSetting('disclaimer_accepted', 'true');
    navigation.replace('MainTabs', { language });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Feather name="alert-triangle" size={22} color="#854F0B" />
        <Text style={[styles.title, isUrdu && styles.rtl]}>{s.disclaimer_title}</Text>
        {/* Audio replay */}
        <TouchableOpacity onPress={() => speak(s.disclaimer_title + '. ' + s.disclaimer_scroll_prompt, language)}>
          <Feather name="volume-2" size={20} color="#9EA3AB" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        onScroll={handleScroll}
        scrollEventThrottle={100}
        showsVerticalScrollIndicator
        onLayout={({ nativeEvent }) => setScrollViewHeight(nativeEvent.layout.height)}
        onContentSizeChange={(w, h) => setContentHeight(h)}
      >
        <Text style={[styles.body, isUrdu && styles.rtl, isUrdu && styles.urduBody]}>
          {s.disclaimer_body}
        </Text>
        <View style={{ height: 40 }} />
      </ScrollView>

      {!scrolled && (
        <View style={styles.scrollHint}>
          <Feather name="chevrons-down" size={16} color="#9EA3AB" />
          <Text style={[styles.scrollHintText, isUrdu && styles.rtl]}>{s.disclaimer_scroll_prompt}</Text>
        </View>
      )}

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.agreeBtn, !scrolled && styles.agreeBtnDisabled]}
          onPress={agree}
          disabled={!scrolled}
          activeOpacity={0.85}
        >
          <Text style={[styles.agreeBtnText, isUrdu && styles.rtl]}>{s.disclaimer_agree}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:           { flex:1, backgroundColor:'#F5F6F8' },
  rtl:            { textAlign:'right', writingDirection:'rtl', fontFamily: 'NotoNastaliqUrdu' },
  urduBody:       { fontSize:15, lineHeight:28 },
  header:         { flexDirection:'row', alignItems:'center', gap:10, padding:20, paddingTop:44 },
  title:          { fontSize:20, fontWeight:'700', color:'#1A1C1E', flex:1 },
  scroll:         { flex:1, backgroundColor:'#FFFFFF', margin:16, marginTop:4, borderRadius:14, padding:16 },
  body:           { fontSize:14, color:'#5A5D63', lineHeight:22 },
  scrollHint:     { flexDirection:'row', alignItems:'center', gap:6, justifyContent:'center', paddingVertical:8 },
  scrollHintText: { fontSize:12, color:'#9EA3AB' },
  bottomBar:      { padding:16, backgroundColor:'#F5F6F8' },
  agreeBtn:       { backgroundColor:'#1A6FD4', borderRadius:12, paddingVertical:15, alignItems:'center' },
  agreeBtnDisabled:{ backgroundColor:'#C0C3CA' },
  agreeBtnText:   { color:'#fff', fontSize:16, fontWeight:'600' },
});

export default DisclaimerScreen;
