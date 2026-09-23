import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme';

/** Thin wrapper so every screen gets the same background + safe-area
 * handling without repeating it. */
export function Screen({ children, style, edges }: { children: React.ReactNode; style?: ViewStyle; edges?: ('top' | 'bottom' | 'left' | 'right')[] }) {
  return (
    <SafeAreaView style={[styles.root, style]} edges={edges ?? ['top', 'bottom']}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
});
