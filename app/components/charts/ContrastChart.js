// VisionCheck — Contrast sensitivity letters
// app/components/charts/ContrastChart.js
//
// One triplet of letters at a given grey. Letter height is 11 mm (about 1.6
// degrees at 40 cm), drawn with the stored screen calibration.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TEST_SIZES } from '../../engine/dpiCalc';

const ContrastChart = ({ letters, color }) => (
  <View style={styles.container}>
    <View style={styles.row}>
      {letters.map((letter, i) => (
        <Text key={i} style={[styles.letter, { fontSize: TEST_SIZES.contrastLetter, color }]}>
          {letter}
        </Text>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E4E8',
    paddingVertical: 28,
    alignItems: 'center',
    marginVertical: 12,
  },
  row:    { flexDirection: 'row', gap: 22 },
  letter: { fontWeight: '700' },
});

export default ContrastChart;
