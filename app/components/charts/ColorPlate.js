// VisionCheck — Colour Vision Plate Component
// app/components/charts/ColorPlate.js
//
// Renders simplified colour vision test plates.
// NOT Ishihara plates (copyrighted) — original simplified dot-pattern design.
// Three plates testing red-green and blue-yellow colour discrimination.
//
// USAGE:
// <ColorPlate plateIndex={0} />  — shows plate 1 of 3

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle as SvgCircle } from 'react-native-svg';

const PLATE_SIZE = 200;
const DOT_COUNT  = 300;

// Three plates — background colour, figure colour, hidden number
export const COLOR_PLATES = [
  {
    index:      0,
    bgColor:    '#D4714A',  // orange-red
    fgColor:    '#6B9E3A',  // green
    number:     '6',
    tests:      'Red-green',
  },
  {
    index:      1,
    bgColor:    '#6B9E3A',  // green
    fgColor:    '#D4714A',  // orange-red
    number:     '29',
    tests:      'Red-green',
  },
  {
    index:      2,
    bgColor:    '#4A7BC8',  // blue
    fgColor:    '#C8A43A',  // yellow
    number:     '45',
    tests:      'Blue-yellow',
  },
];

// Deterministic dot layout — same every render, no randomness
// Uses a seeded pattern based on plate index and dot index
const generateDots = (plate) => {
  const cx     = PLATE_SIZE / 2;
  const cy     = PLATE_SIZE / 2;
  const radius = PLATE_SIZE / 2 - 4;

  return Array.from({ length: DOT_COUNT }, (_, i) => {
    // Deterministic x,y within the circle
    const angle  = (i * 137.508 * Math.PI) / 180; // golden angle distribution
    const r      = Math.sqrt((i + 1) / DOT_COUNT) * radius;
    const x      = cx + r * Math.cos(angle);
    const y      = cy + r * Math.sin(angle);
    const dotR   = 4 + (i % 3) * 1.5;

    // Determine if this dot is part of the hidden number
    const inFigure = isInFigure(x, y, plate.number, cx, cy);

    return { x, y, r: dotR, inFigure };
  });
};

// Simple geometric shapes representing each number
// Avoids exact Ishihara reproduction — original simplified approach
const isInFigure = (x, y, number, cx, cy) => {
  const dx = x - cx;
  const dy = y - cy;

  switch (number) {
    case '6':
      // Digit 6 — left half of centre region + lower loop
      return (dx > -40 && dx < 0 && dy > -30 && dy < 40) ||
             (Math.sqrt(dx * dx + (dy - 20) * (dy - 20)) < 25);

    case '29':
      // Digit 2 — left column, digit 9 — right column
      return (dx > -55 && dx < -15 && dy > -30 && dy < 30) ||
             (dx > 10 && dx < 50 && dy > -30 && dy < 10) ||
             (Math.sqrt((dx - 30) * (dx - 30) + dy * dy) < 22);

    case '45':
      // Digit 4 — left, digit 5 — right
      return (dx > -55 && dx < -15 && dy > -30 && dy < 0) ||
             (dx > -55 && dx < -25 && dy > 0 && dy < 30) ||
             (dx > 10 && dx < 50 && dy > -30 && dy < 30);

    default:
      return false;
  }
};

const ColorPlate = ({ plateIndex = 0 }) => {
  const plate = COLOR_PLATES[plateIndex] || COLOR_PLATES[0];
  const dots  = useMemo(() => generateDots(plate), [plateIndex]);

  return (
    <View style={styles.container}>
      <Svg width={PLATE_SIZE} height={PLATE_SIZE}>
        {/* Background circle */}
        <SvgCircle
          cx={PLATE_SIZE / 2}
          cy={PLATE_SIZE / 2}
          r={PLATE_SIZE / 2 - 2}
          fill={plate.bgColor}
        />

        {/* Dots — figure colour or background colour */}
        {dots.map((dot, i) => (
          <SvgCircle
            key={i}
            cx={dot.x.toFixed(1)}
            cy={dot.y.toFixed(1)}
            r={dot.r}
            fill={dot.inFigure ? plate.fgColor : plate.bgColor}
            opacity="0.9"
          />
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
});

export default ColorPlate;
