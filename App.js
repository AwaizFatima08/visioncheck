// VisionCheck — نظر کا معائنہ
// Entry point

import React, { useEffect } from 'react';
import { initDatabase } from './app/database/db';
import AppNavigator from './app/navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    initDatabase().catch(err => console.error('DB init error:', err));
  }, []);

  return <AppNavigator />;
}
