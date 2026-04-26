# Namane Supply OS — QR-Powered Customer + Operations Platform

Namane Supply OS is a local-first web app for **Namane Images / Namane Supply** (Johannesburg CO2 laser cutting and engraving studio).

It combines:
- A **public QR experience layer** (education, services, quoting, internship intake, AI-production explainer, simulation game).
- An **internal operations layer** (inventory, orders, scan station, sync queue, owner dashboard exports).

## What the app does

### Public pages
- **Home:** “Evolution of Cutting” timeline with CO2-factual explanation and CTA actions.
- **What We Do:** business positioning, services, supported/non-supported materials.
- **Quote:** guided quotation builder with estimate range, readiness score, and risk flags.
- **Learn:** educational laser section with interactive material selector and good-vs-bad file/settings guidance.
- **Internship:** serious training pipeline application form.
- **AI Production:** how AI supports quoting/planning/training/admin (not direct machine control).
- **Simulation:** “Cut Master: Namane Supply Training Mode” educational fabrication game.
- **Process:** automation workflow and connector-ready mock cards.

### Internal pages
- Inventory
- Orders
- Scan
- Sync
- Dashboard (leads, internships, simulation runs, exports, clear local public data)

## Run locally

```bash
npm install
npm run dev
```

## QR mode usage

1. Open the app and use the **Public** navigation.
2. Start at `home` for the QR landing story and CTAs.
3. Capture quote/internship/simulation activity locally.

## Export leads and operational CSV

Go to **Internal → dashboard** and export:
- Quote requests CSV
- Internship applications CSV
- Simulation runs CSV

## Replace content or visuals

- Edit business/service/education/simulation content in `src/data/content.ts`.
- Edit seed inventory/order data in `src/data/materials.ts`.
- Edit styles/theme/animations in `src/styles.css`.
- Edit page logic and flows in `src/App.tsx`.

## Connectors and future integrations

- Existing connector stubs are in `src/connectors/index.ts`.
- Queue-based sync events are stored in the snapshot (`src/lib/store.ts`) so future Gmail/Drive/Airtable/etc integrations can push from one place.
- No API keys are required for current V1.

## Deployment options

- Local laptop (offline-capable via local-first data + service worker)
- GitHub Pages (deploy `dist/`)
- Vercel (static deploy)
- Netlify (static deploy)

## Build

```bash
npm run build
```
