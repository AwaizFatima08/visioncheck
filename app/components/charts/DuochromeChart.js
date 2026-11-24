// VisionCheck — Duochrome (red-green) chart
// app/components/charts/DuochromeChart.js
//
// Black optotypes on a red half and a green half. Because the eye focuses red
// light slightly behind green, a short-sighted eye tends to see the red side
// more clearly and a long-sighted eye the green side. Letters are drawn at a
// true 20/50 size for the 40 cm test distance, with different orientations on
// each side so the sides cannot be matched by memory.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { TEST_SIZES } from '../../engine/dpiCalc';

const RED   = '#FF2A2A';
const GREEN = '#00A04C';

const LEFT_ROTATIONS  = [0, 90, 270, 180];
const RIGHT_ROTATIONS = [180, 0, 90, 270];

const Optotype = ({ size, rotation }) => (
  <Svg width={size} height={size} viewBox="0 0 5 5" style={{ transform: [{ rotate: `${rotation}deg` }] }}>
    <Rect x="0" y="0" width="1" height="5" fill="#000000" />
    <Rect x="0" y="0" width="5" height="1" fill="#000000" />
    <Rect x="0" y="2" width="5" height="1" fill="#000000" />
    <Rect x="0" y="4" width="5" height="1" fill="#000000" />
  </Svg>
);

const Panel = ({ color, rotations, size, label }) => (
  <View style={[styles.panel, { backgroundColor: color }]}>
    <View style={styles.grid}>
      {rotations.map((rotation, i) => (
        <View key={i} style={styles.cell}>
          <Optotype size={size} rotation={rotation} />
        </View>
      ))}
    </View>
    <Text style={styles.label}>{label}</Text>
  </View>
);

const DuochromeChart = () => {
  const rows = TEST_SIZES.snellen;
  const row  = rows.find(r => r.den === 50) || rows[rows.length - 1];

  return (
    <View style={styles.container}>
      <Panel color={RED}   rotations={LEFT_ROTATIONS}  size={row.heightDp} label="RED" />
      <Panel color={GREEN} rotations={RIGHT_ROTATIONS} size={row.heightDp} label="GREEN" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', borderRadius: 14, overflow: 'hidden', marginVertical: 12 },
  panel:     { flex: 1, height: 180, alignItems: 'center', justifyContent: 'center' },
  grid:      { flexDirection: 'row', flexWrap: 'wrap', width: 110, justifyContent: 'space-between', rowGap: 26 },
  cell:      { width: 40, alignItems: 'center' },
  label:     { position: 'absolute', bottom: 8, fontSize: 10, fontWeight: '700', color: 'rgba(0,0,0,0.45)', letterSpacing: 1 },
});

export default DuochromeChart;
