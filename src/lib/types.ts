export type WorkoutType = "push" | "pull" | "legs" | "full" | "custom";

export interface SetEntry { reps: number; weight: number }
export interface ExerciseEntry { name: string; sets: SetEntry[] }
export interface Workout {
  id: string;
  date: string; // YYYY-MM-DD
  type: WorkoutType;
  name?: string;
  notes?: string;
  planKey?: string; // links to a plan session when logged from the plan
  exercises: ExerciseEntry[];
}
export interface TemplateExercise { name: string; sets: number; reps: number }
export interface Template { id: string; name: string; type: WorkoutType; exercises: TemplateExercise[] }

export interface SwimSession {
  id: string;
  date: string;
  durationMin: number;
  laps: number;
  poolLengthM: number;
  distanceM: number;
  strokes: string[];
  notes?: string;
}
export type SkillLevel = 0 | 1 | 2 | 3;
export interface BodyStat { id: string; date: string; weightKg?: number; waistCm?: number; chestCm?: number; armCm?: number }
export interface Meal { id: string; date: string; name: string; proteinG: number; calories: number }
export interface Settings { proteinTarget: number; theme: "system" | "light" | "dark"; planStart: string; planDays: 3 | 4 }

export interface AppData {
  version: 1;
  workouts: Workout[];
  templates: Template[];
  planDone: Record<string, boolean>;
  swims: SwimSession[];
  skills: Record<string, SkillLevel>;
  body: BodyStat[];
  meals: Meal[];
  settings: Settings;
}
