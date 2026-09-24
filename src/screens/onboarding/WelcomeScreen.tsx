import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { colors, fonts, spacing } from '@/theme';
import type { RootStackParamList } from '@/navigation/types';
import logo from '../../../assets/logo.png';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

/**
 * The very first thing a new (or logged-out) person sees — a proper landing
 * moment before ChapterSelectScreen's "pick your city," per Shani ("it's
 * weird that the first page would immediately be pick your city").
 *
 * Registered as RootNavigator's initialRouteName whenever hasChosenChapter
 * is false, so it only ever shows during onboarding — once someone has an
 * active chapter, the app opens straight to Main and this is skipped
 * entirely, same as ChapterSelect/JoinChapter/etc. already are.
 */
export function WelcomeScreen({ navigation }: Props) {
  return (
    <Screen edges={['top', 'bottom']} style={styles.root}>
      <View style={styles.body}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.title}>NICE JEWISH{'\n'}RUNNERS</Text>
        <Text style={styles.tagline}>A running club with chapters around the world — find your city, meet your people, and hit the road together.</Text>
      </View>

      <View style={styles.footer}>
        <PillButton label="GET STARTED" variant="gold" fullWidth onPress={() => navigation.navigate('ChapterSelect')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.navy },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: 16 },
  logo: { width: 96, height: 96, borderRadius: 48, marginBottom: 4 },
  title: { fontFamily: fonts.display, fontSize: 34, color: colors.white, textAlign: 'center', letterSpacing: 0.5, lineHeight: 38 },
  tagline: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.border, textAlign: 'center', lineHeight: 21, maxWidth: 320 },
  footer: { padding: spacing.lg, paddingBottom: spacing.xl },
});
