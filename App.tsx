import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts as useBebasNeue, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import {
  useFonts as useWorkSans,
  WorkSans_500Medium,
  WorkSans_600SemiBold,
  WorkSans_700Bold,
} from '@expo-google-fonts/work-sans';
import { AppProvider } from '@/context/AppContext';
import { RootNavigator } from '@/navigation/RootNavigator';
import { colors } from '@/theme';

export default function App() {
  const [bebasLoaded] = useBebasNeue({ BebasNeue_400Regular });
  const [workSansLoaded] = useWorkSans({ WorkSans_500Medium, WorkSans_600SemiBold, WorkSans_700Bold });

  if (!bebasLoaded || !workSansLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.navy }}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <AppProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </AppProvider>
  );
}
