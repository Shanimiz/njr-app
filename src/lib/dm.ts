/**
 * A fresh DM started from someone's profile ("Send DM") needs a thread id
 * before one necessarily exists yet. Seed data ids (dm_ron, dm_noa, …) don't
 * follow any pattern, so this is only ever used to MINT a new id when no
 * existing thread between the two people was found — see
 * AppContext.getOrCreateDMThreadId, which always checks for an existing
 * thread first and only falls back to this for a genuinely new pair.
 * Deterministic + order-independent so the same two people always land on
 * the same freshly-minted id even if "Send DM" is tapped from either side.
 */
export function newDMThreadId(userIdA: string, userIdB: string): string {
  return `dm_${[userIdA, userIdB].sort().join('_')}`;
}
