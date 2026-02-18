// src/components/navigation/StackNavigator.jsx
import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { flushPendingNavigation, navigationRef } from './navigationRef';

import { AuthProvider, useAuth } from '../../context/AuthContext';
import SplashScreen from '../splash/SplashScreen';

// Import your screens
import LoginScreen from '../login/LoginScreen';
import PasswordRecovery from '../password_recovery/PasswordRecoveryScreen';
import ProfileSetUpStudent from '../profile_setup/ProfileSetUpStudent';
import ProfileUpdateStudent from '../profile_update/ProfileUpdateStudent';
import ProfileUpdateTeacher from '../profile_update/ProfileUpdateTeacher';
import ProfileUpdateCr from '../profile_update/ProfileUpdateCr';
import ProfileSetUpTeacher from '../profile_setup/ProfileSetUpTeacher';
import ProfileSetUpCr from '../profile_setup/ProfileSetUpCr';
import StudentMainScreen from './StudentMainScreen';
import TeacherMainScreen from './TeacherMainScreen';
import SettingsScreen from '../settings/SettingsScreen';
import NotificationScreen from '../notifications/NotificationScreen';
import CRMainScreen from './CRMainScreen'; // Import CRMainScreen

// Create the Stack Navigator
const Stack = createNativeStackNavigator();

const SCREEN_OPTIONS = {
  headerShown: false,
  animation: 'slide_from_right',
  contentStyle: { backgroundColor: '#000000' },
};

const getMainRouteForRole = (role) => {
  if (role === 'teacher') return 'TeacherMainScreen';
  if (role === 'cr') return 'CRMainScreen';
  return 'StudentMainScreen';
};

const getSetupRouteForRole = (role) => {
  if (role === 'teacher') return 'ProfileSetUpTeacher';
  if (role === 'cr') return 'ProfileSetUpCr';
  return 'ProfileSetUpStudent';
};

const RootNavigator = () => {
  const { status, role } = useAuth();

  if (status === 'loading') {
    return (
      <Stack.Navigator initialRouteName="Splash" screenOptions={SCREEN_OPTIONS}>
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  if (status === 'authenticated') {
    if (!role) {
      return (
        <Stack.Navigator initialRouteName="Splash" screenOptions={SCREEN_OPTIONS}>
          <Stack.Screen name="Splash" component={SplashScreen} />
        </Stack.Navigator>
      );
    }

    const mainRoute = getMainRouteForRole(role);
    return (
      <Stack.Navigator key={`app-${mainRoute}`} initialRouteName={mainRoute} screenOptions={SCREEN_OPTIONS}>
        <Stack.Screen name="StudentMainScreen" component={StudentMainScreen} />
        <Stack.Screen name="TeacherMainScreen" component={TeacherMainScreen} />
        <Stack.Screen name="CRMainScreen" component={CRMainScreen} />

        <Stack.Screen name="ProfileUpdateStudent" component={ProfileUpdateStudent} />
        <Stack.Screen name="ProfileUpdateTeacher" component={ProfileUpdateTeacher} />
        <Stack.Screen name="ProfileUpdateCr" component={ProfileUpdateCr} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Notifications" component={NotificationScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    );
  }

  const initialAuthRoute = status === 'setup' && role ? getSetupRouteForRole(role) : 'Login';

  return (
    <Stack.Navigator key={`auth-${initialAuthRoute}`} initialRouteName={initialAuthRoute} screenOptions={SCREEN_OPTIONS}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="PasswordRecovery" component={PasswordRecovery} />
      <Stack.Screen name="ProfileSetUpStudent" component={ProfileSetUpStudent} />
      <Stack.Screen name="ProfileSetUpTeacher" component={ProfileSetUpTeacher} />
      <Stack.Screen name="ProfileSetUpCr" component={ProfileSetUpCr} />
    </Stack.Navigator>
  );
};

const StackNavigator = () => {
  return (
    <AuthProvider>
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          flushPendingNavigation();
        }}
        onStateChange={() => {
          flushPendingNavigation();
        }}
      >
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  )
}

export default StackNavigator