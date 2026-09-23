import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts } from '@/theme';

interface PillButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'navy' | 'gold' | 'outline';
  fullWidth?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

/** The one button component every screen should use, so "what does a
 * primary action look like" stays a single decision. Navy = primary,
 * gold = celebratory / money-adjacent (RSVP, tip, register), outline =
 * secondary/low-emphasis. */
export function PillButton({ label, onPress, variant = 'navy', fullWidth, disabled, style }: PillButtonProps) {
  const bg = variant === 'navy' ? colors.navy : variant === 'gold' ? colors.gold : 'transparent';
  const textColor = variant === 'outline' ? colors.navy : variant === 'gold' ? colors.navy : colors.white;
  const border = variant === 'outline' ? { borderWidth: 1.5, borderColor: colors.navy } : null;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        fullWidth ? { width: '100%' } : null,
        border,
        style,
      ]}
    >
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
