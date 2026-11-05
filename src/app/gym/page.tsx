"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button, Card, Empty, PageTitle } from "@/components/ui";
import { WorkoutForm, blankWorkout, fromTemplate } from "@/components/workoutForm";
import type { Workout } from "@/lib/types";
import { longDate } from "@/lib/dates";
import { newPRs, personalRecords, setVolume } from "@/lib/stats";

export default function GymPage() {
  const { data, update, ready } = useStore();
  const [editing, setEditing] = useState<Workout | null>(null);
  const [toast, setToast] = useState("");

  if (!ready) return null;

  const save = (w: Workout) => {
    const others = data.workouts.filter((x) => x.id !== w.id);
    const prs = newPRs(w, others);
    update((d) => ({ ...d, workouts: [...others, w] }));
    setToast(prs.length ? `🏆 New PR: ${prs.join(", ")}` : "Workout saved");
    setEditing(null);
  };
  const prs = personalRecords(data.workouts);
  const sorted = [...data.workouts].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageTitle>Gym</PageTitle>
      {toast && <p role="status" className="rounded-xl bg-emerald-100 p-3 font-medium text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100">{toast}</p>}

      {editing ? (
        <WorkoutForm initial={editing} onSave={save} onCancel={() => setEditing(null)}
          onSaveTemplate={(t) => { update((d) => ({ ...d, templates: [...d.templates, t] })); setToast(`Template “${t.name}” saved`); }} />
      ) : (
        <Button className="w-full" onClick={() => { setToast(""); setEditing(blankWorkout()); }}>+ New workout</Button>
      )}

      <Card title="Templates">
        {data.templates.length === 0 ? <Empty>No templates yet. Use “Save as template” when logging a workout.</Empty> : (
          <ul className="space-y-2">
            {data.templates.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <div><div className="font-medium">{t.name}</div><div className="text-xs text-slate-500">{t.exercises.map((e) => `${e.name} ${e.sets}×${e.reps}`).join(" · ")}</div></div>
                <div className="flex shrink-0 gap-1">
                  <Button onClick={() => { setToast(""); setEditing(fromTemplate(t)); }}>Start</Button>
                  <Button variant="ghost" aria-label={`Delete template ${t.name}`} onClick={() => confirm(`Delete template “${t.name}”?`) && update((d) => ({ ...d, templates: d.templates.filter((x) => x.id !== t.id) }))}>🗑</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Personal records">
        {prs.length === 0 ? <Empty>Log weighted sets to see your PRs.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="text-slate-500"><th className="py-2 pr-2">Exercise</th><th className="pr-2">Best set</th><th className="pr-2">Est. 1RM</th><th>Date</th></tr></thead>
              <tbody>{prs.map((p) => (
                <tr key={p.name} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-2 pr-2 font-medium">{p.name}</td><td className="pr-2">{p.maxWeight} kg × {p.maxWeightReps}</td><td className="pr-2">{p.best1RM.toFixed(1)} kg</td><td>{p.date.slice(5)}</td>
                </tr>))}</tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="History">
        {sorted.length === 0 ? <Empty>No workouts logged yet.</Empty> : (
          <ul className="space-y-2">
            {sorted.map((w) => (
              <li key={w.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium">{longDate(w.date)} · <span className="capitalize">{w.type}</span>{w.name ? ` · ${w.name}` : ""}</div>
                    <div className="text-xs text-slate-500">Volume {Math.round(setVolume(w)).toLocaleString()} kg</div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" aria-label="Edit workout" onClick={() => { setToast(""); setEditing(w); window.scrollTo({ top: 0 }); }}>✏️</Button>
                    <Button variant="ghost" aria-label="Delete workout" onClick={() => confirm("Delete this workout?") && update((d) => ({ ...d, workouts: d.workouts.filter((x) => x.id !== w.id) }))}>🗑</Button>
                  </div>
                </div>
                <ul className="mt-2 space-y-1 text-sm">
                  {w.exercises.map((e, i) => <li key={i}><b>{e.name}</b>: {e.sets.map((s) => `${s.reps}×${s.weight}kg`).join(", ")}</li>)}
                </ul>
                {w.notes && <p className="mt-1 text-sm italic text-slate-500">{w.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
