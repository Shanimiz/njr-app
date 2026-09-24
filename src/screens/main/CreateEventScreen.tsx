import React, { useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import type { EventsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<EventsStackParamList, 'CreateEvent'>;

const DAY_COUNT = 21;
const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = [0, 15, 30, 45];

function nextNDays(n: number): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
}

/**
 * A real native date/time picker component would be the normal choice
 * here, but this project already had two rounds of a native-ish package
 * (expo-image-picker) breaking the Metro bundle in this exact Codespace —
 * see CompleteProfileScreen's notes. Rather than risk that again for a
 * date picker, this is a fully custom chip-based picker: no new
 * dependency, no free-text date parsing to get wrong, just tap a day and
 * a time. The cover-photo picker below DOES reuse expo-image-picker,
 * since that's already a working dependency in the project (assuming the
 * profile-photo step works for you) rather than a new one.
 */
export function CreateEventScreen({ navigation }: Props) {
  const { activeChapter, dispatch } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [coverUri, setCoverUri] = useState<string | undefined>(undefined);

  const days = useMemo(() => nextNDays(DAY_COUNT), []);
  const [dayIndex, setDayIndex] = useState(1); // tomorrow, by default
  const [hour12, setHour12] = useState(7);
  const [minute, setMinute] = useState(0);
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');

  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState('');
  const [hasCapacity, setHasCapacity] = useState(false);
  const [capacity, setCapacity] = useState('');

  if (!activeChapter) return null;

  const canSubmit = title.trim().length > 0 && location.trim().length > 0;

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photo access needed', 'Allow access to your photos to add a cover image — you can turn this on in your phone’s Settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [16, 9], quality: 0.7 });
    if (!result.canceled && result.assets[0]) setCoverUri(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera access needed', 'Allow camera access to take a cover photo — you can turn this on in your phone’s Settings.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [16, 9], quality: 0.7 });
    if (!result.canceled && result.assets[0]) setCoverUri(result.assets[0].uri);
  };

  const handleCreate = () => {
    if (!canSubmit) return;
    const hour24 = ampm === 'AM' ? (hour12 === 12 ? 0 : hour12) : hour12 === 12 ? 12 : hour12 + 12;
    const when = new Date(days[dayIndex]);
    when.setHours(hour24, minute, 0, 0);

    dispatch({
      type: 'CREATE_RUN_EVENT',
      chapterId: activeChapter.id,
      title: title.trim(),
      description: description.trim() || 'Details coming soon.',
      coverImageUrl: coverUri,
      dateISO: when.toISOString(),
      location: location.trim(),
      isFree,
      priceCents: isFree ? 0 : Math.round((parseFloat(price) || 0) * 100),
      capacity: hasCapacity ? parseInt(capacity, 10) || undefined : undefined,
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
        <Text style={styles.sectionLabel}>COVER PHOTO</Text>
        <View style={styles.coverBox}>
          {coverUri ? <Image source={{ uri: coverUri }} style={styles.coverImage} /> : <Text style={styles.coverPlaceholder}>🖼️ No cover photo yet</Text>}
        </View>
        <View style={styles.coverButtons}>
          <Pressable style={styles.coverBtn} onPress={takePhoto}>
            <Text style={styles.coverBtnText}>📷 Take Photo</Text>
          </Pressable>
          <Pressable style={styles.coverBtn} onPress={pickFromLibrary}>
            <Text style={styles.coverBtnText}>🖼️ Choose From Library</Text>
          </Pressable>
        </View>

        <Field label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Sunset Bridge Run" />
        <Field label="Location" value={location} onChangeText={setLocation} placeholder="e.g. Brooklyn Bridge Park" />
        <Field label="Description" value={description} onChangeText={setDescription} placeholder="Pace, distance, what to bring…" multiline />

        <Text style={styles.sectionLabel}>DAY</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {days.map((d, i) => {
            const active = i === dayIndex;
            return (
              <Pressable key={d.toISOString()} onPress={() => setDayIndex(i)} style={[styles.dayChip, { backgroundColor: active ? colors.gold : colors.bgLight }]}>
                <Text style={[styles.dayChipDow, { color: active ? colors.navy : colors.muted }]}>
                  {d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                </Text>
                <Text style={[styles.dayChipDate, { color: active ? colors.navy : colors.navy }]}>
                  {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionLabel}>TIME</Text>
        <View style={styles.chipWrap}>
          {HOURS.map((h) => (
            <Pressable key={h} onPress={() => setHour12(h)} style={[styles.smallChip, { backgroundColor: hour12 === h ? colors.gold : colors.bgLight }]}>
              <Text style={[styles.smallChipText, { color: hour12 === h ? colors.navy : colors.muted }]}>{h}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.chipRowInline}>
          {MINUTES.map((m) => (
            <Pressable key={m} onPress={() => setMinute(m)} style={[styles.smallChip, { backgroundColor: minute === m ? colors.gold : colors.bgLight }]}>
              <Text style={[styles.smallChipText, { color: minute === m ? colors.navy : colors.muted }]}>:{m.toString().padStart(2, '0')}</Text>
            </Pressable>
          ))}
          <Pressable onPress={() => setAmpm('AM')} style={[styles.smallChip, { backgroundColor: ampm === 'AM' ? colors.gold : colors.bgLight }]}>
            <Text style={[styles.smallChipText, { color: ampm === 'AM' ? colors.navy : colors.muted }]}>AM</Text>
          </Pressable>
          <Pressable onPress={() => setAmpm('PM')} style={[styles.smallChip, { backgroundColor: ampm === 'PM' ? colors.gold : colors.bgLight }]}>
            <Text style={[styles.smallChipText, { color: ampm === 'PM' ? colors.navy : colors.muted }]}>PM</Text>
          </Pressable>
        </View>
        <Text style={styles.whenPreview}>
          {days[dayIndex].toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · {hour12}:{minute.toString().padStart(2, '0')} {ampm}
        </Text>

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

        <Text style={styles.sectionLabel}>SPOTS</Text>
        <View style={styles.toggleRow}>
          <Pressable onPress={() => setHasCapacity(false)} style={[styles.toggleOption, { backgroundColor: !hasCapacity ? colors.gold : colors.bgLight }]}>
            <Text style={[styles.toggleOptionText, { color: !hasCapacity ? colors.navy : colors.muted }]}>NO LIMIT</Text>
          </Pressable>
          <Pressable onPress={() => setHasCapacity(true)} style={[styles.toggleOption, { backgroundColor: hasCapacity ? colors.gold : colors.bgLight }]}>
            <Text style={[styles.toggleOptionText, { color: hasCapacity ? colors.navy : colors.muted }]}>LIMITED SPOTS</Text>
          </Pressable>
        </View>
        {hasCapacity ? <Field label="Capacity" value={capacity} onChangeText={setCapacity} placeholder="e.g. 50" keyboardType="numeric" /> : null}
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
  coverBox: { height: 130, borderRadius: radii.lg, backgroundColor: colors.bgLight, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  coverImage: { width: '100%', height: '100%' },
  coverPlaceholder: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.mutedLight },
  coverButtons: { flexDirection: 'row', gap: 8 },
  coverBtn: { flex: 1, backgroundColor: colors.bgLight, borderRadius: radii.md, paddingVertical: 10, alignItems: 'center' },
  coverBtnText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.navy },
  chipRow: { gap: 8, paddingVertical: 2 },
  chipRowInline: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayChip: { borderRadius: radii.md, paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center', minWidth: 58 },
  dayChipDow: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 0.4 },
  dayChipDate: { fontFamily: fonts.display, fontSize: 13, marginTop: 1 },
  smallChip: { borderRadius: radii.md, paddingVertical: 8, paddingHorizontal: 12 },
  smallChipText: { fontFamily: fonts.bodyBold, fontSize: 12 },
  whenPreview: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.muted, marginTop: 2 },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleOption: { flex: 1, borderRadius: radii.md, paddingVertical: 12, alignItems: 'center' },
  toggleOptionText: { fontFamily: fonts.bodyBold, fontSize: 13 },
  footer: { padding: spacing.lg, paddingBottom: spacing.xl },
});
