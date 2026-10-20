# Puzzle Peak

Ad-free practice for gifted and entrance tests (CogAT, CCAT, OLSAT, NNAT, ISEE), plus Math Kangaroo and Waterloo Gauss style contest puzzles. Every wrong answer comes with an explanation.

**Open it:** https://shakthihegde.github.io/puzzle-peak/

On an iPad or iPhone, open the link in Safari, tap Share, then **Add to Home Screen**. On a Mac, use Safari's **File → Add to Dock**. After the first visit it also works offline.

## What's inside
- 27 question types in four areas: Words, Numbers, Shapes & Patterns, Space & Logic
- Mixed Climb: 40 sets that mix all four areas, plus Smart Mix, which focuses on weak spots
- Timed practice tests modelled on the published structure of each exam
- Stars, XP, badges, a daily challenge, a mistakes list and a progress report
- Parent controls (PIN) to allow mixed practice only
- Optional sync between a child's devices, plus backup files

All questions are original and written in the style of each test. This is an independent practice tool, not affiliated with or endorsed by any test publisher. ## Privacy
No accounts, ads or tracking. Progress is saved in the browser on each device, and the child's name never leaves the device.

If a parent turns on **Profile → Sync between devices**, the app makes a random family code (like `peak-xxxx-xxxx-xxxx-xxxx`). A compressed copy of the progress (stars, scores, XP, mistakes, test results) is stored under a SHA-256 fingerprint of that code. The code itself, names and emails are never stored. Parents can delete the online copy from the same screen. **Profile → Backup** saves or loads a backup file, with or without sync.

## Fork it
MIT licensed, so take it and make it your own. The sync service is optional:
1. Create a free Cloudflare account, then in `cloudflare/` run `npm install`, `npx wrangler login` and `npx wrangler d1 create puzzle-peak`.
2. Put the new `database_id` in `cloudflare/wrangler.toml`, set `ALLOWED_ORIGINS` to your site's address, then run `npx wrangler d1 execute puzzle-peak --remote --file=schema.sql` and `npx wrangler deploy`.
3. Put the deployed address in `cloudflare/sync-url.txt` and run `python3 build.py`. Leave that file out and the app simply works without sync.

## Development
- `src/`: generators (`gen-*.js`), hand-written verbal banks (`banks.js`), tests, UI (`app.js`, `style.css`)
- `python3 build.py`: builds `docs/` (the hosted web app) and `dist/` (single-file copies)
- `cloudflare/`: the sync service, one small worker plus a D1 table (`schema.sql`)
- `node test/check.js 300`: generates and checks every set plus thousands of random questions
