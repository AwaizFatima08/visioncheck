// VisionCheck — Local SQLite Database
// All data stays on device — no cloud, no server

import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('visioncheck.db');

// ─── Initialise all tables on first launch ──────────────────────────────────
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {

      // Settings — language, age band, disclaimer
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `);

      // Assessments — one row per full test session
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS assessments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          path TEXT NOT NULL,
          age_band TEXT NOT NULL,
          language TEXT NOT NULL,
          overall_alert TEXT,
          symptoms TEXT,
          completed INTEGER DEFAULT 0
        );
      `);

      // Test results — one row per individual test per assessment
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS test_results (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          assessment_id INTEGER NOT NULL,
          test_name TEXT NOT NULL,
          eye TEXT NOT NULL,
          response TEXT,
          alert_level TEXT,
          notes TEXT,
          FOREIGN KEY (assessment_id) REFERENCES assessments(id)
        );
      `);

    },
    (error) => reject(error),
    () => resolve()
    );
  });
};

// ─── Settings helpers ────────────────────────────────────────────────────────
export const getSetting = (key) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT value FROM settings WHERE key = ?',
        [key],
        (_, result) => {
          if (result.rows.length > 0) {
            resolve(result.rows.item(0).value);
          } else {
            resolve(null);
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const setSetting = (key, value) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        [key, value],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

// ─── Assessment helpers ──────────────────────────────────────────────────────
export const createAssessment = (path, ageBand, language, symptoms = null) => {
  return new Promise((resolve, reject) => {
    const date = new Date().toISOString();
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO assessments (date, path, age_band, language, symptoms, completed)
         VALUES (?, ?, ?, ?, ?, 0)`,
        [date, path, ageBand, language, symptoms ? JSON.stringify(symptoms) : null],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const completeAssessment = (assessmentId, overallAlert) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE assessments SET overall_alert = ?, completed = 1 WHERE id = ?',
        [overallAlert, assessmentId],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getAllAssessments = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM assessments WHERE completed = 1 ORDER BY date DESC',
        [],
        (_, result) => {
          const rows = [];
          for (let i = 0; i < result.rows.length; i++) {
            rows.push(result.rows.item(i));
          }
          resolve(rows);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getAssessmentById = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM assessments WHERE id = ?',
        [id],
        (_, result) => {
          if (result.rows.length > 0) {
            resolve(result.rows.item(0));
          } else {
            resolve(null);
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const clearAllHistory = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('DELETE FROM test_results', []);
      tx.executeSql('DELETE FROM assessments', [],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

// ─── Test result helpers ─────────────────────────────────────────────────────
export const saveTestResult = (assessmentId, testName, eye, response, alertLevel, notes = null) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO test_results (assessment_id, test_name, eye, response, alert_level, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [assessmentId, testName, eye, response, alertLevel, notes],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getTestResultsForAssessment = (assessmentId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM test_results WHERE assessment_id = ? ORDER BY id ASC',
        [assessmentId],
        (_, result) => {
          const rows = [];
          for (let i = 0; i < result.rows.length; i++) {
            rows.push(result.rows.item(i));
          }
          resolve(rows);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export default db;
