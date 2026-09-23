import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import { colors, fonts } from '@/theme';
import { EventsStack } from './EventsStack';
import { ChatsStack } from './ChatsStack';
import { BenefitsScreen } from '@/screens/main/BenefitsScreen';
import { ProfileScreen } from '@/screens/main/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, string> = {
  EventsTab: '🏃',
  ChatsTab: '💬',
  BenefitsTab: '🎁',
  ProfileTab: '👤',
};

const LABELS: Record<keyof MainTabParamList, string> = {
  EventsTab: 'EVENTS',
  ChatsTab: 'CHATS',
  BenefitsTab: 'PERKS',
  ProfileTab: 'YOU',
};

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.mutedLight,
        tabBarStyle: { borderTopWidth: 2, borderTopColor: colors.navy, height: 64, paddingBottom: 10, paddingTop: 8 },
        tabBarLabel: ({ color }) => (
          <Text style={{ color, fontFamily: fonts.display, fontSize: 11, letterSpacing: 0.5 }}>
            {LABELS[route.name as keyof MainTabParamList]}
          </Text>
        ),
        tabBarIcon: ({ color }) => (
          <Text style={{ fontSize: 18, color }}>{ICONS[route.name as keyof MainTabParamList]}</Text>
        ),
      })}
    >
      <Tab.Screen name="EventsTab" component={EventsStack} />
      <Tab.Screen name="ChatsTab" component={ChatsStack} />
      <Tab.Screen name="BenefitsTab" component={BenefitsScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
