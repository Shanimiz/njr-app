import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import { permissions } from '@/lib/permissions';
import type { ChatsStackParamList } from '@/navigation/types';
import type { ChatChannel } from '@/types';

type Props = NativeStackScreenProps<ChatsStackParamList, 'ChatsList'>;

/**
 * Split into two sections, per Shani: chats you're already in ("Joined")
 * you can open and message right away; everything else in the chapter
 * ("Not Joined") is still visible and tappable, but opens to a JOIN gate
 * instead of messages — no manager approval needed to join a chat, unlike
 * a chapter join request. See ChatThreadScreen for that gate.
 */
export function ChatsListScreen({ navigation }: Props) {
  const { activeChapter, chatChannels, chatMessages, getRole, currentUserId } = useApp();
  if (!activeChapter) return null;

  const channels = chatChannels.filter((c) => c.chapterId === activeChapter.id);
  const joined = channels.filter((c) => c.memberUserIds.includes(currentUserId));
  const notJoined = channels.filter((c) => !c.memberUserIds.includes(currentUserId));
  const role = getRole(currentUserId, activeChapter.id);
  const canCreate = role ? permissions.canCreateChats(role) : false;

  const lastMessageFor = (channelId: string) => {
    const msgs = chatMessages.filter((m) => m.channelId === channelId && !m.deleted);
    return msgs[msgs.length - 1]?.text ?? 'No messages yet';
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.headerWrap}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>CHATS</Text>
            <Text style={styles.subtitle}>{activeChapter.city.toUpperCase()} · {canCreate ? 'YOU CAN CREATE CHATS' : 'ADMIN-ONLY CREATE'}</Text>
          </View>
          {canCreate ? (
            <Pressable style={styles.newBtn} onPress={() => navigation.navigate('CreateChat')}>
              <Text style={styles.newBtnText}>＋</Text>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.headerAngle} />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        <Text style={styles.sectionLabel}>JOINED</Text>
        {joined.length === 0 ? (
          <Text style={styles.emptySection}>You haven't joined any chats in this chapter yet.</Text>
        ) : (
          joined.map((c) => (
            <ChatRow key={c.id} channel={c} preview={lastMessageFor(c.id)} onPress={() => navigation.navigate('ChatThread', { channelId: c.id })} />
          ))
        )}

        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>NOT JOINED</Text>
        {notJoined.length === 0 ? (
          <Text style={styles.emptySection}>You've joined every chat in this chapter.</Text>
        ) : (
          notJoined.map((c) => (
            <ChatRow key={c.id} channel={c} preview="Tap to preview & join" muted onPress={() => navigation.navigate('ChatThread', { channelId: c.id })} />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

function ChatRow({ channel, preview, onPress, muted }: { channel: ChatChannel; preview: string; onPress: () => void; muted?: boolean }) {
  const highlight = channel.announcementOnly && !muted;
  return (
    <Pressable onPress={onPress} style={[styles.row, highlight ? styles.rowHighlight : styles.rowNormal, muted ? styles.rowMuted : null]}>
      <View style={[styles.iconWrap, { backgroundColor: highlight ? colors.gold : colors.navySoft }]}>
        <Text style={styles.icon}>{channel.icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { color: highlight ? colors.white : colors.navy }]}>
          {channel.name.toUpperCase()}
          {channel.announcementOnly ? '  🔒' : ''}
        </Text>
        <Text style={[styles.rowPreview, { color: highlight ? colors.border : colors.muted }]} numberOfLines={1}>
          {preview}
        </Text>
      </View>
      {muted ? <Text style={styles.joinHint}>JOIN →</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerWrap: { backgroundColor: colors.navy, overflow: 'hidden' },
  header: { paddingTop: 12, paddingBottom: 28, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerAngle: { position: 'absolute', left: -24, right: -24, bottom: -18, height: 40, backgroundColor: colors.white, transform: [{ rotate: '-2.5deg' }] },
  title: { fontFamily: fonts.display, fontSize: 26, color: colors.white, letterSpacing: 0.4 },
  subtitle: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.border, letterSpacing: 0.4, marginTop: 2 },
  newBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  newBtnText: { color: colors.navy, fontFamily: fonts.bodyBold, fontSize: 18 },
  list: { padding: spacing.lg, gap: 10, paddingBottom: 90 },
  sectionLabel: { fontFamily: fonts.display, fontSize: 14, letterSpacing: 0.6, color: colors.mutedLight },
  sectionLabelSpaced: { marginTop: 14 },
  emptySection: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.mutedLight, fontStyle: 'italic' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radii.lg, padding: 14 },
  rowNormal: { backgroundColor: colors.bgLight },
  rowHighlight: { backgroundColor: colors.navy },
  rowMuted: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border },
  iconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 17 },
  rowTitle: { fontFamily: fonts.bodyBold, fontSize: 14, letterSpacing: 0.2 },
  rowPreview: { fontFamily: fonts.bodyRegular, fontSize: 12, marginTop: 2 },
  joinHint: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.goldDeep, letterSpacing: 0.3 },
});
