import type { AppData } from "./types";
import { today } from "./dates";

export const STORAGE_KEY = "fitness-tracker:v1";

export const defaultData = (): AppData => ({
  version: 1,
  workouts: [],
  templates: [],
  planDone: {},
  swims: [],
  skills: {},
  body: [],
  meals: [],
  settings: { proteinTarget: 100, theme: "system", planStart: today(), planDays: 3 },
});

const arr = (v: unknown) => (Array.isArray(v) ? v : []);
const obj = (v: unknown) => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, never>) : {});

/** Coerce arbitrary parsed JSON into a valid AppData; throws if it clearly isn't one. */
export function normalize(raw: unknown): AppData {
  if (!raw || typeof raw !== "object") throw new Error("File is not a valid backup.");
  const r = raw as Record<string, unknown>;
  const known = ["workouts", "templates", "swims", "body", "meals", "settings", "skills", "planDone"];
  if (!known.some((k) => k in r)) throw new Error("No fitness tracker data found in this file.");
  const d = defaultData();
  return {
    version: 1,
    workouts: arr(r.workouts) as AppData["workouts"],
    templates: arr(r.templates) as AppData["templates"],
    planDone: obj(r.planDone) as AppData["planDone"],
    swims: arr(r.swims) as AppData["swims"],
    skills: obj(r.skills) as AppData["skills"],
    body: arr(r.body) as AppData["body"],
    meals: arr(r.meals) as AppData["meals"],
    settings: { ...d.settings, ...obj(r.settings) },
  };
}

export function load(): AppData {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return normalize(JSON.parse(s));
  } catch {
    /* fall through to defaults */
  }
  return defaultData();
}

export function save(data: AppData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
