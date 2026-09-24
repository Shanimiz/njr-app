import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { Avatar } from '@/components/Avatar';
import { RoleBadge } from '@/components/RoleBadge';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'NewMessage'>;

/**
 * Opened from the pencil icon on the DM inbox — pick anyone in the active
 * chapter's roster to start a conversation with. Reuses
 * getOrCreateDMThreadId so picking someone you already have a thread with
 * just reopens it instead of creating a duplicate. A `replace` (not
 * `navigate`) into DMThread so backing out of the conversation returns to
 * the inbox, not to this now-pointless picker screen.
 */
export function NewMessageScreen({ navigation }: Props) {
  const { activeChapter, memberships, users, currentUserId, getRole, getMembership, getOrCreateDMThreadId } = useApp();

  const roster = activeChapter
    ? memberships
        .filter((m) => m.chapterId === activeChapter.id && m.status === 'approved' && m.userId !== currentUserId)
        .map((m) => users[m.userId])
        .filter(Boolean)
        .sort((a, b) => a.fullName.localeCompare(b.fullName))
    : [];

  const startThread = (userId: string) => {
    const threadId = getOrCreateDMThreadId(userId);
    navigation.replace('DMThread', { threadId });
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
        <Text style={styles.title}>NEW MESSAGE</Text>
        <Text style={styles.subtitle}>{activeChapter ? `Pick someone from ${activeChapter.city}` : ''}</Text>
      </View>

      <FlatList
        data={roster}
        keyExtractor={(u) => u.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No one else in this chapter yet.</Text>}
        renderItem={({ item }) => {
          const role = activeChapter ? getRole(item.id, activeChapter.id) : null;
          const title = activeChapter ? getMembership(item.id, activeChapter.id)?.title : undefined;
          return (
            <Pressable style={styles.row} onPress={() => startThread(item.id)}>
              <Avatar size={40} uri={item.photoUrl} bg={colors.border} />
              <Text style={styles.rowName}>{item.fullName.toUpperCase() || '(UNNAMED)'}</Text>
              <RoleBadge role={role} title={title} />
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.navy, paddingTop: 16, paddingBottom: 20, paddingHorizontal: spacing.lg },
  closeBtn: { alignSelf: 'flex-end', width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: colors.white, fontSize: 14 },
  title: { color: colors.white, fontFamily: fonts.display, fontSize: 24, marginTop: 6, letterSpacing: 0.4 },
  subtitle: { color: colors.border, fontFamily: fonts.bodySemibold, fontSize: 12, marginTop: 2 },
  list: { padding: spacing.lg, gap: 10 },
  empty: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.bgLight, borderRadius: radii.lg, padding: 12 },
  rowName: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 14, color: colors.navy },
});
