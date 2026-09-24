import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import type { ChatsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<ChatsStackParamList, 'CreateChat'>;

/** Reached from the ＋ button on ChatsListScreen — admin/manager-only
 * (canCreateChats gates that button). Creates a chat in the active
 * chapter; the creator starts out already joined to it (see
 * CREATE_CHAT_CHANNEL in AppContext), so it shows up under "Joined"
 * immediately after Create. */
export function CreateChatScreen({ navigation }: Props) {
  const { activeChapter, dispatch } = useApp();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💬');
  const [announcementOnly, setAnnouncementOnly] = useState(false);
  const [allowMemberReplies, setAllowMemberReplies] = useState(true);

  if (!activeChapter) return null;

  const canSubmit = name.trim().length > 0;

  const handleCreate = () => {
    if (!canSubmit) return;
    dispatch({
      type: 'CREATE_CHAT_CHANNEL',
      chapterId: activeChapter.id,
      name: name.trim(),
      icon: icon.trim() || '💬',
      announcementOnly,
      allowMemberReplies: announcementOnly ? allowMemberReplies : true,
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
          <Text style={styles.title}>NEW CHAT</Text>
          <Text style={styles.subtitle}>{activeChapter.name}</Text>
        </View>
        <View style={styles.headerAngle} />
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Field label="Chat name" value={name} onChangeText={setName} placeholder="e.g. Trail Running" />
        <Field label="Icon (one emoji)" value={icon} onChangeText={setIcon} placeholder="💬" />

        <Text style={styles.sectionLabel}>WHO CAN POST</Text>
        <View style={styles.toggleRow}>
          <ToggleOption label="Everyone" active={!announcementOnly} onPress={() => setAnnouncementOnly(false)} />
          <ToggleOption label="Admins only 🔒" active={announcementOnly} onPress={() => setAnnouncementOnly(true)} />
        </View>

        {announcementOnly ? (
          <>
            <Text style={styles.sectionLabel}>CAN MEMBERS REPLY?</Text>
            <View style={styles.toggleRow}>
              <ToggleOption label="Yes" active={allowMemberReplies} onPress={() => setAllowMemberReplies(true)} />
              <ToggleOption label="View only" active={!allowMemberReplies} onPress={() => setAllowMemberReplies(false)} />
            </View>
          </>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <PillButton label="CREATE CHAT" variant="gold" fullWidth disabled={!canSubmit} onPress={handleCreate} />
      </View>
    </Screen>
  );
}

function Field({ label, value, onChangeText, placeholder }: { label: string; value: string; onChangeText: (v: string) => void; placeholder?: string }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedLight}
        style={styles.fieldInput}
      />
    </View>
  );
}

function ToggleOption({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.toggleOption, { backgroundColor: active ? colors.gold : colors.bgLight }]}>
      <Text style={[styles.toggleOptionText, { color: active ? colors.navy : colors.muted }]}>{label}</Text>
    </Pressable>
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
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleOption: { flex: 1, borderRadius: radii.md, paddingVertical: 12, alignItems: 'center' },
  toggleOptionText: { fontFamily: fonts.bodyBold, fontSize: 13 },
  footer: { padding: spacing.lg, paddingBottom: spacing.xl },
});
