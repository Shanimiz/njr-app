import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { RoleBadge } from '@/components/RoleBadge';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import { permissions } from '@/lib/permissions';
import type { ChatsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<ChatsStackParamList, 'ChatThread'>;

/**
 * Renders both a normal chat and an announcement-only one from the same
 * component: `channel.announcementOnly` + `allowMemberReplies` decide
 * whether the composer is live or replaced with the "only admins can post"
 * bar, and whether the ⋯ pin/delete menu shows on each message.
 */
export function ChatThreadScreen({ route }: Props) {
  const { chatChannels, chatMessages, users, activeChapter, getRole, currentUserId, dispatch } = useApp();
  const [draft, setDraft] = useState('');

  const channel = chatChannels.find((c) => c.id === route.params.channelId);
  if (!channel || !activeChapter) return null;

  const role = getRole(currentUserId, activeChapter.id);
  const canModerate = role ? permissions.canDeleteAnyMessage(role) : false;
  const canPost = !channel.announcementOnly || channel.allowMemberReplies || (role ? permissions.canPostInAnnouncementChat(role) : false);

  const messages = chatMessages.filter((m) => m.channelId === channel.id);

  const send = () => {
    if (!draft.trim()) return;
    dispatch({ type: 'SEND_CHAT_MESSAGE', channelId: channel.id, text: draft.trim() });
    setDraft('');
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={[styles.iconWrap]}>
            <Text style={styles.icon}>{channel.icon}</Text>
          </View>
          <View>
            <Text style={styles.title}>{channel.name.toUpperCase()}</Text>
            <Text style={styles.subtitle}>
              {channel.announcementOnly ? 'ADMINS POST · EVERYONE VIEWS' : 'EVERYONE CAN CHAT'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {messages.map((m) => {
          if (m.deleted) {
            return (
              <Text key={m.id} style={styles.deletedNote}>
                MESSAGE DELETED BY ADMIN
              </Text>
            );
          }
          const author = users[m.authorId];
          const authorRole = getRole(m.authorId, activeChapter.id);
          const isPinnedStyle = m.pinned;
          return (
            <View key={m.id} style={[styles.bubble, isPinnedStyle ? styles.bubbleHighlight : styles.bubbleNormal]}>
              {m.pinned ? <Text style={styles.pinnedLabel}>📌 PINNED</Text> : null}
              <View style={styles.bubbleHeader}>
                <View style={styles.authorRow}>
                  <Text style={[styles.author, { color: isPinnedStyle ? colors.white : colors.navy }]}>
                    {author.fullName.toUpperCase()}
                  </Text>
                  <RoleBadge role={authorRole} />
                </View>
                {canModerate ? (
                  <Pressable onPress={() => dispatch({ type: 'DELETE_CHAT_MESSAGE', messageId: m.id })}>
                    <Text style={{ color: isPinnedStyle ? colors.border : colors.mutedLight }}>⋯</Text>
                  </Pressable>
                ) : null}
              </View>
              <Text style={[styles.messageText, { color: isPinnedStyle ? colors.white : colors.body }]}>{m.text}</Text>
            </View>
          );
        })}
      </ScrollView>

      {canPost ? (
        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Say something…"
            placeholderTextColor={colors.mutedLight}
            style={styles.composerInput}
            onSubmitEditing={send}
          />
          <Pressable onPress={send} style={styles.sendBtn}>
            <Text style={styles.sendText}>➤</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.lockedBar}>
          <Text style={styles.lockedText}>🔒 ONLY ADMINS CAN SEND MESSAGES HERE</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.navy, paddingTop: 12, paddingBottom: 16, paddingHorizontal: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 16 },
  title: { fontFamily: fonts.display, fontSize: 20, color: colors.white, letterSpacing: 0.3 },
  subtitle: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.border, letterSpacing: 0.4 },
  list: { padding: spacing.lg, gap: 14, paddingBottom: 24 },
  bubble: { borderRadius: radii.lg, padding: 14 },
  bubbleNormal: { backgroundColor: colors.bgLight },
  bubbleHighlight: { backgroundColor: colors.navy },
  pinnedLabel: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.gold, marginBottom: 6 },
  bubbleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  author: { fontFamily: fonts.bodyBold, fontSize: 12 },
  messageText: { fontFamily: fonts.bodyRegular, fontSize: 13, lineHeight: 19 },
  deletedNote: { alignSelf: 'center', backgroundColor: colors.bgLight, color: colors.mutedLight, fontFamily: fonts.bodyBold, fontSize: 10, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: spacing.md, borderTopWidth: 2, borderTopColor: colors.navy },
  composerInput: { flex: 1, backgroundColor: colors.bgLight, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.navy },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  sendText: { color: colors.white },
  lockedBar: { padding: spacing.lg, borderTopWidth: 2, borderTopColor: colors.navy, backgroundColor: colors.bgLight, alignItems: 'center' },
  lockedText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.muted },
});
