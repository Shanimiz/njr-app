/**
 * Static seed data so the app is fully click-through-able with no backend
 * connected. Mirrors the names/events used in the wireframes so screenshots
 * and the real app stay recognizable to the club. Swap this module out for
 * real Firestore reads once a project is wired up (see src/lib/firebase.ts)
 * — screens should only ever import from src/data or src/context, never
 * import this file directly, so that swap is a one-place change.
 */
import type {
  Chapter,
  ChatChannel,
  ChatMessage,
  DMThread,
  DMMessage,
  EventMessage,
  Membership,
  RunEvent,
  UserProfile,
} from '@/types';

export const currentUserId = 'u_shani';

export const chapters: Chapter[] = [
  {
    id: 'ch_nyc',
    name: 'New York City',
    city: 'New York',
    country: 'USA',
    emoji: '🗽',
    memberCount: 412,
    membershipEnabled: true,
    membershipFeeCents: 600,
    currency: 'USD',
  },
  {
    id: 'ch_tlv',
    name: 'Tel Aviv',
    city: 'Tel Aviv',
    country: 'Israel',
    emoji: '🇮🇱',
    memberCount: 287,
    membershipEnabled: true,
    membershipFeeCents: 2200,
    currency: 'ILS',
  },
  {
    id: 'ch_la',
    name: 'Los Angeles',
    city: 'Los Angeles',
    country: 'USA',
    emoji: '☀️',
    memberCount: 0,
    membershipEnabled: false,
    membershipFeeCents: 0,
    currency: 'USD',
    comingSoon: true,
  },
  {
    id: 'ch_southflorida',
    name: 'South Florida',
    city: 'South Florida',
    country: 'USA',
    emoji: '🌴',
    memberCount: 0,
    membershipEnabled: true,
    membershipFeeCents: 600,
    currency: 'USD',
  },
  {
    id: 'ch_atlanta',
    name: 'Atlanta',
    city: 'Atlanta',
    country: 'USA',
    emoji: '🍑',
    memberCount: 0,
    membershipEnabled: true,
    membershipFeeCents: 600,
    currency: 'USD',
  },
  {
    id: 'ch_dc',
    name: 'Washington D.C.',
    city: 'DC',
    country: 'USA',
    emoji: '🏛️',
    memberCount: 0,
    membershipEnabled: true,
    membershipFeeCents: 600,
    currency: 'USD',
  },
  {
    id: 'ch_sydney',
    name: 'Sydney',
    city: 'Sydney',
    country: 'Australia',
    emoji: '🏄',
    memberCount: 0,
    membershipEnabled: true,
    membershipFeeCents: 600,
    currency: 'USD',
  },
];

export const users: Record<string, UserProfile> = {
  // The signed-in demo account starts as a genuine first-time user — no
  // name, no membership, no profile yet — so opening the app shows exactly
  // what a brand-new person sees: pick a chapter, apply, then set up a
  // profile. (See `memberships` below: intentionally no u_shani entries.)
  u_shani: {
    id: 'u_shani',
    fullName: '',
    phone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    instagramHandle: undefined,
    safetyQuestion: "What's your favorite Jewish holiday?",
    safetyAnswer: '',
    bio: '',
    photoUrl: undefined,
    memberSince: new Date().toISOString().slice(0, 10),
    runsJoined: 0,
  },
  u_ron: {
    id: 'u_ron',
    fullName: 'Ron Katz',
    phone: '+1 (917) 555-0111',
    emergencyContactName: 'Not on file',
    emergencyContactPhone: '',
    safetyQuestion: "What's your favorite Jewish holiday?",
    safetyAnswer: 'Passover',
    bio: 'NYC route captain. Will always find an excuse for bagels.',
    memberSince: '2019-06-01',
    runsJoined: 210,
  },
  u_ezra: {
    id: 'u_ezra',
    fullName: 'Ezra Levi',
    phone: '+1 (917) 555-0122',
    emergencyContactName: 'Not on file',
    emergencyContactPhone: '',
    safetyQuestion: "What's your favorite Jewish holiday?",
    safetyAnswer: 'Hanukkah',
    bio: 'Keeps the announcements chat honest.',
    memberSince: '2019-08-15',
    runsJoined: 188,
  },
  u_arielle: {
    id: 'u_arielle',
    fullName: 'Arielle S.',
    phone: '+1 (917) 555-0177',
    emergencyContactName: 'Not on file',
    emergencyContactPhone: '',
    safetyQuestion: "What's your favorite Jewish holiday?",
    safetyAnswer: 'Sukkot',
    bio: 'Approves new members and remembers everyone\'s name.',
    memberSince: '2020-01-10',
    runsJoined: 150,
  },
  u_dana: {
    id: 'u_dana',
    fullName: 'Dana Mizrahi',
    phone: '+1 (917) 555-0199',
    emergencyContactName: 'Not on file',
    emergencyContactPhone: '',
    safetyQuestion: "What's your favorite Jewish holiday?",
    safetyAnswer: 'Purim',
    bio: 'Shows up, runs, leaves before the group photo.',
    memberSince: '2024-02-20',
    runsJoined: 12,
  },
  u_noa: {
    id: 'u_noa',
    fullName: 'Noa Tal',
    phone: '+972 50 555 0123',
    emergencyContactName: 'Not on file',
    emergencyContactPhone: '',
    safetyQuestion: "What's your favorite Jewish holiday?",
    safetyAnswer: 'Shavuot',
    bio: 'Tel Aviv marathon pacer.',
    memberSince: '2021-05-01',
    runsJoined: 96,
  },
};

export const memberships: Membership[] = [
  // No u_shani entries — she's the "new user" demo account and should have
  // to go through the join flow for whatever chapter(s) she picks.
  { userId: 'u_ron', chapterId: 'ch_nyc', role: 'manager', status: 'approved', requestedAt: '2019-06-01' },
  { userId: 'u_ezra', chapterId: 'ch_nyc', role: 'manager', status: 'approved', requestedAt: '2019-08-15' },
  { userId: 'u_arielle', chapterId: 'ch_nyc', role: 'owner', status: 'approved', requestedAt: '2020-01-10' },
  { userId: 'u_dana', chapterId: 'ch_nyc', role: 'member', status: 'approved', requestedAt: '2024-02-20' },
  { userId: 'u_noa', chapterId: 'ch_tlv', role: 'manager', status: 'approved', requestedAt: '2021-05-01' },
];

export const events: RunEvent[] = [
  {
    id: 'ev_central_park',
    chapterId: 'ch_nyc',
    title: 'Sunrise Central Park Loop',
    description:
      "Easy 6-mile loop around the park, regroup at every mile. All paces welcome — we always wait at the water fountain. Bagels after at Zabar's for anyone who wants to keep hanging out.",
    dateISO: '2026-10-04T07:00:00-04:00',
    location: "Central Park · Engineer's Gate",
    hostUserId: 'u_ron',
    isFree: true,
    priceCents: 0,
    tipsEnabled: true,
    goingUserIds: ['u_shani', 'u_ron', 'u_arielle'],
    maybeUserIds: ['u_dana'],
  },
  {
    id: 'ev_ice_cream',
    chapterId: 'ch_nyc',
    title: 'Ice Cream Run',
    description: 'Slow, social 3-miler that ends at Ample Hills. Bring a few dollars for a scoop.',
    dateISO: '2026-10-08T18:30:00-04:00',
    location: 'Prospect Park',
    hostUserId: 'u_ezra',
    isFree: true,
    priceCents: 0,
    tipsEnabled: true,
    goingUserIds: ['u_shani', 'u_dana'],
    maybeUserIds: [],
  },
  {
    id: 'ev_nyrr_10k',
    chapterId: 'ch_nyc',
    title: 'NYRR Fall Tune-Up 10K',
    description: 'Official NYRR race. Group pace tent afterward for anyone who wants to hang around.',
    dateISO: '2026-10-19T08:00:00-04:00',
    location: 'Central Park',
    hostUserId: 'u_ron',
    isFree: false,
    priceCents: 1200,
    tipsEnabled: false,
    goingUserIds: ['u_ron'],
    maybeUserIds: [],
    capacity: 60,
  },
  {
    id: 'ev_hayarkon',
    chapterId: 'ch_tlv',
    title: 'HaYarkon Sunset Run',
    description: 'Flat, fast, and finishes right as the sun goes down over the park.',
    dateISO: '2026-10-03T17:30:00+03:00',
    location: 'Yarkon Park',
    hostUserId: 'u_noa',
    isFree: true,
    priceCents: 0,
    tipsEnabled: true,
    goingUserIds: ['u_noa'],
    maybeUserIds: [],
  },
];

export const chatChannels: ChatChannel[] = [
  {
    id: 'chat_announcements',
    chapterId: 'ch_nyc',
    name: 'Announcements',
    icon: '📣',
    announcementOnly: true,
    allowMemberReplies: false,
    createdByUserId: 'u_ezra',
    createdAt: '2019-06-01',
  },
  {
    id: 'chat_general',
    chapterId: 'ch_nyc',
    name: 'General Discussion',
    icon: '💬',
    announcementOnly: false,
    allowMemberReplies: true,
    createdByUserId: 'u_ron',
    createdAt: '2019-06-01',
  },
  {
    id: 'chat_not_running',
    chapterId: 'ch_nyc',
    name: 'Runners Not Running',
    icon: '🍻',
    announcementOnly: false,
    allowMemberReplies: true,
    createdByUserId: 'u_ron',
    createdAt: '2020-02-01',
  },
  {
    id: 'chat_nyrr',
    chapterId: 'ch_nyc',
    name: 'NYRR Races',
    icon: '🏅',
    announcementOnly: false,
    allowMemberReplies: true,
    createdByUserId: 'u_ezra',
    createdAt: '2020-05-01',
  },
  {
    id: 'chat_networking',
    chapterId: 'ch_nyc',
    name: 'Networking',
    icon: '💼',
    announcementOnly: false,
    allowMemberReplies: true,
    createdByUserId: 'u_arielle',
    createdAt: '2021-01-01',
  },
];

export const chatMessages: ChatMessage[] = [
  {
    id: 'msg_1',
    channelId: 'chat_announcements',
    authorId: 'u_ezra',
    text: "Heads up — Saturday's route is shifted to the Reservoir loop, bridge work on the usual path. See you at 7!",
    createdAt: '2026-10-02T18:04:00-04:00',
    pinned: true,
  },
  {
    id: 'msg_2',
    channelId: 'chat_announcements',
    authorId: 'u_ron',
    text: 'New batch of NJR singlets are in — grab yours at the Oct 4 run, $18 or free for members past 1 year.',
    createdAt: '2026-10-03T09:12:00-04:00',
  },
];

export const eventMessages: EventMessage[] = [
  {
    id: 'em_1',
    eventId: 'ev_central_park',
    authorId: 'u_arielle',
    text: 'Is the water fountain on yet or should we bring bottles?',
    createdAt: '2026-10-03T08:14:00-04:00',
  },
  {
    id: 'em_2',
    eventId: 'ev_central_park',
    authorId: 'u_ron',
    text: 'Bring a bottle just in case, they turn it on late in the season',
    createdAt: '2026-10-03T08:20:00-04:00',
  },
];

export const dmThreads: DMThread[] = [
  { id: 'dm_ron', participantIds: ['u_shani', 'u_ron'], lastMessageText: 'See you at 7 tomorrow!', lastMessageAt: '2026-10-03T09:41:00-04:00' },
  { id: 'dm_noa', participantIds: ['u_shani', 'u_noa'], lastMessageText: 'Wanna pace the marathon together?', lastMessageAt: '2026-10-02T12:00:00+03:00' },
  { id: 'dm_dana', participantIds: ['u_shani', 'u_dana'], lastMessageText: 'Thanks for the shoe recommendation!', lastMessageAt: '2026-09-29T20:00:00-04:00' },
  { id: 'dm_arielle', participantIds: ['u_shani', 'u_arielle'], lastMessageText: 'Approved your join request', lastMessageAt: '2026-09-22T10:00:00-04:00' },
];

export const dmMessages: DMMessage[] = [
  { id: 'dmm_1', threadId: 'dm_ron', senderId: 'u_ron', text: 'See you at 7 tomorrow!', createdAt: '2026-10-03T09:41:00-04:00' },
];
