// VisionCheck — Reminders
// app/screens/settings/RemindersScreen.js
//
// Two optional local reminders. Nothing is sent anywhere; the phone schedules them.

import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { setReminder, isEnabled, getExamMonths } from '../../utils/reminders';

const monthsText = (months, isUrdu) => {
  if (months === 12) return isUrdu ? 'ہر سال' : 'every year';
  if (months % 12 === 0) return isUrdu ? `${months / 12} سال بعد` : `in ${months / 12} years`;
  return isUrdu ? `${months} ماہ بعد` : `in ${months} months`;
};

const RemindersScreen = ({ navigation, route }) => {
  const language = route.params?.language || 'en';
  const isUrdu   = language === 'ur';
  const [amsler, setAmsler] = useState(isEnabled('amsler'));
  const [exam,   setExam]   = useState(isEnabled('exam'));
  const [denied, setDenied] = useState(false);

  const toggle = async (kind, value) => {
    setDenied(false);
    try {
      const actual = await setReminder(kind, value, language);
      if (value && !actual) setDenied(true);
      if (kind === 'amsler') setAmsler(actual); else setExam(actual);
    } catch (err) {
      console.error('reminder error:', err);
      setDenied(true);
    }
  };

  const months = getExamMonths();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name={isUrdu ? 'chevron-right' : 'chevron-left'} size={22} color="#1A6FD4" />
          </TouchableOpacity>
          <Text style={[styles.title, isUrdu && styles.rtl]}>{isUrdu ? 'یاد دہانیاں' : 'Reminders'}</Text>
        </View>

        <Text style={[styles.intro, isUrdu && styles.rtl]}>
          {isUrdu
            ? 'یہ یاد دہانیاں آپ کے فون پر ہی چلتی ہیں۔ کوئی ڈیٹا کہیں نہیں بھیجا جاتا۔'
            : 'These reminders run on your phone only. No data is sent anywhere.'}
        </Text>

        <View style={styles.card}>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, isUrdu && styles.rtl]}>
              {isUrdu ? 'ماہانہ جالی (Amsler) ٹیسٹ' : 'Monthly Amsler grid check'}
            </Text>
            <Text style={[styles.cardSub, isUrdu && styles.rtl]}>
              {isUrdu ? 'ہر مہینے ایک بار، صبح ۱۰ بجے۔ مرکزی نظر کی تبدیلی جلد پکڑتا ہے۔' : 'Once a month at 10:00. Catches central vision changes early.'}
            </Text>
          </View>
          <Switch value={amsler} onValueChange={(v) => toggle('amsler', v)} trackColor={{ true: '#1A6FD4' }} />
        </View>

        <View style={styles.card}>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, isUrdu && styles.rtl]}>
              {isUrdu ? 'مکمل آنکھوں کے معائنے کی یاد دہانی' : 'Full eye exam reminder'}
            </Text>
            <Text style={[styles.cardSub, isUrdu && styles.rtl]}>
              {isUrdu
                ? `${monthsText(months, true)}، صبح ۱۰ بجے۔ وقفہ آپ کے رسک چیک سے آتا ہے۔`
                : `${monthsText(months, false)} at 10:00. The interval comes from your risk check.`}
            </Text>
          </View>
          <Switch value={exam} onValueChange={(v) => toggle('exam', v)} trackColor={{ true: '#1A6FD4' }} />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('RiskCheck', { language })} activeOpacity={0.8}>
          <Text style={[styles.link, isUrdu && styles.rtl]}>
            {isUrdu ? 'رسک چیک کر کے وقفہ بدلیں' : 'Take the risk check to set the interval'}
          </Text>
        </TouchableOpacity>

        {denied && (
          <View style={styles.deniedBox}>
            <Text style={[styles.deniedText, isUrdu && styles.rtl]}>
              {isUrdu
                ? 'اطلاعات کی اجازت نہیں ملی۔ فون کی سیٹنگز میں VisionCheck کے لیے نوٹیفکیشن آن کریں۔'
                : 'Notifications are not allowed. Turn them on for VisionCheck in your phone settings.'}
            </Text>
            <TouchableOpacity onPress={() => Linking.openSettings()} activeOpacity={0.8}>
              <Text style={styles.deniedLink}>{isUrdu ? 'سیٹنگز کھولیں' : 'Open settings'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#F5F6F8' },
  content:   { padding: 20, paddingTop: 16 },
  rtl:       { textAlign: 'right', writingDirection: 'rtl', fontFamily: 'NotoNastaliqUrdu' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  backBtn:   { padding: 4 },
  title:     { fontSize: 20, fontWeight: '700', color: '#1A1C1E', flex: 1 },
  intro:     { fontSize: 13, color: '#5A5D63', marginBottom: 14, lineHeight: 19 },
  card:      { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E4E8', padding: 14, marginBottom: 10 },
  cardText:  { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#1A1C1E' },
  cardSub:   { fontSize: 12, color: '#5A5D63', marginTop: 3, lineHeight: 18 },
  link:      { fontSize: 13, color: '#1A6FD4', fontWeight: '600', marginTop: 6 },
  deniedBox: { backgroundColor: '#FAEEDA', borderRadius: 10, padding: 12, marginTop: 16 },
  deniedText:{ fontSize: 13, color: '#854F0B', lineHeight: 19 },
  deniedLink:{ fontSize: 13, color: '#1A6FD4', fontWeight: '700', marginTop: 8 },
});

export default RemindersScreen;
