import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import { permissions } from '@/lib/permissions';
import type { ChatsStackParamList } from '@/navigation/types';
import type { ChatChannel } from '@/types';

type Props = NativeStackScreenProps<ChatsStackParamList, 'ChatsList'>;

export function ChatsListScreen({ navigation }: Props) {
  const { activeChapter, chatChannels, chatMessages, getRole, currentUserId } = useApp();
  if (!activeChapter) return null;

  const channels = chatChannels.filter((c) => c.chapterId === activeChapter.id);
  const role = getRole(currentUserId, activeChapter.id);
  const canCreate = role ? permissions.canCreateChats(role) : false;

  const lastMessageFor = (channelId: string) => {
    const msgs = chatMessages.filter((m) => m.channelId === channelId && !m.deleted);
    return msgs[msgs.length - 1]?.text ?? 'No messages yet';
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>CHATS</Text>
          <Text style={styles.subtitle}>{activeChapter.city.toUpperCase()} · {canCreate ? 'YOU CAN CREATE CHATS' : 'ADMIN-ONLY CREATE'}</Text>
        </View>
        {canCreate ? (
          <Pressable style={styles.newBtn}>
            <Text style={styles.newBtnText}>＋</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={channels}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ChatRow channel={item} preview={lastMessageFor(item.id)} onPress={() => navigation.navigate('ChatThread', { channelId: item.id })} />
        )}
      />
    </Screen>
  );
}

function ChatRow({ channel, preview, onPress }: { channel: ChatChannel; preview: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.row, channel.announcementOnly ? styles.rowHighlight : styles.rowNormal]}>
      <View style={[styles.iconWrap, { backgroundColor: channel.announcementOnly ? colors.gold : colors.navySoft }]}>
        <Text style={styles.icon}>{channel.icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { color: channel.announcementOnly ? colors.white : colors.navy }]}>
          {channel.name.toUpperCase()}
          {channel.announcementOnly ? '  🔒' : ''}
        </Text>
        <Text style={[styles.rowPreview, { color: channel.announcementOnly ? colors.border : colors.muted }]} numberOfLines={1}>
          {preview}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.navy, paddingTop: 12, paddingBottom: 16, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: fonts.display, fontSize: 26, color: colors.white, letterSpacing: 0.4 },
  subtitle: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.border, letterSpacing: 0.4, marginTop: 2 },
  newBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  newBtnText: { color: colors.navy, fontFamily: fonts.bodyBold, fontSize: 18 },
  list: { padding: spacing.lg, gap: 10, paddingBottom: 90 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radii.lg, padding: 14 },
  rowNormal: { backgroundColor: colors.bgLight },
  rowHighlight: { backgroundColor: colors.navy },
  iconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 17 },
  rowTitle: { fontFamily: fonts.bodyBold, fontSize: 14, letterSpacing: 0.2 },
  rowPreview: { fontFamily: fonts.bodyRegular, fontSize: 12, marginTop: 2 },
});
