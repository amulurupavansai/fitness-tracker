"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

const LINKS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/gym/", label: "Gym", icon: "🏋️" },
  { href: "/plan/", label: "Plan", icon: "📋" },
  { href: "/swim/", label: "Swim", icon: "🏊" },
  { href: "/body/", label: "Body", icon: "📏" },
  { href: "/nutrition/", label: "Food", icon: "🍗" },
  { href: "/data/", label: "Data", icon: "💾" },
];

export function Nav() {
  const path = usePathname() || "/";
  const { data, update } = useStore();
  const isActive = (h: string) => (h === "/" ? path === "/" : path.startsWith(h.replace(/\/$/, "")));
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    const sync = () => setDark(el.classList.contains("dark"));
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, [data.settings.theme]);
  const toggle = () => update((d) => ({ ...d, settings: { ...d.settings, theme: dark ? "light" : "dark" } }));
  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <span className="text-lg font-bold">💪 Fit Tracker</span>
        <button onClick={toggle} aria-label="Toggle dark mode" className="h-12 w-12 rounded-xl text-xl hover:bg-slate-100 dark:hover:bg-slate-800">{dark ? "☀️" : "🌙"}</button>
      </header>
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-20 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-slate-800 dark:bg-slate-950 md:static md:border-b md:border-t-0">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} aria-current={isActive(l.href) ? "page" : undefined}
            className={`flex min-h-14 flex-1 flex-col items-center justify-center text-xs font-medium md:flex-row md:gap-2 md:text-sm ${isActive(l.href) ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"}`}>
            <span className="text-xl" aria-hidden>{l.icon}</span>{l.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
