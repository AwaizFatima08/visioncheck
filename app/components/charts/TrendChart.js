// VisionCheck — small line chart for result trends
// app/components/charts/TrendChart.js
//
// series: [{ label, color, points: [{ value }] }]. Points are spaced evenly in
// the order the checks were taken. `lowerIsBetter` flips the axis so that a
// higher point always means a better result.

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Polyline, Circle, Text as SvgText } from 'react-native-svg';

const WIDTH  = Dimensions.get('window').width - 40 - 28;   // screen padding + card padding
const HEIGHT = 150;
const PAD_L  = 34;
const PAD_R  = 10;
const PAD_T  = 10;
const PAD_B  = 14;

const TrendChart = ({ series, yMin, yMax, lowerIsBetter = false, format = (v) => String(v) }) => {
  const count  = Math.max(...series.map(s => s.points.length), 1);
  const innerW = WIDTH - PAD_L - PAD_R;
  const innerH = HEIGHT - PAD_T - PAD_B;

  const x = (i) => PAD_L + (count === 1 ? innerW / 2 : (i / (count - 1)) * innerW);
  const y = (v) => {
    const t = (Math.min(yMax, Math.max(yMin, v)) - yMin) / (yMax - yMin);
    return PAD_T + (lowerIsBetter ? t : 1 - t) * innerH;
  };

  const topLabel    = lowerIsBetter ? yMin : yMax;
  const bottomLabel = lowerIsBetter ? yMax : yMin;

  return (
    <View>
      <Svg width={WIDTH} height={HEIGHT}>
        <Line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + innerH} stroke="#E2E4E8" strokeWidth="1" />
        <Line x1={PAD_L} y1={PAD_T + innerH} x2={PAD_L + innerW} y2={PAD_T + innerH} stroke="#E2E4E8" strokeWidth="1" />
        <SvgText x={PAD_L - 4} y={PAD_T + 8} fontSize="9" fill="#9EA3AB" textAnchor="end">{format(topLabel)}</SvgText>
        <SvgText x={PAD_L - 4} y={PAD_T + innerH} fontSize="9" fill="#9EA3AB" textAnchor="end">{format(bottomLabel)}</SvgText>

        {series.map((s) => (
          <React.Fragment key={s.label}>
            {s.points.length > 1 && (
              <Polyline
                points={s.points.map((p, i) => `${x(i)},${y(p.value)}`).join(' ')}
                fill="none"
                stroke={s.color}
                strokeWidth="2"
              />
            )}
            {s.points.map((p, i) => (
              <Circle key={i} cx={x(i)} cy={y(p.value)} r="4" fill={s.color} />
            ))}
          </React.Fragment>
        ))}
      </Svg>
      <View style={styles.legend}>
        {series.map((s) => (
          <View key={s.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: s.color }]} />
            <Text style={styles.legendText}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  legend:     { flexDirection: 'row', gap: 16, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:  { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: '#5A5D63' },
});

export default TrendChart;
