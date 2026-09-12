// VisionCheck — نظر کا معائنہ
// Entry point — SDK 55 compatible
//
// CHANGES FROM SDK 50:
// - SplashScreen.preventAutoHideAsync() must be called before render
// - initDatabase() is now synchronous (expo-sqlite v15)
// - Added loading guard before rendering navigator

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { initDatabase } from './app/database/db';
import AppNavigator from './app/navigation/AppNavigator';

// Keep splash visible while app initialises
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      // initDatabase is now synchronous in SDK 55 (expo-sqlite v15)
      initDatabase();
    } catch (err) {
      console.error('DB init error:', err);
    } finally {
      setReady(true);
      SplashScreen.hideAsync();
    }
  }, []);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return <AppNavigator />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A6FD4',
  },
});
