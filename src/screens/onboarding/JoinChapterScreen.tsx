import React, { useState } from 'react';
import { Alert, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'JoinChapter'>;

/**
 * The membership application: identity, an emergency contact, and a light
 * social-verification question. Photo + bio are a separate step
 * (CompleteProfileScreen) that runs once after all chosen chapters are
 * applied to — profile info is shared across chapters, so it doesn't repeat
 * per chapter the way this form does.
 *
 * The membership-fee block at the bottom is built and wired into the UI per
 * the brief ("have it in the code, we can remove it") but nothing charges
 * automatically — see src/lib/payments.ts for where that hooks in once the
 * club decides to turn it on.
 */
export function JoinChapterScreen({ route, navigation }: Props) {
  const { chapters, currentUser, currentUserId, selectedChapterIds, memberships, dispatch } = useApp();
  const chapter = chapters.find((c) => c.id === route.params.chapterId);

  const [fullName, setFullName] = useState(currentUser.fullName);
  const [phone, setPhone] = useState(currentUser.phone);
  const [emergencyName, setEmergencyName] = useState(currentUser.emergencyContactName);
  const [emergencyPhone, setEmergencyPhone] = useState(currentUser.emergencyContactPhone);
  const [instagram, setInstagram] = useState(currentUser.instagramHandle ?? '');
  const [safetyAnswer, setSafetyAnswer] = useState('');

  if (!chapter) return null;

  const canSubmit = !!(fullName.trim() && phone.trim() && emergencyName.trim() && emergencyPhone.trim() && safetyAnswer.trim());

  const handleSubmit = () => {
    // TEMPORARY DEBUG — pinpointing why this button doesn't respond. If
    // this alert never appears when tapping "SEND REQUEST TO JOIN", the
    // button is disabled (canSubmit is false — one of the 5 required
    // fields is still empty) rather than the tap failing to register; if it
    // does appear, the problem is somewhere after this line. Remove once
    // the cause is found.
    Alert.alert('DEBUG', `Submit tap registered. canSubmit: ${canSubmit}`);
    if (!canSubmit) return;
    dispatch({
      type: 'SUBMIT_JOIN_REQUEST',
      chapterId: chapter.id,
      profile: { fullName, phone, emergencyContactName: emergencyName, emergencyContactPhone: emergencyPhone, instagramHandle: instagram, safetyAnswer },
    });
    // If onboarding covers more than one chapter (multi-city selection),
    // chain straight into the next one that still needs an application
    // rather than bouncing back to the picker. Once every chosen chapter
    // has an application in, a first-time user still needs a photo + bio
    // (CompleteProfileScreen) before landing in the app.
    const stillNeeds = selectedChapterIds.find(
      (id) => id !== chapter.id && !memberships.some((m) => m.userId === currentUserId && m.chapterId === id)
    );
    if (stillNeeds) {
      navigation.replace('JoinChapter', { chapterId: stillNeeds });
    } else if (!currentUser.photoUrl) {
      navigation.replace('CompleteProfile');
    } else {
      // Already has a profile — this chapter was added on top of an
      // existing membership (via the "browse chapters" link), not first-time
      // onboarding, so land directly in the chapter just requested rather
      // than whichever chapter happened to be active before.
      dispatch({ type: 'SET_ACTIVE_CHAPTER', chapterId: chapter.id });
    }
  };

  const feeLabel =
    chapter.currency === 'USD' ? `$${(chapter.membershipFeeCents / 100).toFixed(0)}/mo` : `₪${(chapter.membershipFeeCents / 100).toFixed(0)}/mo`;

  return (
    <Screen>
      <View style={styles.headerWrap}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backTap}>
            <Text style={styles.back}>← BACK</Text>
          </Pressable>
          <Text style={styles.title}>JOIN {chapter.name.toUpperCase()}</Text>
          <Text style={styles.subtitle}>Goes to a chapter admin for approval</Text>
        </View>
        <View style={styles.headerAngle} />
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Section title="YOUR DETAILS" />
        <Field label="Full name" value={fullName} onChangeText={setFullName} />
        <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

        <Section title="EMERGENCY CONTACT" />
        <Field label="Name & relationship" value={emergencyName} onChangeText={setEmergencyName} />
        <Field label="Emergency phone" value={emergencyPhone} onChangeText={setEmergencyPhone} keyboardType="phone-pad" />

        <Section title="VERIFICATION" />
        <Field label="Instagram / social handle" value={instagram} onChangeText={setInstagram} autoCapitalize="none" />
        <Field label="What's your favorite Jewish holiday?" value={safetyAnswer} onChangeText={setSafetyAnswer} />

        {chapter.membershipEnabled ? (
          <View style={styles.membershipCard}>
            <View style={styles.membershipRow}>
              <Text style={styles.membershipTitle}>{chapter.name.toUpperCase()} MEMBERSHIP</Text>
              <Text style={styles.membershipFee}>{feeLabel}</Text>
            </View>
            <Text style={styles.membershipCopy}>
              Optional right now — the club isn't charging for membership yet. Skip this and continue.
            </Text>
            <Text style={styles.skipLink}>Skip for now →</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <PillButton label="SEND REQUEST TO JOIN" fullWidth disabled={!canSubmit} onPress={handleSubmit} />
        {!canSubmit ? <Text style={styles.requiredHint}>Fill in your name, phone, emergency contact, and the verification question to continue.</Text> : null}
      </View>
    </Screen>
  );
}

function Section({ title }: { title: string }) {
  return <Text style={styles.section}>{title}</Text>;
}

function Field(props: { label: string; value: string; onChangeText: (v: string) => void; keyboardType?: 'phone-pad' | 'default'; autoCapitalize?: 'none' | 'sentences'; multiline?: boolean }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        keyboardType={props.keyboardType}
        autoCapitalize={props.autoCapitalize}
        multiline={props.multiline}
        returnKeyType={props.multiline ? undefined : 'done'}
        onSubmitEditing={props.multiline ? undefined : Keyboard.dismiss}
        style={[styles.fieldInput, props.multiline ? { minHeight: 64, textAlignVertical: 'top' } : null]}
      />
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
  subtitle: { color: colors.border, fontFamily: fonts.bodyRegular, fontSize: 11, marginTop: 2 },
  form: { padding: spacing.lg, gap: 10 },
  section: { fontFamily: fonts.display, fontSize: 14, letterSpacing: 0.6, color: colors.gold, marginTop: 10 },
  fieldWrap: { backgroundColor: colors.bgLight, borderRadius: radii.md, padding: 12 },
  fieldLabel: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.mutedLight, letterSpacing: 0.4 },
  fieldInput: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.navy, marginTop: 2, padding: 0 },
  membershipCard: { backgroundColor: colors.gold, borderRadius: radii.lg, padding: 14, marginTop: 10, gap: 6 },
  membershipRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  membershipTitle: { fontFamily: fonts.display, fontSize: 16, color: colors.navy },
  membershipFee: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.navy },
  membershipCopy: { fontFamily: fonts.bodyRegular, fontSize: 11, color: colors.navy },
  skipLink: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.navy },
  footer: { padding: spacing.lg, paddingBottom: spacing.xl, gap: 8 },
  requiredHint: { fontFamily: fonts.bodyRegular, fontSize: 11, color: colors.muted, textAlign: 'center' },
});
