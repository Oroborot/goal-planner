// Mock workout data for the Training tab (there's no workout editor yet).
// The screens only read from here, so changing these numbers changes the
// whole workout: rounds, sets, times and the session length.

// Every exercise the mock workout can use. `images` stays empty until real
// drawings are made; then they can be dropped in without code changes.
// - positions: 2 drawings (start and end position)
// - muscles:   the small body figure
// - thumb:     the small picture in lists
export const EXERCISES = {
  pushups: {
    name: 'Push-ups',
    muscles: ['Chest', 'Shoulders', 'Triceps'],
    instructions: [
      'Start in a high plank position with hands shoulder-width apart.',
      'Lower your body until your chest is near the floor.',
      'Push back up to the starting position.',
    ],
    variations: ['incline-pushups', 'decline-pushups', 'diamond-pushups', 'wide-pushups'],
    images: { positions: [], muscles: null, thumb: null },
  },
  squats: {
    name: 'Squats',
    muscles: ['Quads', 'Glutes', 'Hamstrings'],
    instructions: [
      'Stand with feet shoulder-width apart.',
      'Push your hips back and bend your knees until your thighs are level with the floor.',
      'Push through your heels to stand back up.',
    ],
    variations: ['sumo-squats', 'jump-squats'],
    images: { positions: [], muscles: null, thumb: null },
  },
  lunges: {
    name: 'Lunges',
    muscles: ['Quads', 'Glutes'],
    instructions: [
      'Stand tall with feet hip-width apart.',
      'Step forward and lower until both knees are bent about 90°.',
      'Push back to the start and switch legs.',
    ],
    variations: ['reverse-lunges', 'walking-lunges', 'jump-lunges'],
    images: { positions: [], muscles: null, thumb: null },
  },
  'mountain-climbers': {
    name: 'Mountain climbers',
    muscles: ['Core', 'Shoulders', 'Hip flexors'],
    instructions: [
      'Start in a high plank position.',
      'Drive one knee toward your chest, then switch legs quickly.',
      'Keep your hips low and your back flat.',
    ],
    variations: [],
    images: { positions: [], muscles: null, thumb: null },
  },
}

// Variations: shown in the Variations panel. Tapping one shows its details;
// it doesn't change the exercise in the workout. A variation can have its
// own `muscles` and `instructions`; without them the details show the main
// exercise's muscles and the variation's description.
const noImages = () => ({ positions: [], muscles: null, thumb: null })

export const VARIATIONS = {
  'incline-pushups': { name: 'Incline Push-ups', description: 'Easier variation, great for beginners.', images: noImages() },
  'decline-pushups': { name: 'Decline Push-ups', description: 'More challenging, focuses on upper chest.', images: noImages() },
  'diamond-pushups': { name: 'Diamond Push-ups', description: 'Targets triceps more.', muscles: ['Triceps', 'Chest'], images: noImages() },
  'wide-pushups': { name: 'Wide Push-ups', description: 'Targets chest more.', images: noImages() },
  'sumo-squats': { name: 'Sumo Squats', description: 'Wide stance, more inner thighs.', images: noImages() },
  'jump-squats': { name: 'Jump Squats', description: 'Explosive, raises the heart rate.', images: noImages() },
  'reverse-lunges': { name: 'Reverse Lunges', description: 'Step back instead, easier on the knees.', images: noImages() },
  'walking-lunges': { name: 'Walking Lunges', description: 'Keep moving forward each step.', images: noImages() },
  'jump-lunges': { name: 'Jump Lunges', description: 'Switch legs in the air.', images: noImages() },
}

// The workout. `rounds` is one sequence, repeated `sets` times
// (here 5 rounds × 3 sets = 15 rounds). A round with no exercise
// (exerciseId: null) shows "Freestyle".
// All times are in seconds.
export const WORKOUT = {
  name: 'Full body',
  exerciseSeconds: 45,
  restSeconds: 10,
  setRestSeconds: 60,
  sessionSeconds: 20 * 60,
  sets: 3,
  rounds: [
    { exerciseId: 'pushups' },
    { exerciseId: 'squats' },
    { exerciseId: null },
    { exerciseId: 'lunges' },
    { exerciseId: 'mountain-climbers' },
  ],
}

// The numbers you can change in the Training settings sheet. Until you
// change them, they match the mock workout above.
export const DEFAULT_SETTINGS = {
  roundsPerSet: WORKOUT.rounds.length,
  sets: WORKOUT.sets,
  exerciseSeconds: WORKOUT.exerciseSeconds,
  restSeconds: WORKOUT.restSeconds,
  setRestSeconds: WORKOUT.setRestSeconds,
}

// The workout built from the settings. The exercises come from the mock
// list, repeated if there are more rounds than exercises (exercise picking
// comes in a later round).
export function workoutFrom(settings) {
  // A workout from one of your programs already has its own blocks (older
  // running workouts have rounds instead).
  if (settings.blocks || settings.rounds) return settings
  const rounds = []
  for (let i = 0; i < settings.roundsPerSet; i++) rounds.push(WORKOUT.rounds[i % WORKOUT.rounds.length])
  return { ...WORKOUT, ...settings, rounds }
}
