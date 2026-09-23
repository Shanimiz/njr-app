/**
 * NJR brand palette — "Bold & Sporty" direction, approved by the club.
 * Navy + white are the primary brand colors (from the club's logo); gold is
 * the single accent, pulled from the Star of David in the mark. Keep new
 * screens to this palette rather than introducing new hues.
 */
export const colors = {
  navy: '#1F3A63',
  navySoft: '#3E5C82',
  gold: '#C9972A',
  goldDeep: '#B8850F',
  goldTint: '#FBF1D6',
  goldTintBorder: '#ECD9A0',
  white: '#FFFFFF',
  bgLight: '#F2F4F8',
  border: '#DCE3EC',
  muted: '#5B7290',
  mutedLight: '#8CA0B8',
  body: '#253C5C',
  toggleOff: '#C7CEDA',
  danger: '#C0392B',
} as const;

export type ColorToken = keyof typeof colors;
