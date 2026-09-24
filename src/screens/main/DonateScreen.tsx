import React from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { colors, fonts, radii, spacing } from '@/theme';
import type { MoreStackParamList } from '@/navigation/types';
import logo from '../../../assets/logo.png';

type Props = NativeStackScreenProps<MoreStackParamList, 'Donate'>;

const GIVEBUTTER_URL = 'https://givebutter.com/nicejewishrunners';

// The real cover photo from the club's actual Givebutter fundraiser page —
// pulled directly from givebutter.com/nicejewishrunners. That page doesn't
// have any written description of its own beyond the title, so the copy
// below is written for the app rather than quoted from the fundraiser.
const COVER_IMAGE_URL = 'https://givebutter.s3.amazonaws.com/media/ZTzlJEjU6i8w6kFUSqfzi3yJpGsjcGdyDqMSylvF.jpg';

export function DonateScreen({ navigation }: Props) {
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
        <Image source={logo} style={styles.logo} />
        <Text style={styles.title}>DONATE TO NJR</Text>
        <Image source={{ uri: COVER_IMAGE_URL }} style={styles.cover} />
        <Text style={styles.copy}>
          Nice Jewish Runners keeps every run free to join, from Central Park sunrise loops to race-day cheer
          squads. Donations help cover route permits, gear for new members, and the coffee (and bagels) after a
          long one. Every bit helps keep the club going strong.
        </Text>
        <PillButton
          label="DONATE ON GIVEBUTTER"
          variant="gold"
          fullWidth
          onPress={() => Linking.openURL(GIVEBUTTER_URL)}
        />
        <Text style={styles.linkNote}>{GIVEBUTTER_URL}</Text>
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
  copy: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.body, textAlign: 'center', lineHeight: 21 },
  linkNote: { fontFamily: fonts.bodyRegular, fontSize: 11, color: colors.mutedLight, textAlign: 'center' },
});
