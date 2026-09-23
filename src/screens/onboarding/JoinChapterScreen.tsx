import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'JoinChapter'>;

/**
 * The membership application. Fields match what the club asked for:
 * identity, an emergency contact, a light social-verification question, and
 * a profile (photo + bio) so other members can recognize each other.
 *
 * The membership-fee block at the bottom is built and wired into the UI per
 * the brief ("have it in the code, we can remove it") but nothing charges
 * automatically — see src/lib/payments.ts for where that hooks in once the
 * club decides to turn it on.
 */
export function JoinChapterScreen({ route, navigation }: Props) {
  const { chapters, currentUser } = useApp();
  const chapter = chapters.find((c) => c.id === route.params.chapterId);

  const [fullName, setFullName] = useState(currentUser.fullName);
  const [phone, setPhone] = useState(currentUser.phone);
  const [emergencyName, setEmergencyName] = useState(currentUser.emergencyContactName);
  const [emergencyPhone, setEmergencyPhone] = useState(currentUser.emergencyContactPhone);
  const [instagram, setInstagram] = useState(currentUser.instagramHandle ?? '');
  const [safetyAnswer, setSafetyAnswer] = useState('');
  const [bio, setBio] = useState('');

  if (!chapter) return null;

  const feeLabel =
    chapter.currency === 'USD' ? `$${(chapter.membershipFeeCents / 100).toFixed(0)}/mo` : `₪${(chapter.membershipFeeCents / 100).toFixed(0)}/mo`;

  return (
    <Screen>
      <View style={styles.header}>
        <Text onPress={() => navigation.goBack()} style={styles.back}>
          ← BACK
        </Text>
        <Text style={styles.title}>JOIN {chapter.name.toUpperCase()}</Text>
        <Text style={styles.subtitle}>Goes to a chapter admin for approval</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Section title="YOUR DETAILS" />
        <Field label="Full name" value={fullName} onChangeText={setFullName} />
        <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

        <Section title="EMERGENCY CONTACT" />
        <Field label="Name & relationship" value={emergencyName} onChangeText={setEmergencyName} />
        <Field label="Emergency phone" value={emergencyPhone} onChangeText={setEmergencyPhone} keyboardType="phone-pad" />

        <Section title="VERIFICATION" />
        <Field label="Instagram" value={instagram} onChangeText={setInstagram} autoCapitalize="none" />
        <Field label="What's your favorite Jewish holiday?" value={safetyAnswer} onChangeText={setSafetyAnswer} />

        <Section title="YOUR PROFILE" />
        <Field label="Short bio" value={bio} onChangeText={setBio} multiline />

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
        <PillButton label="SEND REQUEST TO JOIN" fullWidth onPress={() => navigation.goBack()} />
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
        style={[styles.fieldInput, props.multiline ? { minHeight: 64, textAlignVertical: 'top' } : null]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.navy, paddingTop: 16, paddingBottom: 18, paddingHorizontal: spacing.lg },
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
  footer: { padding: spacing.lg, paddingBottom: spacing.xl },
});
