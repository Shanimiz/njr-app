import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import type { EventsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<EventsStackParamList, 'CreateEvent'>;

function tomorrowAt(hour: number) {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hour, 0, 0, 0);
  return d;
}
function nextSaturdayAt(hour: number) {
  const d = new Date();
  const diff = (6 - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  d.setHours(hour, 0, 0, 0);
  return d;
}
function inDaysAt(days: number, hour: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

const DATE_PRESETS = [
  { label: 'TOMORROW · 7:00 AM', date: tomorrowAt(7) },
  { label: 'THIS SATURDAY · 8:00 AM', date: nextSaturdayAt(8) },
  { label: 'IN 2 WEEKS · 9:00 AM', date: inDaysAt(14, 9) },
];

/**
 * Reached from the + FAB on EventsFeedScreen — admin/manager-only
 * (canCreateEvents gates that button). A real date/time picker felt like
 * overkill for a testing-focused first build, so this offers three
 * presets instead of a native picker dependency; swap for a real picker
 * once the club wants one.
 */
export function CreateEventScreen({ navigation }: Props) {
  const { activeChapter, dispatch } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateIndex, setDateIndex] = useState(0);
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState('');

  if (!activeChapter) return null;

  const canSubmit = title.trim().length > 0 && location.trim().length > 0;

  const handleCreate = () => {
    if (!canSubmit) return;
    dispatch({
      type: 'CREATE_RUN_EVENT',
      chapterId: activeChapter.id,
      title: title.trim(),
      description: description.trim() || 'Details coming soon.',
      dateISO: DATE_PRESETS[dateIndex].date.toISOString(),
      location: location.trim(),
      isFree,
      priceCents: isFree ? 0 : Math.round((parseFloat(price) || 0) * 100),
    });
    navigation.goBack();
  };

  return (
    <Screen>
      <View style={styles.headerWrap}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backTap}>
            <Text style={styles.back}>← BACK</Text>
          </Pressable>
          <Text style={styles.title}>NEW RUN</Text>
          <Text style={styles.subtitle}>{activeChapter.name}</Text>
        </View>
        <View style={styles.headerAngle} />
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Field label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Sunset Bridge Run" />
        <Field label="Location" value={location} onChangeText={setLocation} placeholder="e.g. Brooklyn Bridge Park" />
        <Field label="Description" value={description} onChangeText={setDescription} placeholder="Pace, distance, what to bring…" multiline />

        <Text style={styles.sectionLabel}>WHEN</Text>
        <View style={styles.presetCol}>
          {DATE_PRESETS.map((p, i) => (
            <Pressable
              key={p.label}
              onPress={() => setDateIndex(i)}
              style={[styles.preset, { backgroundColor: dateIndex === i ? colors.gold : colors.bgLight }]}
            >
              <Text style={[styles.presetText, { color: dateIndex === i ? colors.navy : colors.muted }]}>{p.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>PRICE</Text>
        <View style={styles.toggleRow}>
          <Pressable onPress={() => setIsFree(true)} style={[styles.toggleOption, { backgroundColor: isFree ? colors.gold : colors.bgLight }]}>
            <Text style={[styles.toggleOptionText, { color: isFree ? colors.navy : colors.muted }]}>FREE</Text>
          </Pressable>
          <Pressable onPress={() => setIsFree(false)} style={[styles.toggleOption, { backgroundColor: !isFree ? colors.gold : colors.bgLight }]}>
            <Text style={[styles.toggleOptionText, { color: !isFree ? colors.navy : colors.muted }]}>PAID</Text>
          </Pressable>
        </View>
        {!isFree ? <Field label="Price (USD)" value={price} onChangeText={setPrice} placeholder="12" keyboardType="numeric" /> : null}
      </ScrollView>

      <View style={styles.footer}>
        <PillButton label="CREATE RUN" variant="gold" fullWidth disabled={!canSubmit} onPress={handleCreate} />
      </View>
    </Screen>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric';
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor={colors.mutedLight}
        multiline={props.multiline}
        keyboardType={props.keyboardType}
        style={[styles.fieldInput, props.multiline ? { minHeight: 60, textAlignVertical: 'top' } : null]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrap: { backgroundColor: colors.navy, overflow: 'hidden' },
  header: { paddingTop: 16, paddingBottom: 30, paddingHorizontal: spacing.lg },
  headerAngle: { position: 'absolute', left: -24, right: -24, bottom: -18, height: 40, backgroundColor: colors.white, transform: [{ rotate: '-2.5deg' }] },
  backTap: { alignSelf: 'flex-start' },
  back: { color: colors.white, fontFamily: fonts.bodyBold, fontSize: 12 },
  title: { color: colors.white, fontFamily: fonts.display, fontSize: 26, marginTop: 8, letterSpacing: 0.4 },
  subtitle: { color: colors.border, fontFamily: fonts.bodyRegular, fontSize: 11, marginTop: 2 },
  form: { padding: spacing.lg, gap: 10 },
  fieldWrap: { backgroundColor: colors.bgLight, borderRadius: radii.md, padding: 12 },
  fieldLabel: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.mutedLight, letterSpacing: 0.4 },
  fieldInput: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.navy, marginTop: 2, padding: 0 },
  sectionLabel: { fontFamily: fonts.display, fontSize: 14, letterSpacing: 0.6, color: colors.gold, marginTop: 10 },
  presetCol: { gap: 8 },
  preset: { borderRadius: radii.md, paddingVertical: 12, paddingHorizontal: 14 },
  presetText: { fontFamily: fonts.bodyBold, fontSize: 12 },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleOption: { flex: 1, borderRadius: radii.md, paddingVertical: 12, alignItems: 'center' },
  toggleOptionText: { fontFamily: fonts.bodyBold, fontSize: 13 },
  footer: { padding: spacing.lg, paddingBottom: spacing.xl },
});
