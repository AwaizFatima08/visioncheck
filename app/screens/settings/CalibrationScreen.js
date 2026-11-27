// VisionCheck — Screen size calibration
// app/screens/settings/CalibrationScreen.js
//
// Android reports a rounded screen density, so on-screen millimetres can be
// off by 5-15%. The user matches a standard ID-1 card (bank card, ID card:
// 85.6 x 54 mm) to a drawn gap and we store the correction factor.

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { setSetting } from '../../database/db';
import { applyCalibration, getCalibrationScale } from '../../engine/dpiCalc';

const CARD_SHORT_MM = 53.98;
const DP_PER_MM = 160 / 25.4;
const MIN_SCALE = 0.6;
const MAX_SCALE = 1.6;

const clamp = (v) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round(v * 1000) / 1000));

const CalibrationScreen = ({ navigation, route }) => {
  const language = route.params?.language || 'en';
  const isUrdu   = language === 'ur';
  const [scale, setScale] = useState(getCalibrationScale());
  const [saved, setSaved] = useState(false);

  const gap = CARD_SHORT_MM * DP_PER_MM * scale;
  const percent = ((scale - 1) * 100).toFixed(1);

  const adjust = (delta) => { setSaved(false); setScale(prev => clamp(prev + delta)); };
  const reset  = () => { setSaved(false); setScale(1); };

  const save = () => {
    try {
      setSetting('calib_scale', String(scale));
    } catch (err) {
      console.error('calibration save error:', err);
    }
    applyCalibration(scale);
    setSaved(true);
    // Came here from the pre-test screen: go straight back so the tests can start
    if (route.params?.required) navigation.goBack();
  };

  const t = isUrdu
    ? {
        title: 'اسکرین کا سائز ناپیں',
        body:  'کوئی بینک کارڈ یا شناختی کارڈ (کریڈٹ کارڈ کے سائز کا) اسکرین پر لیٹا کر رکھیں۔ اس کا اوپر کا کنارہ اوپر والی لکیر پر ہو۔ + یا − دبائیں یہاں تک کہ کارڈ کا نیچے کا کنارہ نیچے والی لکیر سے مل جائے۔',
        adj:   'ایڈجسٹمنٹ',
        save:  'محفوظ کریں',
        reset: 'ری سیٹ',
        done:  '✓ محفوظ ہو گیا۔ ٹیسٹ کے حروف اب درست سائز میں دکھیں گے۔',
        why:   'اس سے آنکھوں کے ٹیسٹ کے حروف کا سائز آپ کے فون پر درست ہوتا ہے۔',
      }
    : {
        title: 'Calibrate screen size',
        body:  'Lay a bank card or ID card (credit-card size) flat on the screen, sideways. Put its top edge on the upper line. Tap + or − until the card\'s bottom edge meets the lower line.',
        adj:   'Adjustment',
        save:  'Save',
        reset: 'Reset',
        done:  '✓ Saved. Test letters will now be shown at the correct size.',
        why:   'This makes the eye-test letters the right physical size on your phone.',
      };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name={isUrdu ? 'chevron-right' : 'chevron-left'} size={22} color="#1A6FD4" />
          </TouchableOpacity>
          <Text style={[styles.title, isUrdu && styles.rtl]}>{t.title}</Text>
        </View>

        <Text style={[styles.body, isUrdu && styles.rtl]}>{t.body}</Text>
        <Text style={[styles.why, isUrdu && styles.rtl]}>{t.why}</Text>

        <View style={styles.controls}>
          <Step label="−10%" onPress={() => adjust(-0.1)} />
          <Step label="−2%"  onPress={() => adjust(-0.02)} />
          <Step label="+2%"  onPress={() => adjust(0.02)} />
          <Step label="+10%" onPress={() => adjust(0.1)} />
        </View>
        <View style={styles.controls}>
          <Step label="−0.5%" onPress={() => adjust(-0.005)} />
          <Step label="+0.5%" onPress={() => adjust(0.005)} />
        </View>
        <Text style={[styles.readout, isUrdu && styles.rtl]}>
          {t.adj}: {Number(percent) > 0 ? '+' : ''}{percent}%
        </Text>

        <View style={[styles.gapArea, { height: gap }]}>
          <View style={styles.line} />
          <View style={styles.line} />
        </View>

        {saved && <Text style={[styles.saved, isUrdu && styles.rtl]}>{t.done}</Text>}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.resetBtn} onPress={reset} activeOpacity={0.8}>
            <Text style={styles.resetText}>{t.reset}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={save} activeOpacity={0.85}>
            <Text style={styles.saveText}>{t.save}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Step = ({ label, onPress }) => (
  <TouchableOpacity style={styles.stepBtn} onPress={onPress} activeOpacity={0.7}>
    <Text style={styles.stepText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#F5F6F8' },
  content:   { padding: 20, paddingBottom: 40 },
  rtl:       { textAlign: 'right', writingDirection: 'rtl', fontFamily: 'NotoNastaliqUrdu' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  backBtn:   { padding: 4 },
  title:     { fontSize: 20, fontWeight: '700', color: '#1A1C1E', flex: 1 },
  body:      { fontSize: 14, color: '#1A1C1E', lineHeight: 21, marginBottom: 6 },
  why:       { fontSize: 12, color: '#5A5D63', marginBottom: 14 },
  controls:  { flexDirection: 'row', gap: 8, marginBottom: 6 },
  stepBtn:   { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#1A6FD4', alignItems: 'center' },
  stepText:  { fontSize: 14, fontWeight: '700', color: '#1A6FD4' },
  readout:   { fontSize: 13, color: '#5A5D63', marginBottom: 14 },
  gapArea:   { alignSelf: 'center', width: 220, justifyContent: 'space-between', backgroundColor: 'rgba(26,111,212,0.08)', marginBottom: 16 },
  line:      { height: 3, backgroundColor: '#1A6FD4' },
  saved:     { fontSize: 13, color: '#3B6D11', fontWeight: '600', marginBottom: 12 },
  actions:   { flexDirection: 'row', gap: 10 },
  resetBtn:  { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#E2E4E8', alignItems: 'center' },
  resetText: { fontSize: 15, fontWeight: '600', color: '#1A1C1E' },
  saveBtn:   { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: '#1A6FD4', alignItems: 'center' },
  saveText:  { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});

export default CalibrationScreen;
