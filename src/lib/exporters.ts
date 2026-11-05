import type { AppData } from "./types";
import { normalize } from "./storage";
import { today } from "./dates";

export function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const esc = (v: unknown) => {
  let s = v === undefined || v === null ? "" : String(v);
  if (/^[=+\-@]/.test(s)) s = "'" + s; // avoid spreadsheet formula injection
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCsv = (header: string[], rows: unknown[][]) => [header, ...rows].map((r) => r.map(esc).join(",")).join("\n");

export type CsvKind = "workouts" | "swims" | "body" | "meals";

export function csvFor(kind: CsvKind, d: AppData): string {
  switch (kind) {
    case "workouts":
      return toCsv(
        ["date", "type", "workout_name", "exercise", "set", "reps", "weight_kg", "notes"],
        d.workouts.flatMap((w) =>
          w.exercises.flatMap((e) => e.sets.map((s, i) => [w.date, w.type, w.name, e.name, i + 1, s.reps, s.weight, w.notes])),
        ),
      );
    case "swims":
      return toCsv(
        ["date", "duration_min", "laps", "pool_length_m", "distance_m", "strokes", "notes"],
        d.swims.map((s) => [s.date, s.durationMin, s.laps, s.poolLengthM, s.distanceM, s.strokes.join("; "), s.notes]),
      );
    case "body":
      return toCsv(["date", "weight_kg", "waist_cm", "chest_cm", "arm_cm"], d.body.map((b) => [b.date, b.weightKg, b.waistCm, b.chestCm, b.armCm]));
    case "meals":
      return toCsv(["date", "meal", "protein_g", "calories"], d.meals.map((m) => [m.date, m.name, m.proteinG, m.calories]));
  }
}

export const exportJson = (d: AppData) => download(`fitness-backup-${today()}.json`, JSON.stringify(d, null, 2), "application/json");
export const exportCsv = (kind: CsvKind, d: AppData) => download(`fitness-${kind}-${today()}.csv`, csvFor(kind, d), "text/csv");

export async function readBackup(file: File): Promise<AppData> {
  const text = await file.text();
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { throw new Error("That file is not valid JSON."); }
  return normalize(parsed);
}
