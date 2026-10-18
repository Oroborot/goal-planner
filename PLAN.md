# Goal Planner App Plan

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

**6. Planning area and "what now" popup**

- Add the day's tasks in a planning section, for example 3 tasks.
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
- [ ] **Progress rollup:** completing a task updates all its parent goals, shown as a progress bar.
- [ ] **Goal tree view:** see the whole chain from today up to the end goal. A simple version first; the fancy visuals come later (see `DESIGN-IDEAS.md`).

### Part 2: make it a daily app

- [ ] **Notes and daily tasks:** take notes and daily task lists, mark progress on them, and edit or delete them, the same way you manage goals.
- [ ] **Repeating daily tasks:** mark tasks that repeat every day or on certain days.
- [ ] **Timer:** a timer per task that counts up (how long I worked) or down (time left). A plain version first; the liquid tube look comes with the design pass.
- [ ] **Reminders:** set a reminder on a goal or task. The app shows it when it's open; real phone notifications come with the phone version.
- [ ] **Installable app (PWA):** add the app to your phone's home screen so you can use it every day.

### Part 3: find the vibe

- [ ] **Better look:** a design pass, based on how you actually use the app. Pick ideas from `DESIGN-IDEAS.md`.

### Part 4: extras

- [ ] **Folders:** a separate section with folders such as "Achieved" (finished goals, with their "why" and date) and "Reasons to try" (your "why"s, to remind you why you do things). You can create, rename and delete folders, and move goals and "why"s between them.
- [ ] **Planning area and "what now" popup** with your "why" and the swap option. The swap needs an importance level on each task.
- [ ] **Liquid tube timer look:** the animated version of the timer. Good CSS animation practice.
- [ ] **More goal views:** a table view (like a spreadsheet), a link view and a big tree view. See `DESIGN-IDEAS.md`.
- [ ] **Suggestions:** start with simple rules, such as "you skipped push-ups twice, do them first today", and add AI later.

### Part 5: the real product

- [ ] **Login and sync:** an account so your goals and notes are the same on your phone and laptop. This needs a server and a database, not only the browser.
- [ ] **Share goal journeys (later, once real data is in use):** share a finished goal with a friend, including the smaller goals, "why"s, reminders and steps that led to it, so they can see how you did it. They can copy the whole goal set as a fresh start for themselves, without your dates or ticks. Needs login and sync first.
- [ ] **Phone version and real notifications.** Browsers only send reminders reliably while the page is open, so true phone reminders come with a mobile app.

## Hard to change later

**Decided:** until the last stage, all saved data is test data. Nothing needs to be kept, so the shape of saved data can change freely and old test data can simply be cleared. No upgrade code is needed until then.

These become hard to change once real data exists (after login and sync, or once real use starts):

- **Saved data lives in one browser.** Goals are stored in the browser on that device, at that web address. A different device, a different address (such as a preview link or a new domain) or clearing browser data means an empty app.
- **The shape of saved data.** Adding new fields is always easy. Once real data exists, renaming or removing fields needs extra code that upgrades data already saved.
- **Several parents per goal (done).** Goals store a list of parent ids (`parentIds`) instead of a single `parentId`.
- **History for sharing.** To show the process behind a goal later, the app has to record it as it happens: when things were done, notes, reminders. Anything not recorded can't be shown later. Deleting a goal also erases its history, so finished goals may need an "archive" instead of delete.
- **Folders should be linked by id, not by name.** Then renaming a folder doesn't break anything.
- **The web address.** Once the app is installed on phones, changing the address means a new app and an empty data store.
