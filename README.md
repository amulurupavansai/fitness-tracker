# Fit Tracker

A personal gym + swimming tracker. Static Next.js + Tailwind app — **no backend, no account, no tracking**. Everything you log is stored in your browser's `localStorage`, with JSON/CSV export and JSON import for backups.

## Features

- **Gym log** — date, workout type (push / pull / legs / full body / custom), exercises with sets × reps × weight. "Copy last time" per exercise, reusable **templates**, edit/delete history, and **personal records** per exercise (best set and estimated 1RM, with a 🏆 shown when you set a new one).
- **Beginner plan** — 4-week full-body routine, 3 or 4 days/week, that you tick off. Suggested weights follow simple progressive overload: hit every rep of every set → **+2.5 kg** next time; otherwise repeat. "Log this session" pre-fills the gym form.
- **Swimming** — session date, duration, laps × pool length (distance is auto-calculated, editable), strokes practised, notes, a distance chart, and a **skill checklist** (water confidence, breathing, floating, kicking, strokes, safety, milestones) with 4 levels and overall progress.
- **Body stats** — weight, waist, chest, arm with a trend chart per measurement.
- **Nutrition** — simple meal log (approx. protein & calories), daily protein target and progress bar, quick re-add of recent meals.
- **Dashboard** — current/longest streak, workouts per week, volume trend, swim distance trend, weight trend.
- Dark/light mode (follows system, toggle in the header), mobile-first layout with large tap targets and a bottom tab bar.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Production build (static export to `out/`):

```bash
npm run build
```

## Deploy free on Vercel

1. Push this repo to GitHub.
2. In Vercel choose **Add New → Project**, import the repo. Framework preset is detected as Next.js; no environment variables are needed.
3. Deploy. The app is a static export (`output: "export"`), so it runs on the free tier.

Any static host (Netlify, GitHub Pages, Cloudflare Pages) also works — just serve the `out/` folder.

## Where your data lives — and how to back it up

Data is stored **only in the browser and device you use** (key `fitness-tracker:v1` in `localStorage`). It is not synced between phone and laptop, and it is **deleted if you clear site data**, use a private window, or uninstall the browser. So back up regularly:

1. Open the **Data** tab.
2. Tap **Download full backup (JSON)**. Save the file somewhere safe (cloud drive, email to yourself).
3. To restore or move to a new device: open the app there → **Data → Restore** → choose the JSON file. Importing **replaces** the data on that device, so export first if it already holds anything you want to keep.

**CSV export** (workouts by set, swims, body stats, meals) is for spreadsheets only; CSV can't be re-imported — use JSON for backups.

Tip: use the same URL each time (data is tied to the site address), and make a backup after each week of training.

## Notes

- Weights are in **kg**, measurements in **cm**, distances in **metres**.
- The beginner plan and suggested weights are generic starting points, not personalised advice. Start lighter if unsure and focus on form; consider a coach or qualified professional, especially if you have injuries or health conditions.
- Nutrition figures are rough estimates. **Discuss any supplements with a doctor or other qualified professional.**
- If browser storage is unavailable or full, the Data tab shows a warning; export a backup immediately.

## Project layout

```
src/app/*        pages: dashboard, gym, plan, swim, body, nutrition, data
src/lib/*        types, storage (load/save/validate), stats (PRs, streaks), plan, exporters
src/components/* UI primitives, SVG charts, nav, workout form
```
