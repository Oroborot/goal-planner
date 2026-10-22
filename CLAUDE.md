# Goal Planner

**What it is:** a goal-achiever planner, not a calendar app. Every task should connect to a goal (today → week → month → year → end goal). It's my personal app for now and costs nothing. Full vision and build steps are in `PLAN.md`.

## Docs (read when relevant, not every time)

- `PLAN.md`: purpose, how we work, the design decision process, build steps (tick them off when I confirm), "Maybe remove later", "Hard to change later".
- `DESIGN-IDEAS.md`: visual ideas. New design ideas go here.
- `APP-IDEAS.md`: other app ideas. `MY-GOALS.md`: my personal roadmap.
- `NEXT-SESSION.md`: old hand-off prompt, replaced by this file.
- New feature ideas I mention go into `PLAN.md` or `DESIGN-IDEAS.md`.

## Stack

- React 19 + Vite, plain JSX (no TypeScript), PWA via vite-plugin-pwa. No backend.
- GitHub repo `Oroborot/goal-planner`. Vercel deploys `main`, which is installed on my iPhone as a home-screen app.
- Dev server: `npm run dev` → http://localhost:5173. Checks: `npm run lint` and `npm run build`.

## How the code works

- All files are flat in `src/`. Components are PascalCase `.jsx`; logic is lowercase `.js`.
- **State:** every change goes through `apply({ items, events })` in `App.jsx`. Action files (`goalActions.js`, `noteActions.js`, `categoryActions.js`, `rewardActions.js`) return `{ items, events }`, so every change is recorded in the history log. Deleting hides an item (`deletedAt`) and never erases it.
- **Data (localStorage):** `planner-items` (goals, notes and categories; the `list` field says which), `planner-events` (history), `planner-timer`, `planner-settings`, `planner-day-view`, `planner-last-backup`. It's all test data until the final stage, so no migration code is needed; just clear it.
- **Routing:** by the address hash, in `screenFromAddress()` in `App.jsx`. Home has no hash. Routes include `#goals`, `#goal/<id>`, `#notes`, `#note/<id>`, `#day/<date>`, `#week/<date>`, `#month/<yyyy-mm>`, `#focus/<id>`, `#history`, `#archive`, `#settings`, `#stats`, `#folders`, `#rewards` and `#cover`.
- **Shared pieces:** `icons.jsx` (all icons), `colors.js`, `themes.js`, `calendar.js` (date helpers), `repeat.js`, `progress.js`, `timer.js`, `timeframes.js`. Use these instead of writing new ones.
- Comments are plain-English and beginner-friendly. Keep that style.

## Workflow

- Work on branch `feature/save-and-timeframes`. `main` = live on my phone.
- Design choices follow the Design decision process in `PLAN.md`: show real apps first, I pick, then build.
- After each finished step: tell me how to test it and end with http://localhost:5173.
- Then ask "Save and upload?". On my OK, run it yourself: check `git branch --show-current` → `git add -A` → `git commit` → `git push` → `git checkout main` → `git merge feature/save-and-timeframes --no-edit` → `git push` → `git checkout feature/save-and-timeframes`. Then check that both branches and `origin/main` are on the same commit. One OK = one save.

## Testing

- Test in the browser at phone size (375×812). Seed localStorage with test data, then clear it afterwards.

## Quirks

- The Vite dev server sometimes serves a stale file after edits. Touch the file (update LastWriteTime) and reload.
- The code uses characters like ＋ ✎ ✕. Save files as UTF-8 without BOM.
- Phone notifications would need a server, which costs money. Warn me before going there.
