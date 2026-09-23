/**
 * Firebase bootstrap — NOT wired into any screen yet. Every screen in this
 * first draft reads from src/context/AppContext, which is seeded from
 * src/data/mockData.ts. Swapping to a real backend is meant to happen in
 * one place:
 *
 *   1. Create a Firebase project (console.firebase.google.com), enable
 *      Authentication, Firestore, and Storage.
 *   2. Copy the web app config into .env (see .env.example).
 *   3. Replace the reducer actions in AppContext.tsx with calls into a new
 *      src/lib/firestore.ts data-access layer that reads/writes the same
 *      shapes defined in src/types/index.ts — the screens themselves
 *      shouldn't need to change, since they only ever talk to useApp().
 *
 * This file is intentionally inert (isConfigured() returns false, and
 * nothing calls getFirebaseApp() yet) so the app runs with zero setup.
 */
import Constants from 'expo-constants';

export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

function readConfig(): FirebaseWebConfig {
  const env = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;
  return {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? env.firebaseApiKey ?? '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  };
}

export function isFirebaseConfigured(): boolean {
  const cfg = readConfig();
  return Boolean(cfg.apiKey && cfg.projectId);
}

/**
 * Lazily imports and initializes the Firebase SDK only once real config is
 * present, so the `firebase` package doesn't even need to be installed for
 * the mock-data build to run. Once .env has real values, run
 * `npx expo install firebase` and this will start working.
 */
export async function getFirebaseApp() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase is not configured yet. Fill in .env from .env.example, then install the `firebase` package.'
    );
  }
  // @ts-expect-error -- optional dependency, install with `npx expo install firebase`
  const { initializeApp, getApps } = await import('firebase/app');
  const config = readConfig();
  return getApps().length ? getApps()[0] : initializeApp(config);
}
