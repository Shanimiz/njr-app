import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/theme';
import type { ChapterRole } from '@/types';

/** Small gold pill used everywhere a member's role needs to show next to
 * their name — event hosts, chat authors, the profile header, the roles
 * list. Members render nothing (per the wireframes, only Manager/Owner get
 * a visible badge). */
export function RoleBadge({ role }: { role: ChapterRole | null }) {
  if (!role || role === 'member') return null;
  const label = role === 'owner' ? 'OWNER' : 'MANAGER';
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.gold,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    color: colors.navy,
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 0.4,
  },
});
