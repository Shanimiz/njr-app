import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

const TIP_PRESETS_CENTS = [300, 500, 1000];

/**
 * The payment surface the brief asked for, covering the two live money
 * moments: paying a paid event's registration fee, and leaving an optional
 * tip on a free one. Presented as a modal from EventDetailScreen.
 *
 * This is a real, usable UI, but there's no live Stripe integration behind
 * it yet (see src/lib/payments.ts) — hitting Pay/Send Tip records a
 * PaymentRecord in app state and marks it "succeeded" immediately, so the
 * flow is complete to click through even though no card is actually
 * charged. The card field below is a static mock, not a real card input.
 */
export function PaymentScreen({ route, navigation }: Props) {
  const { events, chapters, cardLast4, dispatch } = useApp();
  const event = events.find((e) => e.id === route.params.eventId);
  const mode = route.params.mode;

  const [selectedTip, setSelectedTip] = useState<number | 'custom' | null>(TIP_PRESETS_CENTS[1]);
  const [customTip, setCustomTip] = useState('');
  const [done, setDone] = useState(false);

  if (!event) return null;
  const chapter = chapters.find((c) => c.id === event.chapterId);
  const currency = chapter?.currency ?? 'USD';
  const symbol = currency === 'USD' ? '$' : '₪';

  const amountCents =
    mode === 'pay'
      ? event.priceCents
      : selectedTip === 'custom'
      ? Math.round((parseFloat(customTip || '0') || 0) * 100)
      : selectedTip ?? 0;

  const canPay = amountCents > 0;

  const handlePay = () => {
    dispatch({
      type: 'RECORD_PAYMENT',
      kind: mode === 'pay' ? 'event_fee' : 'event_tip',
      chapterId: event.chapterId,
      eventId: event.id,
      amountCents,
      currency,
    });
    setDone(true);
  };

  if (done) {
    return (
      <Screen>
        <View style={styles.doneWrap}>
          <View style={styles.doneCheck}>
            <Text style={styles.doneCheckText}>✓</Text>
          </View>
          <Text style={styles.doneTitle}>{mode === 'pay' ? "YOU'RE REGISTERED" : 'THANKS FOR THE TIP!'}</Text>
          <Text style={styles.doneCopy}>
            {mode === 'pay'
              ? `${symbol}${(amountCents / 100).toFixed(2)} paid for ${event.title}. See you on the run!`
              : `Thank you for your support of Nice Jewish Runners! Your ${symbol}${(amountCents / 100).toFixed(2)} tip means a lot.`}
          </Text>
          <PillButton label="DONE" fullWidth onPress={() => navigation.goBack()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
        <Text style={styles.title}>{mode === 'pay' ? 'REGISTER & PAY' : 'LEAVE A TIP'}</Text>
        <Text style={styles.subtitle}>{event.title}</Text>
      </View>

      <View style={styles.body}>
        {mode === 'pay' ? (
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>REGISTRATION FEE</Text>
            <Text style={styles.amountValue}>
              {symbol}
              {(event.priceCents / 100).toFixed(2)}
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>CHOOSE AN AMOUNT</Text>
            <View style={styles.tipRow}>
              {TIP_PRESETS_CENTS.map((cents) => (
                <Pressable
                  key={cents}
                  onPress={() => setSelectedTip(cents)}
                  style={[styles.tipChip, selectedTip === cents ? styles.tipChipActive : null]}
                >
                  <Text style={[styles.tipChipText, selectedTip === cents ? styles.tipChipTextActive : null]}>
                    {symbol}
                    {(cents / 100).toFixed(0)}
                  </Text>
                </Pressable>
              ))}
              <Pressable
                onPress={() => setSelectedTip('custom')}
                style={[styles.tipChip, selectedTip === 'custom' ? styles.tipChipActive : null]}
              >
                <Text style={[styles.tipChipText, selectedTip === 'custom' ? styles.tipChipTextActive : null]}>OTHER</Text>
              </Pressable>
            </View>
            {selectedTip === 'custom' ? (
              <View style={styles.customWrap}>
                <Text style={styles.customSymbol}>{symbol}</Text>
                <TextInput
                  value={customTip}
                  onChangeText={setCustomTip}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.mutedLight}
                  style={styles.customInput}
                  autoFocus
                />
              </View>
            ) : null}
          </>
        )}

        <Text style={styles.sectionLabel}>PAYMENT METHOD</Text>
        <Pressable style={styles.cardRow} onPress={() => navigation.navigate('PaymentMethod')}>
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>💳</Text>
          </View>
          <Text style={styles.cardText}>Card ending in •••• {cardLast4}</Text>
          <Text style={styles.cardChange}>CHANGE</Text>
        </Pressable>
        <Text style={styles.disclaimer}>
          Demo build — no card is actually charged yet. This confirms the flow the club asked for; real Stripe billing
          plugs in here next.
        </Text>
      </View>

      <View style={styles.footer}>
        <PillButton
          label={mode === 'pay' ? `PAY ${symbol}${(amountCents / 100).toFixed(2)}` : `SEND ${symbol}${(amountCents / 100).toFixed(2)} TIP`}
          variant="gold"
          fullWidth
          disabled={!canPay}
          onPress={handlePay}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.navy, paddingTop: 16, paddingBottom: 20, paddingHorizontal: spacing.lg },
  closeBtn: { alignSelf: 'flex-end', width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: colors.white, fontSize: 14 },
  title: { color: colors.white, fontFamily: fonts.display, fontSize: 26, marginTop: 6, letterSpacing: 0.4 },
  subtitle: { color: colors.border, fontFamily: fonts.bodySemibold, fontSize: 12, marginTop: 2 },
  body: { padding: spacing.lg, gap: 10, flex: 1 },
  amountCard: { backgroundColor: colors.bgLight, borderRadius: radii.lg, padding: 18, alignItems: 'center', gap: 4, marginBottom: 6 },
  amountLabel: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.muted, letterSpacing: 0.6 },
  amountValue: { fontFamily: fonts.display, fontSize: 40, color: colors.navy },
  sectionLabel: { fontFamily: fonts.display, fontSize: 13, letterSpacing: 0.6, color: colors.gold, marginTop: 8 },
  tipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tipChip: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: radii.pill, backgroundColor: colors.bgLight },
  tipChipActive: { backgroundColor: colors.gold },
  tipChipText: { fontFamily: fonts.display, fontSize: 15, color: colors.navy, letterSpacing: 0.3 },
  tipChipTextActive: { color: colors.navy },
  customWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgLight, borderRadius: radii.md, paddingHorizontal: 14, paddingVertical: 4 },
  customSymbol: { fontFamily: fonts.display, fontSize: 18, color: colors.navy, marginRight: 4 },
  customInput: { flex: 1, fontFamily: fonts.display, fontSize: 18, color: colors.navy, paddingVertical: 10 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.bgLight, borderRadius: radii.md, padding: 12 },
  cardIcon: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  cardIconText: { fontSize: 16 },
  cardText: { flex: 1, fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.navy },
  cardChange: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.goldDeep, letterSpacing: 0.4 },
  disclaimer: { fontFamily: fonts.bodyRegular, fontSize: 11, color: colors.mutedLight, lineHeight: 16, marginTop: 4 },
  footer: { padding: spacing.lg, paddingBottom: spacing.xl },
  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: 14 },
  doneCheck: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  doneCheckText: { fontSize: 34, color: colors.navy, fontFamily: fonts.display },
  doneTitle: { fontFamily: fonts.display, fontSize: 26, color: colors.navy, textAlign: 'center', letterSpacing: 0.4 },
  doneCopy: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.body, textAlign: 'center', lineHeight: 20, marginBottom: 10 },
});
