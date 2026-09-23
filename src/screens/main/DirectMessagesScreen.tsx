import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { Avatar } from '@/components/Avatar';
import { RoleBadge } from '@/components/RoleBadge';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'DirectMessages'>;

/**
 * DM inbox — its own page/UI per the brief, reached from the envelope icon
 * on the Events tab rather than living in the bottom nav. Threads can cross
 * chapters (Noa is Tel Aviv, everyone else here is NYC), which is why role
 * lookups below pass each thread's own chapter rather than assuming one.
 *
 * First draft stops at the inbox list — tapping a thread is a natural next
 * screen to build once the list itself is approved.
 */
export function DirectMessagesScreen({ navigation }: Props) {
  const { dmThreads, users, currentUserId, memberships } = useApp();

  const roleFor = (userId: string) => memberships.find((m) => m.userId === userId && m.status === 'approved')?.role ?? null;

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.headerWrap}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={styles.back}>←</Text>
            </Pressable>
            <Text style={styles.title}>MESSAGES</Text>
          </View>
          <Pressable style={styles.newBtn}>
            <Text style={styles.newBtnText}>✎</Text>
          </Pressable>
        </View>
        <View style={styles.headerAngle} />
      </View>

      <FlatList
        data={dmThreads}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const otherId = item.participantIds.find((id) => id !== currentUserId)!;
          const other = users[otherId];
          return (
            <Pressable style={styles.row}>
              <Avatar size={44} />
              <View style={{ flex: 1 }}>
                <View style={styles.rowNameLine}>
                  <Text style={styles.rowName}>{other.fullName.toUpperCase()}</Text>
                  <RoleBadge role={roleFor(otherId)} />
                </View>
                <Text style={styles.rowPreview} numberOfLines={1}>{item.lastMessageText}</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerWrap: { backgroundColor: colors.navy, overflow: 'hidden' },
  header: { paddingTop: 12, paddingBottom: 28, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerAngle: { position: 'absolute', left: -24, right: -24, bottom: -18, height: 40, backgroundColor: colors.white, transform: [{ rotate: '-2.5deg' }] },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: colors.white, fontSize: 18 },
  title: { fontFamily: fonts.display, fontSize: 24, color: colors.white, letterSpacing: 0.4 },
  newBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  newBtnText: { color: colors.navy, fontFamily: fonts.bodyBold, fontSize: 16 },
  list: { padding: spacing.lg, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.bgLight, borderRadius: radii.lg, padding: 12 },
  rowNameLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowName: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.navy },
  rowPreview: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.muted, marginTop: 2 },
});
