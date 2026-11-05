import type { WorkoutType } from "./types";

export interface PlanExercise { name: string; sets: number; reps: number; start: number } // start weight kg
export interface PlanDay { key: string; title: string; type: WorkoutType; exercises: PlanExercise[] }

const A: PlanExercise[] = [
  { name: "Squat", sets: 3, reps: 8, start: 20 },
  { name: "Bench Press", sets: 3, reps: 8, start: 20 },
  { name: "Barbell Row", sets: 3, reps: 8, start: 20 },
  { name: "Plank (sec)", sets: 3, reps: 30, start: 0 },
];
const B: PlanExercise[] = [
  { name: "Deadlift", sets: 3, reps: 5, start: 30 },
  { name: "Overhead Press", sets: 3, reps: 8, start: 15 },
  { name: "Lat Pulldown", sets: 3, reps: 10, start: 25 },
  { name: "Dumbbell Curl", sets: 2, reps: 12, start: 5 },
];
const C: PlanExercise[] = [
  { name: "Leg Press", sets: 3, reps: 10, start: 40 },
  { name: "Incline Dumbbell Press", sets: 3, reps: 10, start: 8 },
  { name: "Seated Cable Row", sets: 3, reps: 10, start: 25 },
  { name: "Triceps Pushdown", sets: 2, reps: 12, start: 15 },
];
const D: PlanExercise[] = [
  { name: "Romanian Deadlift", sets: 3, reps: 8, start: 25 },
  { name: "Lunges", sets: 3, reps: 10, start: 0 },
  { name: "Face Pull", sets: 3, reps: 12, start: 10 },
  { name: "Calf Raise", sets: 3, reps: 12, start: 20 },
];

export const PLAN_DAYS: PlanDay[] = [
  { key: "A", title: "Day A — Full body (squat focus)", type: "full", exercises: A },
  { key: "B", title: "Day B — Full body (deadlift focus)", type: "full", exercises: B },
  { key: "C", title: "Day C — Full body (volume)", type: "full", exercises: C },
  { key: "D", title: "Day D — Legs & posture (optional)", type: "legs", exercises: D },
];
export const PLAN_WEEKS = 4;
export const sessionKey = (week: number, day: string) => `${week}-${day}`;

/** Progressive overload: if every set hit the target reps last time, add weight; otherwise repeat. */
export function suggestWeight(lastWeight: number | undefined, allSetsHit: boolean, start: number): number {
  if (lastWeight === undefined || lastWeight <= 0) return start;
  return allSetsHit ? Math.round((lastWeight + 2.5) * 2) / 2 : lastWeight;
}
