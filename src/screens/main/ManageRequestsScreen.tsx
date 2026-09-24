import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { Avatar } from '@/components/Avatar';
import { PillButton } from '@/components/PillButton';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import { permissions } from '@/lib/permissions';
import type { RootStackParamList } from '@/navigation/types';
import type { Membership } from '@/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ManageRequests'>;

/**
 * Manager/owner-only queue of pending join requests for whichever chapter
 * is currently active — the other half of SUBMIT_JOIN_REQUEST /
 * JoinChapterScreen. Approve flips a request to 'approved' (the applicant
 * can then tap into the chapter as a full member, and shows up on the
 * roster in the Profile tab's MANAGE ROLES section). Deny flips it to
 * 'rejected' — they drop out of the "already in" state and can search the
 * chapter again to re-apply (see ChapterSelectScreen's isMember).
 */
export function ManageRequestsScreen({ navigation }: Props) {
  const { activeChapter, currentUserId, memberships, users, getRole, dispatch } = useApp();

  const role = activeChapter ? getRole(currentUserId, activeChapter.id) : null;
  const canReview = role ? permissions.canApproveJoinRequests(role) : false;

  const pending = activeChapter
    ? memberships
        .filter((m) => m.chapterId === activeChapter.id && m.status === 'pending')
        .sort((a, b) => a.requestedAt.localeCompare(b.requestedAt))
    : [];

  const handleApprove = (m: Membership) => dispatch({ type: 'APPROVE_JOIN_REQUEST', userId: m.userId, chapterId: m.chapterId });
  const handleDeny = (m: Membership) => dispatch({ type: 'DENY_JOIN_REQUEST', userId: m.userId, chapterId: m.chapterId });

  return (
    <Screen>
      <View style={styles.headerWrap}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backTap}>
            <Text style={styles.back}>✕ CLOSE</Text>
          </Pressable>
          <Text style={styles.title}>PENDING REQUESTS</Text>
          {activeChapter ? <Text style={styles.subtitle}>{activeChapter.name}</Text> : null}
        </View>
        <View style={styles.headerAngle} />
      </View>

      {!activeChapter || !canReview ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>You need manager access to this chapter to review requests.</Text>
        </View>
      ) : (
        <FlatList
          data={pending}
          keyExtractor={(m) => `${m.userId}_${m.chapterId}`}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No pending requests right now.</Text>}
          renderItem={({ item }) => {
            const applicant = users[item.userId];
            if (!applicant) return null;
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Avatar size={44} uri={applicant.photoUrl} bg={colors.border} />
                  <View style={styles.cardTopText}>
                    <Text style={styles.name}>{applicant.fullName || '(no name given)'}</Text>
                    <Text style={styles.meta}>Requested {new Date(item.requestedAt).toLocaleDateString()}</Text>
                  </View>
                </View>

                <DetailRow label="Phone" value={applicant.phone} />
                <DetailRow label="Emergency contact" value={`${applicant.emergencyContactName} · ${applicant.emergencyContactPhone}`} />
                {applicant.instagramHandle ? <DetailRow label="Instagram" value={applicant.instagramHandle} /> : null}
                <DetailRow label={applicant.safetyQuestion} value={applicant.safetyAnswer} />

                <View style={styles.actions}>
                  <PillButton label="✕ DENY" variant="outline" onPress={() => handleDeny(item)} style={styles.actionBtn} />
                  <PillButton label="✓ APPROVE" variant="gold" onPress={() => handleApprove(item)} style={styles.actionBtn} />
                </View>
              </View>
            );
          }}
        />
      )}
    </Screen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label.toUpperCase()}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
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
  cardTopText: { flex: 1 },
  name: { fontFamily: fonts.display, fontSize: 18, color: colors.navy },
  meta: { fontFamily: fonts.bodyRegular, fontSize: 11, color: colors.mutedLight, marginTop: 2 },
  detailRow: { marginTop: 2 },
  detailLabel: { fontFamily: fonts.bodyBold, fontSize: 9, color: colors.mutedLight, letterSpacing: 0.4 },
  detailValue: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.navy, marginTop: 1 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  actionBtn: { flex: 1 },
});
