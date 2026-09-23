import React from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme';

/** Thin wrapper so every screen gets the same background + safe-area
 * handling without repeating it. Also makes every screen dismiss the
 * keyboard on a tap outside a text field, and shifts content up above the
 * keyboard on iOS. Without this, a screen with a text input and a button
 * below it (the registration form, the profile step) could leave that
 * button unreachable once the keyboard was up, with no way to close it.
 *
 * Built with Pressable rather than the older TouchableWithoutFeedback —
 * nested Pressables negotiate taps with each other correctly (tapping a
 * button inside only fires that button, not this wrapper too), whereas
 * TouchableWithoutFeedback can swallow the first tap on a nested button
 * when the keyboard is still open, requiring a second tap to actually
 * work. */
export function Screen({ children, style, edges }: { children: React.ReactNode; style?: ViewStyle; edges?: ('top' | 'bottom' | 'left' | 'right')[] }) {
  return (
    <SafeAreaView style={[styles.root, style]} edges={edges ?? ['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.flex} onPress={Keyboard.dismiss}>
          {children}
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flex: { flex: 1 },
});
