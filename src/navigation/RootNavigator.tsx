import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { useApp } from '@/context/AppContext';
import { ChapterSelectScreen } from '@/screens/onboarding/ChapterSelectScreen';
import { JoinChapterScreen } from '@/screens/onboarding/JoinChapterScreen';
import { MainTabs } from './MainTabs';
import { DirectMessagesScreen } from '@/screens/main/DirectMessagesScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { activeChapterId } = useApp();
  const hasChosenChapter = activeChapterId !== null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasChosenChapter ? (
          <Stack.Screen name="ChapterSelect" component={ChapterSelectScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="JoinChapter" component={JoinChapterScreen} />
            <Stack.Screen name="DirectMessages" component={DirectMessagesScreen} options={{ presentation: 'modal' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
