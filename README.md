# Namane Supply — Laser Manufacturing & Training Lab

Market-ready React + TypeScript web application for Namane Supply.

## What this app includes

- Business website for CO2 laser cutting and engraving services
- Education hub for laser theory, safety, materials, maintenance, quoting, and workflow
- Internship hub with operator-readiness pathway
- Interactive Laser Lab simulation game
- Quote system with Namane Supply pricing references
- User dashboard and admin-style operational dashboard

## Namane Supply focus

Namane Supply is a Johannesburg-based CO2 laser cutting and engraving studio focused on non-metal fabrication.

Supported work includes leather tags, patches, acrylic signage, MDF/wood signage, product branding, prototyping, and short-run manufacturing.

Namane Supply does not offer metal cutting, fiber laser, CNC routing, or UV printing.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown in your terminal, usually:

```text
http://localhost:5173
```

## Production build

```bash
npm run build
npm run preview
```

## Tech stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Zustand
- Lucide React

## Notes

This version uses local demo data and client-side state so it can run from a laptop without requiring a backend. The code is structured so Supabase, Firebase, Airtable, or a custom backend can be added later.
