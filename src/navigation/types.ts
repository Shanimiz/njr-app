export type RootStackParamList = {
  ChapterSelect: undefined;
  JoinChapter: { chapterId: string };
  RequestSent: { chapterId: string };
  // No params = first-time onboarding step. { editMode: true } = reopened
  // later from the Profile tab to change an existing photo/bio.
  CompleteProfile: { editMode?: boolean } | undefined;
  Main: undefined;
  DirectMessages: undefined;
  Payment: { eventId: string; mode: 'pay' | 'tip' };
  // Reads the manager's activeChapter from context — no params needed.
  ManageRequests: undefined;
};

export type MainTabParamList = {
  EventsTab: undefined;
  ChatsTab: undefined;
  BenefitsTab: undefined;
  ProfileTab: undefined;
};

export type EventsStackParamList = {
  EventsFeed: undefined;
  EventDetail: { eventId: string };
};

export type ChatsStackParamList = {
  ChatsList: undefined;
  ChatThread: { channelId: string };
};
