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
- `features.html` - five local-only beta tools
- `subscription.html` - subscription plan preview
- `founders.html` - founder profiles
- `settings.html` - account and notification controls

## Access

The beta gate is fully local.

- Founder answer: stored in `auth.js`
- Access code: stored in `auth.js`
- Browser access state: stored in `sessionStorage`

This is intended for a simple beta gate on a static site. Because the code is in frontend JavaScript, it can be inspected by someone determined enough.

## Local Features

The beta workspace includes local-only tools that do not require external services:

- Focus timer
- Flashcard forge
- Exam countdown
- Notes vault
- Progress tracker

Profile, guild, notes, flashcards, countdown, and progress values are stored in browser `localStorage`.

## Run Locally

```bash
python3 -m http.server 8080
```

Then visit `http://127.0.0.1:8080`.
