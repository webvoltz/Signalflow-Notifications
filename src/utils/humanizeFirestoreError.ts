interface ErrorPattern {
  test: RegExp;
  message: string;
}

const PATTERNS: readonly ErrorPattern[] = [
  {
    test: /invalid project id/i,
    message:
      "Can't connect to Firestore - VITE_FIREBASE_PROJECT_ID in your .env looks invalid. " +
      'Firestore project IDs may only contain lowercase letters, numbers, and hyphens (no underscores).',
  },
  {
    test: /permission-denied|missing or insufficient permissions/i,
    message:
      'Firestore rejected that request - check firestore.rules, it only allows the exact ' +
      'fields this app sends.',
  },
  {
    test: /unavailable|failed to get document because the client is offline|network/i,
    message:
      "Can't reach Firestore - if you're using the emulator, make sure `npm run emulators` " +
      'is running and VITE_USE_FIRESTORE_EMULATOR is set to "true".',
  },
];

/**
 * Firebase/Firestore error messages are written for a developer reading
 * a stack trace, not an end user. Maps the handful of errors this app
 * can actually produce to plain language; anything unrecognized passes
 * through unchanged rather than risk hiding a message someone needs to
 * see behind an overly generic one.
 */
export function humanizeFirestoreError(rawMessage: string): string {
  const match = PATTERNS.find((pattern) => pattern.test.test(rawMessage));

  return match?.message ?? rawMessage;
}
