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

const PLATE_SIZE  = 240;
const DOT_COUNT   = 1600;
// Everything below was tuned against a 200px plate; scaling every dimension
// by this factor keeps the same proportions at the larger size instead of
// re-deriving constants by hand.
const PLATE_SCALE = PLATE_SIZE / 200;

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
  const radius = PLATE_SIZE / 2 - 4 * PLATE_SCALE;

  return Array.from({ length: DOT_COUNT }, (_, i) => {
    // Deterministic x,y within the circle
    const angle  = (i * 137.508 * Math.PI) / 180; // golden angle distribution
    const r      = Math.sqrt((i + 1) / DOT_COUNT) * radius;
    const x      = cx + r * Math.cos(angle);
    const y      = cy + r * Math.sin(angle);
    // Small dots packed densely (real Ishihara-style plates), not a few big
    // ones — that's what actually makes the digit strokes read as solid
    // shapes instead of a scatter of blobs.
    const dotR   = (1.6 + (i % 4) * (2.0 / 3)) * PLATE_SCALE;

    // Determine if this dot is part of the hidden number
    const inFigure = isInFigure(x, y, plate.number, cx, cy);

    return { x, y, r: dotR, inFigure };
  });
};

// ─── Digit shapes ──────────────────────────────────────────────────────────
// Each digit is a set of thick seven-segment-style strokes (same idea as a
// digital-clock digit, but sampled with dots instead of drawn solid). This
// avoids reproducing actual Ishihara plates — the number is an original
// dot-mosaic rendering of a generic digit outline, not a copyrighted design.
// A dot belongs to the figure if it falls within `stroke` px of any segment
// making up that digit.
const DIGIT_SEGMENTS_BY_NAME = {
  a: [[-13, -30], [13, -30]],  // top
  b: [[13, -30], [13, 0]],     // top-right
  c: [[13, 0], [13, 30]],      // bottom-right
  d: [[-13, 30], [13, 30]],    // bottom
  e: [[-13, 0], [-13, 30]],    // bottom-left
  f: [[-13, -30], [-13, 0]],   // top-left
  g: [[-13, 0], [13, 0]],      // middle
};

const DIGIT_SEGMENTS = {
  0: ['a', 'b', 'c', 'd', 'e', 'f'],
  1: ['b', 'c'],
  2: ['a', 'b', 'g', 'e', 'd'],
  3: ['a', 'b', 'g', 'c', 'd'],
  4: ['f', 'g', 'b', 'c'],
  5: ['a', 'f', 'g', 'c', 'd'],
  6: ['a', 'f', 'g', 'e', 'c', 'd'],
  7: ['a', 'b', 'c'],
  8: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  9: ['a', 'b', 'c', 'd', 'f', 'g'],
};

// Shortest distance from point (px,py) to line segment [p1,p2]
const distToSegment = (px, py, [x1, y1], [x2, y2]) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
};

const isInDigit = (localX, localY, digit, scale, stroke) => {
  const segs = DIGIT_SEGMENTS[digit];
  if (!segs) return false;
  return segs.some((name) => {
    const [p1, p2] = DIGIT_SEGMENTS_BY_NAME[name];
    const scaledP1 = [p1[0] * scale, p1[1] * scale];
    const scaledP2 = [p2[0] * scale, p2[1] * scale];
    return distToSegment(localX, localY, scaledP1, scaledP2) <= stroke;
  });
};

// Works for any 1- or 2-digit number — lays digits side by side, centred.
const isInFigure = (x, y, number, cx, cy) => {
  const dx = x - cx;
  const dy = y - cy;
  const digits    = String(number).split('').map(Number);
  const twoDigit  = digits.length > 1;
  const scaleBase  = twoDigit ? 0.8 : 1.5;
  const strokeBase = twoDigit ? 8 : 14;
  const scale     = scaleBase * PLATE_SCALE;
  const stroke    = strokeBase * PLATE_SCALE;
  // Spacing must clear each digit's own half-width *plus* its stroke bleed
  // on both sides, with an explicit gap on top — otherwise the two digits'
  // top/bottom bars touch and fuse into one blob (verified this was the
  // actual bug: a naive `26 * scale` spacing did not account for stroke
  // width at all, so thicker strokes silently merged adjacent digits).
  const halfWidthWithStroke = 13 * scale + stroke;
  const gapBase   = 16;
  const spacing   = 2 * halfWidthWithStroke + gapBase * PLATE_SCALE;
  const totalW    = (digits.length - 1) * spacing;
  const startX    = -totalW / 2;

  return digits.some((digit, i) => isInDigit(dx - (startX + i * spacing), dy, digit, scale, stroke));
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
          r={PLATE_SIZE / 2 - 2 * PLATE_SCALE}
          fill={plate.bgColor}
        />

        {/* Dots — figure colour or background colour. Fully opaque: alpha
            blending here only softened the figure/background contrast and
            made the hidden number harder to read, not easier. */}
        {dots.map((dot, i) => (
          <SvgCircle
            key={i}
            cx={dot.x.toFixed(1)}
            cy={dot.y.toFixed(1)}
            r={dot.r}
            fill={dot.inFigure ? plate.fgColor : plate.bgColor}
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
