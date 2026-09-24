import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { MoreStackParamList } from './types';
import { MoreMenuScreen } from '@/screens/main/MoreMenuScreen';
import { MembersListScreen } from '@/screens/main/MembersListScreen';
import { DonateScreen } from '@/screens/main/DonateScreen';
import { MerchScreen } from '@/screens/main/MerchScreen';
import { FeedbackScreen } from '@/screens/main/FeedbackScreen';
import { RunningEtiquetteScreen } from '@/screens/main/RunningEtiquetteScreen';

const Stack = createNativeStackNavigator<MoreStackParamList>();

export function MoreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MoreMenu" component={MoreMenuScreen} />
      <Stack.Screen name="Members" component={MembersListScreen} />
      <Stack.Screen name="Donate" component={DonateScreen} />
      <Stack.Screen name="Merch" component={MerchScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
      <Stack.Screen name="Etiquette" component={RunningEtiquetteScreen} />
    </Stack.Navigator>
  );
}
