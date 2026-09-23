import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { colors, fonts, radii, spacing } from '@/theme';

interface Perk {
  id: string;
  icon: string;
  title: string;
  body: string;
  detail: string;
  code: string;
}

const PERKS: Perk[] = [
  {
    id: 'gear',
    icon: '👟',
    title: 'Runner-owned gear discount',
    body: '15% off at Bird & Bones Running Co.',
    detail: 'Show your redeem code at checkout, in store or online, on shoes, apparel, and gear. Stacks with their own sale pricing.',
    code: 'NJR15',
  },
  {
    id: 'ice-cream',
    icon: '🍦',
    title: 'Free entry: Ice Cream Run',
    body: 'Always free — tips for the coffee fund optional.',
    detail: "No code needed — every Ice Cream Run is free to join, every time. Tap RSVP on the event and just show up.",
    code: 'N/A',
  },
  {
    id: 'priority-race',
    icon: '🏅',
    title: 'Priority race registration',
    body: 'First access to NJR-organized races before public signup.',
    detail: 'Members get a 48-hour registration window before any NJR-organized race opens to the public. Watch the Announcements chat for the link.',
    code: 'NJR-EARLY',
  },
  {
    id: 'pt',
    icon: '🩹',
    title: 'Discounted physical therapy',
    body: '20% off first visit at Chelsea Sports PT.',
    detail: 'Mention Nice Jewish Runners when booking, or show your redeem code at check-in for 20% off your first visit.',
    code: 'NJR20',
  },
];

/**
 * Made interactive per feedback — each perk expands to show more detail and
 * a redeem code, with a per-viewer "mark as used" toggle (kept local to
 * this screen, not synced anywhere, since there's no backend yet). Content
 * is still hardcoded; an easy real-build follow-up is making this
 * admin-editable from Firestore instead.
 */
export function BenefitsScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [redeemed, setRedeemed] = useState<Record<string, boolean>>({});

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.headerWrap}>
        <View style={styles.header}>
          <Text style={styles.title}>BENEFITS</Text>
          <Text style={styles.subtitle}>Member perks — tap a card for details</Text>
        </View>
        <View style={styles.headerAngle} />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {PERKS.map((p) => {
          const isOpen = expandedId === p.id;
          const isRedeemed = !!redeemed[p.id];
          return (
            <Pressable key={p.id} onPress={() => setExpandedId(isOpen ? null : p.id)} style={styles.card}>
              <View style={styles.cardTopRow}>
                <View style={styles.iconWrap}>
                  <Text style={styles.icon}>{p.icon}</Text>
                </View>
                <View style={styles.cardTopText}>
                  <Text style={styles.cardTitle}>{p.title.toUpperCase()}</Text>
                  <Text style={styles.cardBody}>{p.body}</Text>
                </View>
                <Text style={styles.chevron}>{isOpen ? '▾' : '▸'}</Text>
              </View>

              {isOpen ? (
                <View style={styles.detailWrap}>
                  <Text style={styles.detailText}>{p.detail}</Text>
                  {p.code !== 'N/A' ? (
                    <View style={styles.redeemRow}>
                      <View style={styles.codeChip}>
                        <Text style={styles.codeLabel}>CODE</Text>
                        <Text style={styles.codeValue}>{p.code}</Text>
                      </View>
                      <Pressable
                        onPress={() => setRedeemed((r) => ({ ...r, [p.id]: !r[p.id] }))}
                        style={[styles.redeemBtn, isRedeemed ? styles.redeemBtnDone : null]}
                      >
                        <Text style={[styles.redeemBtnText, isRedeemed ? styles.redeemBtnTextDone : null]}>
                          {isRedeemed ? '✓ REDEEMED' : 'MARK AS REDEEMED'}
                        </Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerWrap: { backgroundColor: colors.navy, overflow: 'hidden' },
  header: { paddingTop: 12, paddingBottom: 28, paddingHorizontal: spacing.lg },
  headerAngle: { position: 'absolute', left: -24, right: -24, bottom: -18, height: 40, backgroundColor: colors.white, transform: [{ rotate: '-2.5deg' }] },
  title: { fontFamily: fonts.display, fontSize: 26, color: colors.white, letterSpacing: 0.4 },
  subtitle: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.border, marginTop: 2 },
  list: { padding: spacing.lg, gap: 12, paddingBottom: 90 },
  card: { backgroundColor: colors.bgLight, borderRadius: radii.lg, padding: 14 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 18 },
  cardTopText: { flex: 1, gap: 2 },
  cardTitle: { fontFamily: fonts.display, fontSize: 15, color: colors.navy, letterSpacing: 0.2 },
  cardBody: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.muted },
  chevron: { fontFamily: fonts.display, fontSize: 16, color: colors.goldDeep },
  detailWrap: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, gap: 10 },
  detailText: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.body, lineHeight: 19 },
  redeemRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  codeChip: { backgroundColor: colors.white, borderRadius: radii.md, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.goldTintBorder },
  codeLabel: { fontFamily: fonts.bodyBold, fontSize: 9, color: colors.mutedLight, letterSpacing: 0.5 },
  codeValue: { fontFamily: fonts.display, fontSize: 15, color: colors.navy, letterSpacing: 0.5 },
  redeemBtn: { flex: 1, backgroundColor: colors.gold, borderRadius: radii.pill, paddingVertical: 10, alignItems: 'center' },
  redeemBtnDone: { backgroundColor: colors.navy },
  redeemBtnText: { fontFamily: fonts.display, fontSize: 12, color: colors.navy, letterSpacing: 0.3 },
  redeemBtnTextDone: { color: colors.white },
});
