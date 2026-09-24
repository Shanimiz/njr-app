import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { Avatar } from '@/components/Avatar';
import { RoleBadge } from '@/components/RoleBadge';
import { PillButton } from '@/components/PillButton';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'UserProfile'>;

/**
 * Anyone's public profile — reached by tapping a name/avatar anywhere in
 * the app (an event's "hosted by", a chat's member list, the chapter
 * Members page). Shows what Shani asked for: picture, bio, number of runs
 * attended, member since, and a Send DM button. "Runs attended" reuses
 * UserProfile.runsJoined, which is already tracked per person in the data
 * model rather than being recomputed here from event RSVPs.
 */
export function UserProfileScreen({ route, navigation }: Props) {
  const { users, currentUserId, activeChapter, getRole, getMembership, getOrCreateDMThreadId } = useApp();
  const { userId } = route.params;
  const person = users[userId];
  if (!person) return null;

  const isSelf = userId === currentUserId;
  const role = activeChapter ? getRole(userId, activeChapter.id) : null;
  const title = activeChapter ? getMembership(userId, activeChapter.id)?.title : undefined;

  const openDM = () => {
    const threadId = getOrCreateDMThreadId(userId);
    navigation.navigate('DMThread', { threadId });
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.headerWrap}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backTap}>
            <Text style={styles.back}>← BACK</Text>
          </Pressable>
        </View>
        <View style={styles.headerAngle} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Avatar size={84} bg={colors.gold} uri={person.photoUrl} />
        <View style={styles.nameRow}>
          <Text style={styles.name}>{person.fullName.toUpperCase() || '(UNNAMED)'}</Text>
          <RoleBadge role={role} title={title} />
        </View>
        {person.bio ? <Text style={styles.bio}>{person.bio}</Text> : null}

        <View style={styles.statsRow}>
          <Stat label="RUNS ATTENDED" value={String(person.runsJoined)} />
          <Stat label="MEMBER SINCE" value={new Date(person.memberSince).getFullYear().toString()} />
        </View>

        {!isSelf ? (
          <PillButton label="✉️  SEND A DM" variant="gold" fullWidth onPress={openDM} style={styles.dmBtn} />
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrap: { backgroundColor: colors.navy, overflow: 'hidden' },
  header: { paddingTop: 16, paddingBottom: 44, paddingHorizontal: spacing.lg },
  headerAngle: { position: 'absolute', left: -24, right: -24, bottom: -18, height: 40, backgroundColor: colors.white, transform: [{ rotate: '-2.5deg' }] },
  backTap: { alignSelf: 'flex-start' },
  back: { color: colors.white, fontFamily: fonts.bodyBold, fontSize: 12 },
  body: { alignItems: 'center', padding: spacing.lg, gap: 10, marginTop: -20 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  name: { fontFamily: fonts.display, fontSize: 24, color: colors.navy, letterSpacing: 0.3, textAlign: 'center' },
  bio: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 19, paddingHorizontal: spacing.md },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 10, alignSelf: 'stretch' },
  statCard: { flex: 1, backgroundColor: colors.bgLight, borderRadius: radii.md, padding: 14, alignItems: 'center' },
  statValue: { fontFamily: fonts.display, fontSize: 22, color: colors.navy },
  statLabel: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.muted, marginTop: 2 },
  dmBtn: { marginTop: 16 },
});
