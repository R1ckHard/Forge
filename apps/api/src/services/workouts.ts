export type WorkoutExercise = {
  name: string;
  detail: string;
  cue: string;
};

export type Workout = {
  durationMin: number;
  focus: string;
  warmup: string;
  exercises: WorkoutExercise[];
  cooldown: string;
};

const WORKOUTS: Record<number, Workout> = {
  1: {
    durationMin: 25,
    focus: 'Build intent and a clean movement baseline',
    warmup: '2 min easy march + arm circles, then 8 bodyweight squats',
    exercises: [
      {
        name: 'Goblet squat pattern',
        detail: '3 × 8',
        cue: 'Chest tall, heels planted, pause 1s at the bottom',
      },
      {
        name: 'Push-up (or incline)',
        detail: '3 × 6–10',
        cue: 'Ribs down, one solid line from head to heels',
      },
      {
        name: 'Hip hinge drill',
        detail: '3 × 8',
        cue: 'Push hips back, soft knees, feel hamstrings',
      },
      {
        name: 'Dead bug',
        detail: '2 × 6/side',
        cue: 'Low back glued to floor, slow exhale',
      },
    ],
    cooldown: '90s box breathing + note one training intention for the week',
  },
  2: {
    durationMin: 30,
    focus: 'Sustainable rhythm and recovery windows',
    warmup: '3 min brisk walk + 10 hip openers each side',
    exercises: [
      {
        name: 'Split squat',
        detail: '3 × 6/leg',
        cue: 'Front shin vertical, light torso lean',
      },
      {
        name: 'Row variation',
        detail: '3 × 8–10',
        cue: 'Pull elbows to ribs, pause at squeeze',
      },
      {
        name: 'Lateral walk / band steps',
        detail: '2 × 12/side',
        cue: 'Soft knees, stay level — no rocking',
      },
      {
        name: 'Farmer carry (or suitcase hold)',
        detail: '3 × 30s',
        cue: 'Tall posture, quiet shoulders',
      },
    ],
    cooldown: '2 min easy walk + 60s stretch for hips/chest. Block one recovery slot on your calendar.',
  },
  3: {
    durationMin: 28,
    focus: 'Progress check — keep what worked, trim noise',
    warmup: '2 min jump rope or shadow steps + 6 slow push-ups',
    exercises: [
      {
        name: 'Best lift from sessions 1–2',
        detail: '4 × 5 quality',
        cue: 'Same cues as before — chase form, not load ego',
      },
      {
        name: 'Single-leg balance reach',
        detail: '2 × 6/leg',
        cue: 'Soft landing of attention; hips square',
      },
      {
        name: 'Core anti-rotation',
        detail: '3 × 20s/side',
        cue: 'Resist twist; breathe through the brace',
      },
      {
        name: 'Finisher: easy cardio',
        detail: '4 min',
        cue: 'Conversational pace — leave one gear in the tank',
      },
    ],
    cooldown: 'Write 3 bullets: what stuck, what to cut, next week’s one focus',
  },
  4: {
    durationMin: 32,
    focus: 'Premium strength — quality load on main patterns',
    warmup: '3 min easy cardio + 2 rounds: inchworm, world’s greatest stretch',
    exercises: [
      {
        name: 'Primary squat or hinge',
        detail: '4 × 5',
        cue: 'Leave 2 reps in reserve; perfect the last rep',
      },
      {
        name: 'Horizontal press',
        detail: '3 × 6–8',
        cue: 'Own the lockout, controlled eccentric',
      },
      {
        name: 'Pull variation',
        detail: '3 × 8',
        cue: 'Full stretch → full squeeze, no shrug',
      },
      {
        name: 'Loaded carry finisher',
        detail: '3 × 40s',
        cue: 'Brace, walk tall, breathe every few steps',
      },
    ],
    cooldown: '2 min walk + note which lift felt strongest today',
  },
  5: {
    durationMin: 30,
    focus: 'Engine work without toasting recovery',
    warmup: '4 min zone-2 pace, nasal breathing if you can',
    exercises: [
      {
        name: 'Bike / row / run intervals',
        detail: '6 × 40s hard / 80s easy',
        cue: 'Hard = strong, not reckless; easy truly easy',
      },
      {
        name: 'Bodyweight circuit',
        detail: '3 rounds',
        cue: '10 squats · 8 push-ups · 12 mountain climbers',
      },
      {
        name: 'Core finisher',
        detail: '2 × 30s',
        cue: 'Hollow or plank — quiet ribs, steady breath',
      },
    ],
    cooldown: '3 min easy flush + hydrate; protect sleep tonight',
  },
  6: {
    durationMin: 35,
    focus: 'Capstone — fuse strength, rhythm, and intent',
    warmup: '5 min mixed prep: hinges, presses, light skips',
    exercises: [
      {
        name: 'Strength complex',
        detail: '3 rounds',
        cue: '5 hinge · 5 press · 5 row — crisp transitions',
      },
      {
        name: 'Conditioning wave',
        detail: '8 min EMOM',
        cue: 'Odd: 8 squats · Even: 6 burpees (or step-backs)',
      },
      {
        name: 'Skill / balance',
        detail: '2 × 45s/side',
        cue: 'Single-leg stance with slow reach',
      },
      {
        name: 'Reflection close',
        detail: '3 min',
        cue: 'Write next month’s one Forge focus',
      },
    ],
    cooldown: 'Breath down to calm. Celebrate the full six-session forge.',
  },
};

/** Deterministic workout for a plan session index (1–6). */
export function workoutForSession(index: number): Workout {
  return WORKOUTS[index] ?? WORKOUTS[1];
}
