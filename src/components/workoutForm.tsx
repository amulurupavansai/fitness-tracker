"use client";
import { useMemo, useState } from "react";
import type { ExerciseEntry, Template, Workout, WorkoutType } from "@/lib/types";
import { Button, Card, Chip, Field, NumInput } from "./ui";
import { today, uid } from "@/lib/dates";
import { useStore } from "@/lib/store";

export const TYPES: { id: WorkoutType; label: string }[] = [
  { id: "push", label: "Push" }, { id: "pull", label: "Pull" }, { id: "legs", label: "Legs" },
  { id: "full", label: "Full body" }, { id: "custom", label: "Custom" },
];

export function blankWorkout(): Workout {
  return { id: uid(), date: today(), type: "full", exercises: [{ name: "", sets: [{ reps: 8, weight: 0 }] }] };
}
export function fromTemplate(t: Template): Workout {
  return {
    id: uid(), date: today(), type: t.type, name: t.name,
    exercises: t.exercises.map((e) => ({ name: e.name, sets: Array.from({ length: e.sets }, () => ({ reps: e.reps, weight: 0 })) })),
  };
}

export function WorkoutForm({ initial, onSave, onCancel, onSaveTemplate }: {
  initial: Workout; onSave: (w: Workout) => void; onCancel: () => void; onSaveTemplate?: (t: Template) => void;
}) {
  const { data } = useStore();
  const [w, setW] = useState<Workout>(initial);
  const names = useMemo(() => [...new Set(data.workouts.flatMap((x) => x.exercises.map((e) => e.name.trim())).filter(Boolean))].sort(), [data.workouts]);

  const setEx = (i: number, fn: (e: ExerciseEntry) => ExerciseEntry) =>
    setW((cur) => ({ ...cur, exercises: cur.exercises.map((e, j) => (j === i ? fn(e) : e)) }));

  const copyLast = (i: number) => {
    const name = w.exercises[i].name.trim().toLowerCase();
    const prev = [...data.workouts].filter((x) => x.id !== w.id).sort((a, b) => b.date.localeCompare(a.date))
      .flatMap((x) => x.exercises).find((e) => e.name.trim().toLowerCase() === name);
    if (prev) setEx(i, (e) => ({ ...e, sets: prev.sets.map((s) => ({ ...s })) }));
  };

  const cleaned = (): Workout => ({
    ...w,
    exercises: w.exercises.filter((e) => e.name.trim()).map((e) => ({ ...e, name: e.name.trim(), sets: e.sets.filter((s) => s.reps > 0) })).filter((e) => e.sets.length),
  });
  const valid = cleaned().exercises.length > 0;

  return (
    <Card title={initial.name || "Log workout"}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date"><input type="date" value={w.date} onChange={(e) => setW({ ...w, date: e.target.value })} /></Field>
          <Field label="Name (optional)"><input value={w.name ?? ""} onChange={(e) => setW({ ...w, name: e.target.value })} placeholder="e.g. Upper A" /></Field>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Workout type">
          {TYPES.map((t) => <Chip key={t.id} active={w.type === t.id} onClick={() => setW({ ...w, type: t.id })}>{t.label}</Chip>)}
        </div>
        <datalist id="exercise-names">{names.map((n) => <option key={n} value={n} />)}</datalist>

        {w.exercises.map((ex, i) => (
          <div key={i} className="space-y-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <div className="flex gap-2">
              <input list="exercise-names" aria-label={`Exercise ${i + 1} name`} placeholder="Exercise name" value={ex.name} onChange={(e) => setEx(i, (x) => ({ ...x, name: e.target.value }))} />
              <Button variant="ghost" aria-label={`Remove exercise ${i + 1}`} onClick={() => setW({ ...w, exercises: w.exercises.filter((_, j) => j !== i) })}>✕</Button>
            </div>
            {ex.sets.map((s, k) => (
              <div key={k} className="space-y-1">
                <div className="flex items-center justify-between text-sm font-medium text-slate-500">
                  <span>Set {k + 1}</span>
                  {ex.sets.length > 1 && <button type="button" className="min-h-11 px-2 text-red-600" onClick={() => setEx(i, (x) => ({ ...x, sets: x.sets.filter((_, m) => m !== k) }))}>Remove</button>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <NumInput label={`Set ${k + 1} reps`} value={s.reps} onChange={(n) => setEx(i, (x) => ({ ...x, sets: x.sets.map((y, m) => (m === k ? { ...y, reps: n } : y)) }))} />
                  <NumInput label={`Set ${k + 1} weight kg`} decimals step={2.5} value={s.weight} onChange={(n) => setEx(i, (x) => ({ ...x, sets: x.sets.map((y, m) => (m === k ? { ...y, weight: n } : y)) }))} />
                </div>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => setEx(i, (x) => ({ ...x, sets: [...x.sets, { ...(x.sets[x.sets.length - 1] ?? { reps: 8, weight: 0 }) }] }))}>+ Add set</Button>
              <Button variant="ghost" onClick={() => copyLast(i)}>Copy last time</Button>
            </div>
          </div>
        ))}
        <Button variant="ghost" className="w-full" onClick={() => setW({ ...w, exercises: [...w.exercises, { name: "", sets: [{ reps: 8, weight: 0 }] }] })}>+ Add exercise</Button>
        <Field label="Notes"><textarea className="py-2" rows={2} value={w.notes ?? ""} onChange={(e) => setW({ ...w, notes: e.target.value })} /></Field>

        <div className="flex flex-wrap gap-2">
          <Button disabled={!valid} onClick={() => onSave(cleaned())}>Save workout</Button>
          {onSaveTemplate && (
            <Button variant="ghost" disabled={!valid} onClick={() => {
              const c = cleaned();
              const name = (c.name || prompt("Template name?", `${c.type} workout`) || "").trim();
              if (!name) return;
              onSaveTemplate({ id: uid(), name, type: c.type, exercises: c.exercises.map((e) => ({ name: e.name, sets: e.sets.length, reps: e.sets[0].reps })) });
            }}>Save as template</Button>
          )}
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </Card>
  );
}
