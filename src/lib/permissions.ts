import type { ChapterRole } from '@/types';

/**
 * Central place for "who can do what." Every screen should check
 * permissions through these functions rather than comparing role strings
 * directly, so the rules stay in one place as the club's requirements
 * firm up (e.g. if they add a finer-grained role later).
 *
 * Current rule of thumb, per the product brief:
 *   member  — can view everything, RSVP, chat where allowed, DM, pay.
 *   manager — everything a member can do, plus running the chapter day to day.
 *   owner   — everything a manager can do, plus managing other managers.
 * This mirrors the "Manager can do X, Owner only can do Y" note on the
 * Profile screen in the wireframes.
 */

const ROLE_RANK: Record<ChapterRole, number> = {
  member: 0,
  manager: 1,
  owner: 2,
};

function atLeast(role: ChapterRole, minimum: ChapterRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export const permissions = {
  canApproveJoinRequests: (role: ChapterRole) => atLeast(role, 'manager'),
  canCreateChats: (role: ChapterRole) => atLeast(role, 'manager'),
  canDeleteChats: (role: ChapterRole) => atLeast(role, 'manager'),
  canPostInAnnouncementChat: (role: ChapterRole) => atLeast(role, 'manager'),
  canDeleteAnyMessage: (role: ChapterRole) => atLeast(role, 'manager'),
  canCreateEvents: (role: ChapterRole) => atLeast(role, 'manager'),
  canEditAnyEvent: (role: ChapterRole) => atLeast(role, 'manager'),
  canViewEmergencyContacts: (role: ChapterRole) => atLeast(role, 'manager'),
  canViewFeedback: (role: ChapterRole) => atLeast(role, 'manager'),
  /** Changing someone ELSE's role — only an owner, matching the wireframe's
   * "Manage other admins' roles — Owner only" note. */
  canManageRoles: (role: ChapterRole) => atLeast(role, 'owner'),
};

export type Permissions = typeof permissions;
