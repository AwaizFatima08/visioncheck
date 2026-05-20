// VisionCheck — Amsler Grid Component
// app/components/charts/AmslerGrid.js
//
// Renders a standard Amsler grid using SVG.
// Standard: 10×10 grid, each square = 1cm at 30cm viewing distance.
// Sizes are DPI-calibrated via TEST_SIZES.
//
// CRITICAL INSTRUCTION: User must fix gaze on centre dot only.
// Any distortion, waviness, or missing areas while staring at centre = URGENT.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Line, Circle, Rect } from 'react-native-svg';
import { TEST_SIZES } from '../../engine/dpiCalc';

const GRID_LINES = 10; // 10×10 grid = 11 lines each direction

const AmslerGrid = () => {
  const gridSize   = TEST_SIZES.amslerGridTotal;
  const squareSize = TEST_SIZES.amslerSquare;
  const cx         = gridSize / 2;
  const cy         = gridSize / 2;

  // Vertical lines
  const verticalLines = Array.from({ length: GRID_LINES + 1 }, (_, i) => ({
    x: i * squareSize,
    y1: 0,
    y2: gridSize,
  }));

  // Horizontal lines
  const horizontalLines = Array.from({ length: GRID_LINES + 1 }, (_, i) => ({
    y: i * squareSize,
    x1: 0,
    x2: gridSize,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>Fix your gaze on the centre dot only — do not look away</Text>
      <Text style={styles.hintUr}>صرف درمیانی نقطے کو دیکھیں — نظر ہٹائیں نہیں</Text>

      <View style={styles.chartWrap}>
        <Svg width={gridSize} height={gridSize}>
          {/* White background */}
          <Rect x="0" y="0" width={gridSize} height={gridSize} fill="#FFFFFF" />

          {/* Vertical grid lines */}
          {verticalLines.map((line, i) => (
            <Line
              key={`v${i}`}
              x1={line.x.toFixed(2)} y1={line.y1}
              x2={line.x.toFixed(2)} y2={line.y2}
              stroke="#1A1C1E"
              strokeWidth="0.8"
            />
          ))}

          {/* Horizontal grid lines */}
          {horizontalLines.map((line, i) => (
            <Line
              key={`h${i}`}
              x1={line.x1} y1={line.y.toFixed(2)}
              x2={line.x2} y2={line.y.toFixed(2)}
              stroke="#1A1C1E"
              strokeWidth="0.8"
            />
          ))}

          {/* Centre dot — must be clearly visible */}
          <Circle cx={cx} cy={cy} r="4" fill="#1A1C1E" />
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E4E8',
    padding: 12,
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
    marginBottom: 10,
    textAlign: 'center',
  },
  chartWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default AmslerGrid;
