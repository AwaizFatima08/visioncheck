// VisionCheck — Local SQLite Database
// SDK 55 / expo-sqlite v15 compatible
// NEW API: openDatabaseSync + synchronous methods (no more callbacks)
// All data stays on device — no cloud, no server

import * as SQLite from 'expo-sqlite';

// ─── Open database synchronously (new API) ───────────────────────────────────
// OLD (SDK 50): SQLite.openDatabase('visioncheck.db')  ← CRASHES on Android 13+
// NEW (SDK 55): SQLite.openDatabaseSync('visioncheck.db')  ← correct
const db = SQLite.openDatabaseSync('visioncheck.db');

// ─── Initialise all tables on first launch ────────────────────────────────────
// OLD: callback-based transactions (tx.executeSql)   ← removed in v15
// NEW: synchronous execSync for DDL statements       ← correct
export const initDatabase = () => {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS settings (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS assessments (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        date           TEXT    NOT NULL,
        path           TEXT    NOT NULL,
        age_band       TEXT    NOT NULL,
        language       TEXT    NOT NULL,
        overall_alert  TEXT,
        symptoms       TEXT,
        completed      INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS test_results (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        assessment_id  INTEGER NOT NULL,
        test_name      TEXT    NOT NULL,
        eye            TEXT    NOT NULL,
        response       TEXT,
        alert_level    TEXT,
        notes          TEXT,
        FOREIGN KEY (assessment_id) REFERENCES assessments(id)
      );
    `);
  } catch (err) {
    console.error('initDatabase error:', err);
    throw err;
  }
};

// ─── Settings helpers ────────────────────────────────────────────────────────
// OLD: db.transaction(tx => tx.executeSql(..., callback))
// NEW: db.getFirstSync(sql, params) — returns first row or null

export const getSetting = (key) => {
  try {
    const row = db.getFirstSync(
      'SELECT value FROM settings WHERE key = ?',
      [key]
    );
    return row ? row.value : null;
  } catch (err) {
    console.error('getSetting error:', err);
    return null;
  }
};

export const setSetting = (key, value) => {
  try {
    db.runSync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      [key, value]
    );
  } catch (err) {
    console.error('setSetting error:', err);
    throw err;
  }
};

// ─── Assessment helpers ───────────────────────────────────────────────────────
export const createAssessment = (path, ageBand, language, symptoms = null) => {
  try {
    const date = new Date().toISOString();
    const result = db.runSync(
      `INSERT INTO assessments (date, path, age_band, language, symptoms, completed)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [date, path, ageBand, language, symptoms ? JSON.stringify(symptoms) : null]
    );
    return result.lastInsertRowId;
  } catch (err) {
    console.error('createAssessment error:', err);
    throw err;
  }
};

export const completeAssessment = (assessmentId, overallAlert) => {
  try {
    db.runSync(
      'UPDATE assessments SET overall_alert = ?, completed = 1 WHERE id = ?',
      [overallAlert, assessmentId]
    );
  } catch (err) {
    console.error('completeAssessment error:', err);
    throw err;
  }
};

// NEW: db.getAllSync(sql, params) — returns array of rows
export const getAllAssessments = () => {
  try {
    return db.getAllSync(
      'SELECT * FROM assessments WHERE completed = 1 ORDER BY date DESC',
      []
    );
  } catch (err) {
    console.error('getAllAssessments error:', err);
    return [];
  }
};

export const getAssessmentById = (id) => {
  try {
    return db.getFirstSync(
      'SELECT * FROM assessments WHERE id = ?',
      [id]
    );
  } catch (err) {
    console.error('getAssessmentById error:', err);
    return null;
  }
};

export const clearAllHistory = () => {
  try {
    db.execSync(`
      DELETE FROM test_results;
      DELETE FROM assessments;
    `);
  } catch (err) {
    console.error('clearAllHistory error:', err);
    throw err;
  }
};

// ─── Test result helpers ──────────────────────────────────────────────────────
export const saveTestResult = (assessmentId, testName, eye, response, alertLevel, notes = null) => {
  try {
    const result = db.runSync(
      `INSERT INTO test_results (assessment_id, test_name, eye, response, alert_level, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [assessmentId, testName, eye, response, alertLevel, notes]
    );
    return result.lastInsertRowId;
  } catch (err) {
    console.error('saveTestResult error:', err);
    throw err;
  }
};

export const getTestResultsForAssessment = (assessmentId) => {
  try {
    return db.getAllSync(
      'SELECT * FROM test_results WHERE assessment_id = ? ORDER BY id ASC',
      [assessmentId]
    );
  } catch (err) {
    console.error('getTestResultsForAssessment error:', err);
    return [];
  }
};

export default db;
