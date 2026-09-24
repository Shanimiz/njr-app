import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import type { RootStackParamList } from '@/navigation/types';
import logo from '../../../assets/logo.png';

type Props = NativeStackScreenProps<RootStackParamList, 'ChapterSelect'>;

/**
 * First screen a new (or logged-out) user sees, and also reachable from
 * inside the app (see the "Browse / join another chapter" link on
 * ProfileScreen) any time a member wants to add another chapter. Search
 * narrows the list; tapping a chapter does one of two things depending on
 * whether the signed-in member already has a request in for it:
 *  - already a member (pending or approved) → straight into the app for
 *    that chapter, exactly like re-opening the app does.
 *  - no membership record yet → the join-request form (JoinChapterScreen),
 *    which for a chapter added on top of an existing membership skips
 *    straight back into the app afterward instead of the one-time photo/bio
 *    step (see JoinChapterScreen — that step is shared across chapters and
 *    only needs to happen once).
 */
export function ChapterSelectScreen({ navigation }: Props) {
  const { chapters, memberships, currentUserId, dispatch } = useApp();
  const [query, setQuery] = useState('');

  const myMembership = (chapterId: string) => memberships.find((m) => m.userId === currentUserId && m.chapterId === chapterId);
  // Whether tapping this chapter should drop the member straight in. There's
  // no admin approval screen yet (deferred — see the club's request list),
  // so a 'pending' request can never actually become 'approved' from inside
  // this app right now; treating only 'approved' as enterable would leave
  // every chapter permanently stuck behind a request no one can act on. For
  // now, a pending request still gets you in (clearly labeled as pending,
  // not approved, on the card below) so the rest of the app stays testable;
  // this should switch to approved-only once the admin approval flow exists.
  const isMember = (chapterId: string) => !!myMembership(chapterId);

  const filteredChapters = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Nothing searched yet — only show chapters already joined (any
      // request status), so this doesn't turn into a long scroll of every
      // city in the club just to get back into your own. Search reveals
      // everything else.
      return chapters.filter((c) => isMember(c.id));
    }
    return chapters.filter((c) => c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters, query, memberships, currentUserId]);

  const handleChapterPress = (chapterId: string) => {
    if (isMember(chapterId)) {
      dispatch({ type: 'ENTER_CHAPTER', chapterId });
      // Only true when this screen was pushed on top of the main app (the
      // ProfileScreen "browse chapters" link) — on a fresh launch this is
      // the root screen and there's nothing to go back to yet; the root
      // navigator swaps itself to the main app on its own in that case.
      if (navigation.canGoBack()) {
        navigation.navigate('Main');
      }
    } else {
      navigation.navigate('JoinChapter', { chapterId });
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.heroWrap}>
        <View style={styles.hero}>
          {navigation.canGoBack() ? (
            <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backTap}>
              <Text style={styles.back}>← BACK</Text>
            </Pressable>
          ) : null}
          <Image source={logo} style={styles.logo} />
          <Text style={styles.heroTitle}>PICK YOUR CITY</Text>
        </View>
        <View style={styles.heroAngle} />
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="🔍  Search chapters…"
          placeholderTextColor={colors.mutedLight}
          style={styles.searchInput}
          returnKeyType="search"
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={filteredChapters}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={styles.empty}>
            {query.trim() ? `No chapters match “${query}”.` : 'Search above to find your chapter and request to join.'}
          </Text>
        }
        renderItem={({ item }) => {
          const disabled = !!item.comingSoon;
          const membership = !disabled ? myMembership(item.id) : undefined;
          const approved = membership?.status === 'approved';
          const pending = membership?.status === 'pending';
          const subtitle = item.comingSoon
            ? 'COMING SOON'
            : approved
            ? "✓ YOU'RE IN — TAP TO ENTER"
            : pending
            ? '⏳ REQUEST PENDING — AWAITING APPROVAL'
            : `${item.memberCount} RUNNERS · TAP TO REQUEST TO JOIN`;
          const cardBg = disabled ? colors.bgLight : approved ? colors.gold : pending ? colors.goldTint : colors.bgLight;
          const textColor = approved ? colors.navy : pending ? colors.goldDeep : colors.muted;
          return (
            <Pressable
              disabled={disabled}
              onPress={() => handleChapterPress(item.id)}
              style={[styles.card, { backgroundColor: cardBg, opacity: disabled ? 0.6 : 1 }, pending ? styles.cardPendingBorder : null]}
            >
              <View>
                <Text style={styles.cardTitle}>
                  {item.emoji} {item.name.toUpperCase()}
                </Text>
                <Text style={[styles.cardSubtitle, { color: textColor }]}>{subtitle}</Text>
              </View>
              {approved ? (
                <View style={styles.check}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              ) : null}
            </Pressable>
          );
        }}
      />
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
  backTap: { position: 'absolute', top: 16, left: spacing.lg, zIndex: 1 },
  back: { color: colors.white, fontFamily: fonts.bodyBold, fontSize: 12 },
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
  searchWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  searchInput: {
    backgroundColor: colors.bgLight,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
    color: colors.navy,
  },
  list: { padding: spacing.lg, gap: spacing.md },
  empty: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 24 },
  card: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardPendingBorder: { borderWidth: 1.5, borderColor: colors.goldTintBorder },
  cardTitle: { fontFamily: fonts.display, fontSize: 22, letterSpacing: 0.4, color: colors.navy },
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
});
