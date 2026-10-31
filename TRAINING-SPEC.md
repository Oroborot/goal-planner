# Training tab spec (approved 2026-10-31)

Visual target: `design/training-reference.webp`. It shows 3 states of ONE screen: left = default, middle = exercise details panel open, right = variations panel open. Match it closely, but build real components (never use the image as a background).

## Style
iOS-like, minimal. Warm white / light beige background, bright orange accent (#EF9F27 or close to the image), soft orange liquid fill, dark text, grey secondary text, rounded cards with soft borders, thin outline icons, lots of white space, system font (SF Pro). Must still work with the app's themes in light and dark mode.

## Top row (no big "Training" title)
- Left: "Round 3 / 15" and "Set 1 / 3" (live values).
- Center: session timer `27:35` + a small ↕ button. Tapping it switches between elapsed time (counting up) and remaining time (counting down from the session length) without restarting.
- Right: gear icon (shared on every tab, opens the gear sheet).

## Big circle timer
- Thin orange ring with a small orange dot at the current position, plus a soft orange liquid fill in the lower part with a gently curved surface. The ring and the liquid both shrink as time runs out.
- Big black `00:32` + smaller grey `.48`. No "of 00:45" and no "Exercise timer" label.
- Exercise example: 45 s, counting down smoothly to 00:00.00.
- Rest uses the same circle with a small orange "Rest" label above the numbers (example 10 s). A longer rest between sets has its own setting. When rest ends, the next exercise starts by itself.
- Always calculate from start timestamps (never count ticks), so the timer stays accurate when the phone sleeps.

## Two cards (side by side, above the buttons)
- Left: "Push-ups" / "Next: Squats" + chevron. Text only, no picture.
- Right: "Variations" / "3 options" + chevron. The count comes from the exercise data.
- Tapping a card opens its bottom panel: rounded white panel, grab handle, title, ✕, dimmed screen behind it, closes with ✕ or a swipe down. The Pause/Skip/+10s buttons stay visible below it.
- Details panel: exercise drawings (2 positions), primary muscles (small body figure + list), numbered instructions.
- Variations panel: scrollable rows, each with a small picture, name, one-line description and chevron. Tapping a row shows its details; it does NOT swap the active exercise.

## Buttons (one row)
- Pause (light grey). Pauses everything and turns into "Resume".
- Skip (orange). During exercise it goes to the next rest; during rest it starts the next exercise.
- +10s (outline). During rest it adds 10 s right away; during exercise it adds 10 s to the coming rest. Taps add up.

## Workout data (mock for now, no editor yet)
- A workout has: exercise time, rest time, rest between sets, session length, and a list of rounds. Each round has an exercise or none (none shows "Freestyle").
- Sets: one sequence of rounds repeated N times (e.g. 10 rounds × 5 sets = 50). The round counter is global; the set counter goes up each time the sequence repeats.
- Keep the data in its own file (e.g. `trainingData.js`), separate from the screens. The data drives everything; never hardcode the 15-round example.

## Placeholders and later work
- **Drawings:** use simple placeholder boxes now. Later the user makes images in ChatGPT and brings them back, one per exercise and variation. Each exercise in the data gets image fields (e.g. `images: { positions: [], muscles: null, thumb: null }`), so real images can be dropped in without code changes.
- **Sound:** none yet. Add one helper (e.g. `sound.js` with `playBeep()` that does nothing yet) and call it where a period ends, so real sound can be plugged in later. iPhone note: sound only works after a first tap, and web apps can't vibrate on iPhone.
- Not in this task: workout editor, exercise library, history/log of workouts, Work/Cookbook/Projects content.
