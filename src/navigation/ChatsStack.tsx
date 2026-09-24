import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ChatsStackParamList } from './types';
import { ChatsListScreen } from '@/screens/main/ChatsListScreen';
import { ChatThreadScreen } from '@/screens/main/ChatThreadScreen';
import { CreateChatScreen } from '@/screens/main/CreateChatScreen';

const Stack = createNativeStackNavigator<ChatsStackParamList>();

export function ChatsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatsList" component={ChatsListScreen} />
      <Stack.Screen name="ChatThread" component={ChatThreadScreen} />
      <Stack.Screen name="CreateChat" component={CreateChatScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
