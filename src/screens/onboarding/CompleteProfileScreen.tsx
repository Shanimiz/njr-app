import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Avatar } from '@/components/Avatar';
import { PillButton } from '@/components/PillButton';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';

const AVATAR_OPTIONS: { emoji: string; bg: string }[] = [
  { emoji: '🏃', bg: colors.gold },
  { emoji: '🏃‍♀️', bg: colors.navySoft },
  { emoji: '🏅', bg: colors.gold },
  { emoji: '⭐', bg: colors.navySoft },
  { emoji: '🔥', bg: colors.gold },
  { emoji: '🐆', bg: colors.navySoft },
  { emoji: '🕎', bg: colors.gold },
  { emoji: '🍦', bg: colors.navySoft },
];

/**
 * Last onboarding step, per the brief: "after they fill this out they have
 * to add a picture of themselves and a little bit of themselves ... so
 * other people can get to know them a little better." Runs once — after
 * every chosen chapter has a join request in — not per chapter, since a
 * profile is shared across all of a member's chapters.
 *
 * This picks a stand-in avatar instead of a real camera/library photo —
 * expo-image-picker (the package that does real photo picking) wasn't
 * installing cleanly in the Codespaces environment this was being tested
 * from, and it's a native-module package that's generally more reliable
 * in a proper dev build than inside Expo Go anyway. Swapping real photo
 * upload back in later only touches this one screen: everywhere else
 * (Avatar, ProfileScreen, app state) already just renders whatever string
 * is in `photoUrl`, image URI or otherwise, via src/components/Avatar.tsx.
 */
export function CompleteProfileScreen() {
  const { dispatch } = useApp();
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [bio, setBio] = useState('');

  const canFinish = !!selected && bio.trim().length > 0;

  const handleFinish = () => {
    if (!canFinish || !selected) return;
    dispatch({ type: 'COMPLETE_PROFILE', photoUrl: selected, bio: bio.trim() });
    dispatch({ type: 'CONFIRM_CHAPTER_SELECTION' });
  };

  return (
    <Screen>
      <View style={styles.headerWrap}>
        <View style={styles.header}>
          <Text style={styles.title}>SET UP YOUR PROFILE</Text>
          <Text style={styles.subtitle}>So other runners recognize you at the start line</Text>
        </View>
        <View style={styles.headerAngle} />
      </View>

      <View style={styles.body}>
        <Text style={styles.fieldLabel}>PICK AN AVATAR</Text>
        <View style={styles.grid}>
          {AVATAR_OPTIONS.map((opt) => (
            <Pressable key={opt.emoji} onPress={() => setSelected(opt.emoji)} style={styles.gridItem}>
              <Avatar size={56} bg={opt.bg} uri={opt.emoji} />
              {selected === opt.emoji ? <View style={styles.selectedRing} /> : null}
            </Pressable>
          ))}
        </View>

        <Text style={styles.fieldLabel}>SHORT BIO</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          multiline
          placeholder="A sentence or two — pace, distance you're training for, what gets you out the door…"
          placeholderTextColor={colors.mutedLight}
          style={styles.bioInput}
        />
      </View>

      <View style={styles.footer}>
        <PillButton label="FINISH — ENTER THE APP" variant="gold" fullWidth disabled={!canFinish} onPress={handleFinish} />
        {!canFinish ? <Text style={styles.hint}>Pick an avatar and add a short bio to continue.</Text> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerWrap: { backgroundColor: colors.navy, overflow: 'hidden' },
  header: { paddingTop: 16, paddingBottom: 30, paddingHorizontal: spacing.lg },
  headerAngle: { position: 'absolute', left: -24, right: -24, bottom: -18, height: 40, backgroundColor: colors.white, transform: [{ rotate: '-2.5deg' }] },
  title: { color: colors.white, fontFamily: fonts.display, fontSize: 26, letterSpacing: 0.4 },
  subtitle: { color: colors.border, fontFamily: fonts.bodyRegular, fontSize: 12, marginTop: 4 },
  body: { flex: 1, padding: spacing.lg, gap: 10 },
  fieldLabel: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.muted, letterSpacing: 0.5, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center', paddingVertical: 8 },
  gridItem: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  selectedRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: colors.navy,
  },
  bioInput: {
    width: '100%',
    minHeight: 100,
    backgroundColor: colors.bgLight,
    borderRadius: radii.md,
    padding: 14,
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
    color: colors.navy,
    textAlignVertical: 'top',
  },
  footer: { padding: spacing.lg, paddingBottom: spacing.xl, gap: 8 },
  hint: { fontFamily: fonts.bodyRegular, fontSize: 11, color: colors.muted, textAlign: 'center' },
});
