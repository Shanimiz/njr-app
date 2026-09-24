import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme';

/** Thin wrapper so every screen gets the same background + safe-area
 * handling without repeating it. Also shifts content up above the keyboard
 * on iOS, so a text input and a button below it (the registration form,
 * the profile step) don't end up with that button hidden behind the
 * keyboard.
 *
 * This used to also wrap children in a Pressable that called
 * Keyboard.dismiss on any background tap, so tapping outside a text field
 * would close the keyboard. In practice that outer Pressable ended up
 * swallowing taps meant for buttons nested inside it (the Finish button,
 * the Send Request to Join button) on real devices, even though nested
 * Pressables are supposed to negotiate this correctly — so it's been
 * removed. Individual text inputs are responsible for their own
 * dismiss-the-keyboard affordance instead (returnKeyType="done" +
 * onSubmitEditing={Keyboard.dismiss}), and since content already shifts
 * above the keyboard here, a screen's primary button should always be
 * reachable without dismissing the keyboard at all. */
export function Screen({ children, style, edges }: { children: React.ReactNode; style?: ViewStyle; edges?: ('top' | 'bottom' | 'left' | 'right')[] }) {
  return (
    <SafeAreaView style={[styles.root, style]} edges={edges ?? ['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {children}
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
