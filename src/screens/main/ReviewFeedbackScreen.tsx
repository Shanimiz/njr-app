import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { Avatar } from '@/components/Avatar';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import { permissions } from '@/lib/permissions';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ReviewFeedback'>;

/**
 * Manager/owner-only view of what's come in through the More tab's
 * Feedback page — the missing other half of FeedbackScreen /
 * SUBMIT_FEEDBACK, so submissions don't just disappear into app state with
 * no one able to read them. Shows feedback submitted while this chapter was
 * active, plus anything submitted with no chapter selected yet, newest
 * first. Tapping the submitter opens their profile (same as everywhere
 * else a name shows up).
 */
export function ReviewFeedbackScreen({ navigation }: Props) {
  const { activeChapter, currentUserId, feedback, users, getRole } = useApp();

  const role = activeChapter ? getRole(currentUserId, activeChapter.id) : null;
  const canReview = role ? permissions.canViewFeedback(role) : false;

  const entries = activeChapter
    ? feedback
        .filter((f) => f.chapterId === activeChapter.id || f.chapterId === null)
        .slice()
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];

  const openProfile = (userId: string) => navigation.navigate('UserProfile', { userId });

  return (
    <Screen>
      <View style={styles.headerWrap}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backTap}>
            <Text style={styles.back}>✕ CLOSE</Text>
          </Pressable>
          <Text style={styles.title}>FEEDBACK</Text>
          {activeChapter ? <Text style={styles.subtitle}>{activeChapter.name}</Text> : null}
        </View>
        <View style={styles.headerAngle} />
      </View>

      {!activeChapter || !canReview ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>You need manager access to this chapter to review feedback.</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(f) => f.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No feedback submitted yet.</Text>}
          renderItem={({ item }) => {
            const author = users[item.userId];
            return (
              <View style={styles.card}>
                <Pressable style={styles.cardTop} onPress={() => openProfile(item.userId)}>
                  <Avatar size={36} uri={author?.photoUrl} bg={colors.border} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{author?.fullName || '(no name given)'}</Text>
                    <Text style={styles.meta}>{new Date(item.createdAt).toLocaleString()}</Text>
                  </View>
                </Pressable>
                <Text style={styles.body}>{item.text}</Text>
              </View>
            );
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerWrap: { backgroundColor: colors.navy, overflow: 'hidden' },
  header: { paddingTop: 16, paddingBottom: 30, paddingHorizontal: spacing.lg },
  headerAngle: { position: 'absolute', left: -24, right: -24, bottom: -18, height: 40, backgroundColor: colors.white, transform: [{ rotate: '-2.5deg' }] },
  backTap: { alignSelf: 'flex-start' },
  back: { color: colors.white, fontFamily: fonts.bodyBold, fontSize: 12 },
  title: { color: colors.white, fontFamily: fonts.display, fontSize: 26, marginTop: 8, letterSpacing: 0.4 },
  subtitle: { color: colors.border, fontFamily: fonts.bodyRegular, fontSize: 12, marginTop: 2 },
  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: 40 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  emptyText: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 24 },
  card: { backgroundColor: colors.bgLight, borderRadius: radii.lg, padding: 14, gap: 8 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.navy },
  meta: { fontFamily: fonts.bodyRegular, fontSize: 11, color: colors.mutedLight, marginTop: 2 },
  body: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.body, lineHeight: 19 },
});
