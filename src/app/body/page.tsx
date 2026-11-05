"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button, Card, Empty, Field, PageTitle } from "@/components/ui";
import { LineChart } from "@/components/charts";
import { longDate, shortDate, today, uid } from "@/lib/dates";
import { sortByDate } from "@/lib/stats";
import type { BodyStat } from "@/lib/types";

const METRICS: { key: keyof Omit<BodyStat, "id" | "date">; label: string; unit: string }[] = [
  { key: "weightKg", label: "Weight", unit: " kg" }, { key: "waistCm", label: "Waist", unit: " cm" },
  { key: "chestCm", label: "Chest", unit: " cm" }, { key: "armCm", label: "Arm", unit: " cm" },
];

export default function BodyPage() {
  const { data, update, ready } = useStore();
  const [date, setDate] = useState(today());
  const [vals, setVals] = useState<Record<string, string>>({});
  if (!ready) return null;
  const rows = sortByDate(data.body);

  const add = () => {
    const entry: BodyStat = { id: uid(), date };
    let any = false;
    for (const m of METRICS) {
      const n = parseFloat((vals[m.key] ?? "").replace(",", "."));
      if (!Number.isNaN(n) && n > 0) { entry[m.key] = n; any = true; }
    }
    if (!any) return;
    update((d) => ({ ...d, body: [...d.body, entry] }));
    setVals({});
  };

  return (
    <>
      <PageTitle>Body stats</PageTitle>
      <Card title="Add measurement">
        <div className="space-y-3">
          <Field label="Date"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            {METRICS.map((m) => (
              <Field key={m.key} label={`${m.label} (${m.unit.trim()})`}>
                <input inputMode="decimal" placeholder="—" value={vals[m.key] ?? ""} onChange={(e) => setVals({ ...vals, [m.key]: e.target.value })} />
              </Field>
            ))}
          </div>
          <Button className="w-full" onClick={add}>Save measurement</Button>
        </div>
      </Card>
      {METRICS.map((m) => {
        const pts = rows.filter((r) => r[m.key] !== undefined).map((r) => ({ label: shortDate(r.date), value: r[m.key] as number }));
        const delta = pts.length > 1 ? pts[pts.length - 1].value - pts[0].value : null;
        return (
          <Card key={m.key} title={m.label} action={delta !== null ? <span className="text-sm text-slate-500">{delta > 0 ? "+" : ""}{delta.toFixed(1)}{m.unit} since first</span> : undefined}>
            <LineChart title={m.label} unit={m.unit} data={pts} />
          </Card>
        );
      })}
      <Card title="History">
        {rows.length === 0 ? <Empty>No measurements yet.</Empty> : (
          <ul className="space-y-2">
            {[...rows].reverse().map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700">
                <div><div className="font-medium">{longDate(r.date)}</div><div>{METRICS.filter((m) => r[m.key] !== undefined).map((m) => `${m.label} ${r[m.key]}${m.unit}`).join(" · ")}</div></div>
                <Button variant="ghost" aria-label="Delete measurement" onClick={() => confirm("Delete this entry?") && update((d) => ({ ...d, body: d.body.filter((x) => x.id !== r.id) }))}>🗑</Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
