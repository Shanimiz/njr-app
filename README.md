# Nice Jewish Runners — app (first code draft)

A first working build of the NJR app, in the **Bold & Sporty** direction the
club picked from the wireframes. It's a real Expo / React Native /
TypeScript project — runs on iOS, Android, and web from one codebase — but
it's wired to **mock data only** so far, not a live backend. The point of
this draft is to have every screen and flow actually working end to end
(navigation, RSVPs, chat, the city switcher, role-gated UI) so it's easy to
react to and easy to wire to real data next, one piece at a time.

## Running it

```bash
npm install
npm start
```

That opens the Expo dev tools — scan the QR code with the Expo Go app on
your phone (fastest way to see it on a real device), or press `i` / `a` /
`w` in the terminal for the iOS Simulator, Android Emulator, or a web
preview.

```bash
npm run typecheck   # TypeScript, no build step
```

## What's real vs. mocked right now

**Real and working:**
- Full navigation: chapter select → join form → the 4-tab main app → event
  detail / chat thread / DMs.
- The multi-chapter flow: pick NYC + TLV at onboarding, then use the city
  switcher pills on the Events tab to flip between them — every list
  (events, chats) filters to whichever chapter is active.
- RSVPing to an event, sending a chat message, and admin-only actions
  (delete a message, see the FAB to create an event) actually update state
  — they're just not saved anywhere beyond this app session yet.
- Role-based permissions (`src/lib/permissions.ts`): Manager vs. Member vs.
  Owner gates what you can see and do, matching the "what a Manager can do"
  list from the wireframes.

**Mocked / not yet wired:**
- **Data**: everything lives in `src/data/mockData.ts` — same people and
  events as the wireframes (Ron, Ezra, Arielle, Dana, the Central Park Loop,
  etc.) — read into `src/context/AppContext.tsx`, an in-memory store. No
  network calls happen anywhere yet.
- **Auth & backend**: `src/lib/firebase.ts` is a stub — it explains what
  connecting a real Firebase project involves but nothing calls it yet.
- **Payments**: `src/lib/payments.ts` is a stub for the same reason — event
  fees, tips, and the (currently-off) membership fee are all in the UI, but
  tapping them doesn't charge anything.
- **Photo upload, push notifications, DM thread detail**: not built yet —
  natural next screens once the core flow is signed off.

## Project layout

```
src/
  theme/        colors, fonts, spacing — the whole visual language in one place
  types/        the data model (User, Chapter, Membership/Role, Event, Chat...)
  data/         mock seed data (swap for real Firestore reads later)
  context/      AppContext — in-memory app state; screens only ever talk to this
  lib/          permissions.ts (role rules), firebase.ts + payments.ts (stubs)
  navigation/   React Navigation setup (stacks + bottom tabs)
  screens/      onboarding/ (chapter select, join form) + main/ (the 8 core screens)
  components/   small shared pieces (buttons, badges, avatars)
```

The idea behind this split: screens never read `mockData.ts` or call
Firebase directly — they only call `useApp()`. That means swapping the
mock store for real Firestore reads/writes is a change to
`AppContext.tsx` and the new `lib/firestore.ts` it'll call, not a rewrite
of every screen.

## Still open before this can go further

These are the same questions from the planning conversation — nothing here
blocks continuing to build, but they'll change some of what's above:

- Are roles per-chapter (as built) or global across every chapter someone's in?
- Who reviews join requests day to day, and what happens on rejection?
- RSVP caps / waitlists needed, like Heylo has?
- Does each chapter need its own Stripe/bank account (Stripe Connect) or one
  central account?
- Native app store listings, or start as a mobile web app?
- Real logo files (have it), exact hex colors confirmed (used the ones from
  the wireframe review), any brand fonts beyond what's used here?

## Suggested next steps

1. Get sign-off on this draft from Ron, Ezra, and Arielle running it on
   their phones via Expo Go.
2. Stand up the Firebase project and swap `AppContext` over to real reads —
   this is the biggest single chunk of remaining work.
3. Wire join requests to actually create pending memberships an admin can
   approve (right now "Send request to join" just closes the form).
4. Stripe, once the club has answered the payment-routing questions above.
