"use client";
import { useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { Button, Card, PageTitle } from "@/components/ui";
import { exportCsv, exportJson, readBackup, type CsvKind } from "@/lib/exporters";
import { defaultData } from "@/lib/storage";

export default function DataPage() {
  const { data, replace, ready, saveFailed } = useStore();
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  if (!ready) return null;

  const onFile = async (f?: File) => {
    if (!f) return;
    try {
      const incoming = await readBackup(f);
      const n = incoming.workouts.length + incoming.swims.length + incoming.body.length + incoming.meals.length;
      if (!confirm(`Import ${n} entries? This REPLACES everything currently stored in this browser. Export a backup first if unsure.`)) return;
      replace(incoming);
      setMsg({ ok: true, text: `Imported ${n} entries.` });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Import failed." });
    } finally {
      if (file.current) file.current.value = "";
    }
  };
  const csv: [CsvKind, string][] = [["workouts", "Workouts"], ["swims", "Swims"], ["body", "Body stats"], ["meals", "Meals"]];

  return (
    <>
      <PageTitle>Data &amp; backup</PageTitle>
      {saveFailed && <p role="alert" className="rounded-xl bg-red-100 p-3 text-red-900">Could not save to browser storage (private mode or storage full). Export a backup now.</p>}
      <Card title="Back up">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">Your data lives only in this browser. Download a JSON backup regularly — it contains everything and can be re-imported.</p>
        <Button className="w-full" onClick={() => exportJson(data)}>Download full backup (JSON)</Button>
      </Card>
      <Card title="Restore">
        <input ref={file} type="file" accept="application/json,.json" aria-label="Choose backup file" className="py-2" onChange={(e) => onFile(e.target.files?.[0])} />
        {msg && <p role="status" className={`mt-3 rounded-xl p-3 text-sm ${msg.ok ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"}`}>{msg.text}</p>}
      </Card>
      <Card title="Export CSV (for spreadsheets)">
        <div className="grid grid-cols-2 gap-2">{csv.map(([k, l]) => <Button key={k} variant="ghost" onClick={() => exportCsv(k, data)}>{l}</Button>)}</div>
      </Card>
      <Card title="Reset">
        <Button variant="danger" className="w-full" onClick={() => confirm("Delete ALL data in this browser? This cannot be undone.") && replace(defaultData())}>Delete all data</Button>
      </Card>
    </>
  );
}
