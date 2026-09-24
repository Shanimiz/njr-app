import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { Avatar } from '@/components/Avatar';
import { RoleBadge } from '@/components/RoleBadge';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import type { MoreStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'Members'>;

/**
 * The chapter roster — everyone with an approved membership in the active
 * chapter, tap a row to open their profile (which also has the Send DM
 * button). Nested in MoreStack, so reaching UserProfile at the root needs
 * the two-hop getParent() pattern used elsewhere for cross-stack navigation.
 */
export function MembersListScreen({ navigation }: Props) {
  const { activeChapter, memberships, users, getRole, getMembership } = useApp();
  if (!activeChapter) return null;

  const roster = memberships
    .filter((m) => m.chapterId === activeChapter.id && m.status === 'approved')
    .map((m) => users[m.userId])
    .filter(Boolean)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  const openProfile = (userId: string) => {
    const rootNav = (navigation.getParent()?.getParent() ?? navigation.getParent()) as
      | (typeof navigation & { navigate: (screen: 'UserProfile', params: { userId: string }) => void })
      | undefined;
    rootNav?.navigate('UserProfile', { userId });
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.headerWrap}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backTap}>
            <Text style={styles.back}>← BACK</Text>
          </Pressable>
          <Text style={styles.title}>MEMBERS</Text>
          <Text style={styles.subtitle}>{activeChapter.city.toUpperCase()} · {roster.length} MEMBERS</Text>
        </View>
        <View style={styles.headerAngle} />
      </View>

      <FlatList
        data={roster}
        keyExtractor={(u) => u.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const role = getRole(item.id, activeChapter.id);
          const title = getMembership(item.id, activeChapter.id)?.title;
          return (
            <Pressable style={styles.row} onPress={() => openProfile(item.id)}>
              <Avatar size={40} uri={item.photoUrl} bg={colors.border} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName}>{item.fullName.toUpperCase() || '(UNNAMED)'}</Text>
                <Text style={styles.rowRuns}>{item.runsJoined} RUNS ATTENDED</Text>
              </View>
              <RoleBadge role={role} title={title} />
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerWrap: { backgroundColor: colors.navy, overflow: 'hidden' },
  header: { paddingTop: 16, paddingBottom: 28, paddingHorizontal: spacing.lg },
  headerAngle: { position: 'absolute', left: -24, right: -24, bottom: -18, height: 40, backgroundColor: colors.white, transform: [{ rotate: '-2.5deg' }] },
  backTap: { alignSelf: 'flex-start', marginBottom: 6 },
  back: { color: colors.white, fontFamily: fonts.bodyBold, fontSize: 12 },
  title: { fontFamily: fonts.display, fontSize: 24, color: colors.white, letterSpacing: 0.4 },
  subtitle: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.border, letterSpacing: 0.4, marginTop: 2 },
  list: { padding: spacing.lg, gap: 10, paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.bgLight, borderRadius: radii.lg, padding: 12 },
  rowName: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.navy },
  rowRuns: { fontFamily: fonts.bodyRegular, fontSize: 11, color: colors.muted, marginTop: 2 },
});
