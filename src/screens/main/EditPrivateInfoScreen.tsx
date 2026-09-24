import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { Avatar } from '@/components/Avatar';
import { PillButton } from '@/components/PillButton';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'EditPrivateInfo'>;

/**
 * "Change my private information" — name, email, phone, emergency contact,
 * and photo, all in one settings-style page. Separate from CompleteProfile
 * (which only ever touches the public-facing photo + bio) since these are
 * account/safety details rather than what other members see on a profile.
 * None of this is validated against a real backend yet, same as the rest of
 * the app — it just updates the in-memory + on-device-persisted profile.
 */
export function EditPrivateInfoScreen({ navigation }: Props) {
  const { currentUser, dispatch } = useApp();
  const [photoUri, setPhotoUri] = useState<string | undefined>(currentUser.photoUrl);
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [email, setEmail] = useState(currentUser.email ?? '');
  const [phone, setPhone] = useState(currentUser.phone);
  const [emergencyName, setEmergencyName] = useState(currentUser.emergencyContactName);
  const [emergencyPhone, setEmergencyPhone] = useState(currentUser.emergencyContactPhone);

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photo access needed', 'Allow access to your photos to change your picture — you can turn this on in your phone’s Settings.');
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
      Alert.alert('Camera access needed', 'Allow camera access to take a new picture — you can turn this on in your phone’s Settings.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!fullName.trim()) {
      Alert.alert('Missing info', 'Please fill out your name.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Missing info', 'Please fill out your phone number.');
      return;
    }
    if (!emergencyName.trim()) {
      Alert.alert('Missing info', "Please fill out your emergency contact's name.");
      return;
    }
    if (!emergencyPhone.trim()) {
      Alert.alert('Missing info', "Please fill out your emergency contact's phone number.");
      return;
    }
    dispatch({
      type: 'UPDATE_PRIVATE_INFO',
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      emergencyContactName: emergencyName.trim(),
      emergencyContactPhone: emergencyPhone.trim(),
      photoUrl: photoUri,
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
          <Text style={styles.title}>PRIVATE INFO</Text>
          <Text style={styles.subtitle}>Only visible to you and chapter admins</Text>
        </View>
        <View style={styles.headerAngle} />
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.fieldLabel}>YOUR PHOTO</Text>
        <View style={styles.photoRow}>
          <Avatar size={64} bg={colors.border} uri={photoUri} />
          <View style={styles.photoButtons}>
            <Pressable style={styles.photoBtn} onPress={takePhoto}>
              <Text style={styles.photoBtnText}>📷 Take Photo</Text>
            </Pressable>
            <Pressable style={styles.photoBtn} onPress={pickFromLibrary}>
              <Text style={styles.photoBtnText}>🖼️ Choose From Library</Text>
            </Pressable>
          </View>
        </View>

        <Field label="Full name" value={fullName} onChangeText={setFullName} required />
        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" required />
        <Field label="Emergency contact name & relationship" value={emergencyName} onChangeText={setEmergencyName} required />
        <Field label="Emergency contact phone" value={emergencyPhone} onChangeText={setEmergencyPhone} keyboardType="phone-pad" required />
      </ScrollView>

      <View style={styles.footer}>
        <PillButton label="SAVE CHANGES" variant="gold" fullWidth onPress={handleSave} />
      </View>
    </Screen>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'phone-pad' | 'email-address' | 'default';
  autoCapitalize?: 'none' | 'sentences';
  required?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>
        {props.label}
        {props.required ? <Text style={styles.requiredStar}> *</Text> : null}
      </Text>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        keyboardType={props.keyboardType}
        autoCapitalize={props.autoCapitalize}
        style={styles.fieldInput}
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
  fieldLabel: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.muted, letterSpacing: 0.5, marginTop: 8 },
  requiredStar: { color: colors.danger, fontFamily: fonts.bodyBold },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 8 },
  photoButtons: { flex: 1, gap: 8 },
  photoBtn: { backgroundColor: colors.bgLight, borderRadius: radii.md, paddingVertical: 10, paddingHorizontal: 12 },
  photoBtnText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.navy },
  fieldWrap: { backgroundColor: colors.bgLight, borderRadius: radii.md, padding: 12, marginTop: 4 },
  fieldInput: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.navy, marginTop: 2, padding: 0 },
  footer: { padding: spacing.lg, paddingBottom: spacing.xl },
});
