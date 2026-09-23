import React, { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';

/**
 * Last onboarding step, per the brief: "after they fill this out they have
 * to add a picture of themselves and a little bit of themselves ... so
 * other people can get to know them a little better." Runs once — after
 * every chosen chapter has a join request in — not per chapter, since a
 * profile is shared across all of a member's chapters.
 *
 * The photo picker (expo-image-picker) needs one extra install the rest of
 * the app doesn't: `npx expo install expo-image-picker`. It works inside
 * Expo Go with no other setup — no custom dev client needed.
 *
 * The picked photo's local URI is stored directly in app state as the mock
 * "photoUrl" — good enough to render immediately in this session. A real
 * build uploads it to Storage/S3 here and stores the resulting remote URL
 * instead (see src/lib/firebase.ts).
 */
export function CompleteProfileScreen() {
  const { dispatch } = useApp();
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [bio, setBio] = useState('');
  const [busy, setBusy] = useState(false);

  const canFinish = !!photoUri && bio.trim().length > 0;

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photo access needed', 'Enable photo library access in your phone settings to add a profile picture.');
      return;
    }
    // Not passing `mediaTypes` on purpose — that option's API has changed
    // across expo-image-picker versions, and the default already covers
    // photos, so leaving it out keeps this working regardless of which
    // version `npx expo install` resolves for your SDK.
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera access needed', 'Enable camera access in your phone settings to take a profile picture.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
  };

  const choosePhoto = () => {
    Alert.alert('Add a profile photo', undefined, [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Library', onPress: pickFromLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleFinish = async () => {
    if (!canFinish || !photoUri) return;
    setBusy(true);
    dispatch({ type: 'COMPLETE_PROFILE', photoUrl: photoUri, bio: bio.trim() });
    dispatch({ type: 'CONFIRM_CHAPTER_SELECTION' });
  };

  return (
    <Screen>
      <View style={styles.headerWrap}>
        <View style={styles.header}>
          <Text style={styles.title}>SET UP YOUR PROFILE</Text>
          <Text style={styles.subtitle}>So other runners recognize you at the start line</Text>
        </View>
        <View style={styles.headerAngle} />
      </View>

      <View style={styles.body}>
        <Pressable onPress={choosePhoto} style={styles.photoWrap}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>📷</Text>
            </View>
          )}
          <View style={styles.photoBadge}>
            <Text style={styles.photoBadgeText}>{photoUri ? 'CHANGE' : 'ADD PHOTO'}</Text>
          </View>
        </Pressable>

        <Text style={styles.fieldLabel}>SHORT BIO</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          multiline
          placeholder="A sentence or two — pace, distance you're training for, what gets you out the door…"
          placeholderTextColor={colors.mutedLight}
          style={styles.bioInput}
        />
      </View>

      <View style={styles.footer}>
        <PillButton label="FINISH — ENTER THE APP" variant="gold" fullWidth disabled={!canFinish || busy} onPress={handleFinish} />
        {!canFinish ? <Text style={styles.hint}>Add a photo and a short bio to continue.</Text> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerWrap: { backgroundColor: colors.navy, overflow: 'hidden' },
  header: { paddingTop: 16, paddingBottom: 30, paddingHorizontal: spacing.lg },
  headerAngle: { position: 'absolute', left: -24, right: -24, bottom: -18, height: 40, backgroundColor: colors.white, transform: [{ rotate: '-2.5deg' }] },
  title: { color: colors.white, fontFamily: fonts.display, fontSize: 26, letterSpacing: 0.4 },
  subtitle: { color: colors.border, fontFamily: fonts.bodyRegular, fontSize: 12, marginTop: 4 },
  body: { flex: 1, padding: spacing.lg, alignItems: 'center', gap: 10 },
  photoWrap: { alignItems: 'center', marginBottom: 8 },
  photo: { width: 132, height: 132, borderRadius: 66, borderWidth: 3, borderColor: colors.gold },
  photoPlaceholder: { width: 132, height: 132, borderRadius: 66, backgroundColor: colors.bgLight, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed' },
  photoPlaceholderText: { fontSize: 36 },
  photoBadge: { backgroundColor: colors.navy, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 6, marginTop: -14 },
  photoBadgeText: { color: colors.white, fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 0.4 },
  fieldLabel: { alignSelf: 'flex-start', fontFamily: fonts.bodyBold, fontSize: 11, color: colors.muted, letterSpacing: 0.5, marginTop: 8 },
  bioInput: {
    width: '100%',
    minHeight: 100,
    backgroundColor: colors.bgLight,
    borderRadius: radii.md,
    padding: 14,
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
    color: colors.navy,
    textAlignVertical: 'top',
  },
  footer: { padding: spacing.lg, paddingBottom: spacing.xl, gap: 8 },
  hint: { fontFamily: fonts.bodyRegular, fontSize: 11, color: colors.muted, textAlign: 'center' },
});
