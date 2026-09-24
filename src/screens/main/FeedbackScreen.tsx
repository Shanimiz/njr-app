import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import type { MoreStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'Feedback'>;

/**
 * A simple way to send feedback about the app or the club — no backend
 * behind it yet, so this saves to app state (see FeedbackEntry) rather than
 * emailing anyone. A "view submitted feedback" admin screen is a natural
 * next step once the club wants one.
 */
export function FeedbackScreen({ navigation }: Props) {
  const { dispatch } = useApp();
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (!text.trim()) return;
    dispatch({ type: 'SUBMIT_FEEDBACK', text: text.trim() });
    setText('');
    setSent(true);
  };

  if (sent) {
    return (
      <Screen edges={['top', 'bottom']}>
        <View style={styles.doneWrap}>
          <View style={styles.doneCheck}>
            <Text style={styles.doneCheckText}>✓</Text>
          </View>
          <Text style={styles.doneTitle}>THANKS FOR THE FEEDBACK!</Text>
          <Text style={styles.doneCopy}>The club appreciates you taking the time to share this.</Text>
          <PillButton label="SEND MORE FEEDBACK" variant="outline" onPress={() => setSent(false)} />
          <PillButton label="DONE" variant="gold" onPress={() => navigation.goBack()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.headerWrap}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backTap}>
            <Text style={styles.back}>← BACK</Text>
          </Pressable>
          <Text style={styles.title}>FEEDBACK</Text>
          <Text style={styles.subtitle}>Ideas, bugs, or anything else on your mind</Text>
        </View>
        <View style={styles.headerAngle} />
      </View>

      <View style={styles.body}>
        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          placeholder="Tell us what's on your mind…"
          placeholderTextColor={colors.mutedLight}
          style={styles.input}
        />
      </View>

      <View style={styles.footer}>
        <PillButton label="SEND FEEDBACK" variant="gold" fullWidth disabled={!text.trim()} onPress={handleSubmit} />
      </View>
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
  body: { flex: 1, padding: spacing.lg },
  input: {
    flex: 1,
    minHeight: 160,
    backgroundColor: colors.bgLight,
    borderRadius: radii.md,
    padding: 14,
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
    color: colors.navy,
    textAlignVertical: 'top',
  },
  footer: { padding: spacing.lg, paddingBottom: spacing.xl },
  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: 14 },
  doneCheck: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  doneCheckText: { fontSize: 34, color: colors.navy, fontFamily: fonts.display },
  doneTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.navy, textAlign: 'center', letterSpacing: 0.4 },
  doneCopy: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.body, textAlign: 'center', lineHeight: 20, marginBottom: 10 },
});
