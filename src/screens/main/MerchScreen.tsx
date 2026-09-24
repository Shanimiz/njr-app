import React from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { colors, fonts, radii, spacing } from '@/theme';
import type { MoreStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'Merch'>;

const MERCH_URL = 'https://nicejewishrunners.org/?srsltid=AU7gw4UljENBhesbJ_l0gwDM50U1EA7bKfAWSRk7Okzy5K7aXGOvRvmJ';

// Pulled directly from nicejewishrunners.org — the club's actual team store.
const HERO_IMAGE_URL =
  'https://nicejewishrunners.org/cdn/shop/files/133cd077-07d2-402d-87d6-a857b434af46_4f407262-25fe-4257-acaa-442ca7a9eb42.jpg?v=1735437036&width=1200';
const LOGO_IMAGE_URL =
  'https://nicejewishrunners.org/cdn/shop/files/Nice_Jewish_Runners_Logos_Mockups_79b1d481-9344-43c2-883f-4c2147e8bba0.jpg?v=1715170847';

export function MerchScreen({ navigation }: Props) {
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.headerWrap}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backTap}>
            <Text style={styles.back}>← BACK</Text>
          </Pressable>
        </View>
        <View style={styles.headerAngle} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Image source={{ uri: LOGO_IMAGE_URL }} style={styles.logo} />
        <Text style={styles.title}>NJR MERCH</Text>
        <Image source={{ uri: HERO_IMAGE_URL }} style={styles.cover} />
        {/* Quoted straight from the team store's own homepage. */}
        <Text style={styles.tagline}>“Nice Jewish Runners Team Store”</Text>
        <Text style={styles.copy}>“Come join us in a city near you!” Shop tees, hats, and gear for Women's, Men's, Kids', and Rabbit collections.</Text>
        <PillButton label="EXPLORE MERCH" variant="gold" fullWidth onPress={() => Linking.openURL(MERCH_URL)} />
        <Text style={styles.linkNote}>nicejewishrunners.org</Text>
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
  body: { alignItems: 'center', padding: spacing.lg, gap: 14 },
  logo: { width: 56, height: 56, borderRadius: 28, marginTop: -8 },
  title: { fontFamily: fonts.display, fontSize: 26, color: colors.navy, letterSpacing: 0.4, textAlign: 'center' },
  cover: { width: '100%', height: 170, borderRadius: radii.lg, backgroundColor: colors.bgLight },
  tagline: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.goldDeep, textAlign: 'center' },
  copy: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.body, textAlign: 'center', lineHeight: 21 },
  linkNote: { fontFamily: fonts.bodyRegular, fontSize: 11, color: colors.mutedLight, textAlign: 'center' },
});
