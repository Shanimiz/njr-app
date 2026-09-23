import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Screen } from '@/components/Screen';
import { colors, fonts, radii, spacing } from '@/theme';
import { useApp } from '@/context/AppContext';
import { permissions } from '@/lib/permissions';
import type { EventsStackParamList, MainTabParamList, RootStackParamList } from '@/navigation/types';
import type { RunEvent } from '@/types';

type Props = CompositeScreenProps<
  NativeStackScreenProps<EventsStackParamList, 'EventsFeed'>,
  BottomTabScreenProps<MainTabParamList>
>;

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/**
 * Main landing screen once a chapter is active. The pill row at the top is
 * the city switcher the club asked for: only shows when more than one
 * chapter was selected at onboarding, and swapping it changes every list on
 * this screen (and, in a full build, the Chats/Benefits tabs too).
 */
export function EventsFeedScreen({ navigation }: Props) {
  const { selectedChapters, activeChapter, events, getRole, currentUserId, dispatch } = useApp();

  if (!activeChapter) return null;

  const chapterEvents = events.filter((e) => e.chapterId === activeChapter.id);
  const role = getRole(currentUserId, activeChapter.id);
  const canCreate = role ? permissions.canCreateEvents(role) : false;

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.greeting}>{activeChapter.name.toUpperCase()} CREW</Text>
          <Pressable
            onPress={() => {
              // Two levels up: EventsStack -> the tab navigator -> the root
              // stack, where the DirectMessages screen actually lives.
              const rootNav = (navigation.getParent()?.getParent() ?? navigation.getParent()) as
                | (typeof navigation & { navigate: (screen: 'DirectMessages') => void })
                | undefined;
              rootNav?.navigate('DirectMessages');
            }}
          >
            <Text style={styles.dmIcon}>✉️</Text>
          </Pressable>
        </View>
        {selectedChapters.length > 1 ? (
          <View style={styles.switcher}>
            {selectedChapters.map((c) => {
              const active = c.id === activeChapter.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => dispatch({ type: 'SET_ACTIVE_CHAPTER', chapterId: c.id })}
                  style={[styles.switchPill, { backgroundColor: active ? colors.gold : 'rgba(255,255,255,0.12)' }]}
                >
                  <Text style={[styles.switchLabel, { color: active ? colors.navy : colors.white }]}>
                    {c.city.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>

      <FlatList
        data={chapterEvents}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <EventCard event={item} onPress={() => navigation.navigate('EventDetail', { eventId: item.id })} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No runs on the calendar yet.</Text>}
      />

      {canCreate ? (
        <Pressable style={styles.fab}>
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

function EventCard({ event, onPress }: { event: RunEvent; onPress: () => void }) {
  const priceLabel = event.isFree ? 'FREE' : `$${(event.priceCents / 100).toFixed(0)}`;
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.cardCover}>
        <Text style={styles.coverBadge}>{formatDate(event.dateISO)}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{event.title.toUpperCase()}</Text>
        <View style={styles.cardMetaRow}>
          <Text style={styles.cardMeta}>{event.location}</Text>
          <Text style={styles.cardGoing}>{event.goingUserIds.length} GOING</Text>
        </View>
        <Text style={styles.cardPrice}>{priceLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.navy, paddingTop: 12, paddingBottom: 16, paddingHorizontal: spacing.lg },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { fontFamily: fonts.display, fontSize: 24, color: colors.white, letterSpacing: 0.4 },
  dmIcon: { fontSize: 20 },
  switcher: { flexDirection: 'row', gap: 8, marginTop: 12 },
  switchPill: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 },
  switchLabel: { fontFamily: fonts.display, fontSize: 13, letterSpacing: 0.4 },
  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: 90 },
  empty: { fontFamily: fonts.bodyRegular, color: colors.muted, textAlign: 'center', marginTop: 40 },
  card: { borderRadius: radii.lg, overflow: 'hidden', backgroundColor: colors.white, shadowColor: colors.navy, shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardCover: { height: 110, backgroundColor: colors.navySoft, justifyContent: 'flex-end', alignItems: 'flex-start', padding: 12 },
  coverBadge: { backgroundColor: colors.gold, color: colors.navy, fontFamily: fonts.display, fontSize: 12, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, letterSpacing: 0.3 },
  cardBody: { padding: 14, gap: 4 },
  cardTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.navy, letterSpacing: 0.3 },
  cardMetaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardMeta: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.muted },
  cardGoing: { fontFamily: fonts.display, fontSize: 13, color: colors.goldDeep },
  cardPrice: { fontFamily: fonts.display, fontSize: 15, color: colors.navy, marginTop: 2 },
  fab: { position: 'absolute', right: 20, bottom: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', shadowColor: colors.navy, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  fabText: { color: colors.white, fontSize: 28, fontFamily: fonts.display, marginTop: -2 },
});
