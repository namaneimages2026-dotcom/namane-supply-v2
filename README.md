# Namane Supply OS — QR-Powered Customer + Operations Platform

Namane Supply OS is a local-first web app for **Namane Images / Namane Supply** — a Johannesburg CO2 laser cutting and engraving studio.

It combines:

- A **public QR experience layer** for education, services, quoting, internship intake, AI-production explanation, and simulation training.
- An **internal operations layer** for inventory, orders, scan station, sync queue, owner dashboard exports, and local-first workflow control.

## What the app does

### Public pages

- **Home:** “Evolution of Cutting” timeline with CO2-factual explanation and CTA actions.
- **What We Do:** business positioning, services, supported and non-supported materials.
- **Quote:** guided quotation builder with estimate range, readiness score, and risk flags.
- **Learn:** educational laser section with interactive material selector and good-vs-bad file/settings guidance.
- **Internship:** serious training pipeline application form.
- **AI Production:** how AI supports quoting, planning, training, and admin — not direct machine control.
- **Simulation:** “Cut Master: Namane Supply Training Mode” educational fabrication game.
- **Process:** automation workflow and connector-ready mock cards.

### Internal pages

- Inventory
- Orders
- Scan
- Sync
- Dashboard for leads, internships, simulation runs, exports, and clearing local public data

## Architecture

- **Local-first:** operational state is stored in browser local storage through a snapshot store in `src/lib/store.ts`.
- **Offline-capable:** service worker and app manifest are included in `public/sw.js` and `public/manifest.webmanifest`.
- **QR-ready:** item labels can be generated as QR images in-app through the QR-style SVG generator in `src/lib/qr.ts`.
- **Connector-ready:** pluggable connector interface with example adapters for GitHub dispatch and ERP webhook in `src/connectors/index.ts`.
- **GitHub deployable:** Vite static build output can be deployed to GitHub Pages or any static host.

## Functional modules

- Inventory management with low-stock visibility.
- Work order intake and tracking.
- Scan station for stock movements and QR generation.
- Offline sync queue with connector push.
- Public quote, internship, education, simulation, and customer journey capture.

## Run locally

```bash
npm install
npm run dev