import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { Avatar } from '@/components/Avatar';
import { RoleBadge } from '@/components/RoleBadge';
import { PillButton } from '@/components/PillButton';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import { permissions } from '@/lib/permissions';
import type { ChatsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<ChatsStackParamList, 'ChatThread'>;

/**
 * Renders three states from one component: not-joined (a join gate — no
 * messages or composer visible until you tap JOIN, no approval needed,
 * unlike a chapter join request), a normal joined chat, and an
 * announcement-only one (`channel.announcementOnly` + `allowMemberReplies`
 * decide whether the composer is live or replaced with the "only admins
 * can post" bar, and whether the ⋯ delete menu shows on each message).
 */
export function ChatThreadScreen({ route }: Props) {
  const { chatChannels, chatMessages, users, activeChapter, getRole, getMembership, currentUserId, dispatch } = useApp();
  const [draft, setDraft] = useState('');

  const channel = chatChannels.find((c) => c.id === route.params.channelId);
  if (!channel || !activeChapter) return null;

  const isJoined = channel.memberUserIds.includes(currentUserId);
  const role = getRole(currentUserId, activeChapter.id);
  const canModerate = role ? permissions.canDeleteAnyMessage(role) : false;
  const canPost = isJoined && (!channel.announcementOnly || channel.allowMemberReplies || (role ? permissions.canPostInAnnouncementChat(role) : false));

  const messages = chatMessages.filter((m) => m.channelId === channel.id);
  const members = channel.memberUserIds.map((id) => users[id]).filter(Boolean);

  const send = () => {
    if (!draft.trim()) return;
    dispatch({ type: 'SEND_CHAT_MESSAGE', channelId: channel.id, text: draft.trim() });
    setDraft('');
  };

  const join = () => dispatch({ type: 'JOIN_CHAT_CHANNEL', channelId: channel.id });

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>{channel.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{channel.name.toUpperCase()}</Text>
            <Text style={styles.subtitle}>
              {isJoined
                ? `${members.length} MEMBER${members.length === 1 ? '' : 'S'} · ${channel.announcementOnly ? 'ADMINS POST · EVERYONE VIEWS' : 'EVERYONE CAN CHAT'}`
                : 'NOT JOINED YET'}
            </Text>
          </View>
        </View>
        {isJoined && members.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.memberRow}>
            {members.map((m) => (
              <View key={m.id} style={styles.memberChip}>
                <Avatar size={22} uri={m.photoUrl} bg={colors.border} />
                <Text style={styles.memberChipText} numberOfLines={1}>
                  {m.fullName.split(' ')[0] || '(unnamed)'}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : null}
      </View>

      {!isJoined ? (
        <View style={styles.joinGate}>
          <Text style={styles.joinGateIcon}>{channel.icon}</Text>
          <Text style={styles.joinGateTitle}>{channel.name}</Text>
          <Text style={styles.joinGateCopy}>
            Join to see the messages and everyone who's already in here — no approval needed, unlike a chapter join
            request.
          </Text>
          <PillButton label="JOIN CHAT" variant="gold" onPress={join} />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.list}>
            {messages.length === 0 ? <Text style={styles.emptyText}>No messages yet — be the first to say something!</Text> : null}
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
              const authorTitle = getMembership(m.authorId, activeChapter.id)?.title;
              const isPinnedStyle = m.pinned;
              return (
                <View key={m.id} style={[styles.bubble, isPinnedStyle ? styles.bubbleHighlight : styles.bubbleNormal]}>
                  {m.pinned ? <Text style={styles.pinnedLabel}>📌 PINNED</Text> : null}
                  <View style={styles.bubbleHeader}>
                    <View style={styles.authorRow}>
                      <Text style={[styles.author, { color: isPinnedStyle ? colors.white : colors.navy }]}>
                        {author.fullName.toUpperCase()}
                      </Text>
                      <RoleBadge role={authorRole} title={authorTitle} />
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
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.navy, paddingTop: 12, paddingBottom: 16, paddingHorizontal: spacing.lg, gap: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 16 },
  title: { fontFamily: fonts.display, fontSize: 20, color: colors.white, letterSpacing: 0.3 },
  subtitle: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.border, letterSpacing: 0.4 },
  memberRow: { gap: 10 },
  memberChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 8 },
  memberChipText: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.white, maxWidth: 70 },
  joinGate: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: 10 },
  joinGateIcon: { fontSize: 40 },
  joinGateTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.navy, textAlign: 'center' },
  joinGateCopy: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 19, marginBottom: 8 },
  list: { padding: spacing.lg, gap: 14, paddingBottom: 24 },
  emptyText: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 24 },
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
