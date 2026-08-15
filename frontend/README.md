# DSS-MIP Frontend

Next.js 14 (App Router) + React 18 + TypeScript frontend for the DSS-MIP
decision support system. Hosted on Vercel; talks to the FastAPI backend on
Render over CORS-enabled JSON.

## Getting started

```bash
npm install
npm run dev
```

In dev mode the app calls `http://localhost:8000`. To point it at a different
API, create `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

In production builds the client defaults to `https://dss-mip.onrender.com`
unless `NEXT_PUBLIC_API_BASE_URL` is set (e.g. in the Vercel project env).

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Development server on :3000 |
| `npm run build` | Lint + type-check + production build |
| `npm run lint` | ESLint only |
| `npm start` | Serve the production build |

## Structure

```
src/
├── app/            # Routes: / (landing), /login, /dashboard, /simulate, /models
├── components/     # UI kit, custom SVG charts, forms, report, landing sections
├── lib/            # Typed API client + utilities
└── types/          # Shared TypeScript contracts (mirror the Pydantic schemas)
```
