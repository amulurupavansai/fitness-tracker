"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button, Card, PageTitle, Progress, Chip } from "@/components/ui";
import { PLAN_DAYS, PLAN_WEEKS, sessionKey, suggestWeight } from "@/lib/plan";
import { WorkoutForm } from "@/components/workoutForm";
import type { Workout } from "@/lib/types";
import { today, uid } from "@/lib/dates";
import { personalRecords } from "@/lib/stats";

export default function PlanPage() {
  const { data, update, ready } = useStore();
  const [logging, setLogging] = useState<{ key: string; w: Workout } | null>(null);
  const [week, setWeek] = useState(1);
  if (!ready) return null;

  const dayCount = data.settings.planDays;
  const days = PLAN_DAYS.slice(0, dayCount === 3 ? 3 : 4);
  const total = PLAN_WEEKS * days.length;
  const done = Object.entries(data.planDone).filter(([k, v]) => v && Number(k.split("-")[0]) <= PLAN_WEEKS && days.some((d) => k.endsWith(`-${d.key}`))).length;

  const lastWeight = (name: string) => {
    const hist = [...data.workouts].sort((a, b) => b.date.localeCompare(a.date)).flatMap((w) => w.exercises).filter((e) => e.name.toLowerCase() === name.toLowerCase());
    return hist[0];
  };
  const target = (name: string, sets: number, reps: number, start: number) => {
    const last = lastWeight(name);
    if (!last) return suggestWeight(undefined, false, start);
    const w = Math.max(...last.sets.map((s) => s.weight));
    const hit = last.sets.length >= sets && last.sets.every((s) => s.reps >= reps);
    return suggestWeight(w, hit, start);
  };
  void personalRecords;

  const startLogging = (key: string, dayKey: string) => {
    const d = days.find((x) => x.key === dayKey)!;
    setLogging({
      key,
      w: { id: uid(), date: today(), type: d.type, name: d.title.split(" — ")[0] + " " + d.title.split(" — ")[1], planKey: key,
        exercises: d.exercises.map((e) => ({ name: e.name, sets: Array.from({ length: e.sets }, () => ({ reps: e.reps, weight: target(e.name, e.sets, e.reps, e.start) })) })) },
    });
  };

  return (
    <>
      <PageTitle>Beginner plan</PageTitle>
      <Card>
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
          A simple full-body routine, {dayCount} days a week for {PLAN_WEEKS} weeks. Rest at least a day between sessions. Start light and keep good form. When you hit every rep of every set, the app suggests <b>+2.5 kg</b> next time (progressive overload); if not, repeat the same weight. Starting weights are only suggestions — begin lighter if unsure.
        </p>
        <div className="flex gap-2" role="group" aria-label="Days per week">
          <Chip active={dayCount === 3} onClick={() => update((d) => ({ ...d, settings: { ...d.settings, planDays: 3 } }))}>3 days / week</Chip>
          <Chip active={dayCount === 4} onClick={() => update((d) => ({ ...d, settings: { ...d.settings, planDays: 4 } }))}>4 days / week</Chip>
        </div>
        <div className="mt-4"><Progress value={done} max={total} label="Plan progress" /><p className="mt-1 text-sm text-slate-500">{done} of {total} sessions done</p></div>
      </Card>

      {logging && (
        <WorkoutForm initial={logging.w} onCancel={() => setLogging(null)}
          onSave={(w) => { update((d) => ({ ...d, workouts: [...d.workouts, w], planDone: { ...d.planDone, [logging.key]: true } })); setLogging(null); }} />
      )}

      <div className="flex flex-wrap gap-2" role="group" aria-label="Week">
        {Array.from({ length: PLAN_WEEKS }, (_, i) => i + 1).map((n) => <Chip key={n} active={week === n} onClick={() => setWeek(n)}>Week {n}</Chip>)}
      </div>

      {days.map((d) => {
        const key = sessionKey(week, d.key);
        const ticked = !!data.planDone[key];
        return (
          <Card key={key} title={d.title}>
            <ul className="mb-3 space-y-1 text-sm">
              {d.exercises.map((e) => {
                const wgt = target(e.name, e.sets, e.reps, e.start);
                return <li key={e.name}><b>{e.name}</b> — {e.sets} × {e.reps}{e.name.includes("(sec)") ? "" : wgt > 0 ? ` @ ~${wgt} kg` : " (bodyweight)"}</li>;
              })}
            </ul>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex min-h-12 items-center gap-3 text-base text-slate-900 dark:text-slate-100">
                <input type="checkbox" checked={ticked} onChange={() => update((x) => ({ ...x, planDone: { ...x.planDone, [key]: !ticked } }))} />
                Done
              </label>
              <Button variant="ghost" onClick={() => startLogging(key, d.key)}>Log this session</Button>
            </div>
          </Card>
        );
      })}
    </>
  );
}
