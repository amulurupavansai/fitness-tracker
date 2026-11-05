"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button, Card, Chip, Empty, Field, NumInput, PageTitle, Progress } from "@/components/ui";
import { LEVELS, SKILLS, STROKES } from "@/lib/swimSkills";
import { LineChart } from "@/components/charts";
import { longDate, shortDate, today, uid } from "@/lib/dates";
import type { SkillLevel, SwimSession } from "@/lib/types";
import { sortByDate } from "@/lib/stats";

const blank = (): SwimSession => ({ id: uid(), date: today(), durationMin: 30, laps: 4, poolLengthM: 25, distanceM: 100, strokes: [], notes: "" });

export default function SwimPage() {
  const { data, update, ready } = useStore();
  const [s, setS] = useState<SwimSession | null>(null);
  if (!ready) return null;

  const patch = (p: Partial<SwimSession>) => setS((cur) => {
    if (!cur) return cur;
    const n = { ...cur, ...p };
    if ("laps" in p || "poolLengthM" in p) n.distanceM = Math.round(n.laps * n.poolLengthM);
    return n;
  });
  const toggle = (st: string) => s && patch({ strokes: s.strokes.includes(st) ? s.strokes.filter((x) => x !== st) : [...s.strokes, st] });
  const sessions = sortByDate(data.swims);
  const level = (id: string) => (data.skills[id] ?? 0) as SkillLevel;
  const score = SKILLS.reduce((t, k) => t + level(k.id), 0);
  const groups = [...new Set(SKILLS.map((k) => k.group))];

  return (
    <>
      <PageTitle>Swimming</PageTitle>
      {s ? (
        <Card title="Log swim session">
          <div className="space-y-4">
            <Field label="Date"><input type="date" value={s.date} onChange={(e) => patch({ date: e.target.value })} /></Field>
            <Field label="Duration (minutes)"><NumInput label="Duration minutes" value={s.durationMin} step={5} onChange={(n) => patch({ durationMin: n })} /></Field>
            <Field label="Laps (one length = one lap)"><NumInput label="Laps" value={s.laps} onChange={(n) => patch({ laps: n })} /></Field>
            <Field label="Pool length (m)"><NumInput label="Pool length" value={s.poolLengthM} step={5} onChange={(n) => patch({ poolLengthM: n })} /></Field>
            <Field label="Distance (m) — auto from laps, editable"><NumInput label="Distance" value={s.distanceM} step={25} onChange={(n) => patch({ distanceM: n })} /></Field>
            <div><label>Strokes practised</label><div className="mt-2 flex flex-wrap gap-2">{STROKES.map((st) => <Chip key={st} active={s.strokes.includes(st)} onClick={() => toggle(st)}>{st}</Chip>)}</div></div>
            <Field label="Notes"><textarea className="py-2" rows={2} value={s.notes ?? ""} onChange={(e) => patch({ notes: e.target.value })} /></Field>
            <div className="flex gap-2">
              <Button onClick={() => { update((d) => ({ ...d, swims: [...d.swims.filter((x) => x.id !== s.id), s] })); setS(null); }}>Save session</Button>
              <Button variant="ghost" onClick={() => setS(null)}>Cancel</Button>
            </div>
          </div>
        </Card>
      ) : <Button className="w-full" onClick={() => setS(blank())}>+ Log swim session</Button>}

      <Card title="Distance per session">
        <LineChart title="Swim distance" unit=" m" data={sessions.slice(-12).map((x) => ({ label: shortDate(x.date), value: x.distanceM }))} />
      </Card>

      <Card title="Skill checklist">
        <p className="mb-2 text-sm text-slate-500">Tap a level for each skill: {LEVELS.join(" → ")}.</p>
        <Progress value={score} max={SKILLS.length * 3} label="Overall swim skill progress" />
        <p className="mb-4 mt-1 text-sm text-slate-500">{Math.round((score / (SKILLS.length * 3)) * 100)}% overall</p>
        {groups.map((g) => (
          <div key={g} className="mb-4">
            <h3 className="mb-2 font-semibold">{g}</h3>
            <ul className="space-y-3">
              {SKILLS.filter((k) => k.group === g).map((k) => (
                <li key={k.id}>
                  <div className="mb-1 text-sm">{k.label}</div>
                  <div className="grid grid-cols-4 gap-1" role="group" aria-label={k.label}>
                    {LEVELS.map((l, i) => (
                      <button key={l} type="button" aria-pressed={level(k.id) === i} onClick={() => update((d) => ({ ...d, skills: { ...d.skills, [k.id]: i as SkillLevel } }))}
                        className={`min-h-12 rounded-lg border px-1 text-xs font-medium ${level(k.id) === i ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 dark:border-slate-700"}`}>{l}</button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Card>

      <Card title="History">
        {sessions.length === 0 ? <Empty>No swim sessions yet.</Empty> : (
          <ul className="space-y-2">
            {[...sessions].reverse().map((x) => (
              <li key={x.id} className="flex items-start justify-between gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <div className="text-sm">
                  <div className="font-medium">{longDate(x.date)}</div>
                  <div>{x.distanceM} m · {x.laps} laps × {x.poolLengthM} m · {x.durationMin} min</div>
                  {x.strokes.length > 0 && <div className="text-slate-500">{x.strokes.join(", ")}</div>}
                  {x.notes && <div className="italic text-slate-500">{x.notes}</div>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" aria-label="Edit swim" onClick={() => setS(x)}>✏️</Button>
                  <Button variant="ghost" aria-label="Delete swim" onClick={() => confirm("Delete this session?") && update((d) => ({ ...d, swims: d.swims.filter((y) => y.id !== x.id) }))}>🗑</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
