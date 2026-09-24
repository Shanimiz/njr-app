/**
 * Core data model for the NJR app.
 *
 * This is a first-draft shape meant to match what's in the approved
 * wireframes and the club's stated requirements. Several fields are marked
 * with open questions — see the README and the clarification list Shani has
 * from Ron/Ezra/Arielle. Nothing here is final; it's meant to be easy to
 * extend once those answers come back (e.g. per-chapter vs. global roles).
 */

/** A member's standing within one specific chapter. Roles are per-chapter —
 * someone can be a Manager in NYC and a plain Member in Tel Aviv — pending
 * confirmation from the club that this is actually how they want it to work. */
export type ChapterRole = 'member' | 'manager' | 'owner';

export type MembershipStatus = 'pending' | 'approved' | 'rejected' | 'removed';

export interface Chapter {
  id: string;
  name: string;
  city: string;
  country: string;
  emoji: string;
  memberCount: number;
  /** Whether new joins even see the membership pricing step. Product wants
   * this wired up but inactive at launch — see membershipFeeCents. */
  membershipEnabled: boolean;
  membershipFeeCents: number;
  currency: 'USD' | 'ILS';
  comingSoon?: boolean;
}

/** Links a user to a chapter with a role and a join-request state. */
export interface Membership {
  userId: string;
  chapterId: string;
  role: ChapterRole;
  status: MembershipStatus;
  requestedAt: string; // ISO date
  decidedAt?: string;
  decidedByUserId?: string;
  /** Display job title (e.g. "CEO", "Team Captain", "Local Lead") shown
   * instead of the generic role label wherever this person's role is
   * shown. Purely cosmetic — permissions are still driven entirely by
   * `role`; every non-member title maps to either 'manager' (same
   * permissions as any other admin) or 'owner' (CEO — the only tier that
   * can change other people's roles, per permissions.canManageRoles). */
  title?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  instagramHandle?: string;
  /** The "which Jewish holiday is your favorite" style verification question
   * asked at signup. Kept generic (question + answer) so admins can change
   * the question later without a schema change. */
  safetyQuestion: string;
  safetyAnswer: string;
  photoUrl?: string;
  bio: string;
  memberSince: string; // ISO date
  runsJoined: number;
}

export interface RunEvent {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  coverImageUrl?: string;
  dateISO: string;
  location: string;
  hostUserId: string;
  isFree: boolean;
  priceCents: number;
  tipsEnabled: boolean;
  goingUserIds: string[];
  maybeUserIds: string[];
  /** Optional RSVP cap; undefined = unlimited. Heylo supports this and the
   * club may want it too — flagged as an open question. */
  capacity?: number;
}

export interface ChatChannel {
  id: string;
  chapterId: string;
  name: string;
  icon: string;
  /** True for things like #announcements: only managers/owners can post. */
  announcementOnly: boolean;
  /** When announcementOnly is true, this additionally toggles whether
   * members can reply/comment at all (Heylo-style "view only" mode). */
  allowMemberReplies: boolean;
  createdByUserId: string;
  createdAt: string;
  /** Chapter members who've opted into this specific chat — separate from
   * chapter membership itself. A chat a chapter member hasn't joined yet
   * still shows up (under "Not Joined" on ChatsListScreen) but its
   * messages and member list stay hidden behind a JOIN button until they
   * do — no approval needed, unlike chapter join requests. */
  memberUserIds: string[];
}

export interface ChatMessage {
  id: string;
  channelId: string;
  authorId: string;
  text: string;
  createdAt: string;
  pinned?: boolean;
  deleted?: boolean;
  deletedByUserId?: string;
}

/** A run's own comment thread, separate from the chapter's group chats. */
export interface EventMessage {
  id: string;
  eventId: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface DMThread {
  id: string;
  participantIds: [string, string];
  lastMessageText: string;
  lastMessageAt: string;
}

export interface DMMessage {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

/** Payment intent record — three payment shapes per the product brief:
 * event ticket price, optional tip, and (built but inactive) recurring
 * chapter membership. Stripe wiring lives in src/lib/payments.ts. */
export type PaymentKind = 'event_fee' | 'event_tip' | 'membership';

export interface PaymentRecord {
  id: string;
  kind: PaymentKind;
  userId: string;
  chapterId: string;
  eventId?: string;
  amountCents: number;
  currency: 'USD' | 'ILS';
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  createdAt: string;
}

/** Free-text feedback submitted from the More tab — see FeedbackScreen.
 * No admin-facing "view feedback" screen exists yet; this just captures it
 * in app state so one is a natural follow-up to build. */
export interface FeedbackEntry {
  id: string;
  userId: string;
  chapterId: string | null;
  text: string;
  createdAt: string;
}
