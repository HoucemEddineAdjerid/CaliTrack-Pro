
export enum ExerciseType {
  Push = 'Push',
  Pull = 'Pull',
  Leg = 'Leg',
  Core = 'Core'
}

export enum DayOfWeek {
  Mon = 'Mon',
  Tue = 'Tue',
  Wed = 'Wed',
  Thu = 'Thu',
  Fri = 'Fri',
  Sat = 'Sat',
  Sun = 'Sun'
}

export enum PerformanceTag {
  Poor = 'Poor',
  Good = 'Good',
  Outstanding = 'Outstanding'
}

export interface MetricDefinition {
  metric_name: string;
  metric_unit: string;
}

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  metrics: MetricDefinition[];
  TUT_target: number;
  tags: string[];
  optional: boolean;
}

export interface SetLog {
  metrics: Record<string, number>;
  TUT: number;
  performance: PerformanceTag;
  is_assisted?: boolean;
  assistance_weight?: number;
}

export interface WorkoutExercise {
  exercise_id: string;
  sets: SetLog[];
}

export interface Workout {
  id: string;
  name: string;
  exercises: string[]; // IDs of exercises included
  scheduled_days: DayOfWeek[];
}

export interface Milestone {
  id: string;
  name: string;
  criteria: {
    TUT?: number;
    reps?: number;
    exercise_id?: string;
  };
  achieved_date: number | null;
}

export interface UserProfile {
  profile_id: string;
  name: string;
  streak: number;
  last_workout_date: number | null;
}

export interface WorkoutSession {
  id: string;
  workout_id: string;
  date: number;
  duration_seconds: number;
  logs: WorkoutExercise[];
}
