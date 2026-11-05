import type { AppData, Workout } from "./types";
import { addDays, diffDays, today, weekStart } from "./dates";

export const setVolume = (w: Workout) =>
  w.exercises.reduce((t, e) => t + e.sets.reduce((s, x) => s + (x.reps || 0) * (x.weight || 0), 0), 0);

export const epley = (weight: number, reps: number) => (reps <= 1 ? weight : weight * (1 + reps / 30));

export interface PR { name: string; maxWeight: number; maxWeightReps: number; best1RM: number; date: string }

export function personalRecords(workouts: Workout[]): PR[] {
  const map = new Map<string, PR>();
  for (const w of [...workouts].sort((a, b) => a.date.localeCompare(b.date))) {
    for (const e of w.exercises) {
      const key = e.name.trim().toLowerCase();
      if (!key) continue;
      for (const s of e.sets) {
        if (!(s.weight > 0) || !(s.reps > 0)) continue;
        const cur = map.get(key);
        const orm = epley(s.weight, s.reps);
        if (!cur) map.set(key, { name: e.name.trim(), maxWeight: s.weight, maxWeightReps: s.reps, best1RM: orm, date: w.date });
        else {
          if (s.weight > cur.maxWeight || (s.weight === cur.maxWeight && s.reps > cur.maxWeightReps)) {
            cur.maxWeight = s.weight; cur.maxWeightReps = s.reps; cur.date = w.date;
          }
          if (orm > cur.best1RM) cur.best1RM = orm;
        }
      }
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Which exercises in `w` set a new best (weight or e1RM) compared with all other workouts. */
export function newPRs(w: Workout, others: Workout[]): string[] {
  const before = new Map(personalRecords(others).map((p) => [p.name.toLowerCase(), p]));
  const out: string[] = [];
  for (const e of w.exercises) {
    const p = before.get(e.name.trim().toLowerCase());
    const best = Math.max(0, ...e.sets.filter((s) => s.weight > 0 && s.reps > 0).map((s) => epley(s.weight, s.reps)));
    if (best > 0 && (!p || best > p.best1RM + 0.001) && !out.includes(e.name)) out.push(e.name);
  }
  return out;
}

export function activityDays(d: AppData): string[] {
  return [...new Set([...d.workouts.map((w) => w.date), ...d.swims.map((s) => s.date)])].sort();
}

/** Streak of consecutive days with activity. Today may still be pending (doesn't break the streak). */
export function streaks(days: string[]) {
  const set = new Set(days);
  let current = 0;
  let cursor = set.has(today()) ? today() : addDays(today(), -1);
  while (set.has(cursor)) { current++; cursor = addDays(cursor, -1); }
  let longest = 0, run = 0, prev = "";
  for (const d of days) {
    run = prev && diffDays(d, prev) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = d;
  }
  return { current, longest };
}

export function workoutsPerWeek(workouts: Workout[], weeks = 8) {
  const start = weekStart(today());
  const out: { label: string; value: number }[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const ws = addDays(start, -7 * i);
    const we = addDays(ws, 6);
    out.push({ label: ws.slice(5), value: workouts.filter((w) => w.date >= ws && w.date <= we).length });
  }
  return out;
}

export const sortByDate = <T extends { date: string }>(a: T[]) => [...a].sort((x, y) => x.date.localeCompare(y.date));
