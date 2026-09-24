import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentMethod'>;

/**
 * "A page for changing the card number." Reached from the CHANGE link on
 * PaymentScreen's card row, and from a matching link on the Profile tab.
 * Demo build, same as the rest of the payment flow (see PaymentScreen) —
 * nothing is validated with a real card network or charged; this just
 * updates the mock cardLast4 in context so "Card ending in ••••" stays
 * consistent everywhere it's shown.
 */
export function PaymentMethodScreen({ navigation }: Props) {
  const { cardLast4, dispatch } = useApp();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const digitsOnly = cardNumber.replace(/\D/g, '');
  const canSave = digitsOnly.length >= 12 && expiry.trim().length > 0 && cvv.trim().length >= 3;

  const handleSave = () => {
    if (!canSave) {
      Alert.alert('Missing info', 'Enter a full card number, expiry, and CVV to save a new card.');
      return;
    }
    dispatch({ type: 'UPDATE_CARD', last4: digitsOnly.slice(-4) });
    Alert.alert('Card updated', `Your card ending in ${digitsOnly.slice(-4)} is now on file.`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
        <Text style={styles.title}>PAYMENT METHOD</Text>
        <Text style={styles.subtitle}>Card ending in •••• {cardLast4}</Text>
      </View>

      <View style={styles.body}>
        <Field label="Card number" value={cardNumber} onChangeText={setCardNumber} keyboardType="number-pad" placeholder="1234 5678 9012 3456" />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Expiry" value={expiry} onChangeText={setExpiry} placeholder="MM/YY" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="CVV" value={cvv} onChangeText={setCvv} keyboardType="number-pad" placeholder="123" secureTextEntry />
          </View>
        </View>
        <Text style={styles.disclaimer}>
          Demo build — no card network is actually contacted. Saving here just updates the card shown at checkout.
        </Text>
      </View>

      <View style={styles.footer}>
        <PillButton label="SAVE CARD" variant="gold" fullWidth onPress={handleSave} />
      </View>
    </Screen>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'number-pad' | 'default';
  placeholder?: string;
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        keyboardType={props.keyboardType}
        placeholder={props.placeholder}
        placeholderTextColor={colors.mutedLight}
        secureTextEntry={props.secureTextEntry}
        style={styles.fieldInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.navy, paddingTop: 16, paddingBottom: 20, paddingHorizontal: spacing.lg },
  closeBtn: { alignSelf: 'flex-end', width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: colors.white, fontSize: 14 },
  title: { color: colors.white, fontFamily: fonts.display, fontSize: 24, marginTop: 6, letterSpacing: 0.4 },
  subtitle: { color: colors.border, fontFamily: fonts.bodySemibold, fontSize: 12, marginTop: 2 },
  body: { padding: spacing.lg, gap: 10, flex: 1 },
  row: { flexDirection: 'row', gap: 10 },
  fieldWrap: { backgroundColor: colors.bgLight, borderRadius: radii.md, padding: 12 },
  fieldLabel: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.mutedLight, letterSpacing: 0.4 },
  fieldInput: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.navy, marginTop: 2, padding: 0 },
  disclaimer: { fontFamily: fonts.bodyRegular, fontSize: 11, color: colors.mutedLight, lineHeight: 16, marginTop: 4 },
  footer: { padding: spacing.lg, paddingBottom: spacing.xl },
});
