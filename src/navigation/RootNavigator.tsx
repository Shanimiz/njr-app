import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { useApp } from '@/context/AppContext';
import { ChapterSelectScreen } from '@/screens/onboarding/ChapterSelectScreen';
import { JoinChapterScreen } from '@/screens/onboarding/JoinChapterScreen';
import { RequestSentScreen } from '@/screens/onboarding/RequestSentScreen';
import { CompleteProfileScreen } from '@/screens/onboarding/CompleteProfileScreen';
import { MainTabs } from './MainTabs';
import { DirectMessagesScreen } from '@/screens/main/DirectMessagesScreen';
import { DMThreadScreen } from '@/screens/main/DMThreadScreen';
import { NewMessageScreen } from '@/screens/main/NewMessageScreen';
import { UserProfileScreen } from '@/screens/main/UserProfileScreen';
import { PaymentScreen } from '@/screens/main/PaymentScreen';
import { PaymentMethodScreen } from '@/screens/main/PaymentMethodScreen';
import { EditPrivateInfoScreen } from '@/screens/main/EditPrivateInfoScreen';
import { ManageRequestsScreen } from '@/screens/main/ManageRequestsScreen';
import { ReviewFeedbackScreen } from '@/screens/main/ReviewFeedbackScreen';
import { colors } from '@/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { activeChapterId, hydrated } = useApp();
  const hasChosenChapter = activeChapterId !== null;

  // Brief check of on-device storage for a returning member — see
  // AppContext. Usually instant; this just avoids a flash of the
  // registration screen before that check finishes.
  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.navy }}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  // ROOT-CAUSE FIX: this used to swap which screens even EXIST depending on
  // hasChosenChapter, so a screen calling navigation.navigate('Main') could
  // silently do nothing if 'Main' hadn't been added to the navigator's
  // screen set yet at that exact moment (React re-renders this component
  // asynchronously after a dispatch — the navigator doesn't retroactively
  // jump anywhere just because a new screen becomes available to it). That
  // was invisible whenever code was ALSO relying on canGoBack() to decide
  // whether to navigate — on a screen with no back history (a fresh app
  // launch, since ChapterSelect starts as the root route), canGoBack() is
  // false, so the navigate call was skipped entirely and nothing happened.
  // Confirmed via a debug alert: tapping an already-approved chapter on a
  // fresh launch showed canGoBack: false and never entered the app.
  //
  // Fix: register every screen unconditionally, all the time. Only the
  // FIRST screen shown on a cold launch changes (initialRouteName below) —
  // 'Main' is always a valid, always-present navigate() target after that,
  // so every screen that does navigation.navigate('Main') (ChapterSelect,
  // RequestSent, CompleteProfile) now reliably works regardless of where in
  // the app that navigate call happens to fire from.
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={hasChosenChapter ? 'Main' : 'ChapterSelect'}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="ChapterSelect" component={ChapterSelectScreen} />
        <Stack.Screen name="JoinChapter" component={JoinChapterScreen} />
        <Stack.Screen name="RequestSent" component={RequestSentScreen} />
        <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
        <Stack.Screen name="DirectMessages" component={DirectMessagesScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="DMThread" component={DMThreadScreen} />
        <Stack.Screen name="NewMessage" component={NewMessageScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="EditPrivateInfo" component={EditPrivateInfoScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="ManageRequests" component={ManageRequestsScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="ReviewFeedback" component={ReviewFeedbackScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
