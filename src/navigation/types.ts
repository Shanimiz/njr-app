export type RootStackParamList = {
  ChapterSelect: undefined;
  JoinChapter: { chapterId: string };
  Main: undefined;
  DirectMessages: undefined;
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
