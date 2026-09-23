import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import {
  chapters as seedChapters,
  chatChannels as seedChatChannels,
  chatMessages as seedChatMessages,
  currentUserId,
  dmMessages as seedDmMessages,
  dmThreads as seedDmThreads,
  eventMessages as seedEventMessages,
  events as seedEvents,
  memberships as seedMemberships,
  users as seedUsers,
} from '@/data/mockData';
import type {
  Chapter,
  ChapterRole,
  ChatChannel,
  ChatMessage,
  DMMessage,
  DMThread,
  EventMessage,
  Membership,
  PaymentKind,
  PaymentRecord,
  RunEvent,
  UserProfile,
} from '@/types';

interface AppState {
  currentUserId: string;
  users: Record<string, UserProfile>;
  chapters: Chapter[];
  memberships: Membership[];
  events: RunEvent[];
  chatChannels: ChatChannel[];
  chatMessages: ChatMessage[];
  eventMessages: EventMessage[];
  dmThreads: DMThread[];
  dmMessages: DMMessage[];
  payments: PaymentRecord[];
  /** Chapters the signed-in user picked on the chapter-select screen. Empty
   * until onboarding completes. */
  selectedChapterIds: string[];
  /** Which of the selected chapters is currently "open" in the main app —
   * this is the city switcher state from the Events/Chats tabs. */
  activeChapterId: string | null;
}

type Action =
  | { type: 'TOGGLE_CHAPTER_SELECTION'; chapterId: string }
  | { type: 'CONFIRM_CHAPTER_SELECTION' }
  | { type: 'SET_ACTIVE_CHAPTER'; chapterId: string }
  | { type: 'RSVP_EVENT'; eventId: string; status: 'going' | 'maybe' | 'none' }
  | { type: 'SEND_CHAT_MESSAGE'; channelId: string; text: string }
  | { type: 'DELETE_CHAT_MESSAGE'; messageId: string }
  | { type: 'SEND_DM'; threadId: string; text: string }
  | {
      type: 'SUBMIT_JOIN_REQUEST';
      chapterId: string;
      profile: {
        fullName: string;
        phone: string;
        emergencyContactName: string;
        emergencyContactPhone: string;
        instagramHandle: string;
        safetyAnswer: string;
        bio: string;
      };
    }
  | { type: 'RECORD_PAYMENT'; kind: PaymentKind; chapterId: string; eventId?: string; amountCents: number; currency: 'USD' | 'ILS' };

const initialState: AppState = {
  currentUserId,
  users: seedUsers,
  chapters: seedChapters,
  memberships: seedMemberships,
  events: seedEvents,
  chatChannels: seedChatChannels,
  chatMessages: seedChatMessages,
  eventMessages: seedEventMessages,
  dmThreads: seedDmThreads,
  dmMessages: seedDmMessages,
  payments: [],
  // A real signed-in user starts having picked nothing yet — the app opens
  // on the chapter-select screen. See RootNavigator for how this gates
  // navigation.
  selectedChapterIds: [],
  activeChapterId: null,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'TOGGLE_CHAPTER_SELECTION': {
      const isSelected = state.selectedChapterIds.includes(action.chapterId);
      const selectedChapterIds = isSelected
        ? state.selectedChapterIds.filter((id) => id !== action.chapterId)
        : [...state.selectedChapterIds, action.chapterId];
      return { ...state, selectedChapterIds };
    }
    case 'CONFIRM_CHAPTER_SELECTION': {
      const activeChapterId = state.activeChapterId ?? state.selectedChapterIds[0] ?? null;
      return { ...state, activeChapterId };
    }
    case 'SET_ACTIVE_CHAPTER':
      return { ...state, activeChapterId: action.chapterId };
    case 'RSVP_EVENT': {
      const events = state.events.map((ev) => {
        if (ev.id !== action.eventId) return ev;
        const going = ev.goingUserIds.filter((id) => id !== state.currentUserId);
        const maybe = ev.maybeUserIds.filter((id) => id !== state.currentUserId);
        if (action.status === 'going') going.push(state.currentUserId);
        if (action.status === 'maybe') maybe.push(state.currentUserId);
        return { ...ev, goingUserIds: going, maybeUserIds: maybe };
      });
      return { ...state, events };
    }
    case 'SEND_CHAT_MESSAGE': {
      const message: ChatMessage = {
        id: `msg_${Date.now()}`,
        channelId: action.channelId,
        authorId: state.currentUserId,
        text: action.text,
        createdAt: new Date().toISOString(),
      };
      return { ...state, chatMessages: [...state.chatMessages, message] };
    }
    case 'DELETE_CHAT_MESSAGE': {
      const chatMessages = state.chatMessages.map((m) =>
        m.id === action.messageId ? { ...m, deleted: true, deletedByUserId: state.currentUserId } : m
      );
      return { ...state, chatMessages };
    }
    case 'SEND_DM': {
      const message: DMMessage = {
        id: `dmm_${Date.now()}`,
        threadId: action.threadId,
        senderId: state.currentUserId,
        text: action.text,
        createdAt: new Date().toISOString(),
      };
      const dmThreads = state.dmThreads.map((t) =>
        t.id === action.threadId ? { ...t, lastMessageText: action.text, lastMessageAt: message.createdAt } : t
      );
      return { ...state, dmMessages: [...state.dmMessages, message], dmThreads };
    }
    case 'SUBMIT_JOIN_REQUEST': {
      const existingUser = state.users[state.currentUserId];
      const users = {
        ...state.users,
        [state.currentUserId]: {
          ...existingUser,
          fullName: action.profile.fullName,
          phone: action.profile.phone,
          emergencyContactName: action.profile.emergencyContactName,
          emergencyContactPhone: action.profile.emergencyContactPhone,
          instagramHandle: action.profile.instagramHandle || undefined,
          safetyAnswer: action.profile.safetyAnswer,
          bio: action.profile.bio || existingUser.bio,
        },
      };
      // One membership record per user+chapter — replace any prior attempt
      // (e.g. a rejected request) rather than stacking duplicates.
      const withoutExisting = state.memberships.filter(
        (m) => !(m.userId === state.currentUserId && m.chapterId === action.chapterId)
      );
      const membership: Membership = {
        userId: state.currentUserId,
        chapterId: action.chapterId,
        role: 'member',
        status: 'pending',
        requestedAt: new Date().toISOString(),
      };
      return { ...state, users, memberships: [...withoutExisting, membership] };
    }
    case 'RECORD_PAYMENT': {
      const payment: PaymentRecord = {
        id: `pay_${Date.now()}`,
        kind: action.kind,
        userId: state.currentUserId,
        chapterId: action.chapterId,
        eventId: action.eventId,
        amountCents: action.amountCents,
        currency: action.currency,
        // Mocked: there's no real Stripe call yet (see src/lib/payments.ts),
        // so every payment "succeeds" instantly.
        status: 'succeeded',
        createdAt: new Date().toISOString(),
      };
      let events = state.events;
      if (action.kind === 'event_fee' && action.eventId) {
        events = state.events.map((ev) =>
          ev.id === action.eventId && !ev.goingUserIds.includes(state.currentUserId)
            ? { ...ev, goingUserIds: [...ev.goingUserIds, state.currentUserId] }
            : ev
        );
      }
      return { ...state, payments: [...state.payments, payment], events };
    }
    default:
      return state;
  }
}

interface AppContextValue extends AppState {
  dispatch: React.Dispatch<Action>;
  currentUser: UserProfile;
  selectedChapters: Chapter[];
  activeChapter: Chapter | null;
  getMembership: (userId: string, chapterId: string) => Membership | undefined;
  getRole: (userId: string, chapterId: string) => ChapterRole | null;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const getMembership = useCallback(
    (userId: string, chapterId: string) =>
      state.memberships.find((m) => m.userId === userId && m.chapterId === chapterId && m.status === 'approved'),
    [state.memberships]
  );

  const getRole = useCallback(
    (userId: string, chapterId: string): ChapterRole | null => getMembership(userId, chapterId)?.role ?? null,
    [getMembership]
  );

  const selectedChapters = useMemo(
    () => state.chapters.filter((c) => state.selectedChapterIds.includes(c.id)),
    [state.chapters, state.selectedChapterIds]
  );

  const activeChapter = useMemo(
    () => state.chapters.find((c) => c.id === state.activeChapterId) ?? null,
    [state.chapters, state.activeChapterId]
  );

  const value: AppContextValue = {
    ...state,
    dispatch,
    currentUser: state.users[state.currentUserId],
    selectedChapters,
    activeChapter,
    getMembership,
    getRole,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}
