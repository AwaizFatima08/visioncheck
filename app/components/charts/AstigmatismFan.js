// VisionCheck — Astigmatism Fan Chart Component
// app/components/charts/AstigmatismFan.js
//
// Renders a starburst/fan chart using SVG.
// 12 lines at 15° intervals radiating from a centre dot.
// User notes if any lines appear darker or blurrier than others.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Line, Circle, G } from 'react-native-svg';
import { TEST_SIZES } from '../../engine/dpiCalc';

const AstigmatismFan = () => {
  const size     = TEST_SIZES.fanChartDiameter;
  const cx       = size / 2;
  const cy       = size / 2;
  const radius   = (size / 2) - 8;
  const numLines = 12;

  // Generate 12 lines at 15° intervals (0° to 165°)
  // Each line passes through centre — so it extends in both directions
  const lines = Array.from({ length: numLines }, (_, i) => {
    const angleDeg = i * (180 / numLines);
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x1: cx + radius * Math.cos(angleRad),
      y1: cy + radius * Math.sin(angleRad),
      x2: cx - radius * Math.cos(angleRad),
      y2: cy - radius * Math.sin(angleRad),
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>Stare at the centre dot. Do all lines look equally dark?</Text>
      <Text style={styles.hintUr}>درمیانی نقطے کو دیکھیں۔ کیا تمام لکیریں یکساں گہری ہیں؟</Text>

      <View style={styles.chartWrap}>
        <Svg width={size} height={size}>
          <G>
            {lines.map((line, i) => (
              <Line
                key={i}
                x1={line.x1.toFixed(2)}
                y1={line.y1.toFixed(2)}
                x2={line.x2.toFixed(2)}
                y2={line.y2.toFixed(2)}
                stroke="#1A1C1E"
                strokeWidth="1.5"
              />
            ))}
            {/* Centre dot */}
            <Circle cx={cx} cy={cy} r="5" fill="#1A1C1E" />
          </G>
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
    padding: 16,
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
    marginBottom: 12,
    textAlign: 'center',
  },
  chartWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AstigmatismFan;
