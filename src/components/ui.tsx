"use client";
import { cloneElement, isValidElement, useId, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from "react";

export function Card({ title, children, action, className = "" }: { title?: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

type Variant = "primary" | "ghost" | "danger";
export function Button({ variant = "primary", className = "", ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const v = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800",
    ghost: "border border-slate-300 bg-transparent hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800",
    danger: "bg-red-600 text-white hover:bg-red-700",
  }[variant];
  return <button type="button" {...p} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-base font-semibold disabled:opacity-50 ${v} ${className}`} />;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  const child = isValidElement(children) ? cloneElement(children as ReactElement<{ id?: string }>, { id }) : children;
  return <div className="space-y-1"><label htmlFor={id}>{label}</label>{child}</div>;
}

export function NumInput({ id, value, onChange, step = 1, min = 0, label, decimals = false }: {
  id?: string; value: number | undefined; onChange: (n: number) => void; step?: number; min?: number; label: string; decimals?: boolean }) {
  const v = value ?? 0;
  const set = (n: number) => onChange(Math.max(min, Math.round(n * 100) / 100));
  return (
    <div className="flex items-center gap-1">
      <button type="button" aria-label={`${label} minus`} onClick={() => set(v - step)} className="h-12 w-12 shrink-0 rounded-xl border border-slate-300 text-2xl dark:border-slate-700">−</button>
      <input id={id} aria-label={label} inputMode={decimals ? "decimal" : "numeric"} className="text-center" value={value === undefined || Number.isNaN(value) ? "" : String(value)}
        onChange={(e) => { const n = parseFloat(e.target.value.replace(",", ".")); onChange(Number.isNaN(n) ? 0 : Math.max(min, n)); }} />
      <button type="button" aria-label={`${label} plus`} onClick={() => set(v + step)} className="h-12 w-12 shrink-0 rounded-xl border border-slate-300 text-2xl dark:border-slate-700">+</button>
    </div>
  );
}

export function Chip({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick}
      className={`min-h-11 rounded-full border px-4 text-sm font-medium ${active ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 dark:border-slate-700"}`}>
      {children}
    </button>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">{children}</p>;
}

export function Progress({ value, max, label }: { value: number; max: number; label?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div role="progressbar" aria-valuenow={Math.round(value)} aria-valuemax={max} aria-label={label} className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="mb-4 text-2xl font-bold">{children}</h1>;
}
