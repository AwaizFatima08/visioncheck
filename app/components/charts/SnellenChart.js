// VisionCheck — Tumbling E Chart Component
// app/components/charts/SnellenChart.js
//
// Renders a single E at a specified row size and random rotation.
// Rotation is passed as prop so parent controls and records the correct answer.
// Drawn as an exact 5x5 grid (not a font glyph) at the true optotype size for
// a 40cm viewing distance, using the stored screen calibration.
//
// USAGE:
// <SnellenChart rowIndex={currentRow} rotation={currentRotation} />
//
// Rotations: 0=right(→), 90=down(↓), 180=left(←), 270=up(↑)

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { TEST_SIZES } from '../../engine/dpiCalc';

// Direction the E faces at each rotation angle
export const ROTATION_DIRECTIONS = {
  0:   { symbol: '→', labelEn: 'Right', labelUr: 'دائیں'  },
  90:  { symbol: '↓', labelEn: 'Down',  labelUr: 'نیچے'   },
  180: { symbol: '←', labelEn: 'Left',  labelUr: 'بائیں'  },
  270: { symbol: '↑', labelEn: 'Up',    labelUr: 'اوپر'   },
};

export const ALL_ROTATIONS = [0, 90, 180, 270];

// Returns a random rotation — called by parent screen
export const getRandomRotation = () => {
  return ALL_ROTATIONS[Math.floor(Math.random() * ALL_ROTATIONS.length)];
};

const SnellenChart = ({ rowIndex = 0, rotation = 0 }) => {
  const rows = TEST_SIZES.snellen;
  const row  = rows[rowIndex];
  const size = row ? row.heightDp : 30;

  return (
    <View style={styles.container}>
      {/* Row indicator dots */}
      <View style={styles.dotsRow}>
        {rows.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === rowIndex && styles.dotActive,
              i < rowIndex  && styles.dotDone,
            ]}
          />
        ))}
      </View>

      {/* The E — rotated */}
      <View style={styles.eWrap}>
        <Svg
          width={size}
          height={size}
          viewBox="0 0 5 5"
          style={{ transform: [{ rotate: `${rotation}deg` }] }}
        >
          <Rect x="0" y="0" width="1" height="5" fill="#1A1C1E" />
          <Rect x="0" y="0" width="5" height="1" fill="#1A1C1E" />
          <Rect x="0" y="2" width="5" height="1" fill="#1A1C1E" />
          <Rect x="0" y="4" width="5" height="1" fill="#1A1C1E" />
        </Svg>
      </View>

      {/* Acuity label — small, for reference */}
      <Text style={styles.acuityLabel}>
        {row ? row.acuity : ''}
      </Text>
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
    minHeight: 180,
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E4E8',
  },
  dotActive: { backgroundColor: '#1A6FD4' },
  dotDone:   { backgroundColor: '#3B6D11' },

  eWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  acuityLabel: {
    fontSize: 10,
    color: '#C0C3CA',
    marginTop: 12,
  },
});

export default SnellenChart;
