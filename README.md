# FarSah Coaching

FarSah Coaching is a gamer-inspired AI education beta for tutoring, exam practice, XP quests, study guilds, and developer access.

## Pages

- `index.html` - public beta quest landing page
- `access.html` - founder-project question and access-code gate
- `unlock.html` - simple access-gate redirect screen
- `dashboard.html` - beta dashboard
- `ai-tutor.html` - AI tutor quest planner
- `exams.html` - exam arena
- `guilds.html` - study guild leaderboard
- `settings.html` - account and notification controls

## Access

The beta gate is now fully local and does not use Supabase.

- Founder answer: stored in `auth.js`
- Access code: stored in `auth.js`
- Browser access state: stored in `sessionStorage`

This is intended for a simple beta gate on a static site. Because the code is in frontend JavaScript, it can be inspected by someone determined enough.

## Run Locally

```bash
python3 -m http.server 8080
```

Then visit `http://127.0.0.1:8080`.
