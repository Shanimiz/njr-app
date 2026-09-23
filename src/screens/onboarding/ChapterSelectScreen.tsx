import React from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import type { RootStackParamList } from '@/navigation/types';
import logo from '../../../assets/logo.png';

type Props = NativeStackScreenProps<RootStackParamList, 'ChapterSelect'>;

/**
 * First screen a new (or logged-out) user sees. Pick one or more chapters —
 * picking more than one is what turns on the in-app city switcher on the
 * Events/Chats tabs later (see EventsFeedScreen). Chapters the user has no
 * membership record for at all route through the join form (JoinChapterScreen)
 * before they can enter the app; chapters they already have a pending or
 * approved membership for skip straight through.
 */
export function ChapterSelectScreen({ navigation }: Props) {
  const { chapters, selectedChapterIds, memberships, currentUserId, dispatch } = useApp();

  const toggle = (chapterId: string) => dispatch({ type: 'TOGGLE_CHAPTER_SELECTION', chapterId });
  const continueLabel =
    selectedChapterIds.length === 0
      ? 'Select a chapter to continue'
      : `CONTINUE — ${selectedChapterIds.length} ${selectedChapterIds.length === 1 ? 'CITY' : 'CITIES'}`;

  const handleContinue = () => {
    const chapterNeedingJoin = selectedChapterIds.find(
      (id) => !memberships.some((m) => m.userId === currentUserId && m.chapterId === id)
    );
    if (chapterNeedingJoin) {
      navigation.navigate('JoinChapter', { chapterId: chapterNeedingJoin });
    } else {
      dispatch({ type: 'CONFIRM_CHAPTER_SELECTION' });
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.heroWrap}>
        <View style={styles.hero}>
          <Image source={logo} style={styles.logo} />
          <Text style={styles.heroTitle}>PICK YOUR CITY</Text>
        </View>
        <View style={styles.heroAngle} />
      </View>

      <FlatList
        data={chapters}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const selected = selectedChapterIds.includes(item.id);
          const disabled = !!item.comingSoon;
          return (
            <Pressable
              disabled={disabled}
              onPress={() => toggle(item.id)}
              style={[
                styles.card,
                { backgroundColor: disabled ? colors.bgLight : selected ? colors.gold : colors.bgLight, opacity: disabled ? 0.6 : 1 },
              ]}
            >
              <View>
                <Text style={[styles.cardTitle, { color: selected ? colors.navy : colors.navy }]}>
                  {item.emoji} {item.name.toUpperCase()}
                </Text>
                <Text style={[styles.cardSubtitle, { color: selected ? colors.navy : colors.muted }]}>
                  {item.comingSoon ? 'COMING SOON' : `${item.memberCount} RUNNERS`}
                </Text>
              </View>
              {selected ? (
                <View style={styles.check}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              ) : null}
            </Pressable>
          );
        }}
      />

      <View style={styles.footer}>
        <PillButton
          label={continueLabel}
          variant="navy"
          fullWidth
          disabled={selectedChapterIds.length === 0}
          onPress={handleContinue}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // The angled navy hero is the Bold & Sporty signature — a rotated white
  // rectangle overlapping the bottom edge fakes the diagonal cut from the
  // wireframes without needing an SVG library.
  heroWrap: { backgroundColor: colors.navy, overflow: 'hidden' },
  hero: {
    paddingTop: 24,
    paddingBottom: 56,
    alignItems: 'center',
    gap: 10,
  },
  heroAngle: {
    position: 'absolute',
    left: -24,
    right: -24,
    bottom: -20,
    height: 44,
    backgroundColor: colors.white,
    transform: [{ rotate: '-2.5deg' }],
  },
  logo: { width: 64, height: 64, borderRadius: 32 },
  heroTitle: { fontFamily: fonts.display, fontSize: 32, color: colors.white, letterSpacing: 0.5 },
  list: { padding: spacing.lg, gap: spacing.md },
  card: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: { fontFamily: fonts.display, fontSize: 22, letterSpacing: 0.4 },
  cardSubtitle: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 0.6, marginTop: 2 },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { color: colors.white, fontFamily: fonts.bodyBold, fontSize: 14 },
  footer: { padding: spacing.lg, paddingBottom: spacing.xl },
});
