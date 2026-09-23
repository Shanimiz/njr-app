import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { colors, fonts, radii, spacing } from '@/theme';

/**
 * Placeholder per the brief ("some other tabs like benefits could be
 * discussed after"). Static content for now — an easy follow-up is making
 * this admin-editable from Firestore instead of hardcoded here.
 */
export function BenefitsScreen() {
  const perks = [
    { title: 'Runner-owned gear discount', body: '15% off at Bird & Bones Running Co. with your member ID.' },
    { title: 'Free entry: Ice Cream Run', body: 'Always free — tips for the coffee fund optional.' },
    { title: 'Priority race registration', body: 'Members get first access to NJR-organized races before public signup.' },
  ];
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>BENEFITS</Text>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {perks.map((p) => (
          <View key={p.title} style={styles.card}>
            <Text style={styles.cardTitle}>{p.title.toUpperCase()}</Text>
            <Text style={styles.cardBody}>{p.body}</Text>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.navy, paddingTop: 12, paddingBottom: 16, paddingHorizontal: spacing.lg },
  title: { fontFamily: fonts.display, fontSize: 26, color: colors.white, letterSpacing: 0.4 },
  list: { padding: spacing.lg, gap: 12, paddingBottom: 90 },
  card: { backgroundColor: colors.bgLight, borderRadius: radii.lg, padding: 16, gap: 6 },
  cardTitle: { fontFamily: fonts.display, fontSize: 16, color: colors.navy, letterSpacing: 0.3 },
  cardBody: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.body, lineHeight: 19 },
});
