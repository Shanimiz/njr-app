import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Screen } from '@/components/Screen';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import type { MainTabParamList, MoreStackParamList } from '@/navigation/types';

type Props = CompositeScreenProps<
  NativeStackScreenProps<MoreStackParamList, 'MoreMenu'>,
  BottomTabScreenProps<MainTabParamList>
>;

/**
 * The 5th tab's landing menu — holds the pages that didn't get their own
 * spot in the bottom bar (see the tab-layout conversation with Shani):
 * chapter Messages (the DM inbox), chapter Members, and Donate to NJR.
 */
export function MoreMenuScreen({ navigation }: Props) {
  const { activeChapter } = useApp();

  const openDirectMessages = () => {
    const rootNav = (navigation.getParent()?.getParent() ?? navigation.getParent()) as
      | (typeof navigation & { navigate: (screen: 'DirectMessages') => void })
      | undefined;
    rootNav?.navigate('DirectMessages');
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.headerWrap}>
        <View style={styles.header}>
          <Text style={styles.title}>MORE</Text>
          <Text style={styles.subtitle}>{activeChapter ? activeChapter.city.toUpperCase() : ''}</Text>
        </View>
        <View style={styles.headerAngle} />
      </View>

      <View style={styles.list}>
        <MenuRow icon="✉️" label="Messages" sub="Your chapter DMs" onPress={openDirectMessages} />
        <MenuRow icon="🧑‍🤝‍🧑" label="Members" sub="Everyone in this chapter" onPress={() => navigation.navigate('Members')} />
        <MenuRow icon="❤️" label="Donate to NJR" sub="Support the club" onPress={() => navigation.navigate('Donate')} />
      </View>
    </Screen>
  );
}

function MenuRow({ icon, label, sub, onPress }: { icon: string; label: string; sub: string; onPress: () => void }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label.toUpperCase()}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerWrap: { backgroundColor: colors.navy, overflow: 'hidden' },
  header: { paddingTop: 12, paddingBottom: 28, paddingHorizontal: spacing.lg },
  headerAngle: { position: 'absolute', left: -24, right: -24, bottom: -18, height: 40, backgroundColor: colors.white, transform: [{ rotate: '-2.5deg' }] },
  title: { fontFamily: fonts.display, fontSize: 26, color: colors.white, letterSpacing: 0.4 },
  subtitle: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.border, letterSpacing: 0.4, marginTop: 2 },
  list: { padding: spacing.lg, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.bgLight, borderRadius: radii.lg, padding: 14 },
  iconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 18 },
  rowLabel: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.navy, letterSpacing: 0.2 },
  rowSub: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.muted, marginTop: 2 },
  chevron: { fontFamily: fonts.display, fontSize: 20, color: colors.mutedLight },
});
