// VisionCheck — Contrast Sensitivity Chart Component
// app/components/charts/ContrastChart.js
//
// Renders the same text at 4 decreasing opacity levels.
// Tests ability to see low contrast — indicator of early cataracts or glaucoma.
// Both eyes open for this test.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Fixed font size — contrast test is not about letter size, only visibility
const FONT_SIZE = 18;

const LEVELS = [
  { label: 'Level 1', opacity: 0.90, text: 'VISION CHECK' },
  { label: 'Level 2', opacity: 0.45, text: 'VISION CHECK' },
  { label: 'Level 3', opacity: 0.20, text: 'VISION CHECK' },
  { label: 'Level 4', opacity: 0.10, text: 'VISION CHECK' },
];

const ContrastChart = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.hint}>Read each line — both eyes open</Text>
      <Text style={styles.hintUr}>دونوں آنکھیں کھول کر ہر لائن پڑھیں</Text>

      {LEVELS.map((level, index) => (
        <View key={index} style={styles.row}>
          <Text style={[styles.text, { opacity: level.opacity }]}>
            {level.text}
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
    padding: 20,
    alignItems: 'center',
    marginVertical: 12,
  },
  hint: {
    fontSize: 11,
    color: '#9EA3AB',
    marginBottom: 2,
    textAlign: 'center',
  },
  hintUr: {
    fontSize: 11,
    color: '#9EA3AB',
    marginBottom: 16,
    textAlign: 'center',
  },
  row: {
    marginVertical: 8,
    alignItems: 'center',
  },
  text: {
    fontSize:   FONT_SIZE,
    fontFamily: 'monospace',
    color:      '#000000',
    fontWeight: '500',
    letterSpacing: 3,
  },
});

export default ContrastChart;
