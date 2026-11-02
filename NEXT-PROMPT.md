# Round 1 prompt (copy everything below the line into a new chat)

Start a new chat in `goal-planner`. Model: Sonnet is enough (small fixes).

---

Read `CLAUDE.md`, then `src/App.css` (the `.training` and `body:has(.training)` rules), `src/WorkPanels.jsx` (`FinishSheet`, `GainsField`), `src/TrainingScreen.jsx`, `src/training.js` and `src/trainingData.js`.

**Where we are:** Training and Work tabs are live on my phone. There are uncommitted changes in the working folder (a no-scroll fix in `App.css`, `REQUESTS.md`, `PLAN.md`, this file). I'm starting to use the app for real now, so saved data matters: keep any change to saved data **additive** (new fields with defaults, never rename or remove), and remind me to use the Backup screen.

**Round 1: four small jobs. Do them in this order, one finished and tested at a time.**

1. **No scroll (Training and Work).** On my iPhone the screen still scrolls and bounces about 1 cm, and the rounds/sets in the top left move with it. A fix is already in `App.css` (the screen fits exactly, the page adds no extra top space). Keep it, and also stop the rubber-band bounce (`overscroll-behavior: none`, and check it works when the app is installed on the home screen). Test with a simulated notch and home bar (body padding 47px top, 34px bottom) at 375x812: scroll height must equal the window height on both tabs.

2. **Gains: collapsed and reordered.** In the end-of-session sheet (Work), Gains must be collapsed by default: one small "+ Gains" row I tap to open. Inside, the kinds are in this order: **Item, Number, Money** (Item selected first). Don't touch Note or Goal progress.

3. **Restart (Training).** Add a way to restart the workout from the beginning, both during a workout and after it ends (today only "Again" shows at the end). Needs a confirm so I don't lose a session by accident. Keep the three-button layout; put Restart where it fits best and tell me where.

4. **Edit rounds, sets and times (Training).** A small settings sheet on the Training tab to change: rounds per set, number of sets, exercise seconds, rest seconds, set-rest seconds. Saved on the phone, used instead of the mock numbers in `trainingData.js`. Keep it simple: plain number fields, no exercise picking yet (that's a later round). Changing it must not break a running workout (apply from the next start, or ask me).

5. **Backup check.** Look at `backup.js` and `BackupSection.jsx`: does the backup file include the Work data (`planner-work-sessions`, `planner-work-projects`, `planner-work-prefs`, `planner-work-active`) and the Training data? If not, add them. Tell me the answer in one line.

**Rules:** theme colors only (no hardcoded orange), same look as the rest of the Training tab, plain-English comments, don't touch Cookbook or Projects. Don't add schedules, photos or a workout builder (later rounds).

After each job: tell me how to test it, end with http://localhost:5173, then ask "Save and upload?". Run `npm run lint` and `npm run build` before asking.

**Round 2 comes after this (do not start it):** Training time shows in "This week" as saved sessions, a manual "Log time" button, and Training as a built-in category next to my Work projects.
