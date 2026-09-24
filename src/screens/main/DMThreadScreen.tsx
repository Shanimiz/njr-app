import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { Avatar } from '@/components/Avatar';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'DMThread'>;

/**
 * One-on-one conversation — opened either from the DirectMessages inbox
 * list, or straight from "Send a DM" on someone's profile (which creates
 * the thread on the fly via getOrCreateDMThreadId if it doesn't exist yet).
 * The header name/avatar is itself tappable back to that person's profile,
 * same "tap a name to see the profile" pattern used in chats.
 */
export function DMThreadScreen({ route, navigation }: Props) {
  const { dmThreads, dmMessages, users, currentUserId, dispatch } = useApp();
  const [draft, setDraft] = useState('');

  const thread = dmThreads.find((t) => t.id === route.params.threadId);
  if (!thread) return null;

  const otherId = thread.participantIds.find((id) => id !== currentUserId) ?? thread.participantIds[0];
  const other = users[otherId];
  const messages = dmMessages.filter((m) => m.threadId === thread.id);

  const send = () => {
    if (!draft.trim()) return;
    dispatch({ type: 'SEND_DM', threadId: thread.id, text: draft.trim() });
    setDraft('');
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Pressable style={styles.headerIdentity} onPress={() => navigation.navigate('UserProfile', { userId: otherId })}>
          <Avatar size={34} uri={other?.photoUrl} bg={colors.border} />
          <Text style={styles.title}>{other?.fullName.toUpperCase() || '(UNNAMED)'}</Text>
        </Pressable>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {messages.length === 0 ? <Text style={styles.emptyText}>Say hi to get things started.</Text> : null}
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <View key={m.id} style={[styles.bubbleRow, mine ? styles.bubbleRowMine : null]}>
              <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                <Text style={[styles.bubbleText, { color: mine ? colors.white : colors.body }]}>{m.text}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.composer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Message…"
          placeholderTextColor={colors.mutedLight}
          style={styles.composerInput}
          onSubmitEditing={send}
        />
        <Pressable onPress={send} style={styles.sendBtn}>
          <Text style={styles.sendText}>➤</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.navy,
    gap: 10,
  },
  back: { fontSize: 20, color: colors.navy },
  headerIdentity: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'center' },
  title: { fontFamily: fonts.display, fontSize: 16, color: colors.navy, letterSpacing: 0.3 },
  list: { padding: spacing.lg, gap: 10, paddingBottom: 24 },
  emptyText: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 24 },
  bubbleRow: { flexDirection: 'row' },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubble: { borderRadius: radii.lg, paddingVertical: 10, paddingHorizontal: 14, maxWidth: '80%' },
  bubbleTheirs: { backgroundColor: colors.bgLight },
  bubbleMine: { backgroundColor: colors.navy },
  bubbleText: { fontFamily: fonts.bodyRegular, fontSize: 13, lineHeight: 19 },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: spacing.md, borderTopWidth: 2, borderTopColor: colors.navy },
  composerInput: { flex: 1, backgroundColor: colors.bgLight, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.navy },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  sendText: { color: colors.white },
});
