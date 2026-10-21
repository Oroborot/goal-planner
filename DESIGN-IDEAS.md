# Design ideas

A place to collect visual ideas for later. Nothing here is being built yet. Add ideas anytime; we pick from this list during the "Better look" and "More goal views" steps in `PLAN.md`.

## Goal views

### Link view (futuristic)

- Goals shown as glowing dots, connected with smooth, flowing lines, like pictures of AI networks.
- Can flow top to bottom (vertical) or left to right (horizontal).
- Ideas: lines light up or pulse when a goal is done; tapping a goal highlights everything it's connected to.
- Fits goals with several parents well, since any goal can have lines to many others.

### Big tree view

- The trunk is the biggest goal (end goal or year goal).
- Branches are the middle goals (month and week).
- Leaves are the daily goals.
- Ideas: leaves change color or bloom when done; the tree grows fuller as you make progress.
- Open question: a goal with two parents is like a leaf on two branches. Options: show it on one branch with a thin line to the other, or show it on both.

### Table view

- Like a spreadsheet: one row per goal, with columns for timeframe, parent goals, why, done and dates.

## Timer

### Liquid tube timer

- A tube that fills with liquid as time passes (counting up) or drains (counting down).

## Home screen

- Replace "What do you want to do?" under the greeting with an **inspirational quote**, changing each day (or each time the app opens).
- Quote ideas so far (final list decided later; check the exact wording and author of each before using):
  - "Do what you need to do to become what you want to be."
  - "Be offended that someone can take your days and do better." (credited as Seneca; check the source)
- Maybe: let the user add their own quotes, or show their own "why"s as quotes.

## Navigation (decided, not built yet)

- Bottom bar, icons only, no labels: **Home, Calendar, ＋, Goals, Notes**. App opens on Home.
- ＋ is round, slightly bigger than the other icons, in the **theme's accent color** (purple for now). Opens a sheet: Task / Habit / Goal / Note.
- Side menu by swiping from the left edge (no Menu button): Views, Settings, History, Archive, Note categories; later Statistics, Folders, Backup, Help.
- Icons live in one place so they can be swapped for other sets or custom-made icons.

## Focus mode

- One task fills the screen: title, its "why", the timer, Done / Back.
- Room for design: calm visuals (one of the timer looks: liquid, hourglass, dominoes, burning wood), maybe soft background sounds or a sound when time is up.

## Customize (user preferences)

- A **Customize** section (in Settings) where the user picks:
  - which icon set to use (templates made later, or custom icons)
  - colors for everything: background, text, accent, the ＋ button, goal colors, icons
  - font and text size; light or dark
- **Live preview**: a small dummy screen that updates as you pick colors, so you see the result before saving.
- **One-color themes**: everything blue, pink, orange, and so on.
- **Theme templates**: the four seasons (spring, summer, autumn, winter), gold, iridescent, violet, black hole, star rupture.

## Design themes (Constellation, Trail, Vessel)

- Mockups: `design-mockups/index.html` (Home, Goal page, Focus for each).
- Step 1 (built): colors and fonts, light and dark, picked in Settings.
- Step 2a (built): new Home: theme picture on top (sky / climb chart / glass; other themes a "done today" bar), Now box, Today list with "feeds …". Tiles removed.
- Step 2b (next): Focus timer (star ring / contour rings / draining bottle).
- Step 2c (later): goal page chain (stars / climb stages / glasses).

## General look

- To be decided once the app's "vibe" is clear from using it.

## What the visuals need from the data

The visuals are mostly drawing: they show the same saved data in different ways. They're easy to add later as long as the app records:

- each goal's timeframe (decides trunk, branch or leaf)
- the links between goals (the lines)
- done or not, and when (colors, glowing, blooming)
- the "why" (shown when you tap a goal)
- timer sessions and reminders, once those exist

## New ideas

-  I want to have different timer visuals, like stacking dominoes, like sand in an hourglass, like liquid in a bottle and like a piece of wood burning turning black by the minute.
-  
