# Supabase Edge Functions

These functions keep beta access rules out of inspectable frontend code.

Required secrets:

- `FOUNDER_PROJECT_ANSWER`
- `DEV_ACCESS_ROSTER`
- `BACKUP_ACCESS_CODE`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically in hosted Supabase Edge Functions. Set the founder answer and developer roster manually.

Example roster shape:

```json
[
  { "email": "FIRST_DEV_EMAIL", "aliases": ["farris zaman", "farris"] },
  { "email": "SECOND_DEV_EMAIL", "aliases": ["sahaan kesavan", "sahaan"] }
]
```
