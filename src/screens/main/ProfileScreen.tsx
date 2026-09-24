import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Screen } from '@/components/Screen';
import { Avatar } from '@/components/Avatar';
import { RoleBadge } from '@/components/RoleBadge';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import { permissions } from '@/lib/permissions';
import type { ChapterRole } from '@/types';
import type { MainTabParamList } from '@/navigation/types';

type Props = BottomTabScreenProps<MainTabParamList, 'ProfileTab'>;

/**
 * Profile + (for managers/owners) the roles & permissions panel, combined
 * on one screen per the brief: "roles ... would be shown in their profile."
 * The role dropdowns are read-only in this mock — wiring a real change
 * needs canManageRoles() to gate it (owner-only) once there's a backend to
 * write to.
 */
export function ProfileScreen({ navigation }: Props) {
  const { currentUser, currentUserId, selectedChapters, activeChapter, memberships, users, getRole, dispatch } = useApp();

  const openChapterPicker = () => {
    // One hop up from the tab navigator reaches the root stack, where
    // ChapterSelect lives (same "reach the root navigator" pattern as the
    // DMs button on EventsFeedScreen — the extra ?? fallback covers both
    // in case ProfileScreen's own nesting ever changes).
    const rootNav = (navigation.getParent()?.getParent() ?? navigation.getParent()) as
      | (typeof navigation & { navigate: (screen: 'ChapterSelect') => void })
      | undefined;
    rootNav?.navigate('ChapterSelect');
  };

  const chapterNames = selectedChapters.map((c) => c.city).join(' · ');
  const activeRole = activeChapter ? getRole(currentUserId, activeChapter.id) : null;
  const canViewEmergencyContacts = activeRole ? permissions.canViewEmergencyContacts(activeRole) : false;
  const canManageRoles = activeRole ? permissions.canManageRoles(activeRole) : false;
  const isManagerOrAbove = activeRole === 'manager' || activeRole === 'owner';

  const chapterRoster = activeChapter
    ? memberships.filter((m) => m.chapterId === activeChapter.id && m.status === 'approved')
    : [];

  return (
    <Screen edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        <View style={styles.banner}>
          <View style={styles.bannerAngle} />
        </View>
        <View style={styles.body}>
          <Avatar size={70} bg={colors.gold} uri={currentUser.photoUrl} />
          <View style={styles.nameRow}>
            <Text style={styles.name}>{currentUser.fullName.toUpperCase()}</Text>
            <RoleBadge role={activeRole} />
          </View>
          <Text style={styles.chapters}>{chapterNames.toUpperCase()}</Text>
          <Text style={styles.bio}>{currentUser.bio}</Text>

          <View style={styles.statsRow}>
            <Stat label="RUNS JOINED" value={String(currentUser.runsJoined)} />
            <Stat label="MEMBER SINCE" value={new Date(currentUser.memberSince).getFullYear().toString()} />
          </View>

          {canViewEmergencyContacts ? (
            <Text style={styles.emergencyNote}>🔒 Emergency contact & safety answers — visible to admins only</Text>
          ) : null}

          {isManagerOrAbove && activeChapter ? (
            <View style={styles.rolesSection}>
              <Text style={styles.rolesTitle}>MANAGE ROLES</Text>
              {chapterRoster.map((m) => (
                <RoleRow key={m.userId} name={users[m.userId].fullName} role={m.role} editable={canManageRoles} />
              ))}

              <View style={styles.rulesCard}>
                <Text style={styles.rulesTitle}>WHAT A MANAGER CAN DO</Text>
                <Text style={styles.rulesText}>
                  ✅ Approve join requests{'\n'}
                  ✅ Create & delete chats{'\n'}
                  ✅ Post in announcement-only chats{'\n'}
                  ✅ Delete any message{'\n'}
                  ✅ Create & edit events{'\n'}
                  ⬜ Manage other admins' roles — Owner only
                </Text>
              </View>
            </View>
          ) : null}

          <Pressable style={styles.browseLink} onPress={openChapterPicker}>
            <Text style={styles.browseLinkText}>+ Browse / join another chapter</Text>
          </Pressable>

          <Pressable
            style={styles.resetLink}
            onPress={() =>
              Alert.alert(
                'Reset for testing?',
                'This clears your registration on this device so you can go through joining again from scratch. Only useful while testing the app.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Reset', style: 'destructive', onPress: () => dispatch({ type: 'RESET_MEMBER' }) },
                ]
              )
            }
          >
            <Text style={styles.resetLinkText}>Reset for testing (start onboarding over)</Text>
          </Pressable>
        </View>
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

function RoleRow({ name, role, editable }: { name: string; role: ChapterRole; editable: boolean }) {
  return (
    <View style={styles.roleRow}>
      <View style={styles.roleRowLeft}>
        <Avatar size={32} />
        <Text style={styles.roleName}>{name.toUpperCase()}</Text>
      </View>
      <Pressable disabled={!editable} style={[styles.rolePill, { backgroundColor: role === 'member' ? colors.border : colors.gold }]}>
        <Text style={[styles.rolePillText, { color: colors.navy }]}>
          {role.toUpperCase()} {editable ? '▾' : ''}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { height: 90, backgroundColor: colors.navy, overflow: 'hidden' },
  bannerAngle: { position: 'absolute', left: -24, right: -24, bottom: -18, height: 40, backgroundColor: colors.white, transform: [{ rotate: '-2.5deg' }] },
  body: { paddingHorizontal: spacing.lg, marginTop: -35, gap: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  name: { fontFamily: fonts.display, fontSize: 24, color: colors.navy, letterSpacing: 0.3 },
  chapters: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.mutedLight, letterSpacing: 0.4 },
  bio: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.muted },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  statCard: { flex: 1, backgroundColor: colors.bgLight, borderRadius: radii.md, padding: 12, alignItems: 'center' },
  statValue: { fontFamily: fonts.display, fontSize: 20, color: colors.navy },
  statLabel: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.muted },
  emergencyNote: { fontFamily: fonts.bodyRegular, fontSize: 11, color: colors.muted, fontStyle: 'italic' },
  rolesSection: { marginTop: 12, gap: 10 },
  rolesTitle: { fontFamily: fonts.display, fontSize: 16, color: colors.navy, letterSpacing: 0.4 },
  roleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.bgLight, borderRadius: radii.md, padding: 12 },
  roleRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  roleName: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.navy },
  rolePill: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  rolePillText: { fontFamily: fonts.bodyBold, fontSize: 11 },
  rulesCard: { backgroundColor: colors.navy, borderRadius: radii.lg, padding: 14, marginTop: 6 },
  rulesTitle: { fontFamily: fonts.display, fontSize: 13, color: colors.gold, marginBottom: 8, letterSpacing: 0.4 },
  rulesText: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.white, lineHeight: 21 },
  browseLink: { marginTop: 24, alignItems: 'center', paddingVertical: 10, backgroundColor: colors.bgLight, borderRadius: radii.md },
  browseLinkText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.navy },
  resetLink: { marginTop: 10, alignItems: 'center', paddingVertical: 8 },
  resetLinkText: { fontFamily: fonts.bodyRegular, fontSize: 11, color: colors.mutedLight, textDecorationLine: 'underline' },
});
