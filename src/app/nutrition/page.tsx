"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Button, Card, Empty, Field, NumInput, PageTitle, Progress } from "@/components/ui";
import { addDays, longDate, today, uid } from "@/lib/dates";

export default function NutritionPage() {
  const { data, update, ready } = useStore();
  const [date, setDate] = useState(today());
  const [name, setName] = useState("");
  const [protein, setProtein] = useState(20);
  const [cal, setCal] = useState(300);
  const recent = useMemo(() => {
    const seen = new Map<string, { name: string; proteinG: number; calories: number }>();
    for (const m of [...data.meals].reverse()) if (!seen.has(m.name.toLowerCase())) seen.set(m.name.toLowerCase(), m);
    return [...seen.values()].slice(0, 8);
  }, [data.meals]);
  if (!ready) return null;

  const meals = data.meals.filter((m) => m.date === date);
  const tp = meals.reduce((t, m) => t + m.proteinG, 0);
  const tc = meals.reduce((t, m) => t + m.calories, 0);
  const target = data.settings.proteinTarget;
  const add = (n: string, p: number, c: number) => n.trim() && update((d) => ({ ...d, meals: [...d.meals, { id: uid(), date, name: n.trim(), proteinG: p, calories: c }] }));

  return (
    <>
      <PageTitle>Nutrition</PageTitle>
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Button variant="ghost" aria-label="Previous day" onClick={() => setDate(addDays(date, -1))}>‹</Button>
          <input type="date" aria-label="Date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
          <Button variant="ghost" aria-label="Next day" onClick={() => setDate(addDays(date, 1))}>›</Button>
        </div>
        <div className="mb-1 flex justify-between font-medium"><span>Protein {Math.round(tp)} / {target} g</span><span>{Math.round(tc)} kcal</span></div>
        <Progress value={tp} max={target} label="Protein vs daily target" />
        <div className="mt-4"><Field label="Daily protein target (g)"><NumInput label="Protein target" step={5} value={target} onChange={(n) => update((d) => ({ ...d, settings: { ...d.settings, proteinTarget: n } }))} /></Field></div>
      </Card>

      <Card title="Add meal">
        <div className="space-y-3">
          {recent.length > 0 && (
            <div className="flex flex-wrap gap-2">{recent.map((r) => (
              <Button key={r.name} variant="ghost" className="min-h-11 text-sm" onClick={() => add(r.name, r.proteinG, r.calories)}>+ {r.name}</Button>
            ))}</div>
          )}
          <Field label="Meal (e.g. dal + rice, 3 eggs)"><input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Approx. protein (g)"><NumInput label="Protein grams" step={5} value={protein} onChange={setProtein} /></Field>
          <Field label="Approx. calories"><NumInput label="Calories" step={50} value={cal} onChange={setCal} /></Field>
          <Button className="w-full" disabled={!name.trim()} onClick={() => { add(name, protein, cal); setName(""); }}>Add meal</Button>
        </div>
      </Card>

      <Card title={`Meals — ${longDate(date)}`}>
        {meals.length === 0 ? <Empty>Nothing logged for this day.</Empty> : (
          <ul className="space-y-2">{meals.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <div><div className="font-medium">{m.name}</div><div className="text-sm text-slate-500">{m.proteinG} g protein · {m.calories} kcal</div></div>
              <Button variant="ghost" aria-label={`Delete ${m.name}`} onClick={() => update((d) => ({ ...d, meals: d.meals.filter((x) => x.id !== m.id) }))}>🗑</Button>
            </li>))}</ul>
        )}
      </Card>

      <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
        Figures here are rough estimates, not medical advice. Please discuss any supplements (protein powder, creatine, vitamins, etc.) with a doctor or other qualified professional before using them.
      </p>
    </>
  );
}
