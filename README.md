<img src="https://webvoltz.com/wp-content/uploads/2025/07/webvoltz.svg" alt="WebVoltz" width="180" />

# SignalFlow Notifications

A small, emulator-first demo of realtime user notifications built on React, Vite, TypeScript, and
Firestore. It exists to show the pattern end to end - a Firestore subscription driving React
state, an optimistic read update with rollback, and loading/error handling - rather than to be a
product in its own right.

## Features

- **Realtime Firestore subscription** - the notification list is never fetched once; it's a live
  `onSnapshot` listener mapped straight into React state.
- **Optimistic updates with rollback** - marking a notification as read flips it in the UI
  immediately and rolls back automatically if the Firestore write fails.
- **Loading and error states** - both the subscription and each write surface failures instead of
  failing silently.
- **Runtime validation** - every Firestore document and every `VITE_` environment variable is
  parsed through a zod schema before the app trusts it.
- **Emulator-first development** - the app runs against the Firestore emulator by default, with
  security rules exercised the same way locally as in production.
- **Firestore security rules** - writes are constrained to the exact document shape the app
  produces; nothing else is accepted.
- **Strict TypeScript** - no `any` anywhere, full `strict` compiler family, zero-warning ESLint.

## Tech stack

| Technology                                    | Role                                               |
| --------------------------------------------- | -------------------------------------------------- |
| React 19                                      | UI                                                 |
| TypeScript (strict)                           | Type safety                                        |
| Vite                                          | Dev server and production build                    |
| Firebase JS SDK / Firestore                   | Realtime database and client SDK                   |
| Zod                                           | Runtime validation (Firestore documents, env vars) |
| Vitest + Testing Library                      | Unit and component tests                           |
| ESLint, Prettier, Husky, commitlint, Gitleaks | Code quality and security gates                    |

## Architecture

```mermaid
flowchart LR
    UI["React UI\n(NotificationButton, NotificationList)"]
    Hook["useNotifications hook\n(loading / error / optimistic state)"]
    Service["notificationService\n(createNotification, subscribeToNotifications,\nmarkNotificationAsRead)"]
    SDK["Firebase JS SDK\n(firebase/firestore)"]
    Rules["Firestore security rules\n(firestore.rules)"]
    Firestore[("Firestore\n(notifications collection)")]
    Emulator["Firestore Emulator\n(local dev, npm run emulators)"]

    UI <--> Hook
    Hook --> Service
    Service --> SDK
    SDK <--> Rules
    Rules <--> Firestore
    SDK -. "VITE_USE_FIRESTORE_EMULATOR=true" .-> Emulator
    Emulator -. enforces same rules .-> Rules
```

Every Firestore read and write is isolated in `src/services/notificationService.ts` - no
component ever imports `firebase/firestore` directly. Documents read off a snapshot are validated
against a zod schema before they become application state, so a malformed or unexpected document
shape is dropped instead of crashing the UI.

## Project structure

```text
src/
  components/     NotificationButton, NotificationList - presentation only
  hooks/          useNotifications - realtime state, loading/error, optimistic updates
  services/       notificationService - the only module that talks to Firestore
  types/          NotificationRecord / NotificationType shared shape
  config/         Firebase app + Firestore initialization, env validation, emulator wiring
firestore.rules   Security rules for the notifications collection
firebase.json     Emulator ports and Firestore config
```

## Data flow

**Creating a notification:**

```text
NotificationButton (onSend)
  -> App.handleSend
  -> useNotifications.sendNotification
  -> notificationService.createNotification
  -> Firebase SDK: addDoc(..., createdAt: serverTimestamp())
  -> Firestore write, checked against firestore.rules
```

**Receiving it back, in realtime, on every connected client:**

```text
Firestore document change
  -> onSnapshot fires
  -> notificationService.subscribeToNotifications maps + zod-validates each document
  -> useNotifications updates notifications / loading / error state
  -> NotificationList re-renders
```

Marking a notification as read updates local state immediately (optimistic), then confirms with a
Firestore write; a failed write rolls the local state back and surfaces the error.

## Environment variables

| Variable                            | Purpose                                                        |
| ----------------------------------- | -------------------------------------------------------------- |
| `VITE_FIREBASE_API_KEY`             | Firebase web app API key                                       |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase auth domain                                           |
| `VITE_FIREBASE_PROJECT_ID`          | Firebase project id (any placeholder works under the emulator) |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket                                        |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender id                                   |
| `VITE_FIREBASE_APP_ID`              | Firebase app id                                                |
| `VITE_USE_FIRESTORE_EMULATOR`       | `"true"` to connect to the local emulator instead of Firebase  |

`.env.example` contains placeholders for all of these - copy it to `.env` and fill in real values
only if you're pointing at an actual Firebase project (see [Local development](#local-development)
below). `src/config/env.ts` validates every one of them at startup via zod and throws a single
generic error if any is missing or malformed, so a bad value never leaks into a raw SDK error.
None of these are secret in the sense of granting write access on their own - Firestore access
control lives entirely in `firestore.rules`, not in the client config. Still, never commit a real
`.env` file; `.gitignore` blocks every `.env*` variant except `.env.example`.

## Firestore security rules

`firestore.rules` scopes the `notifications` collection to exactly what this app does:

- **Read**: open (this demo has no auth layer).
- **Create**: only documents with the exact fields the app writes
  (`type`/`message`/`read`/`createdAt`), `type` restricted to `info | alert | message`, a
  non-empty bounded `message`, `read` starting `false`, and `createdAt` required to equal the
  request's server timestamp (so a client can't backdate or forge it).
- **Update**: only the `read` field may change, and only `false -> true`.
- **Delete**: denied entirely.

Because the emulator loads this same file, running `npm run emulators` locally exercises the real
rules, not a permissive stand-in.

## Local development

Requires Node 24.x and npm 11.x (see `.nvmrc` / `engines` in `package.json`).

```bash
npm ci
cp .env.example .env
```

### Run against the Firestore emulator (recommended)

The emulator needs the Firebase CLI and a JRE (the emulator runs on Java); install
[Firebase CLI](https://firebase.google.com/docs/cli) globally if you don't already have it:

```bash
npm install -g firebase-tools
```

Then, in one terminal:

```bash
npm run emulators
```

This starts the Firestore emulator on `127.0.0.1:8080` (Emulator UI on `127.0.0.1:4000`). In a
second terminal:

```bash
npm run dev
```

With `VITE_USE_FIRESTORE_EMULATOR=true` (the default in `.env.example`), the app connects to the
local emulator instead of a real Firebase project - `VITE_FIREBASE_PROJECT_ID` can stay as the
placeholder value in that mode.

### Run against a real Firebase project

1. Create a Firestore-enabled project in the
   [Firebase console](https://console.firebase.google.com/).
2. Copy its web app config into `.env` (`VITE_FIREBASE_*` values) and update `.firebaserc`'s
   `default` project id.
3. Set `VITE_USE_FIRESTORE_EMULATOR=false`.
4. Deploy the rules in this repo so production enforces the same constraints as the emulator:

   ```bash
   firebase deploy --only firestore:rules
   ```

## Available commands

| Command                           | Purpose                                                      |
| --------------------------------- | ------------------------------------------------------------ |
| `npm run dev`                     | Start the Vite dev server.                                   |
| `npm run build`                   | Production build (output in `dist/`).                        |
| `npm run preview`                 | Preview the production build locally.                        |
| `npm run emulators`               | Start the Firebase emulator suite (Firestore + Emulator UI). |
| `npm run quality`                 | Format check, lint, and typecheck.                           |
| `npm run lint`                    | ESLint (zero warnings allowed).                              |
| `npm run format` / `format:check` | Prettier write / check.                                      |
| `npm run typecheck`               | `tsc --noEmit`.                                              |
| `npm test`                        | Vitest with coverage.                                        |
| `npm run security:audit`          | `npm audit --audit-level=high`.                              |

## Testing

`npm test` runs the full suite with coverage thresholds enforced in `vite.config.ts`
(currently 100% statements/functions/lines, 89.65% branches - above the 90/100/90/85 floor):

- `src/services/notificationService.test.ts` - the exact Firestore write payload, realtime
  snapshot-to-record mapping (including a pending server timestamp and a malformed document that
  must be dropped rather than crash the subscription), and that write failures propagate to the
  caller instead of being swallowed.
- `src/hooks/useNotifications.test.ts` - the optimistic read update and its rollback on failure,
  plus loading/error state for both the subscription and notification creation.
- `src/config/env.test.ts` - valid config parses correctly; a missing/invalid value throws one
  generic error that never contains the value supplied.
- Component tests (`App.test.tsx`, `NotificationList.test.tsx`, `NotificationButton.test.tsx`)
  covering rendering, sorting, and the click -> callback wiring for send and mark-as-read.

## Code quality and security

This repo follows the Webvoltz React engineering standards: strict TypeScript (no `any`, the full
`strict` family of compiler flags), a flat ESLint config with type-aware rules plus React/hooks/
a11y plugins, Prettier, and exact pinned dependency versions. A Husky pre-commit hook runs Gitleaks
secret scanning, `lint-staged`, the full `quality` check, and a production build before any commit
is allowed through; `commit-msg` enforces Conventional Commits via commitlint. The same gates run
in CI (`.github/workflows/ci.yml`) - secret scan and dependency audit first, then quality and
commit-message lint, then tests, then the production build - so a bypassed or missing local hook
still gets caught before anything merges.

`skipLibCheck` is `false`, matching the standard exactly - every third-party `.d.ts` file is
type-checked too, not just this project's own source. That only holds together with the exact
`vite`/`vitest`/`@vitest/coverage-v8` versions pinned in `package.json`: newer vite/vitest pairs
(e.g. vite 8.2.x with vitest 5.x) currently ship mismatched internal type declarations between the
two packages, unrelated to this project's code, that only `skipLibCheck: true` can paper over.

## Design decisions

- **Firestore over a REST API** - `onSnapshot` is the whole point of this demo: a live listener
  that pushes changes to every connected client, no polling.
- **Optimistic updates** - a network round-trip for every read-status change would make the UI
  feel laggy for something this small; rollback-on-failure keeps it honest when the write fails.
- **Zod at every boundary** - Firestore documents and `import.meta.env` are both untyped at
  runtime. Validating them with zod avoids unsafe casts and gives a single, predictable failure
  mode (drop the document, or throw one generic config error) instead of letting bad data crash
  the app or leak raw values into an error message.
- **`serverTimestamp()` over a client `Date()`** - avoids client clock skew, and lets
  `firestore.rules` check `createdAt == request.time` so a client can't forge when a notification
  was created.
- **A dedicated service module** - `notificationService.ts` is the only file that imports
  `firebase/firestore`, which is what makes every other layer (the hook, the components) testable
  with plain mocks instead of a real Firestore connection.

## Troubleshooting

- **Emulator won't connect** - confirm `VITE_USE_FIRESTORE_EMULATOR=true` in `.env` and that
  `npm run emulators` is actually running (check `127.0.0.1:4000` for the Emulator UI).
- **Env vars not taking effect** - Vite only reads `.env` at startup; restart `npm run dev` after
  editing it. A missing/invalid `VITE_*` value throws `Invalid application configuration.` -
  check `src/config/env.ts` for the exact fields required.
- **Firestore "permission denied" on write** - `firestore.rules` only accepts the exact document
  shape `notificationService.ts` sends, and updates may only flip `read` from `false` to `true`;
  anything else (including deletes) is denied by design.
- **Type errors after changing `vite`/`vitest`/`@vitest/coverage-v8` versions** - these three are
  pinned deliberately (see [Code quality and security](#code-quality-and-security)); an unpinned
  upgrade can reintroduce upstream `.d.ts` conflicts that `skipLibCheck: false` would otherwise
  catch.

## Future improvements

- Firebase Authentication, scoping notifications per user instead of one shared collection.
- Pagination/windowing once a notification list can grow unbounded.
- Notification categories or filtering in the UI.
- Push notifications (FCM) alongside the in-app realtime feed.

## License

MIT - see [LICENSE](LICENSE).
