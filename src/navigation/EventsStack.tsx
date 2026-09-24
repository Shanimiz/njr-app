import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { EventsStackParamList } from './types';
import { EventsFeedScreen } from '@/screens/main/EventsFeedScreen';
import { EventDetailScreen } from '@/screens/main/EventDetailScreen';
import { CreateEventScreen } from '@/screens/main/CreateEventScreen';

const Stack = createNativeStackNavigator<EventsStackParamList>();

export function EventsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EventsFeed" component={EventsFeedScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
