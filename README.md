# FarSah Coaching

FarSah Coaching is a polished education beta for tutoring, exam practice, study quests, local progress tools, study guilds, and developer access.

## Pages

- `index.html` - public beta quest landing page
- `access.html` - founder-project question and access-code gate
- `unlock.html` - simple access-gate redirect screen
- `dashboard.html` - beta hub with local study stats
- `ai-tutor.html` - AI tutor quest planner
- `exams.html` - exam arena
- `guilds.html` - study guild leaderboard
- `features.html` - local Study Lab tools
- `chat.html` - local beta chat room
- `subscription.html` - subscription plan preview
- `founders.html` - founder profiles
- `settings.html` - account and notification controls

## Access

The beta gate is fully local.

- Founder answer: checked against a SHA-256 hash in `auth.js`
- Access code: checked against a SHA-256 hash in `auth.js`
- Browser access state: stored in `sessionStorage`

This is intended for a simple beta gate on a static site. Because the code is in frontend JavaScript, it can be inspected by someone determined enough.

## Local Features

The beta workspace includes local-only tools that do not require external services:

- Focus timer with custom session length
- Flashcard forge with review mode
- Quest checklist
- Exam countdown
- Notes vault with search and quick summary
- Progress tracker with daily goal bar
- Grade goal calculator
- Study mix generator
- Saved exam attempts
- Local beta chat

Profile, guild, notes, flashcards, checklist items, countdown, progress, exam attempts, and chat values are stored in browser `localStorage`.

## Run Locally

```bash
python3 -m http.server 8080
```

Then visit `http://127.0.0.1:8080`.
