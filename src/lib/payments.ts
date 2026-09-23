/**
 * Stripe integration stub for the three payment shapes in the brief:
 *   - event_fee: paid races/events (e.g. the $12 NYRR 10K)
 *   - event_tip: optional tip on a free run (e.g. the Ice Cream Run)
 *   - membership: recurring chapter dues — built but OFF by default; see
 *     Chapter.membershipEnabled in src/types/index.ts. The club said they
 *     don't want to actually charge for this yet, just have it ready.
 *
 * None of this is wired to a real Stripe account. The publishable key goes
 * in .env (EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY) and is safe to ship in the
 * app; charging a card requires a small server (a Firebase Cloud Function
 * is the natural fit alongside the rest of this stack) that holds the
 * SECRET key and creates PaymentIntents — that never happens on-device.
 *
 * Suggested next step when the club is ready to turn this on:
 *   1. `npx expo install @stripe/stripe-react-native`
 *   2. Write a Cloud Function `createPaymentIntent(kind, amountCents, ...)`
 *      that returns a client secret.
 *   3. Replace startPayment() below with a call to that function + the
 *      Stripe SDK's confirmPayment().
 */
import type { PaymentKind } from '@/types';

export interface StartPaymentInput {
  kind: PaymentKind;
  amountCents: number;
  currency: 'USD' | 'ILS';
  chapterId: string;
  eventId?: string;
}

export async function startPayment(_input: StartPaymentInput): Promise<never> {
  throw new Error(
    'Payments are not wired up yet — this is a UI-only stub. See the comment at the top of src/lib/payments.ts for what connecting Stripe involves.'
  );
}
