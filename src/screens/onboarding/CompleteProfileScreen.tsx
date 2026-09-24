import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { Avatar } from '@/components/Avatar';
import { PillButton } from '@/components/PillButton';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CompleteProfile'>;

/**
 * Last onboarding step, per the brief: "after they fill this out they have
 * to add a picture of themselves and a little bit of themselves ... so
 * other people can get to know them a little better." Runs once — after
 * every chosen chapter has a join request in — not per chapter, since a
 * profile is shared across all of a member's chapters.
 *
 * Uses the device's real camera or photo library via expo-image-picker.
 * This failed to install cleanly the first time it was tried in this
 * Codespace ("Unable to resolve module ../../../expo" deep inside the
 * package) — root cause turned out to be this project's own
 * babel.config.js, not the package: the module-resolver plugin's `root`
 * was set to the whole project folder, which meant it was also processing
 * expo-image-picker's own source as Metro transformed it (several Expo
 * packages ship raw TypeScript that Metro compiles on the fly) and
 * mangling its internal imports. Narrowed to `root: ['./src']` — see
 * babel.config.js — since `@` never needs to resolve outside there anyway.
 *
 * Also reachable later, after onboarding, via "Edit photo & bio" on the
 * Profile tab (passes { editMode: true }) — same screen, prefilled with
 * whatever's already on the profile, but Finish saves and goes back to
 * Profile instead of trying to (re-)enter onboarding.
 */
export function CompleteProfileScreen({ route, navigation }: Props) {
  const { currentUser, dispatch } = useApp();
  const editMode = !!route.params?.editMode;
  const [photoUri, setPhotoUri] = useState<string | undefined>(currentUser.photoUrl);
  const [bio, setBio] = useState(currentUser.bio ?? '');

  const canFinish = !!photoUri && bio.trim().length > 0;

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photo access needed', 'Allow access to your photos to choose a profile picture — you can turn this on in your phone’s Settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera access needed', 'Allow camera access to take a profile picture — you can turn this on in your phone’s Settings.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleFinish = () => {
    if (!canFinish || !photoUri) return;
    dispatch({ type: 'COMPLETE_PROFILE', photoUrl: photoUri, bio: bio.trim() });
    if (editMode) {
      navigation.goBack();
    } else {
      dispatch({ type: 'CONFIRM_CHAPTER_SELECTION' });
      // Main is always registered in RootNavigator now — without this
      // explicit call, finishing onboarding set the app's state correctly
      // but never actually moved you off this screen (the same root cause
      // as the "tap to enter" bug elsewhere in onboarding).
      navigation.navigate('Main');
    }
  };

  return (
    <Screen>
      <View style={styles.headerWrap}>
        <View style={styles.header}>
          {editMode ? (
            <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backTap}>
              <Text style={styles.back}>← BACK</Text>
            </Pressable>
          ) : null}
          <Text style={styles.title}>{editMode ? 'EDIT YOUR PROFILE' : 'SET UP YOUR PROFILE'}</Text>
          <Text style={styles.subtitle}>
            {editMode ? 'Update your photo or bio anytime' : 'So other runners recognize you at the start line'}
          </Text>
        </View>
        <View style={styles.headerAngle} />
      </View>

      <View style={styles.body}>
        <Text style={styles.fieldLabel}>YOUR PHOTO</Text>
        <View style={styles.photoRow}>
          <Avatar size={72} bg={colors.border} uri={photoUri} />
          <View style={styles.photoButtons}>
            <Pressable style={styles.photoBtn} onPress={takePhoto}>
              <Text style={styles.photoBtnText}>📷 Take Photo</Text>
            </Pressable>
            <Pressable style={styles.photoBtn} onPress={pickFromLibrary}>
              <Text style={styles.photoBtnText}>🖼️ Choose From Library</Text>
            </Pressable>
          </View>
        </View>

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
        <PillButton
          label={editMode ? 'SAVE CHANGES' : 'FINISH — ENTER THE APP'}
          variant="gold"
          fullWidth
          disabled={!canFinish}
          onPress={handleFinish}
        />
        {!canFinish ? <Text style={styles.hint}>Add a photo and a short bio to continue.</Text> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerWrap: { backgroundColor: colors.navy, overflow: 'hidden' },
  header: { paddingTop: 16, paddingBottom: 30, paddingHorizontal: spacing.lg },
  headerAngle: { position: 'absolute', left: -24, right: -24, bottom: -18, height: 40, backgroundColor: colors.white, transform: [{ rotate: '-2.5deg' }] },
  backTap: { alignSelf: 'flex-start', marginBottom: 8 },
  back: { color: colors.white, fontFamily: fonts.bodyBold, fontSize: 12 },
  title: { color: colors.white, fontFamily: fonts.display, fontSize: 26, letterSpacing: 0.4 },
  subtitle: { color: colors.border, fontFamily: fonts.bodyRegular, fontSize: 12, marginTop: 4 },
  body: { flex: 1, padding: spacing.lg, gap: 10 },
  fieldLabel: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.muted, letterSpacing: 0.5, marginTop: 8 },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 8 },
  photoButtons: { flex: 1, gap: 8 },
  photoBtn: { backgroundColor: colors.bgLight, borderRadius: radii.md, paddingVertical: 10, paddingHorizontal: 12 },
  photoBtnText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.navy },
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
