// VisionCheck — History Screen (Sprint 6 — audio wired)
// app/screens/history/HistoryScreen.js
//
// Speaks screen heading on focus.
// Speaks assessment summary when row is tapped.
// Pull-to-refresh, clear history, empty state unchanged.

import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useFocusEffect } from '@react-navigation/native';
import { getAllAssessments, clearAllHistory, getSetting } from '../../database/db';
import { ALERT_STYLE, ALERT } from '../../engine/alertLogic';
import { formatDate, relativeDate, ageBandLabel } from '../../utils/dateFormatter';

const speak = (text, lang) => {
  Speech.stop();
  Speech.speak(text, { language: lang === 'ur' ? 'ur-PK' : 'en-US', rate: 0.85, onError: () => {} });
};

const HistoryScreen = ({ navigation, route }) => {
  const [language,    setLanguage]    = useState(route.params?.language || 'en');
  const [assessments, setAssessments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const isUrdu = language === 'ur';

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const lang = await getSetting('language');
      if (lang) setLanguage(lang);
      const rows = await getAllAssessments();
      setAssessments(rows);
      // Speak heading
      const heading = lang === 'ur' ? 'پچھلے معائنے' : 'Past Assessments';
      const count   = rows.length > 0
        ? (lang === 'ur' ? `${rows.length} معائنے محفوظ ہیں` : `${rows.length} assessment${rows.length > 1 ? 's' : ''} saved`)
        : (lang === 'ur' ? 'کوئی پچھلا معائنہ نہیں' : 'No past assessments');
      setTimeout(() => speak(heading + '. ' + count, lang || 'en'), 400);
    } catch (err) {
      console.error('History load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      isUrdu ? 'تاریخ مٹائیں' : 'Clear history',
      isUrdu ? 'کیا آپ کو یقین ہے؟ تمام نتائج مٹ جائیں گے۔' : 'Are you sure? All past results will be deleted.',
      [
        { text: isUrdu ? 'منسوخ' : 'Cancel', style:'cancel' },
        { text: isUrdu ? 'مٹائیں' : 'Clear all', style:'destructive',
          onPress: async () => { await clearAllHistory(); setAssessments([]); }
        },
      ]
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyEmoji}>📋</Text>
      <Text style={[styles.emptyTitle, isUrdu && styles.rtl]}>
        {isUrdu ? 'کوئی پچھلا معائنہ نہیں' : 'No past assessments'}
      </Text>
      <Text style={[styles.emptySub, isUrdu && styles.rtl]}>
        {isUrdu ? 'پہلا معائنہ مکمل کریں تو نتائج یہاں دکھائی دیں گے' : 'Complete your first assessment to see results here'}
      </Text>
      <TouchableOpacity style={styles.startBtn} onPress={() => navigation.navigate('Home', { language })} activeOpacity={0.85}>
        <Text style={styles.startBtnText}>{isUrdu ? 'ٹیسٹ شروع کریں' : 'Start an assessment'}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item, index }) => {
    const alert = item.overall_alert || ALERT.GREEN;
    const style = ALERT_STYLE[alert] || ALERT_STYLE[ALERT.GREEN];

    const speakItem = () => {
      const rel  = relativeDate(item.date, language);
      const band = ageBandLabel(item.age_band, language);
      const al   = getAlertLabel(alert, isUrdu);
      speak(`${rel}. ${al}. ${band}`, language);
    };

    return (
      <TouchableOpacity
        style={[styles.row, index === 0 && styles.rowFirst]}
        onPress={() => {
          speakItem();
          navigation.navigate('HistoryDetail', { assessmentId: item.id, language });
        }}
        activeOpacity={0.8}
      >
        <View style={[styles.strip, { backgroundColor: style.bg }]}>
          <Feather name={style.icon} size={18} color={style.text} />
        </View>
        <View style={styles.rowContent}>
          <View style={styles.rowTop}>
            <Text style={[styles.rowDate, isUrdu && styles.rtl]}>{relativeDate(item.date, language)}</Text>
            <View style={[styles.alertPill, { backgroundColor: style.bg, borderColor: style.border }]}>
              <Text style={[styles.alertPillText, { color: style.text }]}>{getAlertLabel(alert, isUrdu)}</Text>
            </View>
          </View>
          <Text style={[styles.rowFullDate, isUrdu && styles.rtl]}>{formatDate(item.date, language)}</Text>
          <View style={styles.rowMeta}>
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>👤 {ageBandLabel(item.age_band, language)}</Text>
            </View>
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>🌐 {item.language === 'ur' ? 'اردو' : 'English'}</Text>
            </View>
          </View>
        </View>
        <Feather name={isUrdu ? 'chevron-left' : 'chevron-right'} size={18} color="#C0C3CA" style={styles.rowChevron} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={[styles.heading, isUrdu && styles.rtl]}>{isUrdu ? 'پچھلے معائنے' : 'Past Assessments'}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => speak(isUrdu ? 'پچھلے معائنے' : 'Past Assessments', language)} style={styles.audioBtn}>
            <Feather name="volume-2" size={18} color="#1A6FD4" />
          </TouchableOpacity>
          {assessments.length > 0 && (
            <TouchableOpacity onPress={handleClearHistory} style={styles.clearBtn}>
              <Feather name="trash-2" size={18} color="#993C1D" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {assessments.length > 0 && (
        <Text style={[styles.countLabel, isUrdu && styles.rtl]}>
          {isUrdu ? `${assessments.length} معائنے محفوظ` : `${assessments.length} saved`}
        </Text>
      )}

      <FlatList
        data={assessments}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={!loading ? renderEmpty : null}
        contentContainerStyle={[styles.listContent, assessments.length === 0 && styles.listContentEmpty]}
        showsVerticalScrollIndicator={false}
        onRefresh={loadData}
        refreshing={loading}
      />
    </SafeAreaView>
  );
};

const getAlertLabel = (alert, isUrdu) => ({
  green:'معمول', yellow:'معمولی', red:'ڈاکٹر دیکھیں', urgent:'فوری',
}[alert] || (isUrdu ? alert : { green:'Normal', yellow:'Mild', red:'See doctor', urgent:'Urgent' }[alert] || alert));

const styles = StyleSheet.create({
  safe:             { flex:1, backgroundColor:'#F5F6F8' },
  rtl:              { textAlign:'right', writingDirection:'rtl' },
  header:           { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:20, paddingTop:20, paddingBottom:8 },
  heading:          { fontSize:24, fontWeight:'800', color:'#1A1C1E' },
  headerRight:      { flexDirection:'row', gap:10, alignItems:'center' },
  audioBtn:         { padding:6 },
  clearBtn:         { padding:6 },
  countLabel:       { fontSize:13, color:'#9EA3AB', paddingHorizontal:20, marginBottom:12 },
  listContent:      { paddingHorizontal:16, paddingBottom:32 },
  listContentEmpty: { flex:1, justifyContent:'center' },
  row:              { flexDirection:'row', alignItems:'center', backgroundColor:'#FFFFFF', borderRadius:14, borderWidth:1, borderColor:'#E2E4E8', marginBottom:10, overflow:'hidden' },
  rowFirst:         { marginTop:4 },
  strip:            { width:44, alignSelf:'stretch', alignItems:'center', justifyContent:'center' },
  rowContent:       { flex:1, padding:14 },
  rowTop:           { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:3 },
  rowDate:          { fontSize:15, fontWeight:'700', color:'#1A1C1E' },
  rowFullDate:      { fontSize:12, color:'#9EA3AB', marginBottom:8 },
  alertPill:        { paddingHorizontal:10, paddingVertical:3, borderRadius:20, borderWidth:1 },
  alertPillText:    { fontSize:11, fontWeight:'600' },
  rowMeta:          { flexDirection:'row', gap:8 },
  metaChip:         { backgroundColor:'#F5F6F8', paddingHorizontal:8, paddingVertical:3, borderRadius:20 },
  metaChipText:     { fontSize:11, color:'#9EA3AB' },
  rowChevron:       { marginRight:12 },
  emptyWrap:        { alignItems:'center', padding:32 },
  emptyEmoji:       { fontSize:48, marginBottom:16 },
  emptyTitle:       { fontSize:18, fontWeight:'700', color:'#1A1C1E', marginBottom:8 },
  emptySub:         { fontSize:14, color:'#9EA3AB', textAlign:'center', lineHeight:20 },
  startBtn:         { marginTop:24, backgroundColor:'#1A6FD4', borderRadius:12, paddingVertical:13, paddingHorizontal:28 },
  startBtnText:     { color:'#fff', fontSize:15, fontWeight:'600' },
});

export default HistoryScreen;
