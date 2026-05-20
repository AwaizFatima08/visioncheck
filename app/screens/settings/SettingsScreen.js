// VisionCheck — Settings Screen
// app/screens/settings/SettingsScreen.js
//
// Language toggle — switches between English and Urdu app-wide
// Age band — update without retaking tests
// View disclaimer — opens DisclaimerViewScreen
// Clear history — deletes all local SQLite records with confirmation
// App version info
// Bilingual — reflects current language setting

import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Switch, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getSetting, setSetting, clearAllHistory } from '../../database/db';
import { strings } from '../../i18n/strings';

const APP_VERSION = '1.0.0';

// Age band options
const AGE_BANDS = {
  en: [
    { key: 'child',  label: 'Under 13',    icon: '🧒', note: 'App designed for adults' },
    { key: 'young',  label: '13 – 40 yrs', icon: '👤', note: null },
    { key: 'middle', label: '40 – 60 yrs', icon: '👔', note: null },
    { key: 'senior', label: 'Over 60 yrs', icon: '🧓', note: null },
  ],
  ur: [
    { key: 'child',  label: '۱۳ سال سے کم', icon: '🧒', note: 'یہ ایپ بڑوں کے لیے ہے' },
    { key: 'young',  label: '۱۳ – ۴۰ سال',  icon: '👤', note: null },
    { key: 'middle', label: '۴۰ – ۶۰ سال',  icon: '👔', note: null },
    { key: 'senior', label: '۶۰ سال سے زیادہ', icon: '🧓', note: null },
  ],
};

const SettingsScreen = ({ navigation, route }) => {
  const [language,    setLanguage]    = useState(route.params?.language || 'en');
  const [ageBand,     setAgeBand]     = useState('young');
  const [showAgePicker, setShowAgePicker] = useState(false);

  const isUrdu = language === 'ur';
  const s      = strings[language];
  const bands  = AGE_BANDS[language] || AGE_BANDS.en;

  // Load saved settings on focus
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
    } catch (err) {
      console.error('Settings load error:', err);
    }
  };

  // ─── Language toggle ──────────────────────────────────────────────────────
  const handleLanguageToggle = async (value) => {
    const newLang = value ? 'ur' : 'en';
    await setSetting('language', newLang);
    setLanguage(newLang);
    // Navigate to reset tab navigator with new language
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { language: newLang } }],
    });
  };

  // ─── Age band change ──────────────────────────────────────────────────────
  const handleAgeBandSelect = async (band) => {
    if (band.key === 'child') {
      Alert.alert(
        isUrdu ? 'نوٹ' : 'Note',
        band.note || (isUrdu ? 'یہ ایپ بڑوں کے لیے بنائی گئی ہے' : 'This app is designed for adults'),
      );
      return;
    }
    await setSetting('age_band', band.key);
    setAgeBand(band.key);
    setShowAgePicker(false);
  };

  // ─── Clear history ────────────────────────────────────────────────────────
  const handleClearHistory = () => {
    Alert.alert(
      isUrdu ? 'تاریخ مٹائیں' : 'Clear all history',
      isUrdu
        ? 'کیا آپ کو یقین ہے؟ تمام پچھلے نتائج مٹ جائیں گے اور واپس نہیں آ سکتے۔'
        : 'Are you sure? All past results will be permanently deleted.',
      [
        { text: isUrdu ? 'منسوخ' : 'Cancel', style: 'cancel' },
        {
          text:  isUrdu ? 'مٹائیں' : 'Delete all',
          style: 'destructive',
          onPress: async () => {
            await clearAllHistory();
            Alert.alert(
              isUrdu ? 'مکمل' : 'Done',
              isUrdu ? 'تمام تاریخ مٹا دی گئی' : 'All history cleared',
            );
          },
        },
      ]
    );
  };

  // ─── Current age band label ───────────────────────────────────────────────
  const currentBand = bands.find(b => b.key === ageBand) || bands[1];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Heading */}
        <Text style={[styles.heading, isUrdu && styles.rtl]}>
          {isUrdu ? 'ترتیبات' : 'Settings'}
        </Text>

        {/* ── Language section ─────────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, isUrdu && styles.rtl]}>
          {isUrdu ? 'زبان' : 'Language'}
        </Text>

        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🌐</Text>
              <View>
                <Text style={[styles.settingTitle, isUrdu && styles.rtl]}>
                  {isUrdu ? 'اردو' : 'Urdu / اردو'}
                </Text>
                <Text style={[styles.settingDesc, isUrdu && styles.rtl]}>
                  {isUrdu ? 'اردو انٹرفیس اور آڈیو' : 'Urdu interface and audio'}
                </Text>
              </View>
            </View>
            <Switch
              value={isUrdu}
              onValueChange={handleLanguageToggle}
              trackColor={{ false: '#E2E4E8', true: '#1A6FD4' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* ── Age band section ─────────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, isUrdu && styles.rtl]}>
          {isUrdu ? 'عمر کا گروپ' : 'Age group'}
        </Text>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowAgePicker(!showAgePicker)}
            activeOpacity={0.8}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>{currentBand.icon}</Text>
              <View>
                <Text style={[styles.settingTitle, isUrdu && styles.rtl]}>
                  {isUrdu ? 'موجودہ عمر' : 'Current age group'}
                </Text>
                <Text style={[styles.settingDesc, isUrdu && styles.rtl]}>
                  {currentBand.label}
                </Text>
              </View>
            </View>
            <Feather
              name={showAgePicker ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#9EA3AB"
            />
          </TouchableOpacity>

          {/* Age picker — inline dropdown */}
          {showAgePicker && (
            <View style={styles.agePicker}>
              {bands.map((band, i) => (
                <TouchableOpacity
                  key={band.key}
                  style={[
                    styles.ageBandOption,
                    band.key === ageBand && styles.ageBandSelected,
                    i === bands.length - 1 && styles.ageBandLast,
                  ]}
                  onPress={() => handleAgeBandSelect(band)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.ageBandIcon}>{band.icon}</Text>
                  <Text style={[
                    styles.ageBandLabel,
                    band.key === ageBand && styles.ageBandLabelSelected,
                    isUrdu && styles.rtl,
                  ]}>
                    {band.label}
                  </Text>
                  {band.key === ageBand && (
                    <Feather name="check" size={16} color="#1A6FD4" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Age band note */}
        <View style={styles.noteRow}>
          <Feather name="info" size={13} color="#9EA3AB" />
          <Text style={[styles.noteText, isUrdu && styles.rtl]}>
            {isUrdu
              ? 'عمر کا گروپ قریب کے نظر کے ٹیسٹ کے نتائج کو متاثر کرتا ہے'
              : 'Age group affects how near vision results are interpreted'}
          </Text>
        </View>

        {/* ── App section ───────────────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, isUrdu && styles.rtl]}>
          {isUrdu ? 'ایپ' : 'App'}
        </Text>

        <View style={styles.card}>

          {/* View disclaimer */}
          <TouchableOpacity
            style={[styles.settingRow, styles.settingRowBorder]}
            onPress={() => navigation.navigate('DisclaimerView', { language })}
            activeOpacity={0.8}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>📋</Text>
              <Text style={[styles.settingTitle, isUrdu && styles.rtl]}>
                {isUrdu ? 'اعلان پڑھیں' : 'View disclaimer'}
              </Text>
            </View>
            <Feather
              name={isUrdu ? 'chevron-left' : 'chevron-right'}
              size={18}
              color="#9EA3AB"
            />
          </TouchableOpacity>

          {/* Clear history */}
          <TouchableOpacity
            style={[styles.settingRow, styles.settingRowBorder]}
            onPress={handleClearHistory}
            activeOpacity={0.8}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🗑️</Text>
              <View>
                <Text style={[styles.settingTitle, styles.dangerText, isUrdu && styles.rtl]}>
                  {isUrdu ? 'تمام تاریخ مٹائیں' : 'Clear all history'}
                </Text>
                <Text style={[styles.settingDesc, isUrdu && styles.rtl]}>
                  {isUrdu ? 'تمام پچھلے نتائج حذف کر دیں' : 'Permanently delete all past results'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Version */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>ℹ️</Text>
              <Text style={[styles.settingTitle, isUrdu && styles.rtl]}>
                {isUrdu ? 'ورژن' : 'Version'}
              </Text>
            </View>
            <Text style={styles.versionText}>{APP_VERSION}</Text>
          </View>

        </View>

        {/* ── Guest mode note ───────────────────────────────────────────────── */}
        <View style={styles.guestBanner}>
          <Feather name="user" size={14} color="#5A5D63" />
          <Text style={[styles.guestText, isUrdu && styles.rtl]}>
            {isUrdu
              ? 'مہمان موڈ — نتائج صرف اس فون پر محفوظ ہیں۔ فون بدلنے یا ایپ دوبارہ انسٹال کرنے پر نتائج مٹ جائیں گے۔'
              : 'Guest mode — results are saved on this device only. Reinstalling the app or changing phones will delete your history.'}
          </Text>
        </View>

        {/* App name footer */}
        <View style={styles.footer}>
          <Text style={styles.footerApp}>VisionCheck</Text>
          <Text style={styles.footerUrdu}>نظر کا معائنہ</Text>
          <Text style={styles.footerNote}>
            {isUrdu
              ? 'HomiLabs Solutions SMC Pvt Ltd کی جانب سے'
              : 'by HomiLabs Solutions SMC Pvt Ltd'}
          </Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#F5F6F8' },
  content: { padding: 20, paddingTop: 24 },
  rtl:     { textAlign: 'right', writingDirection: 'rtl' },

  heading:      { fontSize: 24, fontWeight: '800', color: '#1A1C1E', marginBottom: 20 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: '#9EA3AB', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 16 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E4E8',
    overflow: 'hidden',
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F5F6F8',
  },
  settingLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingIcon:  { fontSize: 20, width: 28, textAlign: 'center' },
  settingTitle: { fontSize: 15, fontWeight: '500', color: '#1A1C1E' },
  settingDesc:  { fontSize: 12, color: '#9EA3AB', marginTop: 2 },
  dangerText:   { color: '#993C1D' },
  versionText:  { fontSize: 13, color: '#9EA3AB' },

  // Age picker
  agePicker: {
    borderTopWidth: 1,
    borderTopColor: '#F5F6F8',
    backgroundColor: '#FAFAFA',
  },
  ageBandOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F3',
  },
  ageBandSelected: { backgroundColor: '#E8F1FB' },
  ageBandLast:     { borderBottomWidth: 0 },
  ageBandIcon:     { fontSize: 18 },
  ageBandLabel:    { flex: 1, fontSize: 14, color: '#1A1C1E' },
  ageBandLabelSelected: { color: '#1A6FD4', fontWeight: '600' },

  // Note
  noteRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 8, paddingHorizontal: 4 },
  noteText: { flex: 1, fontSize: 12, color: '#9EA3AB', lineHeight: 17 },

  // Guest banner
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F5F6F8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E4E8',
    padding: 12,
    marginTop: 20,
  },
  guestText: { flex: 1, fontSize: 12, color: '#5A5D63', lineHeight: 18 },

  // Footer
  footer:     { alignItems: 'center', marginTop: 28, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#E2E4E8' },
  footerApp:  { fontSize: 16, fontWeight: '800', color: '#1A6FD4' },
  footerUrdu: { fontSize: 13, color: '#9EA3AB', marginTop: 2 },
  footerNote: { fontSize: 11, color: '#C0C3CA', marginTop: 6 },
});

export default SettingsScreen;
