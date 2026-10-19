# Prompt for the next session

Copy everything inside the box below into a new Claude Code session opened on this project folder.

```text
We're continuing my Goal Planner app. Project folder: C:\Users\gavri\Documents\Projects\goal-planner (Windows, React + Vite, deployed on Vercel from GitHub Oroborot/goal-planner). Work on branch feature/save-and-timeframes; `main` is the live version installed on my iPhone as a home-screen app (PWA).

FIRST, before anything else:
1. Read PLAN.md fully (main purpose, "How we work", "Design decision process", build steps, "Maybe remove later", "Hard to change later") and DESIGN-IDEAS.md.
2. Run `git status` and `git log --oneline -5` and tell me in 2–3 lines where things stand (anything uncommitted?).
3. Then propose the next step and WAIT for my OK. Don't write code yet.

HOW TO WORK WITH ME (important):
- I'm a beginner. Answer short and to the point, caveman style, no fluff. Same information, fewer words.
- Before building: say in a few plain lines what you'll change, plus time, difficulty and cost. Warn me before big/hard steps and before anything that costs money (servers, databases, AI, app stores). I don't want to pay for anything for now.
- Any design choice: follow the Design decision process in PLAN.md. Name 2–3 real apps I can check first (or a quick sketch if none exist), and let me pick. Don't build something just to see if I like it.
- Work in small steps (my usage limit runs out fast). Finish and test one small piece at a time.
- After every finished step: tell me exactly how to test it, and END your message with the link http://localhost:5173. Then give me the exact git commands to save (git add / git commit -m "..." / git push), one command per code block. I run git myself in the VS Code terminal.
- Tell me where each step happens (VS Code, terminal, browser, GitHub, Vercel) and what I should see.
- When I confirm a step works, tick it in PLAN.md.
- New ideas I mention go into PLAN.md or DESIGN-IDEAS.md; things that might be removed later go in PLAN.md → "Maybe remove later".

TECH NOTES (for you, Claude):
- Data is in localStorage: 'planner-items' (goals, notes, categories; `list` field tells which), 'planner-events' (history log), 'planner-timer'. All data is test data until the last stage, so no migration code is needed; just clear it.
- Every change goes through `apply({ items, events })` in App.jsx. Actions live in goalActions.js, noteActions.js, categoryActions.js and return { items, events } so everything is recorded in the history log. Deleting hides (deletedAt), never erases.
- Routing is by the hash in the address (#goals, #goal/<id>, #notes, #note/<id>, #day/<date>, #week/<monday>, #month/<yyyy-mm>, #history, #archive, #views, #settings). Home = no hash.
- Key files: App.jsx (state, routes, timer, bottom bar, side menu), GoalsScreen/GoalPage/GoalEditForm, NotesScreen/NotePage/NoteEditForm, DayPage/WeekPage/MonthPage/DayList/ViewSwitch, calendar.js, repeat.js, progress.js, history.js, colors.js, timer.js, icons.jsx (all icons in one place), BottomBar.jsx, AddSheet.jsx, SideMenu.jsx, MenuPages.jsx, App.css.
- Check with `npm run lint` and `npm run build`. Test in the browser at phone size (375×812) by setting localStorage test data, then clear it afterwards.
- Quirks: the Vite dev server sometimes serves a stale file after edits. Touch the files (set LastWriteTime) and reload if something looks old. Python isn't installed; use PowerShell or Node. When rewriting files from PowerShell, use UTF-8 without BOM (the code has characters like ＋ ✎ ✕).
- To update my phone: merge the branch into main (git checkout main / git merge feature/save-and-timeframes / git push / git checkout feature/save-and-timeframes). Vercel rebuilds; the PWA updates itself.

OPEN QUESTION to ask me once: repeating goals show "N in a row" (a streak), but PLAN.md lists "streak scoring" as not wanted. Keep it as plain info or remove it?

LIKELY NEXT STEPS (let me choose):
- History cleanup: delete single history entries or all of it, with confirmation (~45 min, easy).
- "What now" popup + time windows, chains, importance (core idea, big: several sessions, hard). Do the design process first.
- Goal tree view, simple version (~60 min, medium).
- Postponed: one-tap "move task to another day", Backup (export/import file), Customize/themes, notifications (need a server).
```
