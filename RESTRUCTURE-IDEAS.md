# Restructure ideas (written 2026-10-31)

Goal: turn the Goal Planner into a simple hub with 4 spaces. Maybe a product I can sell to teams later.

## Decisions so far
- Goals, notes, week/month views: **hide** from the menu, don't delete.
- Team projects: **real plan**, and possibly sold to teams with real-time visibility.
- Platforms: iPhone first, then Android, then PC. One codebase (the PWA already runs on all three, no re-coding).
- Cookbook: photos only, stored on the phone. I paste text from ChatGPT myself. No AI reading in the app.
- Style: minimalistic, clean, clear.

## The 4 spaces
1. **Training**: see "Training timer" below. Log: exercises, sets, time, completion rate, "liked it?".
2. **Work timer**: pick project, set 1 or 2 hours, count down. At zero: extend or next project. Per-project time log, weekly totals. Each entry can have tags: limit % (start to end), money spent, result/progress. Works for any activity (homework, reading, games).
3. **Cookbook + grocery list**: recipe photos, ingredients, tick-off shopping list.
4. **Team projects**: name, company, deadline, status (done / not done / delayed...), teammate notes (e.g. "delayed, computer broke"). Real-time for everyone on the team.

## Build order
Work timer, then Training, then Cookbook, then Team projects. A solo project tracker can come early; the shared team part needs the backend.

## Training timer (inspired by the app "Timer Plus")
- Settings the user can change: number of rounds, prepare time before each round, work time, rest time.
- Big main timer that never pauses, plus a second rest timer running at the same time, plus a "+15s" button.
- Sounds: beep when a period ends. Optional ticking. Optional vibration.
- Modes: freestyle (just a stopwatch), or a routine (from suggested plans or my own).
- Also a plain stopwatch and different time formats.
- iPhone catches: web apps can't vibrate on iPhone. Sound only works after a first tap. Timers must count from a start timestamp (not tick every second) or they drift when the phone sleeps.

## Selling / teams: what it means technically
- Needs accounts, a server database and live updates. Cheapest start: Supabase (free tier, includes login and real-time). **Costs money once there are real customers.** Warn before enabling anything paid.
- Prepare now: keep all data changes going through `apply()` and the action files. Later the storage behind them can switch from localStorage to the server without rewriting screens.
- Each item gets an `owner` and a `teamId` field from the start, even while solo.
- Backup: data only lives in the phone browser. Clearing Safari data loses everything. Real backup/sync comes with the server step.
- Selling also means: privacy policy, terms, and maybe app-store listing (App Store costs 99 USD/year). Much later.

## Design picks (decided 2026-10-31, can change later)
- Hub / navigation: **Apple Clock**: 4 tabs at the bottom, one per space.
- Training timer screen: **Timer Plus**, but with better colors and a somewhat different layout.
- Training log: **Hevy** (each exercise with its sets, last time's numbers shown next to them).
- Work timer: **Session** for the timer screen, **Toggl Track** for the time log.
- Weekly totals: **iOS Screen Time** style bars.
- Cookbook: **Mela**.
- Grocery list: **Apple Reminders groceries** (sorted by aisle, tick off).
- Team projects: **Linear** (list with status chips).

## Build order (planned 2026-10-31)
0. Hub shell: 4 tabs, hide old sections, `store.js` between `apply()` and storage, `ownerId`/`teamId`/`createdAt`/`updatedAt` on every item.
1. Work timer → 2. Training → 3. Cookbook + groceries (photos in IndexedDB) → 4. Team projects (solo first, then Supabase).

## Hosting and native app (notes 2026-10-31)
- Vercel Hobby is free for personal use. It must switch to Pro (20 USD/month) or move to Cloudflare Pages (free, commercial OK) once the app makes money.
- Before real users: buy an own domain (~10–15 €/year) so the host can change without changing the address (a new address means empty data).
- Native app later via Capacitor (same code). Trigger: needing vibration or lock-screen alerts, or publishing. iOS builds need a Mac or a cloud Mac build service. Apple 99 USD/year.
- Keep phone-specific features (sound, vibration, alerts, photo storage) in small helper files so the switch is easy.

## Reuse from the current app
PWA setup, themes, `timer.js`, history log, `apply()` pattern, backup, `icons.jsx`, `colors.js`.
