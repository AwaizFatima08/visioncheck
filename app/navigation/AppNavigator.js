// VisionCheck — Navigation
// React Navigation setup for all screens

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { colors } from '../components/ui';

// Screens — Sprint 1
import SplashScreen from '../screens/SplashScreen';
import LanguageSelectScreen from '../screens/LanguageSelectScreen';
import DisclaimerScreen from '../screens/DisclaimerScreen';
import AgeBandScreen from '../screens/AgeBandScreen';
import HomeScreen from '../screens/HomeScreen';
import SymptomSelectorScreen from '../screens/SymptomSelectorScreen';
import RecommendedTestsScreen from '../screens/RecommendedTestsScreen';
import PreTestSetupScreen from '../screens/PreTestSetupScreen';
import HistoryScreen from '../screens/HistoryScreen';
import HistoryDetailScreen from '../screens/HistoryDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DisclaimerViewScreen from '../screens/DisclaimerViewScreen';

// Test screens — Sprint 2 onwards (placeholders for now)
import TestDistanceScreen from '../screens/tests/TestDistanceScreen';
import TestNearScreen from '../screens/tests/TestNearScreen';
import TestAstigmatismScreen from '../screens/tests/TestAstigmatismScreen';
import TestContrastScreen from '../screens/tests/TestContrastScreen';
import TestAmslerScreen from '../screens/tests/TestAmslerScreen';
import TestColorScreen from '../screens/tests/TestColorScreen';
import TestResultScreen from '../screens/tests/TestResultScreen';
import FinalSummaryScreen from '../screens/FinalSummaryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Main Tab Navigator (shown after onboarding) ──────────────────────────────
const MainTabs = ({ route }) => {
  const { language } = route.params || { language: 'en' };

  const tabLabels = {
    en: { home: 'Home', history: 'History', settings: 'Settings' },
    ur: { home: 'ہوم', history: 'تاریخ', settings: 'ترتیبات' },
  };
  const labels = tabLabels[language] || tabLabels.en;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textHint,
        tabBarStyle: {
          borderTopColor: colors.border,
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        initialParams={{ language }}
        options={{
          tabBarLabel: labels.home,
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        initialParams={{ language }}
        options={{
          tabBarLabel: labels.history,
          tabBarIcon: ({ color, size }) => <Feather name="clock" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        initialParams={{ language }}
        options={{
          tabBarLabel: labels.settings,
          tabBarIcon: ({ color, size }) => <Feather name="settings" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

// ─── Root Stack Navigator ─────────────────────────────────────────────────────
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        {/* Onboarding */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
        <Stack.Screen name="Disclaimer" component={DisclaimerScreen} />

        {/* Main app */}
        <Stack.Screen name="MainTabs" component={MainTabs} />

        {/* Assessment flow */}
        <Stack.Screen name="AgeBand" component={AgeBandScreen} />
        <Stack.Screen name="SymptomSelector" component={SymptomSelectorScreen} />
        <Stack.Screen name="RecommendedTests" component={RecommendedTestsScreen} />
        <Stack.Screen name="PreTestSetup" component={PreTestSetupScreen} />

        {/* Individual tests */}
        <Stack.Screen name="TestDistance" component={TestDistanceScreen} />
        <Stack.Screen name="TestNear" component={TestNearScreen} />
        <Stack.Screen name="TestAstigmatism" component={TestAstigmatismScreen} />
        <Stack.Screen name="TestContrast" component={TestContrastScreen} />
        <Stack.Screen name="TestAmsler" component={TestAmslerScreen} />
        <Stack.Screen name="TestColor" component={TestColorScreen} />
        <Stack.Screen name="TestResult" component={TestResultScreen} />

        {/* Final summary */}
        <Stack.Screen name="FinalSummary" component={FinalSummaryScreen} />

        {/* History detail */}
        <Stack.Screen name="HistoryDetail" component={HistoryDetailScreen} />

        {/* Disclaimer view from settings */}
        <Stack.Screen name="DisclaimerView" component={DisclaimerViewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
