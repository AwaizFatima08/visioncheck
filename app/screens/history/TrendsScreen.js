// VisionCheck — Trends
// app/screens/history/TrendsScreen.js
//
// Charts of saved results over time: distance acuity (logMAR), Amsler marked
// areas and contrast score. Needs checks done with v1.1 or later, because that
// is when these values started being saved. Everything is read from the phone.

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import TrendChart from '../../components/charts/TrendChart';
import { getTestHistory } from '../../database/db';
import { decodeDetails } from '../../engine/testInfo';

const BLUE   = '#1A6FD4';
const ORANGE = '#D98A1C';

// Rows -> one series per eye (or one for both eyes), keeping only rows that have a value
const toSeries = (rows, pick, labels) => {
  const eyes = Object.keys(labels);
  return eyes
    .map((eye) => ({
      label:  labels[eye].label,
      color:  labels[eye].color,
      points: rows
        .filter(r => r.eye === eye)
        .map(r => ({ value: pick(decodeDetails(r.notes)) }))
        .filter(p => p.value !== null && p.value !== undefined),
    }))
    .filter(s => s.points.length > 0);
};

const TrendsScreen = ({ navigation, route }) => {
  const language = route.params?.language || 'en';
  const isUrdu   = language === 'ur';
  const [data, setData] = useState({ distance: [], amsler: [], contrast: [] });

  useFocusEffect(useCallback(() => {
    setData({
      distance: getTestHistory('distance'),
      amsler:   getTestHistory('amsler'),
      contrast: getTestHistory('contrast'),
    });
  }, []));

  const eyeLabels = {
    R: { label: isUrdu ? 'دائیں' : 'Right', color: BLUE },
    L: { label: isUrdu ? 'بائیں' : 'Left',  color: ORANGE },
  };

  const distanceSeries = toSeries(data.distance, d => (d && d.logmar !== undefined ? d.logmar : undefined), eyeLabels);
  const amslerSeries   = toSeries(data.amsler,   d => (d && Array.isArray(d.marks) ? d.marks.length : undefined), eyeLabels);
  const contrastSeries = toSeries(data.contrast, d => (d && d.logcs !== undefined ? d.logcs : undefined),
    { both: { label: isUrdu ? 'دونوں آنکھیں' : 'Both eyes', color: BLUE } });

  const amslerMax = Math.max(5, ...amslerSeries.flatMap(s => s.points.map(p => p.value)));

  const sections = [
    {
      title: isUrdu ? 'دور کی نظر (logMAR)' : 'Distance vision (logMAR)',
      note:  isUrdu ? 'جتنا اوپر، اتنی بہتر نظر (۰ = 20/20)' : 'Higher is better (0 = 20/20)',
      series: distanceSeries, yMin: -0.1, yMax: 1.0, lowerIsBetter: true, format: v => v.toFixed(1),
    },
    {
      title: isUrdu ? 'جالی: نشان زد حصے' : 'Amsler grid: marked areas',
      note:  isUrdu ? 'جتنا اوپر، اتنے کم نشان زد حصے' : 'Higher is better (fewer marked areas)',
      series: amslerSeries, yMin: 0, yMax: amslerMax, lowerIsBetter: true, format: v => String(Math.round(v)),
    },
    {
      title: isUrdu ? 'کنٹراسٹ سکور (logCS)' : 'Contrast score (logCS)',
      note:  isUrdu ? 'جتنا اوپر، اتنی بہتر حساسیت' : 'Higher is better',
      series: contrastSeries, yMin: 0.45, yMax: 1.65, lowerIsBetter: false, format: v => v.toFixed(2),
    },
  ];

  const hasAny = sections.some(sec => sec.series.length > 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name={isUrdu ? 'chevron-right' : 'chevron-left'} size={22} color="#1A6FD4" />
          </TouchableOpacity>
          <Text style={[styles.title, isUrdu && styles.rtl]}>{isUrdu ? 'آپ کے رجحانات' : 'Your trends'}</Text>
        </View>

        {!hasAny && (
          <Text style={[styles.empty, isUrdu && styles.rtl]}>
            {isUrdu
              ? 'ابھی کوئی ڈیٹا نہیں۔ ایک مکمل معائنہ کریں، پھر کچھ ہفتوں بعد دوبارہ کریں تاکہ تبدیلی نظر آئے۔'
              : 'No data yet. Complete a check, then repeat it a few weeks later to see how your results change.'}
          </Text>
        )}

        {sections.filter(sec => sec.series.length > 0).map((sec) => {
          const single = sec.series.every(s => s.points.length < 2);
          return (
            <View key={sec.title} style={styles.card}>
              <Text style={[styles.cardTitle, isUrdu && styles.rtl]}>{sec.title}</Text>
              <Text style={[styles.cardNote, isUrdu && styles.rtl]}>{sec.note}</Text>
              <TrendChart
                series={sec.series}
                yMin={sec.yMin}
                yMax={sec.yMax}
                lowerIsBetter={sec.lowerIsBetter}
                format={sec.format}
              />
              {single && (
                <Text style={[styles.cardNote, isUrdu && styles.rtl]}>
                  {isUrdu ? 'رجحان دیکھنے کے لیے یہ ٹیسٹ کم از کم دو بار کریں۔' : 'Repeat this test at least twice to see a trend.'}
                </Text>
              )}
            </View>
          );
        })}

        <Text style={[styles.foot, isUrdu && styles.rtl]}>
          {isUrdu
            ? 'ایک آدھ نمبر کا فرق عام ہے۔ مسلسل گراوٹ ہو تو ڈاکٹر سے رجوع کریں۔'
            : 'Small ups and downs are normal. If a result keeps getting worse, see an eye doctor.'}
        </Text>
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
  empty:     { fontSize: 14, color: '#5A5D63', lineHeight: 21, marginTop: 8 },
  card:      { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E4E8', padding: 14, marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#1A1C1E' },
  cardNote:  { fontSize: 11, color: '#9EA3AB', marginTop: 2, marginBottom: 8 },
  foot:      { fontSize: 11, color: '#9EA3AB', textAlign: 'center', marginTop: 8 },
});

export default TrendsScreen;
