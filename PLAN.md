# Goal Planner App Plan

## Main purpose (never lose sight of this)

This is a **goal-achiever planner, not a calendar app**. The calendar is the place where goals, notes and tasks live and get streamlined. **Every task should connect to a goal.**

## How we work

- **Personal app for now, no spending.** Before any step that needs money (servers, databases, AI usage, app store fees), say so in advance and explain the cost.
- **Warn before big steps.** Before any task that takes a lot of time or brainpower, warn first; it may change the order.
- **Compare real apps before any design choice** (see "Design decision process" below).
- **Beginner-friendly instructions.** For every step, say exactly where it happens (VS Code, terminal, browser, GitHub, Vercel) and what you should see after it. Always give the test link (http://localhost:5173).

## Design decision process

Used for every feature before any code is written:

1. **Look:** name 2–3 real apps to compare (or sketch one if none exist).
2. **Like / Skip:** say what you like and what you don't need from each.
3. **Map:** each "like" becomes a named piece of the app.
4. **Combine:** one sentence describing the mix.
5. **Phase:** sort the pieces into first / next / later.
6. **Questions:** settle open choices for the first phase only.
7. **Build:** only then start coding.

## Why this angle works

The angle is strong: every small task visibly feeds a bigger goal, and the app reminds you why you do it, in your own words. Most planners are just lists of tasks. Some apps link tasks to goals, so the idea isn't fully unique, but the mix of the goal chain, your own "why", the swap option and the liquid timer feels personal and motivating rather than corporate.

Saturation matters less right now. The first goal is to learn to build apps and to use this one yourself for your next projects. If it turns out good, selling it is a bonus.

## Your ideas, organized

The core is the goal chain; every other feature supports acting on it.

Example chain: Today: Work out -> This week: Work out 3 times -> This month: 50 push-ups in one go -> This year: Fit body

**1. The goal chain (the core of the app)**

- Goals live at different levels: end goal, year, month, week, day.
- Each goal can link to one or more bigger "parent" goals, so a goal can count toward several bigger goals.
- Finishing a small goal counts as progress toward the bigger ones.
- Several areas of life, each with its own chain (fitness, apps, money, and so on).

**Goal structure**

- **End goals:** long-term (e.g. get fit, get rich).
- **Milestones** inside end goals, reached by: number of times a task is done, hours put in, or certificates earned.
- **Habits:** recurring tasks (e.g. daily run). Built as "repeating goals".
- **Deadlines and priorities** on anything where they make sense (details later).
- **Side quests (later):** optional challenges the user writes and attaches to a task (e.g. daily run → "run my chosen distance in 30 min or less"). The user marks whether they achieved it. Gives a reward, possibly visual bonuses (details later).

**2. Your "why"**

- Each goal stores your own reason for doing it.
- The app shows it back to you when it's time to act.

**3. Liquid tube timer**

- A timer per task that looks like liquid filling a tube.
- You choose whether it counts up (how long I worked) or down (time left).

**4. Different views**

- Several ways to see the same tasks, such as a list, a goal tree, or by day or week.
- A table view, like a spreadsheet, showing goals and their links.
- A visual map that draws goals and the connections between them.

**5. Daily repeating tasks**

- Mark tasks that repeat every day or on certain days.

**6. Calendar and "what now" popup**

- The calendar is where the day's tasks get planned (see "Calendar" in the build steps).
- The app pops up with what to do next, with your "why" attached.
- If you want to skip, it offers another task that's equally important.

**7. Smart suggestions (later)**

- The app suggests tasks based on what you've entered and done before.

**8. Reward system**

- You enter your own reward when you set a goal: a cheat day, or a small pleasure like lazing around or eating ice cream.
- The app unlocks the reward when you reach the goal.

**How progress is counted:** you set your own goals and log your own progress. For a number goal like "50 push-ups in one go", you either type your best number or pick a level (above 20, above 30, and so on). "Work out 3 times a week" counts finished tasks automatically, and "Fit body" shows the progress of the goals below it.

## Mega prompt or step by step?

Do both, in a specific way: write the whole vision down once, then build one feature per prompt.

1. **Write the full vision in a `PLAN.md` file** inside the project, and tell Claude Code to read it first. It then designs the data the right way from the start: goals with a parent, a timeframe and a "why". Changing that structure later is painful.
2. **Build one feature per prompt.** Test it, commit and push before moving on.

Avoid a single mega prompt that says "build all of this". Claude Code would produce a lot of code at once, and when something breaks you won't know where. One feature at a time keeps each step small enough to understand and fix.

## Build steps, in order

Each step is roughly one or two sessions. Commit and deploy after every step so a working version is always online.

Practical features come first, visual design later: the look (colors, fonts, spacing) is easy to change at any point, and the app's "vibe" becomes clear from using it. Until the design pass, keep the style simple and consistent. Visual ideas are collected in `DESIGN-IDEAS.md`.

### Done

- [x] **Finish Day 2:** saving with localStorage, timeframes and tabs. Everything else builds on this.
- [x] **Create `PLAN.md`** with the organized list above.
- [x] **Goal linking:** a "parent goal" dropdown when creating a goal, plus a "why" field.
- [x] **Home screen:** when you open the app, a start screen where you choose what to do: goals, notes, folders, and so on.

### Part 1: make goals actually work

- [x] **Edit what you've added:** change a goal's title, timeframe, "why" and parent goals after creating it.
- [x] **Flexible linking:** link goals at any time, not only when creating them. Often a goal comes first and its bigger goal only becomes clear later, so adding a goal should be quick, with linking done whenever it makes sense. A goal can link to several parent goals, and linking works in both directions: from a bigger goal, add a new smaller goal under it, or link existing smaller goals to it.
- [x] **Keep all data (history log):** "all data is good data". Every action is recorded with the time it happened: created, edited, linked, ticked, unticked, deleted, and later skipped, timer runs and reminders. Deleted goals are hidden, not erased, so nothing is ever lost. This makes it possible to count things like how many times a goal was ticked or skipped, and it's the base for history, folders, suggestions and sharing. Includes a folded "Deleted goals" section at the bottom of the goals list, showing progress when deleted and times ticked.
- [x] **Restore deleted goals:** a "Restore" button on deleted goals (in the "Deleted goals" section and on the deleted goal's page) that brings the goal back into the lists, with its history kept. The restore is recorded in the history log. Links it had when it was deleted are offered back, or it comes back unlinked and you relink it.
- [x] **Progress rollup and goal page:** the goals list is for creating goals; the goal page is for tracking them. Tap a goal to open its own page with a progress bar, the smaller goals under it by name (tickable, each with its own progress), and the bigger goals it counts toward (tap to move up the chain). Progress: a goal with nothing under it is 0% or 100%; a bigger goal is the average of the goals under it, all the way up the chain. Both ways of completing: tick a big goal by hand at any time, or it completes itself automatically when everything under it is done (and un-completes if something under it is unticked, unless you ticked it by hand).
- [x] **Repeating goals and a counter:** some goals are done again and again, not once. Mark a goal as repeating (every day, or on certain days) and tick it each time you do it. It resets for the next day, and a counter shows how many times you've done it in total and in a row (a streak), plus the days you missed. A target like "3 times a week" fills up the bigger goal automatically. The counts come from the history log, so this step comes right after it.
- [ ] **Goal tree view:** see the whole chain from today up to the end goal. A simple version first; the fancy visuals come later (see `DESIGN-IDEAS.md`).

### Part 2: make it a daily app

- [x] **Notes and daily tasks:** take notes and daily task lists, mark progress on them, and edit or delete them, the same way you manage goals. Each note has a small id (N1, N2…), can be a task with a tick box, and links to other notes or goals both ways. Notes have categories: main ones (Ideas, Thoughts, Reminders…) and sub-categories under them, with filter chips, rename and delete. Later: merge notes, link by typing an id like N3 in the text.
- [x] **Timer:** a timer per task that counts up (how long I worked) or down (time left, in minutes and seconds). A plain version first; the liquid tube look comes with the design pass. Later: a place to see all repeating goals, timers and tasks together (with the design pass).
#### Calendar

Phone first, computer maybe later. Main flow: **Today** page → turn the page to **Tomorrow** → keep going day by day → then a **Week** view → then a **Month** view. Data stays on the device (localStorage) for now.

Inspiration: Google Calendar (week/month overview), Todoist (daily list), Sunsama (moving tasks between days), Akiflow (both views together + statistics).

**Phase 1 (first):**
- [x] Every task links to a goal, with a color per goal (or life area). Colors done: 8 colors, smaller goals take their bigger goal's color. Decided: a calendar task is a Day goal with a date; being on the calendar is optional ("Add to calendar", off by default); tasks without a goal are allowed but shown grey with a "link me" hint.
- [x] Today page: a list where tasks can have an optional time. Habits for that weekday show below; quick add with time and goal.
- [x] Go to tomorrow and onward (arrow buttons first, swipe later).
- [x] Week view: each task shows its name and its goal's color. Decided: on a phone, the 7 days are stacked; each day can be folded or opened, so it never becomes a huge list.
- [x] Month view, first version: **A** a dot grid (iPhone Calendar style): goal-colored dots per day; tap a day to see its tasks below the grid with "Open day". **C** your Month goals with progress bars above the grid. Later: **B** each week row shows "% done"; **D** quick add a task on a tapped day, and add a Month goal from the top.
- [ ] Move an unfinished task to another day (button first, drag later). **Postponed (later):** dates can already be changed with ✎ Edit; this adds one-tap moving (Today / Tomorrow / Next week / pick a date) and a "left from earlier · move all to today" reminder. Convenience only.

**Next phases:**
- [ ] **Now box (decided, phase 1 of "what now"):** a small box at the top of Today (not a popup, no auto-planning: you plan your own day). Shows today's timed tasks that are due or overdue (never yesterday's), the next one coming up, and **ASAP** tasks: only one-time Day tasks with no date that you mark "⚡ Show in Now (ASAP)" (e.g. "fix the broken window"). Skipped timed tasks move to tomorrow and show "Skipped from …". Buttons: Do it · Later (+15/+30/+60 min) · Skip (timed → tomorrow; ASAP → hidden until tomorrow) · Swap (trade time slots with another of today's tasks). Every choice goes into history (done, snoozed, skipped, swapped). **Focus mode** built (simple): Do it opens one task full screen with its why, timer and Done; visuals/audio come with the design pass. Also fixed: "← Back" returns to the page you came from.
- [ ] **"What now" popup (original idea, partly replaced by the Now box):** at the planned time, show the task with its "why": Do it, Silence (snooze), Change (move or edit), or Swap for another equally important task that fits the current time. Every choice goes into the history log (done, skipped, snoozed, swapped), so skips get counted. Popups only work while the app is open.
- [ ] **Importance and expected time (built, waiting for OK):** importance none/low/medium/high (●/●●/●●● for now, themes later; Swap suggests the most important first); expected time in minutes, shown as 09:00–09:30; Day page shows "Planned 4h 30m" and warns about overlaps and days over 8h. Set in ✎ edit, the Day quick add and the ＋ sheet.
- [ ] **Chains (next):** "do this after that" (shower after workout): when the first is ticked, the next comes up in the Now box.
- [ ] **Time windows (parked, maybe):** times a task can be done (mornings / evenings).
- [ ] **Time windows and chains (original note):** times a task can be done (e.g. working out: mornings or late afternoon; shower: start or end of day), a rough duration, and "do this after that" (shower after the workout). An importance level per task, used for swapping.
- [ ] **Assisted rescheduling (no AI):** unfinished tasks get highlighted. If the user turns help on, the app suggests a new day/time from the priorities the user set; the user makes the final decision.
- [ ] **Stats:** how many times, how much time, progress toward goals. Rewards are user-defined (see "Reward system").

- [ ] **Installable app (PWA):** add the app to your phone's home screen so you can use it every day. Works on iPhone (Safari → Share → Add to Home Screen) and Android. Data stays on the phone; notifications later (need a server).
- [ ] **Backup (later, after the basics):** one button downloads all data as a file, one loads it back. Important because data lives only on the phone: deleting the app icon or losing the phone loses it. ~30 min, free.

- [x] **Navigation menu:** built: bottom bar, ＋ sheet, side menu with History and Archive. Decided (see `DESIGN-IDEAS.md` → Navigation): bottom bar with icons only (Home, Calendar, round ＋ in the accent color, Goals, Notes), ＋ opens Task / Habit / Goal / Note; side menu by swiping from the left (Views, Settings, History, Archive, Note categories). Build in two parts: bottom bar + ＋ sheet (~60 min), then side menu + History + Archive (~60 min).
- [x] **History cleanup:** delete single history entries (e.g. mistakes) or the whole history, each with a confirmation. Keep it discreet: history folded away or reached from the menu, not always open. Note: deleting entries also changes the counts built from them (times ticked, timer totals).

### Part 3: find the vibe

- [ ] **Better look:** a design pass, based on how you actually use the app. Pick ideas from `DESIGN-IDEAS.md`.
- [ ] **Customize:** in Settings, pick icon set, all colors (one-color themes like all blue or all pink), font, text size, light/dark, with a live preview screen. Theme templates: four seasons, gold, iridescent, violet, black hole, star rupture. Details in `DESIGN-IDEAS.md` → Customize.
- [ ] **Home screen design:** an inspirational quote instead of "What do you want to do?" (ideas in `DESIGN-IDEAS.md`), background of the user's choice, date and time, custom or chosen imagery, a small bar at the top showing tasks done today, and a button at the bottom that takes you to the main area.

### Part 4: extras

- [ ] **Folders:** a separate section with folders such as "Achieved" (finished goals, with their "why" and date) and "Reasons to try" (your "why"s, to remind you why you do things). You can create, rename and delete folders, and move goals and "why"s between them.
- [ ] **Liquid tube timer look:** the animated version of the timer. Good CSS animation practice.
- [ ] **More goal views:** a table view (like a spreadsheet), a link view and a big tree view. See `DESIGN-IDEAS.md`.
- [ ] **Suggestions:** start with simple rules, such as "you skipped push-ups twice, do them first today", and add AI later.
- [ ] **Side quests:** see "Goal structure".
- [ ] **Task details:** notes, location or links inside a task; sub-tasks inside a task; a time estimate per task with a warning when a day is overloaded; task durations shown as block heights in the day/week views.
- [ ] **Organizing:** several color-coded calendars (e.g. Work, Fitness) that can be shown/hidden; labels and filters; an Inbox for tasks with no date yet; time-blocking: drag a task from the Inbox onto a time in the calendar.
- [ ] **Speed:** quick add by typing a sentence (e.g. "run tomorrow 7am") using a free date-parsing library, not AI; a typing shortcut/command bar.
- [ ] **Routines:** guided morning planning; evening shutdown/reflection (also the daily review); weekly review; energy tracker (how drained or energetic a day is).
- [ ] **Reminders before a task.** Warn before building: phone notifications while the app is closed may need a server (possible cost).

**Not wanted:** karma points or streak scoring, an inbox collecting tasks from other apps, a vertical timeline with icons.

**AI (parked until the end):** e.g. "plan my tomorrow from text". Only when actually needed, and only after explaining the cost.

### Part 5: the real product

- [ ] **Login and sync:** an account so your goals and notes are the same on your phone and laptop. This needs a server and a database, not only the browser.
- [ ] **Share goal journeys (later, once real data is in use):** share a finished goal with a friend, including the smaller goals, "why"s, reminders and steps that led to it, so they can see how you did it. They can copy the whole goal set as a fresh start for themselves, without your dates or ticks. Needs login and sync first.
- [ ] **Phone version and real notifications.** Browsers only send reminders reliably while the page is open, so true phone reminders come with a mobile app.
- [ ] **Legal and privacy:** everything in the "Legal and privacy checklist" below. Must be done before the app goes public (before login, payments, sharing or app stores).

## Maybe remove later

Small things added along the way that might not be needed in the final app. Review this list during the design pass.

- [ ] The "Not linked to a goal yet · tap to link" hint under tasks without a bigger goal.
- [ ] The ＋ button on goals in the goals list (adds a smaller goal under it; ✎ Edit and the goal page can do the same).

## Legal and privacy checklist (before going public)

Not started. Collect templates first (web, GitHub), then have a lawyer review before launch. Not legal advice.

**Documents**
- [ ] Privacy policy: what data is collected, why, where it's stored, who sees it, how long it's kept
- [ ] Terms of service
- [ ] Cookie policy, plus a cookie/consent banner if non-essential cookies or analytics are used
- [ ] License to use the app
- [ ] Eligibility: minimum age, who may use it
- [ ] Subscription pricing and billing: prices, renewals, cancelling, refunds, free trials
- [ ] Your content and recordings: who owns goals, notes and "why"s; what the app may do with them
- [ ] Third-party services: hosting (Vercel), payments, analytics, AI, app stores
- [ ] Acceptable use: what users may not do (especially for sharing)
- [ ] Our intellectual property: name, logo, design, code
- [ ] Disclaimers: not medical, fitness, financial or professional advice
- [ ] Limitation of liability
- [ ] Indemnification
- [ ] Termination: closing accounts, what happens to data
- [ ] App store terms (Apple, Google)
- [ ] Governing law
- [ ] Dispute resolution and arbitration
- [ ] State- and country-specific notices
- [ ] Changes to the terms, and how users are told
- [ ] Contact details

**Extra items to check**
- [ ] Data protection laws: GDPR (EU/UK) and CCPA (California), depending on where users live
- [ ] User data rights in the app: download my data, delete my account and data
- [ ] Children's privacy (COPPA in the US): block or handle users under 13 (16 in some countries)
- [ ] Data security: encryption, passwords, what to do if data leaks
- [ ] Data retention: how long history, deleted goals and accounts are kept. The history log keeps everything, so this must be stated clearly
- [ ] Sharing goal journeys: consent before sharing, what friends can see, reporting misuse
- [ ] App store privacy labels (Apple "nutrition label", Google data safety form)
- [ ] Auto-renewal rules for subscriptions (clear cancel button, reminders before charging)
- [ ] AI disclosure if suggestions use AI
- [ ] Accessibility
- [ ] Trademark check on the app's name
- [ ] Business setup (company, tax) before charging money

## Hard to change later

**Decided:** until the last stage, all saved data is test data. Nothing needs to be kept, so the shape of saved data can change freely and old test data can simply be cleared. No upgrade code is needed until then.

These become hard to change once real data exists (after login and sync, or once real use starts):

- **Saved data lives in one browser.** Goals are stored in the browser on that device, at that web address. A different device, a different address (such as a preview link or a new domain) or clearing browser data means an empty app.
- **The shape of saved data.** Adding new fields is always easy. Once real data exists, renaming or removing fields needs extra code that upgrades data already saved.
- **Several parents per goal (done).** Goals store a list of parent ids (`parentIds`) instead of a single `parentId`.
- **History only exists from the day it's recorded.** The app can only show or count what it recorded at the time: when things were ticked, skipped, edited, and so on. Anything done before the history log existed is gone. Deleting hides goals instead of erasing them, so their history stays.
- **Browser storage has a size limit (about 5 MB).** The history log grows forever. For one person that's years of normal use, but it's another reason to move to login and a real database before the app is used for real.
- **Folders should be linked by id, not by name.** Then renaming a folder doesn't break anything.
- **The web address.** Once the app is installed on phones, changing the address means a new app and an empty data store.
