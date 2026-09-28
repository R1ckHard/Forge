export type SessionStatus = 'locked' | 'open' | 'completed';

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

export type PlanSession = {
  id: string;
  index: number;
  title: string;
  summary: string;
  status: SessionStatus;
  completedAt: string | null;
  tier: 'free' | 'premium';
  workout?: Workout;
};

export type PlanResponse = {
  sessions: PlanSession[];
  nextSessionId: string | null;
};

export type CompleteSessionResponse = {
  session: PlanSession;
  sessions: PlanSession[];
  nextSessionId: string | null;
  unlocked: {
    id: string;
    index: number;
    title: string;
    status: SessionStatus;
  } | null;
};
