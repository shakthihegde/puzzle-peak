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

All questions are original and written in the style of each test. This is an independent practice tool, not affiliated with or endorsed by any test publisher. Progress stays in the browser on each device; use Profile → *Move progress to another device* to combine devices.

## Development
- `src/`: generators (`gen-*.js`), hand-written verbal banks (`banks.js`), tests, UI (`app.js`, `style.css`)
- `python3 build.py`: builds `docs/` (the hosted web app) and `dist/` (single-file copies)
- `node test/check.js 300`: generates and checks every set plus thousands of random questions
