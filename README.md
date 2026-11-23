# KLYVERO

A marketplace app starter built with Expo, React Native, TypeScript and Supabase Auth.

## Included

- Email sign-up and sign-in
- Password reset email flow
- Persistent auth session and automatic token refresh
- Signed-in screen and sign-out
- Supabase profile table with Row Level Security
- Dark charcoal and gold starter UI

## 1. Install

Install Node.js LTS, then in the project folder run:

```bash
npm install
npx expo start
```

Press `w` to open the web app, or scan the QR code with Expo Go on your phone.

## 2. Create a Supabase project

1. Create a project at https://supabase.com/dashboard.
2. Open **Project Settings → API** (or **Data API**).
3. Copy the Project URL and the publishable key (or legacy anon key).
4. In the project root, create a file named `.env` and add:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

5. Restart Expo after saving the file.

The publishable/anon key is designed for client apps. Never put a Supabase `service_role` or secret key in this app, in GitHub, or in a public environment variable.

## 3. Create the profile table

In the Supabase dashboard, open **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it. This creates a profile for each new auth user and restricts profile rows with Row Level Security.

## 4. Configure email sign-in

In Supabase **Authentication → URL Configuration**, set the Site URL and allowed redirect URLs for the domains you actually use. For local testing, use the local URL shown by Expo if the flow requires a redirect. Supabase email confirmation settings can be adjusted under **Authentication → Providers → Email**.

## Authentication flow

1. `App.tsx` wraps the app in `AuthProvider`.
2. `AuthProvider` restores the saved session with `getSession()` and subscribes to auth changes.
3. Sign-up calls `supabase.auth.signUp()`; sign-in calls `signInWithPassword()`.
4. Supabase verifies credentials and issues the session. The SDK persists it using AsyncStorage in this React Native starter and refreshes tokens automatically.
5. The provider exposes the current user/session to screens through `useAuth()`.
6. Sign-out calls `supabase.auth.signOut()`; password recovery calls `resetPasswordForEmail()`.

Passwords are sent over HTTPS to Supabase Auth and are not stored by this app. Do not log passwords or tokens. The SQL profile table stores display names and user IDs, never passwords or tokens. Enforce authorization with Supabase Row Level Security, not just by hiding UI.

## Project files

- `App.tsx`: sign-up, sign-in, reset-password and signed-in UI
- `src/auth/AuthProvider.tsx`: session lifecycle and auth actions
- `src/lib/supabase.ts`: Supabase client setup
- `supabase/schema.sql`: profile table, trigger and RLS policies
- `.env.example`: environment variable template

## Important before launch

This is an authentication starter, not a complete production marketplace. Add marketplace database tables, server-side validation, moderation/reporting, secure payment-provider integration, privacy/terms pages, and tests before accepting real users or payments. For web production, review the Supabase SSR/cookie-based session guidance rather than assuming AsyncStorage is the right browser session store.
