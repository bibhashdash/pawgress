# Project setup — dog training tracker

Status: scoping only, nothing built yet.

## Concept

A tracker for training a dog, covering behaviours and sub-behaviours.
Must support logging offline, with sync to the backend once back online.

## Location

Sibling directory to `recurrly-native`:
`C:\Users\bdash\personal\dog-training-tracker`

## Backend stack

Branching out from the Clerk + Supabase pairing used in `recurrly-native`.
Leaning towards Convex, since the offline-first logging requirement fits
its local-first/optimistic-update patterns more naturally than adding a
sync layer on top of Supabase. Auth provider not yet decided — needs a
Convex-compatible option (Convex has first-party Clerk support, so Clerk
remains a candidate, but this hasn't been confirmed).

## Platform scope

Both iOS and Android.

- Android: local dev builds via `expo run:android`, same as `recurrly-native`.
- iOS: no local Xcode on this machine, so builds go through EAS Build's
  cloud service. Free tier covers 15 iOS + 15 Android builds/month, one
  concurrent build, which should be enough for normal native-dependency-change
  cadence (JS/TS changes never need a build).

## Tech stack

- Latest Expo SDK (SDK 57 as of this session)
- TypeScript
- NativeWind for styling, following the same hand-built-components approach
  as `recurrly-native` rather than a full opinionated UI component library
  (considered React Native Paper / Tamagui — both bring their own visual
  language that would fight the custom palette below; leaning towards
  react-native-reusables if a component-primitives library is wanted, since
  it's headless/NativeWind-native rather than imposing a look).

## Scaffolding

Same overall shape as `recurrly-native`: tab navigation + auth flow
(sign-in/sign-up screens, protected routes).

## Colour palette

Going for a "Strava vibe" — warm neutrals with an energetic accent:

| Name          | Hex       |
|---------------|-----------|
| Floral White  | `#FFFCF2` |
| Dust Grey     | `#CCC5B9` |
| Charcoal Brown| `#403D39` |
| Carbon Black  | `#252422` |
| Spicy Paprika | `#EB5E28` |

## Auth baseline (lessons from recurrly-native)

`recurrly-native` shipped with password-based Clerk auth, then hit a
release-build-only sign-in failure that traced back to Clerk's
[Client Trust](https://clerk.com/docs/guides/secure/client-trust) feature
(new/untrusted device + password + no MFA → forced second-factor challenge
that the app didn't handle). Passwords were dropped entirely in favour of
passwordless email-code auth, which sidesteps that whole failure class. If
this project uses Clerk (still unconfirmed above), start passwordless from
day one rather than retrofitting later:

- **Sign-in**: `signIn.create({identifier})` → find the `email_code` factor
  in `supportedFirstFactors` → `signIn.prepareFirstFactor({strategy:
  "email_code", emailAddressId})` → `signIn.attemptFirstFactor({strategy:
  "email_code", code})`.
- **Sign-up**: `signUp.create({emailAddress, ...requiredFields})` →
  `signUp.prepareEmailAddressVerification({strategy: "email_code"})` →
  `signUp.attemptEmailAddressVerification({code})`.
- No password field anywhere means no Client Trust second-factor path to
  implement — `SignUpStatus` has no client-trust equivalent, and
  passwordless sign-in never enters `needs_client_trust`.
- Import `useSignIn`/`useSignUp` from **`@clerk/expo/legacy`**, not the
  root `@clerk/expo` package — the root export uses a newer signals-based
  API with a different shape. `useAuth`/`useUser` do come from the root
  package.
- Whatever fields the Clerk Dashboard is configured to *require* at
  sign-up (e.g. "Require first and last name") must be collected in the
  sign-up form and passed to `signUp.create()`, or `attempt.status` will
  sit at `missing_requirements` forever with a generic-looking failure —
  check the dashboard's user & authentication settings before building the
  sign-up screen, not after.
- EAS Build reads env vars from its own remote store (`eas env:create`,
  `eas env:list <profile>`), never from a local `.env` file — push the
  needed `EXPO_PUBLIC_*` vars to the relevant EAS environment before the
  first cloud build, or the build will silently ship without them.

## Decided (boilerplate scaffolded)

- App name: **Pawgress** (`app.json` name/slug/scheme, `package.json` name)
- Backend: **Convex** (`convex/schema.ts`, `convex/auth.config.ts` scaffolded,
  empty schema — data model still to be designed)
- Auth: **Clerk**, passwordless email-code only, per the lessons above
  (`app/(auth)/sign-in.tsx`, `app/(auth)/sign-up.tsx`)
- Component library: **react-native-reusables conventions**, hand-scaffolded
  (`components.json`, `lib/utils.ts`, `components/ui/{button,input,card,text}.tsx`)
  — the CLI installer (`@react-native-reusables/cli init`) hung in this
  non-interactive shell, so the same output was recreated by hand instead
- Tab skeleton: `app/(tabs)/_layout.tsx` with Home / Log / Behaviours /
  Settings placeholder screens and a shared `TabHeader`

## Not yet decided

- Data model for behaviours/sub-behaviours
- Offline sync implementation details

## Finish-line steps (need your own account login, not run by the agent)

- `npx convex dev` — logs in via browser, creates the Convex project, writes
  `EXPO_PUBLIC_CONVEX_URL` for local dev
- Clerk Dashboard: create an app, activate the Convex integration, copy the
  Frontend API domain into `CLERK_JWT_ISSUER_DOMAIN` for Convex's env, and
  set `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` in `.env` (see `.env.example`)
- Clerk Dashboard → User & Authentication: confirm which sign-up fields are
  required (first/last name are collected in `sign-up.tsx` as a guess —
  adjust to match)
- Push the same `EXPO_PUBLIC_*` vars to EAS (`eas env:create`) before the
  first cloud iOS build
