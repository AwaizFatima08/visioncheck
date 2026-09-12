// VisionCheck — Navigation
// app/navigation/AppNavigator.js
// Updated import paths matching actual folder structure

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

// ─── Onboarding screens ───────────────────────────────────────────────────────
import SplashScreen         from '../screens/onboarding/SplashScreen';
import LanguageSelectScreen from '../screens/onboarding/LanguageSelectScreen';
import DisclaimerScreen     from '../screens/onboarding/DisclaimerScreen';

// ─── Home screens ─────────────────────────────────────────────────────────────
import HomeScreen            from '../screens/home/HomeScreen';
import AgeBandScreen         from '../screens/home/AgeBandScreen';
import SymptomSelectorScreen from '../screens/home/SymptomSelectorScreen';
import RecommendedTestsScreen from '../screens/home/RecommendedTestsScreen';
import PreTestSetupScreen    from '../screens/home/PreTestSetupScreen';

// ─── Test screens ─────────────────────────────────────────────────────────────
import TestDistanceScreen    from '../screens/tests/TestDistanceScreen';
import TestNearScreen        from '../screens/tests/TestNearScreen';
import TestAstigmatismScreen from '../screens/tests/TestAstigmatismScreen';
import TestContrastScreen    from '../screens/tests/TestContrastScreen';
import TestAmslerScreen      from '../screens/tests/TestAmslerScreen';
import TestColorScreen       from '../screens/tests/TestColorScreen';

// ─── Result screens ───────────────────────────────────────────────────────────
import TestResultScreen   from '../screens/results/TestResultScreen';
import FinalSummaryScreen from '../screens/results/FinalSummaryScreen';

// ─── History screens ──────────────────────────────────────────────────────────
import HistoryScreen       from '../screens/history/HistoryScreen';
import HistoryDetailScreen from '../screens/history/HistoryDetailScreen';

// ─── Settings screens ─────────────────────────────────────────────────────────
import SettingsScreen       from '../screens/settings/SettingsScreen';
import DisclaimerViewScreen from '../screens/settings/DisclaimerViewScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ─── Main tab navigator ───────────────────────────────────────────────────────
const MainTabs = ({ route }) => {
  const language = route.params?.language || 'en';
  const isUrdu   = language === 'ur';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   '#1A6FD4',
        tabBarInactiveTintColor: '#9EA3AB',
        tabBarStyle: {
          borderTopColor: '#E2E4E8',
          paddingBottom:  6,
          paddingTop:     6,
          height:         60,
        },
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        initialParams={{ language }}
        options={{
          tabBarLabel: isUrdu ? 'ہوم' : 'Home',
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        initialParams={{ language }}
        options={{
          tabBarLabel: isUrdu ? 'تاریخ' : 'History',
          tabBarIcon: ({ color, size }) => (
            <Feather name="clock" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        initialParams={{ language }}
        options={{
          tabBarLabel: isUrdu ? 'ترتیبات' : 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// ─── Root stack navigator ─────────────────────────────────────────────────────
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        {/* Onboarding */}
        <Stack.Screen name="Splash"          component={SplashScreen} />
        <Stack.Screen name="LanguageSelect"  component={LanguageSelectScreen} />
        <Stack.Screen name="Disclaimer"      component={DisclaimerScreen} />

        {/* Main app with tabs */}
        <Stack.Screen name="MainTabs"        component={MainTabs} />

        {/* Assessment flow */}
        <Stack.Screen name="AgeBand"           component={AgeBandScreen} />
        <Stack.Screen name="SymptomSelector"   component={SymptomSelectorScreen} />
        <Stack.Screen name="RecommendedTests"  component={RecommendedTestsScreen} />
        <Stack.Screen name="PreTestSetup"      component={PreTestSetupScreen} />

        {/* Tests */}
        <Stack.Screen name="TestDistance"    component={TestDistanceScreen} />
        <Stack.Screen name="TestNear"        component={TestNearScreen} />
        <Stack.Screen name="TestAstigmatism" component={TestAstigmatismScreen} />
        <Stack.Screen name="TestContrast"    component={TestContrastScreen} />
        <Stack.Screen name="TestAmsler"      component={TestAmslerScreen} />
        <Stack.Screen name="TestColor"       component={TestColorScreen} />

        {/* Results */}
        <Stack.Screen name="TestResult"    component={TestResultScreen} />
        <Stack.Screen name="FinalSummary"  component={FinalSummaryScreen} />

        {/* History */}
        <Stack.Screen name="HistoryDetail" component={HistoryDetailScreen} />

        {/* Settings */}
        <Stack.Screen name="DisclaimerView" component={DisclaimerViewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;