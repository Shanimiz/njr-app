import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  /** False until the one-time check of on-device storage for a returning
   * member has finished. RootNavigator waits for this before deciding
   * whether to show onboarding or the main app, so a returning member
   * isn't flashed the registration screen for a moment on every launch. */
  hydrated: boolean;
}

/** The slice of state that identifies "this device already has a member
 * registered" — saved to on-device storage so a completed registration
 * survives closing and reopening the app, instead of resetting every time
 * (there's no real backend account system yet; this is the mock stand-in
 * for "you're logged in"). Deliberately does NOT include activeChapterId —
 * the chapter-picker screen is always the app's home screen on launch;
 * only the registration/profile steps should be skipped for a chapter the
 * member has already joined, never the picker screen itself. */
interface PersistedMember {
  user: UserProfile;
  memberships: Membership[];
  selectedChapterIds: string[];
}

const STORAGE_KEY = 'njr:member';

type Action =
  | { type: 'CONFIRM_CHAPTER_SELECTION' }
  | { type: 'SET_ACTIVE_CHAPTER'; chapterId: string }
  /** Tapping a chapter on ChapterSelectScreen that the member already has a
   * request in for (pending or approved) — adds it to selectedChapterIds if
   * it's somehow not there yet and makes it the active chapter in one step,
   * for both the cold-launch "recognize a returning member" case and
   * browsing back to that screen from inside the app to jump to a chapter
   * already joined. */
  | { type: 'ENTER_CHAPTER'; chapterId: string }
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
      };
    }
  | { type: 'RECORD_PAYMENT'; kind: PaymentKind; chapterId: string; eventId?: string; amountCents: number; currency: 'USD' | 'ILS' }
  | { type: 'COMPLETE_PROFILE'; photoUrl: string; bio: string }
  | { type: 'HYDRATE'; payload: PersistedMember | null }
  | { type: 'RESET_MEMBER' };

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
  hydrated: false,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ENTER_CHAPTER': {
      const selectedChapterIds = state.selectedChapterIds.includes(action.chapterId)
        ? state.selectedChapterIds
        : [...state.selectedChapterIds, action.chapterId];
      return { ...state, selectedChapterIds, activeChapterId: action.chapterId };
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
      // A submitted request makes this chapter "yours" for the profile
      // chip line and the multi-city switcher, even before anyone
      // approves it — this used to only happen via the old pick-then-
      // continue flow on ChapterSelectScreen, which no longer runs before
      // a join request goes in.
      const selectedChapterIds = state.selectedChapterIds.includes(action.chapterId)
        ? state.selectedChapterIds
        : [...state.selectedChapterIds, action.chapterId];
      return { ...state, users, memberships: [...withoutExisting, membership], selectedChapterIds };
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
    case 'COMPLETE_PROFILE': {
      const users = {
        ...state.users,
        [state.currentUserId]: { ...state.users[state.currentUserId], photoUrl: action.photoUrl, bio: action.bio },
      };
      return { ...state, users };
    }
    case 'HYDRATE': {
      if (!action.payload) return { ...state, hydrated: true };
      const { user, memberships, selectedChapterIds } = action.payload;
      const users = { ...state.users, [state.currentUserId]: user };
      const othersMemberships = state.memberships.filter((m) => m.userId !== state.currentUserId);
      // activeChapterId is deliberately left as-is (null on a fresh app
      // launch) — the chapter picker is always the first thing a member
      // sees. Restoring their profile and membership here is what lets
      // that screen recognize them and skip straight past the
      // registration form for a chapter they've already joined.
      return {
        ...state,
        users,
        memberships: [...othersMemberships, ...memberships],
        selectedChapterIds,
        hydrated: true,
      };
    }
    case 'RESET_MEMBER': {
      // Testing-only escape hatch: forget this device's saved member and
      // go back to a first-time-open state. A real account system
      // wouldn't need this — it'd offer switching accounts instead.
      const blankUser: UserProfile = {
        ...state.users[state.currentUserId],
        fullName: '',
        phone: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        instagramHandle: undefined,
        safetyAnswer: '',
        bio: '',
        photoUrl: undefined,
      };
      const users = { ...state.users, [state.currentUserId]: blankUser };
      const memberships = state.memberships.filter((m) => m.userId !== state.currentUserId);
      return { ...state, users, memberships, selectedChapterIds: [], activeChapterId: null };
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

  // One-time load, on app start: check on-device storage for a member who
  // already registered on this phone, and restore them straight in —
  // this is what makes picking a chapter skip registration on a return
  // visit instead of asking for it every time the app is reopened.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        dispatch({ type: 'HYDRATE', payload: raw ? (JSON.parse(raw) as PersistedMember) : null });
      } catch {
        dispatch({ type: 'HYDRATE', payload: null });
      }
    })();
  }, []);

  // Save on every relevant change, once the initial load above has
  // finished (guarded so this can't fire before hydration and overwrite a
  // real saved member with the blank starting state).
  useEffect(() => {
    if (!state.hydrated) return;
    const payload: PersistedMember = {
      user: state.users[state.currentUserId],
      memberships: state.memberships.filter((m) => m.userId === state.currentUserId),
      selectedChapterIds: state.selectedChapterIds,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
  }, [state.hydrated, state.users, state.memberships, state.selectedChapterIds, state.currentUserId]);

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
