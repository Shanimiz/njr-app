import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { colors, fonts, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import type { RootStackParamList } from '@/navigation/types';
import logo from '../../../assets/logo.png';

type Props = NativeStackScreenProps<RootStackParamList, 'RequestSent'>;

/**
 * Shown right after SEND REQUEST TO JOIN, before whatever happens next
 * (another chapter's application if one is still pending, the one-time
 * photo/bio step, or straight into the app) — every submitted request gets
 * an explicit, friendly confirmation instead of silently jumping to the
 * next screen. Per Shani: a submitted request is "pending," not
 * membership, until a chapter manager approves it — there's no approval
 * screen yet (deferred), so this deliberately does not say "you're in."
 */
export function RequestSentScreen({ route, navigation }: Props) {
  const { chapters, currentUser, currentUserId, selectedChapterIds, memberships, dispatch } = useApp();
  const chapter = chapters.find((c) => c.id === route.params.chapterId);

  const handleContinue = () => {
    if (!chapter) return;
    // Same "what's next" logic that used to live in JoinChapterScreen's
    // submit handler — moved here so it runs after the confirmation is
    // seen rather than instead of it.
    const stillNeeds = selectedChapterIds.find(
      (id) => id !== chapter.id && !memberships.some((m) => m.userId === currentUserId && m.chapterId === id)
    );
    if (stillNeeds) {
      navigation.replace('JoinChapter', { chapterId: stillNeeds });
    } else if (!currentUser.photoUrl) {
      navigation.replace('CompleteProfile');
    } else {
      dispatch({ type: 'SET_ACTIVE_CHAPTER', chapterId: chapter.id });
      // Main is always registered in RootNavigator now, so this always
      // works — whether this was a first-time onboarding completion or a
      // chapter added on top of an existing membership.
      navigation.navigate('Main');
    }
  };

  if (!chapter) return null;

  return (
    <Screen>
      <View style={styles.body}>
        <Image source={logo} style={styles.logo} />
        <View style={styles.check}>
          <Text style={styles.checkText}>✓</Text>
        </View>
        <Text style={styles.title}>REQUEST SENT!</Text>
        <Text style={styles.copy}>
          Your request to join the <Text style={styles.chapterName}>{chapter.name}</Text> chapter has been sent to a
          chapter manager for approval. We'll let you know as soon as it's confirmed.
        </Text>
      </View>

      <View style={styles.footer}>
        <PillButton label="CONTINUE" variant="gold" fullWidth onPress={handleContinue} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: 14 },
  logo: { width: 64, height: 64, borderRadius: 32, marginBottom: 6 },
  check: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { color: colors.navy, fontFamily: fonts.bodyBold, fontSize: 26 },
  title: { fontFamily: fonts.display, fontSize: 28, color: colors.navy, letterSpacing: 0.5, textAlign: 'center' },
  copy: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 21 },
  chapterName: { color: colors.navy, fontFamily: fonts.bodyBold },
  footer: { padding: spacing.lg, paddingBottom: spacing.xl },
});
