export type RootStackParamList = {
  // The very first screen during onboarding — logo + welcome copy + "Get
  // Started" — before ChapterSelect's "pick your city." Only ever the
  // initial route while hasChosenChapter is false (see RootNavigator); a
  // returning member with an active chapter skips straight to Main.
  Welcome: undefined;
  ChapterSelect: undefined;
  JoinChapter: { chapterId: string };
  RequestSent: { chapterId: string };
  // No params = first-time onboarding step. { editMode: true } = reopened
  // later from the Profile tab to change an existing photo/bio.
  CompleteProfile: { editMode?: boolean } | undefined;
  Main: undefined;
  DirectMessages: undefined;
  // One specific DM conversation — reads currentUserId + participants from
  // the thread itself via context, so only the thread id is needed here.
  DMThread: { threadId: string };
  // Anyone's public profile — event hosts, chat members, chapter roster,
  // wherever a name/avatar is tappable. Reachable from every tab, so it
  // lives at the root like DirectMessages/Payment rather than in one stack.
  UserProfile: { userId: string };
  Payment: { eventId: string; mode: 'pay' | 'tip' };
  // The "CHANGE" link on Payment, and the Profile tab's own settings link,
  // both open this — reads/writes the mock card-on-file in context.
  PaymentMethod: undefined;
  // The pencil icon on the DM inbox — pick someone to start a new
  // conversation with, then hands off to DMThread.
  NewMessage: undefined;
  // The Profile tab's "Edit private info" link — name, email, phone,
  // emergency contact, photo. Separate from CompleteProfile, which only
  // ever touches photo + bio.
  EditPrivateInfo: undefined;
  // Reads the manager's activeChapter from context — no params needed.
  ManageRequests: undefined;
  // Manager/owner-only view of what's been submitted on the More tab's
  // Feedback page — reads activeChapter from context, no params needed.
  ReviewFeedback: undefined;
};

export type MainTabParamList = {
  EventsTab: undefined;
  ChatsTab: undefined;
  BenefitsTab: undefined;
  MoreTab: undefined;
  ProfileTab: undefined;
};

export type EventsStackParamList = {
  EventsFeed: undefined;
  EventDetail: { eventId: string };
  CreateEvent: undefined;
};

export type ChatsStackParamList = {
  ChatsList: undefined;
  ChatThread: { channelId: string };
  CreateChat: undefined;
};

/** The 5th tab, added to hold pages that don't need their own dedicated
 * spot in the bottom bar: chapter Messages (the DM inbox) and Members live
 * one tap away here instead of as bottom-tab icons of their own, along with
 * the Donate to NJR page. */
export type MoreStackParamList = {
  MoreMenu: undefined;
  Members: undefined;
  Donate: undefined;
  Merch: undefined;
  Feedback: undefined;
  Etiquette: undefined;
};
