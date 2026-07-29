# FarSah Coaching

FarSah Coaching is a gamer-inspired AI education beta for tutoring, exam practice, XP quests, study guilds, and secure developer-only access.

## Pages

- `index.html` - public beta quest landing page
- `access.html` - developer name and founder-project challenge
- `unlock.html` - Supabase sign-in-link waiting screen with unlock animation
- `dashboard.html` - beta dashboard
- `ai-tutor.html` - AI tutor quest planner
- `exams.html` - exam arena
- `guilds.html` - study guild leaderboard
- `settings.html` - account and notification controls

## Supabase Setup

The browser never stores the allowed answer, allowed emails, or generated OTPs. Those checks live in Supabase Edge Functions:

- `supabase/functions/request-dev-otp/index.ts`
- `supabase/functions/verify-dev-otp/index.ts`
- `supabase/functions/validate-backup-code/index.ts`
- `supabase/functions/validate-dev-session/index.ts`

Create `config.js` from `config.example.js` and add your public Supabase project URL and anon key:

```js
window.FARSAH_CONFIG = {
  SUPABASE_URL: "https://YOUR_PROJECT_ID.supabase.co",
  SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY",
};
```

Set these Supabase function secrets:

```bash
supabase secrets set FOUNDER_PROJECT_ANSWER="YOUR_PRIVATE_ANSWER"
supabase secrets set BACKUP_ACCESS_CODE="YOUR_PRIVATE_BACKUP_CODE"
supabase secrets set DEV_ACCESS_ROSTER='[
  {"email":"FIRST_DEV_EMAIL","aliases":["farris zaman","farris"]},
  {"email":"SECOND_DEV_EMAIL","aliases":["sahaan kesavan","sahaan"]}
]'
```

Deploy the functions:

```bash
supabase functions deploy request-dev-otp
supabase functions deploy verify-dev-otp
supabase functions deploy validate-backup-code
supabase functions deploy validate-dev-session
```

Supabase Auth sign-in links are one-time links. Configure expiry, resend limits, and allowed redirect URLs in Supabase Auth settings.

## Run Locally

```bash
python3 -m http.server 8080
```

Then visit `http://127.0.0.1:8080`.
