"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, PageTitle } from "@/components/ui";
import { BarChart, LineChart } from "@/components/charts";
import { activityDays, setVolume, sortByDate, streaks, workoutsPerWeek } from "@/lib/stats";
import { shortDate, today } from "@/lib/dates";

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-xl bg-slate-100 p-3 text-center dark:bg-slate-800"><div className="text-2xl font-bold">{value}</div><div className="text-xs text-slate-500 dark:text-slate-400">{label}</div></div>;
}

export default function Dashboard() {
  const { data, ready } = useStore();
  if (!ready) return null;
  const { current, longest } = streaks(activityDays(data));
  const weeks = workoutsPerWeek(data.workouts, 8);
  const vol = sortByDate(data.workouts).slice(-12).map((w) => ({ label: shortDate(w.date), value: Math.round(setVolume(w)) }));
  const swim = sortByDate(data.swims).slice(-12).map((s) => ({ label: shortDate(s.date), value: s.distanceM }));
  const wt = sortByDate(data.body).filter((b) => b.weightKg !== undefined).slice(-20).map((b) => ({ label: shortDate(b.date), value: b.weightKg as number }));
  const protein = data.meals.filter((m) => m.date === today()).reduce((t, m) => t + m.proteinG, 0);
  const empty = !data.workouts.length && !data.swims.length && !data.body.length && !data.meals.length;

  return (
    <>
      <PageTitle>Dashboard</PageTitle>
      {empty && (
        <Card><p>Welcome! Everything you log is stored privately in this browser. Start with <Link className="font-semibold text-emerald-600 underline" href="/plan/">the beginner plan</Link> or <Link className="font-semibold text-emerald-600 underline" href="/gym/">log a workout</Link>. Back up often from the <Link className="font-semibold text-emerald-600 underline" href="/data/">Data</Link> tab.</p></Card>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Day streak" value={`${current} 🔥`} />
        <Stat label="Longest streak" value={longest} />
        <Stat label="This week" value={weeks[weeks.length - 1].value} />
        <Stat label="Protein today" value={`${Math.round(protein)}/${data.settings.proteinTarget}g`} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Link href="/gym/" className="flex min-h-14 items-center justify-center rounded-xl bg-emerald-600 font-semibold text-white">+ Workout</Link>
        <Link href="/swim/" className="flex min-h-14 items-center justify-center rounded-xl bg-sky-600 font-semibold text-white">+ Swim</Link>
      </div>
      <Card title="Workouts per week"><BarChart title="Workouts per week, last 8 weeks" data={weeks} /></Card>
      <Card title="Volume per workout (kg)"><LineChart title="Training volume" unit=" kg" data={vol} /></Card>
      <Card title="Swim distance (m)"><LineChart title="Swim distance" unit=" m" data={swim} /></Card>
      <Card title="Weight (kg)"><LineChart title="Body weight" unit=" kg" data={wt} /></Card>
    </>
  );
}
