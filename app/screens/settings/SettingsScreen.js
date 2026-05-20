// VisionCheck — Settings Screen (Sprint 6 — audio wired)
// app/screens/settings/SettingsScreen.js
//
// Speaks screen heading on load.
// Speaks confirmation when language or age band is changed.
// Replay button in header.

import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Switch, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useFocusEffect } from '@react-navigation/native';
import { getSetting, setSetting, clearAllHistory } from '../../database/db';
import { strings } from '../../i18n/strings';

const APP_VERSION = '1.0.0';

const speak = (text, lang, onDone) => {
  Speech.stop();
  Speech.speak(text, { language: lang === 'ur' ? 'ur-PK' : 'en-US', rate: 0.85, onDone: onDone || (() => {}), onError: () => {} });
};

const AGE_BANDS = {
  en: [
    { key:'child',  label:'Under 13',     icon:'🧒' },
    { key:'young',  label:'13–40 years',  icon:'👤' },
    { key:'middle', label:'40–60 years',  icon:'👔' },
    { key:'senior', label:'Over 60 years',icon:'🧓' },
  ],
  ur: [
    { key:'child',  label:'۱۳ سال سے کم',     icon:'🧒' },
    { key:'young',  label:'۱۳–۴۰ سال',        icon:'👤' },
    { key:'middle', label:'۴۰–۶۰ سال',        icon:'👔' },
    { key:'senior', label:'۶۰ سال سے زیادہ',  icon:'🧓' },
  ],
};

const SettingsScreen = ({ navigation, route }) => {
  const [language,      setLanguage]      = useState(route.params?.language || 'en');
  const [ageBand,       setAgeBand]       = useState('young');
  const [showAgePicker, setShowAgePicker] = useState(false);
  const isUrdu = language === 'ur';
  const s      = strings[language];
  const bands  = AGE_BANDS[language] || AGE_BANDS.en;

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  const loadSettings = async () => {
    try {
      const lang = await getSetting('language');
      const band = await getSetting('age_band');
      if (lang) setLanguage(lang);
      if (band) setAgeBand(band);
      const heading = lang === 'ur' ? 'ترتیبات' : 'Settings';
      setTimeout(() => speak(heading, lang || 'en'), 400);
    } catch (err) {
      console.error('Settings load error:', err);
    }
  };

  const handleLanguageToggle = async (value) => {
    const newLang = value ? 'ur' : 'en';
    const confirm = newLang === 'ur' ? 'اردو منتخب کی گئی' : 'English selected';
    speak(confirm, newLang);
    await setSetting('language', newLang);
    setLanguage(newLang);
    navigation.reset({ index:0, routes:[{ name:'MainTabs', params:{ language: newLang } }] });
  };

  const handleAgeBandSelect = async (band) => {
    if (band.key === 'child') {
      const note = isUrdu ? 'یہ ایپ بڑوں کے لیے بنائی گئی ہے' : 'This app is designed for adults';
      speak(note, language);
      Alert.alert('', note);
      return;
    }
    speak(band.label, language);
    await setSetting('age_band', band.key);
    setAgeBand(band.key);
    setShowAgePicker(false);
  };

  const handleClearHistory = () => {
    Alert.alert(
      isUrdu ? 'تاریخ مٹائیں' : 'Clear all history',
      isUrdu ? 'کیا آپ کو یقین ہے؟ تمام پچھلے نتائج مٹ جائیں گے۔' : 'Are you sure? All past results will be permanently deleted.',
      [
        { text: isUrdu ? 'منسوخ' : 'Cancel', style:'cancel' },
        { text: isUrdu ? 'مٹائیں' : 'Delete all', style:'destructive',
          onPress: async () => {
            await clearAllHistory();
            speak(isUrdu ? 'تاریخ مٹا دی گئی' : 'History cleared', language);
            Alert.alert('', isUrdu ? 'تمام تاریخ مٹا دی گئی' : 'All history cleared');
          }
        },
      ]
    );
  };

  const currentBand = bands.find(b => b.key === ageBand) || bands[1];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Heading */}
        <View style={styles.headingRow}>
          <Text style={[styles.heading, isUrdu && styles.rtl]}>{isUrdu ? 'ترتیبات' : 'Settings'}</Text>
          <TouchableOpacity onPress={() => speak(isUrdu ? 'ترتیبات' : 'Settings', language)} style={styles.audioBtn}>
            <Feather name="volume-2" size={20} color="#1A6FD4" />
          </TouchableOpacity>
        </View>

        {/* Language */}
        <Text style={[styles.sectionLabel, isUrdu && styles.rtl]}>{isUrdu ? 'زبان' : 'Language'}</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🌐</Text>
              <View>
                <Text style={[styles.settingTitle, isUrdu && styles.rtl]}>{isUrdu ? 'اردو' : 'Urdu / اردو'}</Text>
                <Text style={[styles.settingDesc, isUrdu && styles.rtl]}>{isUrdu ? 'اردو انٹرفیس اور آڈیو' : 'Urdu interface and audio'}</Text>
              </View>
            </View>
            <Switch value={isUrdu} onValueChange={handleLanguageToggle} trackColor={{ false:'#E2E4E8', true:'#1A6FD4' }} thumbColor="#FFFFFF" />
          </View>
        </View>

        {/* Age band */}
        <Text style={[styles.sectionLabel, isUrdu && styles.rtl]}>{isUrdu ? 'عمر کا گروپ' : 'Age group'}</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRow} onPress={() => setShowAgePicker(!showAgePicker)} activeOpacity={0.8}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>{currentBand.icon}</Text>
              <View>
                <Text style={[styles.settingTitle, isUrdu && styles.rtl]}>{isUrdu ? 'موجودہ عمر' : 'Current age group'}</Text>
                <Text style={[styles.settingDesc, isUrdu && styles.rtl]}>{currentBand.label}</Text>
              </View>
            </View>
            <Feather name={showAgePicker ? 'chevron-up' : 'chevron-down'} size={20} color="#9EA3AB" />
          </TouchableOpacity>
          {showAgePicker && (
            <View style={styles.agePicker}>
              {bands.map((band, i) => (
                <TouchableOpacity
                  key={band.key}
                  style={[styles.ageBandOption, band.key === ageBand && styles.ageBandSelected, i === bands.length - 1 && styles.ageBandLast]}
                  onPress={() => handleAgeBandSelect(band)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.ageBandIcon}>{band.icon}</Text>
                  <Text style={[styles.ageBandLabel, band.key === ageBand && styles.ageBandLabelSelected, isUrdu && styles.rtl]}>{band.label}</Text>
                  {band.key === ageBand && <Feather name="check" size={16} color="#1A6FD4" />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* App section */}
        <Text style={[styles.sectionLabel, isUrdu && styles.rtl]}>{isUrdu ? 'ایپ' : 'App'}</Text>
        <View style={styles.card}>
          <TouchableOpacity style={[styles.settingRow, styles.settingRowBorder]} onPress={() => navigation.navigate('DisclaimerView', { language })} activeOpacity={0.8}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>📋</Text>
              <Text style={[styles.settingTitle, isUrdu && styles.rtl]}>{isUrdu ? 'اعلان پڑھیں' : 'View disclaimer'}</Text>
            </View>
            <Feather name={isUrdu ? 'chevron-left' : 'chevron-right'} size={18} color="#9EA3AB" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingRow, styles.settingRowBorder]} onPress={handleClearHistory} activeOpacity={0.8}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🗑️</Text>
              <View>
                <Text style={[styles.settingTitle, styles.dangerText, isUrdu && styles.rtl]}>{isUrdu ? 'تمام تاریخ مٹائیں' : 'Clear all history'}</Text>
                <Text style={[styles.settingDesc, isUrdu && styles.rtl]}>{isUrdu ? 'تمام پچھلے نتائج حذف کر دیں' : 'Permanently delete all past results'}</Text>
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>ℹ️</Text>
              <Text style={[styles.settingTitle, isUrdu && styles.rtl]}>{isUrdu ? 'ورژن' : 'Version'}</Text>
            </View>
            <Text style={styles.versionText}>{APP_VERSION}</Text>
          </View>
        </View>

        {/* Guest note */}
        <View style={styles.guestBanner}>
          <Text style={styles.guestIcon}>👤</Text>
          <Text style={[styles.guestText, isUrdu && styles.rtl]}>
            {isUrdu
              ? 'مہمان موڈ — نتائج صرف اس فون پر محفوظ ہیں'
              : 'Guest mode — results saved on this device only'}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerApp}>VisionCheck</Text>
          <Text style={styles.footerUrdu}>نظر کا معائنہ</Text>
          <Text style={styles.footerNote}>{isUrdu ? 'HomiLabs Solutions SMC Pvt Ltd' : 'by HomiLabs Solutions SMC Pvt Ltd'}</Text>
        </View>

        <View style={{ height:32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:               { flex:1, backgroundColor:'#F5F6F8' },
  content:            { padding:20, paddingTop:24 },
  rtl:                { textAlign:'right', writingDirection:'rtl' },
  headingRow:         { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:20 },
  heading:            { fontSize:24, fontWeight:'800', color:'#1A1C1E' },
  audioBtn:           { padding:6 },
  sectionLabel:       { fontSize:12, fontWeight:'600', color:'#9EA3AB', textTransform:'uppercase', letterSpacing:0.8, marginBottom:8, marginTop:16 },
  card:               { backgroundColor:'#FFFFFF', borderRadius:14, borderWidth:1, borderColor:'#E2E4E8', overflow:'hidden' },
  settingRow:         { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:14, paddingHorizontal:16 },
  settingRowBorder:   { borderBottomWidth:1, borderBottomColor:'#F5F6F8' },
  settingLeft:        { flexDirection:'row', alignItems:'center', gap:12, flex:1 },
  settingIcon:        { fontSize:20, width:28, textAlign:'center' },
  settingTitle:       { fontSize:15, fontWeight:'500', color:'#1A1C1E' },
  settingDesc:        { fontSize:12, color:'#9EA3AB', marginTop:2 },
  dangerText:         { color:'#993C1D' },
  versionText:        { fontSize:13, color:'#9EA3AB' },
  agePicker:          { borderTopWidth:1, borderTopColor:'#F5F6F8', backgroundColor:'#FAFAFA' },
  ageBandOption:      { flexDirection:'row', alignItems:'center', gap:12, paddingVertical:12, paddingHorizontal:20, borderBottomWidth:1, borderBottomColor:'#F0F1F3' },
  ageBandSelected:    { backgroundColor:'#E8F1FB' },
  ageBandLast:        { borderBottomWidth:0 },
  ageBandIcon:        { fontSize:18 },
  ageBandLabel:       { flex:1, fontSize:14, color:'#1A1C1E' },
  ageBandLabelSelected:{ color:'#1A6FD4', fontWeight:'600' },
  guestBanner:        { flexDirection:'row', alignItems:'flex-start', gap:8, backgroundColor:'#F5F6F8', borderRadius:10, borderWidth:1, borderColor:'#E2E4E8', padding:12, marginTop:20 },
  guestIcon:          { fontSize:16 },
  guestText:          { flex:1, fontSize:12, color:'#5A5D63', lineHeight:18 },
  footer:             { alignItems:'center', marginTop:28, paddingTop:20, borderTopWidth:1, borderTopColor:'#E2E4E8' },
  footerApp:          { fontSize:16, fontWeight:'800', color:'#1A6FD4' },
  footerUrdu:         { fontSize:13, color:'#9EA3AB', marginTop:2 },
  footerNote:         { fontSize:11, color:'#C0C3CA', marginTop:6 },
});

export default SettingsScreen;
