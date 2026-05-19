// VisionCheck — Shared UI Components
// Clean, accessible components used across all screens

import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { alertColors, alertIcons, ALERT } from '../engine/testEngine';

// ─── Colours ──────────────────────────────────────────────────────────────────
export const colors = {
  primary:    '#1A6FD4',
  primaryBg:  '#E8F1FB',
  surface:    '#FFFFFF',
  background: '#F5F6F8',
  border:     '#E2E4E8',
  textPrimary:'#1A1C1E',
  textSecond: '#5A5D63',
  textHint:   '#9EA3AB',
  urduText:   '#1A1C1E',
  green:      '#3B6D11',
  greenBg:    '#EAF3DE',
  yellow:     '#854F0B',
  yellowBg:   '#FAEEDA',
  red:        '#993C1D',
  redBg:      '#FAECE7',
  urgent:     '#A32D2D',
  urgentBg:   '#FCEBEB',
};

// ─── Typography helper ────────────────────────────────────────────────────────
export const isUrdu = (language) => language === 'ur';
export const textAlign = (language) => isUrdu(language) ? 'right' : 'left';
export const fontFamily = (language) => isUrdu(language) ? 'System' : 'System';

// ─── Primary Button ───────────────────────────────────────────────────────────
export const PrimaryButton = ({ label, onPress, disabled = false, loading = false, language = 'en' }) => (
  <TouchableOpacity
    style={[styles.primaryBtn, disabled && styles.disabledBtn]}
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.8}
  >
    {loading
      ? <ActivityIndicator color="#fff" size="small" />
      : <Text style={[styles.primaryBtnText, { textAlign: textAlign(language) }]}>{label}</Text>
    }
  </TouchableOpacity>
);

// ─── Secondary Button ─────────────────────────────────────────────────────────
export const SecondaryButton = ({ label, onPress, language = 'en' }) => (
  <TouchableOpacity style={styles.secondaryBtn} onPress={onPress} activeOpacity={0.7}>
    <Text style={[styles.secondaryBtnText, { textAlign: textAlign(language) }]}>{label}</Text>
  </TouchableOpacity>
);

// ─── Choice Button — for test answer options ──────────────────────────────────
export const ChoiceButton = ({ label, sublabel, onPress, language = 'en' }) => (
  <TouchableOpacity style={styles.choiceBtn} onPress={onPress} activeOpacity={0.7}>
    <Text style={[styles.choiceBtnLabel, { textAlign: textAlign(language) }]}>{label}</Text>
    {sublabel && (
      <Text style={[styles.choiceBtnSub, { textAlign: textAlign(language) }]}>{sublabel}</Text>
    )}
  </TouchableOpacity>
);

// ─── Screen Header ────────────────────────────────────────────────────────────
export const ScreenHeader = ({ title, subtitle, language = 'en', onBack = null }) => (
  <View style={styles.headerContainer}>
    {onBack && (
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Feather name={isUrdu(language) ? 'chevron-right' : 'chevron-left'} size={24} color={colors.textPrimary} />
      </TouchableOpacity>
    )}
    <View style={styles.headerText}>
      <Text style={[styles.headerTitle, { textAlign: textAlign(language) }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.headerSubtitle, { textAlign: textAlign(language) }]}>{subtitle}</Text>
      )}
    </View>
  </View>
);

// ─── Progress bar ─────────────────────────────────────────────────────────────
export const ProgressBar = ({ current, total }) => (
  <View style={styles.progressContainer}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          styles.progressDot,
          i < current && styles.progressDone,
          i === current && styles.progressCurrent,
        ]}
      />
    ))}
  </View>
);

// ─── Alert Banner ─────────────────────────────────────────────────────────────
export const AlertBanner = ({ level, title, body, language = 'en' }) => {
  const c = alertColors[level] || alertColors[ALERT.GREEN];
  const icon = alertIcons[level] || 'info';
  return (
    <View style={[styles.alertBanner, { backgroundColor: c.bg, borderColor: c.border }]}>
      <View style={styles.alertRow}>
        <Feather name={icon} size={20} color={c.text} style={styles.alertIcon} />
        <Text style={[styles.alertTitle, { color: c.text, textAlign: textAlign(language), flex: 1 }]}>
          {title}
        </Text>
      </View>
      {body && (
        <Text style={[styles.alertBody, { color: c.text, textAlign: textAlign(language) }]}>
          {body}
        </Text>
      )}
    </View>
  );
};

// ─── Info Card ────────────────────────────────────────────────────────────────
export const InfoCard = ({ children, style }) => (
  <View style={[styles.infoCard, style]}>{children}</View>
);

// ─── Section Label ────────────────────────────────────────────────────────────
export const SectionLabel = ({ text, language = 'en' }) => (
  <Text style={[styles.sectionLabel, { textAlign: textAlign(language) }]}>{text}</Text>
);

// ─── Distance Instruction Badge ───────────────────────────────────────────────
export const DistanceBadge = ({ text, language = 'en' }) => (
  <View style={styles.distanceBadge}>
    <Feather name="smartphone" size={16} color={colors.primary} />
    <Text style={[styles.distanceBadgeText, { textAlign: textAlign(language) }]}>{text}</Text>
  </View>
);

// ─── Audio Button ─────────────────────────────────────────────────────────────
export const AudioButton = ({ onPress, isPlaying = false }) => (
  <TouchableOpacity style={styles.audioBtn} onPress={onPress}>
    <Feather name={isPlaying ? 'volume-2' : 'volume'} size={20} color={colors.primary} />
  </TouchableOpacity>
);

// ─── Result Row — for summary screen ─────────────────────────────────────────
export const ResultRow = ({ testName, eyeLabel, alertLevel, language = 'en' }) => {
  const c = alertColors[alertLevel] || alertColors[ALERT.GREEN];
  return (
    <View style={styles.resultRow}>
      <View style={styles.resultRowLeft}>
        <Text style={[styles.resultRowName, { textAlign: textAlign(language) }]}>{testName}</Text>
        {eyeLabel && (
          <Text style={[styles.resultRowEye, { textAlign: textAlign(language) }]}>{eyeLabel}</Text>
        )}
      </View>
      <View style={[styles.resultPill, { backgroundColor: c.bg, borderColor: c.border }]}>
        <Feather name={alertIcons[alertLevel]} size={12} color={c.text} />
        <Text style={[styles.resultPillText, { color: c.text }]}>{alertLevel?.toUpperCase()}</Text>
      </View>
    </View>
  );
};

// ─── Guest Banner ─────────────────────────────────────────────────────────────
export const GuestBanner = ({ text }) => (
  <View style={styles.guestBanner}>
    <Feather name="info" size={14} color={colors.textSecond} />
    <Text style={styles.guestBannerText}>{text}</Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Buttons
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginVertical: 6,
  },
  disabledBtn: { backgroundColor: colors.textHint },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginVertical: 4,
  },
  secondaryBtnText: { color: colors.textPrimary, fontSize: 15 },

  choiceBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: colors.surface,
    marginVertical: 4,
  },
  choiceBtnLabel: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },
  choiceBtnSub: { fontSize: 12, color: colors.textSecond, marginTop: 2 },

  // Header
  headerContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  backBtn: { marginRight: 12, marginTop: 2 },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  headerSubtitle: { fontSize: 14, color: colors.textSecond, marginTop: 4, lineHeight: 20 },

  // Progress
  progressContainer: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  progressDot: { flex: 1, height: 3, borderRadius: 2, backgroundColor: colors.border },
  progressDone: { backgroundColor: colors.green },
  progressCurrent: { backgroundColor: colors.primary },

  // Alert
  alertBanner: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginVertical: 8,
  },
  alertRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  alertIcon: { marginRight: 8 },
  alertTitle: { fontSize: 15, fontWeight: '600' },
  alertBody: { fontSize: 13, lineHeight: 19, marginTop: 4 },

  // Cards
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginVertical: 8,
  },

  // Section label
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textHint,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 16,
  },

  // Distance badge
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryBg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    marginVertical: 8,
  },
  distanceBadgeText: { fontSize: 13, color: colors.primary, flex: 1, fontWeight: '500' },

  // Audio button
  audioBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Result row
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultRowLeft: { flex: 1 },
  resultRowName: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },
  resultRowEye: { fontSize: 12, color: colors.textSecond, marginTop: 1 },
  resultPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  resultPillText: { fontSize: 11, fontWeight: '600' },

  // Guest banner
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  guestBannerText: { fontSize: 12, color: colors.textSecond, flex: 1 },
});
