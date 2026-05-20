// VisionCheck — Near Vision Chart Component
// app/components/charts/NearVisionChart.js
//
// Renders DPI-calibrated reading text.
// Language-aware: Urdu sentences when language='ur', English when language='en'.
// Urdu sentences are simple everyday text accessible to all literacy levels.
// DPI-calibrated at 30cm viewing distance.
//
// USAGE:
// <NearVisionChart language={language} />

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TEST_SIZES } from '../../engine/dpiCalc';

// Urdu sentences — simple everyday language, one per size level
// Chosen to be familiar to all literacy levels across Pakistan
const URDU_ROWS = [
  'بسم اللہ الرحمن الرحیم',                          // J10 — largest
  'آج موسم بہت اچھا ہے۔',                            // J5
  'پانی پیو اور صحت مند رہو۔',                       // J3
  'محنت کرنے والا کبھی نہیں ہارتا۔',                 // J1 — smallest
];

const ENGLISH_ROWS = [
  'The quick brown fox jumps over the lazy dog.',
  'She sells seashells by the seashore on sunny days.',
  'Pack my box with five dozen liquor jugs carefully.',
  'How vexingly quick daft zebras jump over the fence.',
];

const NearVisionChart = ({ language = 'en' }) => {
  const isUrdu = language === 'ur';
  const rows   = isUrdu ? URDU_ROWS : ENGLISH_ROWS;

  return (
    <View style={styles.container}>

      {/* Hint */}
      <Text style={[styles.hint, isUrdu && styles.rtl]}>
        {isUrdu
          ? 'سب سے چھوٹا متن پڑھیں جو آپ کو صاف نظر آئے'
          : 'Read the smallest text you can clearly see'}
      </Text>

      {/* Text rows */}
      {TEST_SIZES.near.map((row, index) => (
        <View key={index} style={styles.row}>
          <Text
            style={[
              styles.text,
              { fontSize: row.heightDp },
              isUrdu && styles.urduText,
            ]}
          >
            {rows[index]}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E4E8',
    padding: 16,
    marginVertical: 12,
  },
  hint: {
    fontSize: 11,
    color: '#9EA3AB',
    marginBottom: 14,
    textAlign: 'center',
  },
  rtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  row: {
    marginVertical: 5,
  },
  text: {
    color: '#1A1C1E',
  },
  urduText: {
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: 'System', // uses device Urdu font
  },
});

export default NearVisionChart;
