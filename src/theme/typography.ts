/**
 * Font families for the "Bold & Sporty" direction: Bebas Neue for condensed
 * display/headline text, Work Sans for body copy. Both are loaded as Expo
 * Google Fonts in App.tsx — screens should reference these constants rather
 * than hardcoding family strings, so a future re-theme is a one-file change.
 */
export const fonts = {
  display: 'BebasNeue_400Regular',
  bodyRegular: 'WorkSans_500Medium',
  bodySemibold: 'WorkSans_600SemiBold',
  bodyBold: 'WorkSans_700Bold',
} as const;

export const fontsToLoad = {
  // Populated in App.tsx from @expo-google-fonts packages; listed here for
  // reference so it's obvious what App.tsx is loading and why.
} as const;

export const type = {
  displayXl: { fontFamily: fonts.display, fontSize: 34, letterSpacing: 0.5 },
  displayLg: { fontFamily: fonts.display, fontSize: 28, letterSpacing: 0.5 },
  displayMd: { fontFamily: fonts.display, fontSize: 22, letterSpacing: 0.4 },
  displaySm: { fontFamily: fonts.display, fontSize: 16, letterSpacing: 0.6 },
  label: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 0.8 },
  body: { fontFamily: fonts.bodyRegular, fontSize: 14 },
  bodySemibold: { fontFamily: fonts.bodySemibold, fontSize: 14 },
  caption: { fontFamily: fonts.bodySemibold, fontSize: 12 },
} as const;
