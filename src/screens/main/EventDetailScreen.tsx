import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { Avatar } from '@/components/Avatar';
import { RoleBadge } from '@/components/RoleBadge';
import { PillButton } from '@/components/PillButton';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import type { EventsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<EventsStackParamList, 'EventDetail'>;

/**
 * Event page: RSVP, the free/paid + tip payment surface, and the event's
 * own comment thread (separate from the chapter group chats). The RSVP and
 * message-send actions are wired to the in-memory context so they actually
 * work in this mock build; payments are not — see src/lib/payments.ts.
 */
export function EventDetailScreen({ route, navigation }: Props) {
  const { events, users, eventMessages, currentUserId, getRole, getMembership, dispatch } = useApp();
  const [draft, setDraft] = useState('');

  const event = events.find((e) => e.id === route.params.eventId);
  if (!event) return null;

  const host = users[event.hostUserId];
  const hostRole = getRole(event.hostUserId, event.chapterId);
  const hostTitle = getMembership(event.hostUserId, event.chapterId)?.title;
  const isGoing = event.goingUserIds.includes(currentUserId);
  const thread = eventMessages.filter((m) => m.eventId === event.id);

  // EventDetail is nested EventsStack -> tab navigator -> root stack, and
  // the Payment modal lives at the root, so two getParent() hops are needed
  // to reach it (same pattern as the DMs button on EventsFeedScreen).
  const openPayment = (mode: 'pay' | 'tip') => {
    const rootNav = (navigation.getParent()?.getParent() ?? navigation.getParent()) as
      | (typeof navigation & { navigate: (screen: 'Payment', params: { eventId: string; mode: 'pay' | 'tip' }) => void })
      | undefined;
    rootNav?.navigate('Payment', { eventId: event.id, mode });
  };

  const dateLabel = new Date(event.dateISO).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <Screen edges={['top', 'bottom']}>
      <ScrollView>
        <View style={styles.cover}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.coverDate}>{dateLabel.toUpperCase()}</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{event.title.toUpperCase()}</Text>
          <Text style={styles.location}>{event.location}</Text>

          <View style={styles.hostRow}>
            <Avatar size={32} />
            <Text style={styles.hostText}>HOSTED BY {host.fullName.toUpperCase()}</Text>
            <RoleBadge role={hostRole} title={hostTitle} />
          </View>

          <Text style={styles.description}>{event.description}</Text>

          <View style={styles.rsvpCard}>
            <Text style={styles.rsvpCount}>{event.goingUserIds.length} GOING</Text>
            <PillButton
              label={isGoing ? "I'M IN" : "I'M GOING"}
              variant="gold"
              onPress={() => dispatch({ type: 'RSVP_EVENT', eventId: event.id, status: isGoing ? 'none' : 'going' })}
            />
          </View>

          {event.isFree ? (
            <View style={styles.tipCard}>
              <View>
                <Text style={styles.tipTitle}>THIS RUN IS FREE</Text>
                {event.tipsEnabled ? <Text style={styles.tipSubtitle}>Tips for the coffee fund welcome</Text> : null}
              </View>
              {event.tipsEnabled ? (
                <PillButton label="TIP" variant="gold" style={{ paddingVertical: 8, paddingHorizontal: 16 }} onPress={() => openPayment('tip')} />
              ) : null}
            </View>
          ) : (
            <View style={styles.tipCard}>
              <View>
                <Text style={styles.tipTitle}>${(event.priceCents / 100).toFixed(0)} TO REGISTER</Text>
                {event.capacity ? <Text style={styles.tipSubtitle}>{event.capacity - event.goingUserIds.length} spots left</Text> : null}
              </View>
              <PillButton label="REGISTER" variant="gold" style={{ paddingVertical: 8, paddingHorizontal: 16 }} onPress={() => openPayment('pay')} />
            </View>
          )}

          <View style={styles.threadHeader}>
            <Text style={styles.threadTitle}>EVENT CHAT</Text>
          </View>
          {thread.map((m) => {
            const author = users[m.authorId];
            const authorRole = getRole(m.authorId, event.chapterId);
            const authorTitle = getMembership(m.authorId, event.chapterId)?.title;
            return (
              <View key={m.id} style={styles.messageRow}>
                <Avatar size={28} />
                <View style={{ flex: 1 }}>
                  <View style={styles.messageAuthorRow}>
                    <Text style={styles.messageAuthor}>{author.fullName.toUpperCase()}</Text>
                    <RoleBadge role={authorRole} title={authorTitle} />
                  </View>
                  <Text style={styles.messageText}>{m.text}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.composer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Ask a question or say hi…"
          placeholderTextColor={colors.mutedLight}
          style={styles.composerInput}
        />
        <Pressable
          onPress={() => setDraft('')}
          style={styles.sendBtn}
          disabled={!draft.trim()}
        >
          <Text style={styles.sendText}>➤</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cover: { height: 190, backgroundColor: colors.navy, justifyContent: 'flex-end', padding: spacing.lg },
  backBtn: { position: 'absolute', top: 16, left: 16, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backText: { color: colors.white, fontSize: 16 },
  coverDate: { backgroundColor: colors.gold, color: colors.navy, alignSelf: 'flex-start', fontFamily: fonts.display, fontSize: 13, letterSpacing: 0.3, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  body: { padding: spacing.lg, gap: 14 },
  title: { fontFamily: fonts.display, fontSize: 28, color: colors.navy, letterSpacing: 0.3, lineHeight: 30 },
  location: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.muted },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hostText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.navy },
  description: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.body, lineHeight: 21 },
  rsvpCard: { backgroundColor: colors.bgLight, borderRadius: radii.lg, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rsvpCount: { fontFamily: fonts.display, fontSize: 20, color: colors.navy },
  tipCard: { backgroundColor: colors.navy, borderRadius: radii.lg, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tipTitle: { fontFamily: fonts.display, fontSize: 16, color: colors.white, letterSpacing: 0.3 },
  tipSubtitle: { fontFamily: fonts.bodyRegular, fontSize: 11, color: colors.border },
  threadHeader: { marginTop: 6 },
  threadTitle: { fontFamily: fonts.display, fontSize: 16, color: colors.navy, letterSpacing: 0.4 },
  messageRow: { flexDirection: 'row', gap: 10 },
  messageAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  messageAuthor: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.navy },
  messageText: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.body, marginTop: 2 },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: spacing.md, borderTopWidth: 2, borderTopColor: colors.navy },
  composerInput: { flex: 1, backgroundColor: colors.bgLight, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.navy },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  sendText: { color: colors.white },
});
