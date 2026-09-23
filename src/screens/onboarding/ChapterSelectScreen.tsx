import React from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import logo from '../../../assets/logo.png';

/**
 * First screen a new (or logged-out) user sees. Pick one or more chapters —
 * picking more than one is what turns on the in-app city switcher on the
 * Events/Chats tabs later (see EventsFeedScreen).
 */
export function ChapterSelectScreen() {
  const { chapters, selectedChapterIds, dispatch } = useApp();

  const toggle = (chapterId: string) => dispatch({ type: 'TOGGLE_CHAPTER_SELECTION', chapterId });
  const continueLabel =
    selectedChapterIds.length === 0
      ? 'Select a chapter to continue'
      : `CONTINUE — ${selectedChapterIds.length} ${selectedChapterIds.length === 1 ? 'CITY' : 'CITIES'}`;

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.hero}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.heroTitle}>PICK YOUR CITY</Text>
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
          onPress={() => dispatch({ type: 'CONFIRM_CHAPTER_SELECTION' })}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.navy,
    paddingTop: 24,
    paddingBottom: 36,
    alignItems: 'center',
    gap: 10,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
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
