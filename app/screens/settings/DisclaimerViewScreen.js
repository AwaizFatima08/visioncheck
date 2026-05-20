// VisionCheck — Disclaimer View Screen
// app/screens/settings/DisclaimerViewScreen.js
//
// Full disclaimer text readable from Settings at any time.
// Shown in currently selected language.
// No action required — read-only, back button to return.

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView,
  StyleSheet, SafeAreaView, TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { strings } from '../../i18n/strings';
import { getSetting } from '../../database/db';

const DisclaimerViewScreen = ({ navigation, route }) => {
  const [language, setLanguage] = useState(route.params?.language || 'en');

  useEffect(() => {
    getSetting('language').then(l => { if (l) setLanguage(l); });
  }, []);

  const s      = strings[language];
  const isUrdu = language === 'ur';

  return (
    <SafeAreaView style={styles.safe}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Feather
            name={isUrdu ? 'chevron-right' : 'chevron-left'}
            size={22}
            color="#1A6FD4"
          />
        </TouchableOpacity>
        <Text style={[styles.heading, isUrdu && styles.rtl]}>
          {isUrdu ? 'اہم اعلان' : 'Important Disclaimer'}
        </Text>
        <View style={{ width: 34 }} />
      </View>

      {/* Warning badge */}
      <View style={styles.warnBadge}>
        <Feather name="alert-triangle" size={16} color="#854F0B" />
        <Text style={[styles.warnText, isUrdu && styles.rtl]}>
          {isUrdu ? 'براہ کرم یہ اعلان غور سے پڑھیں' : 'Please read this notice carefully'}
        </Text>
      </View>

      {/* Disclaimer body */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
      >
        {/* App name block */}
        <View style={styles.appBlock}>
          <Text style={styles.appName}>VisionCheck</Text>
          <Text style={styles.appUrdu}>نظر کا معائنہ</Text>
        </View>

        {/* Disclaimer paragraphs */}
        {getDisclaimerParagraphs(language).map((para, i) => (
          <View key={i} style={styles.paraBlock}>
            <Text style={styles.paraIcon}>{para.icon}</Text>
            <View style={styles.paraText}>
              {para.title && (
                <Text style={[styles.paraTitle, isUrdu && styles.rtl]}>
                  {para.title}
                </Text>
              )}
              <Text style={[styles.paraBody, isUrdu && styles.rtl]}>
                {para.body}
              </Text>
            </View>
          </View>
        ))}

        {/* Emergency note */}
        <View style={styles.emergencyBox}>
          <Text style={styles.emergencyIcon}>🚨</Text>
          <Text style={[styles.emergencyText, isUrdu && styles.rtl]}>
            {isUrdu
              ? 'اگر آپ کو اچانک بینائی میں کمی، آنکھ میں شدید درد، یا روشنی کی چمک محسوس ہو تو یہ ایپ استعمال نہ کریں — فوری طبی امداد حاصل کریں۔'
              : 'If you experience sudden vision loss, severe eye pain, or flashes of light — do not use this app. Seek emergency medical attention immediately.'}
          </Text>
        </View>

        {/* By using note */}
        <Text style={[styles.byUsing, isUrdu && styles.rtl]}>
          {isUrdu
            ? 'اس ایپ کو استعمال کر کے آپ تصدیق کرتے ہیں کہ آپ نے یہ اعلان پڑھ اور سمجھ لیا ہے۔'
            : 'By using this app you confirm that you have read and understood this disclaimer.'}
        </Text>

        {/* HomiLabs credit */}
        <Text style={styles.credit}>
          {isUrdu ? 'HomiLabs Solutions SMC Pvt Ltd' : 'HomiLabs Solutions SMC Pvt Ltd'}
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Disclaimer paragraphs — structured for clean rendering ─────────────────
const getDisclaimerParagraphs = (language) => {
  const isUrdu = language === 'ur';

  return [
    {
      icon: '🔍',
      title: isUrdu ? 'خود معائنہ کا آلہ' : 'Self-screening tool only',
      body:  isUrdu
        ? 'VisionCheck ایک خود معائنہ کا آلہ ہے جو آپ کو کسی ماہرِ امراضِ چشم سے ملنے سے پہلے اپنی بینائی میں ممکنہ تبدیلیوں کو جاننے میں مدد دیتا ہے۔'
        : 'VisionCheck is a self-screening tool designed to help you notice potential vision changes before consulting an eye care professional.',
    },
    {
      icon: '🚫',
      title: isUrdu ? 'طبی آلہ نہیں' : 'Not a medical device',
      body:  isUrdu
        ? 'یہ کوئی طبی آلہ نہیں ہے اور نہ ہی یہ کوئی طبی تشخیص فراہم کرتا ہے۔ اس ایپ کے نتائج صرف ذاتی آگاہی کے لیے ہیں۔'
        : 'This is NOT a medical device and does NOT provide a medical diagnosis. Results are for personal awareness only.',
    },
    {
      icon: '👨‍⚕️',
      title: isUrdu ? 'پیشہ ورانہ معائنہ ضروری ہے' : 'Professional examination required',
      body:  isUrdu
        ? 'یہ نتائج کسی مستند ماہرِ امراضِ چشم یا آپٹومیٹرسٹ کے پیشہ ورانہ معائنے کا متبادل نہیں ہیں۔ کوئی بھی تشویشناک نتیجہ آنے پر فوری ڈاکٹر سے ملیں۔'
        : 'These results do not replace a professional eye examination by a qualified ophthalmologist or optometrist. If any concerning result appears, please see a doctor promptly.',
    },
    {
      icon: '📋',
      title: isUrdu ? 'ڈاکٹر ڈائریکٹری' : 'Doctor directory',
      body:  isUrdu
        ? 'ڈاکٹروں، آپٹومیٹرسٹس اور آپٹیشنز کی فہرست خود اندراج پر مبنی ہے۔ ان کی اسناد اور دستیابی کی آزادانہ تصدیق نہیں کی گئی۔ فہرست میں شامل افراد سے رابطہ مکمل طور پر صارف کی اپنی صوابدید اور ذمہ داری پر ہے۔'
        : 'Listings of doctors, optometrists, and opticians in the directory are based on self-registration. Their qualifications and availability have not been independently verified. Users contact listed practitioners entirely at their own discretion and risk.',
    },
    {
      icon: '📱',
      title: isUrdu ? 'ڈیٹا' : 'Your data',
      body:  isUrdu
        ? 'آپ کے تمام نتائج صرف اس فون پر محفوظ ہیں۔ کوئی ڈیٹا کسی سرور یا بیرونی جگہ نہیں بھیجا جاتا۔'
        : 'All your results are stored only on this device. No data is sent to any server or external service.',
    },
  ];
};

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#F5F6F8' },
  rtl:     { textAlign: 'right', writingDirection: 'rtl' },

  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  backBtn: { padding: 6 },
  heading: { fontSize: 18, fontWeight: '700', color: '#1A1C1E', flex: 1, textAlign: 'center' },

  warnBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FAEEDA', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#FAC775', paddingHorizontal: 20, paddingVertical: 10 },
  warnText:  { fontSize: 13, color: '#854F0B', fontWeight: '500', flex: 1 },

  scroll:        { flex: 1 },
  scrollContent: { padding: 20 },

  appBlock: { alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#E2E4E8', marginBottom: 20 },
  appName:  { fontSize: 22, fontWeight: '800', color: '#1A6FD4' },
  appUrdu:  { fontSize: 16, color: '#9EA3AB', marginTop: 4 },

  paraBlock: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 20 },
  paraIcon:  { fontSize: 22, width: 32, textAlign: 'center', marginTop: 2 },
  paraText:  { flex: 1 },
  paraTitle: { fontSize: 14, fontWeight: '700', color: '#1A1C1E', marginBottom: 4 },
  paraBody:  { fontSize: 13, color: '#5A5D63', lineHeight: 21 },

  emergencyBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#FCEBEB', borderRadius: 12, borderWidth: 1, borderColor: '#F7C1C1', padding: 16, marginBottom: 20 },
  emergencyIcon:{ fontSize: 22 },
  emergencyText:{ flex: 1, fontSize: 13, color: '#A32D2D', fontWeight: '600', lineHeight: 21 },

  byUsing: { fontSize: 12, color: '#9EA3AB', lineHeight: 18, textAlign: 'center', marginBottom: 16 },
  credit:  { fontSize: 11, color: '#C0C3CA', textAlign: 'center' },
});

export default DisclaimerViewScreen;
