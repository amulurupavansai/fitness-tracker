"use client";
export interface Pt { label: string; value: number }

const W = 320, H = 140, PX = 8, PY = 14;

function scale(vals: number[], zero: boolean) {
  let lo = Math.min(...vals), hi = Math.max(...vals);
  if (zero) lo = Math.min(0, lo);
  if (hi === lo) { hi += 1; lo -= zero ? 0 : 1; }
  return { lo, hi };
}

export function LineChart({ data, unit = "", title }: { data: Pt[]; unit?: string; title: string }) {
  if (data.length === 0) return <p className="text-sm text-slate-500">No data yet.</p>;
  const { lo, hi } = scale(data.map((d) => d.value), false);
  const x = (i: number) => (data.length === 1 ? W / 2 : PX + (i * (W - 2 * PX)) / (data.length - 1));
  const y = (v: number) => H - PY - ((v - lo) / (hi - lo)) * (H - 2 * PY);
  const path = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(" ");
  const last = data[data.length - 1];
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}: latest ${last.value}${unit}`} className="w-full text-emerald-600 dark:text-emerald-400">
        <line x1={PX} x2={W - PX} y1={H - PY} y2={H - PY} className="stroke-slate-300 dark:stroke-slate-700" />
        <path d={path} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => <circle key={i} cx={x(i)} cy={y(d.value)} r="3.5" fill="currentColor" />)}
      </svg>
      <figcaption className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{data[0].label} · {data[0].value}{unit}</span>
        <span>{last.label} · {last.value}{unit}</span>
      </figcaption>
    </figure>
  );
}

export function BarChart({ data, title }: { data: Pt[]; title: string }) {
  if (data.length === 0) return <p className="text-sm text-slate-500">No data yet.</p>;
  const { hi } = scale(data.map((d) => d.value), true);
  const bw = (W - 2 * PX) / data.length;
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title} className="w-full text-emerald-600 dark:text-emerald-400">
        <line x1={PX} x2={W - PX} y1={H - PY} y2={H - PY} className="stroke-slate-300 dark:stroke-slate-700" />
        {data.map((d, i) => {
          const h = (d.value / hi) * (H - 2 * PY);
          return (
            <g key={i}>
              <rect x={PX + i * bw + 4} y={H - PY - h} width={bw - 8} height={Math.max(h, 0)} rx="4" fill="currentColor" />
              <text x={PX + i * bw + bw / 2} y={H - PY - h - 3} textAnchor="middle" fontSize="10" className="fill-slate-600 dark:fill-slate-300">{d.value || ""}</text>
              <text x={PX + i * bw + bw / 2} y={H - 2} textAnchor="middle" fontSize="9" className="fill-slate-500">{d.label}</text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
