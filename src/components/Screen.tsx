import React from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme';

/** Thin wrapper so every screen gets the same background + safe-area
 * handling without repeating it. Also makes every screen dismiss the
 * keyboard on a tap outside a text field, and shifts content up above the
 * keyboard on iOS. Without this, a screen with a text input and a button
 * below it (the registration form, the profile step) could leave that
 * button unreachable once the keyboard was up, with no way to close it. */
export function Screen({ children, style, edges }: { children: React.ReactNode; style?: ViewStyle; edges?: ('top' | 'bottom' | 'left' | 'right')[] }) {
  return (
    <SafeAreaView style={[styles.root, style]} edges={edges ?? ['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.flex}>{children}</View>
        </TouchableWithoutFeedback>
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
