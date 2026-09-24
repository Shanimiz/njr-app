import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { colors, fonts, radii, spacing } from '@/theme';
import type { MoreStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'Etiquette'>;

interface Tip {
  icon: string;
  title: string;
  body: string;
}

// General group-run etiquette, written for the club — not pulled from any
// outside source. Easy for a chapter admin to hand Claude updated wording
// for later if the club wants something more specific per chapter.
const TIPS: Tip[] = [
  { icon: '🙋', title: 'Call it out', body: `Give a friendly "on your left!" before passing someone from behind.` },
  { icon: '🚦', title: 'Face traffic', body: 'On streets with no sidewalk, run facing oncoming traffic so you can see what\'s coming.' },
  { icon: '🧍', title: 'Single file when it\'s tight', body: 'Narrow sidewalks or bridges — drop to single file so others can get by.' },
  { icon: '🐌', title: 'No runner left behind', body: 'Regroup at corners and water stops so the group doesn\'t split apart for good.' },
  { icon: '🗑️', title: 'Pack it out', body: 'Gel wrappers and cups go in a pocket, not the sidewalk — even at the finish.' },
  { icon: '🔦', title: 'Be seen after dark', body: 'Reflective gear or a light for early-morning and evening runs.' },
  { icon: '⏰', title: 'Show up a few minutes early', body: 'Groups roll out on time — a late arrival means running solo to catch up.' },
  { icon: '🤝', title: 'No runner too slow, no runner too fast', body: 'Every pace group is welcome — cheer on whoever\'s near you, front or back of the pack.' },
];

export function RunningEtiquetteScreen({ navigation }: Props) {
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.headerWrap}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backTap}>
            <Text style={styles.back}>← BACK</Text>
          </Pressable>
          <Text style={styles.title}>RUNNING ETIQUETTE</Text>
          <Text style={styles.subtitle}>Keeping group runs safe and friendly for everyone</Text>
        </View>
        <View style={styles.headerAngle} />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {TIPS.map((tip) => (
          <View key={tip.title} style={styles.card}>
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>{tip.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{tip.title.toUpperCase()}</Text>
              <Text style={styles.cardBody}>{tip.body}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerWrap: { backgroundColor: colors.navy, overflow: 'hidden' },
  header: { paddingTop: 16, paddingBottom: 30, paddingHorizontal: spacing.lg },
  headerAngle: { position: 'absolute', left: -24, right: -24, bottom: -18, height: 40, backgroundColor: colors.white, transform: [{ rotate: '-2.5deg' }] },
  backTap: { alignSelf: 'flex-start' },
  back: { color: colors.white, fontFamily: fonts.bodyBold, fontSize: 12 },
  title: { color: colors.white, fontFamily: fonts.display, fontSize: 24, marginTop: 8, letterSpacing: 0.4 },
  subtitle: { color: colors.border, fontFamily: fonts.bodyRegular, fontSize: 12, marginTop: 2 },
  list: { padding: spacing.lg, gap: 12, paddingBottom: 40 },
  card: { flexDirection: 'row', gap: 12, backgroundColor: colors.bgLight, borderRadius: radii.lg, padding: 14, alignItems: 'flex-start' },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 18 },
  cardTitle: { fontFamily: fonts.display, fontSize: 14, color: colors.navy, letterSpacing: 0.2 },
  cardBody: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.muted, marginTop: 3, lineHeight: 17 },
});
