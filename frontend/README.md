# Frontend

React 19 + TypeScript single-page application built with Vite, Tailwind CSS v4, and shadcn-style components. The interface uses Google OAuth for sign-in and provides inventory, customer, and order screens.

## Local development

Run the Spring Boot API from the repository root, then:

```bash
npm install
npm run dev
```

The Vite server proxies API and OAuth routes to `http://localhost:8080`. No frontend env file is needed for local development.

## Production on Vercel

Use `frontend` as Vercel's Root Directory, `npm run build` as the build command, and `dist` as the output directory. Set this Vercel Production environment variable to the backend origin (no trailing slash and no `/api` path):

```text
VITE_API_BASE_URL=https://your-backend-host.example.com
```

The [`.env.production.example`](.env.production.example) file is a template. Replace its example origin when the backend host is decided. Alternatively, add `VITE_API_BASE_URL` directly in Vercel's project settings. The actual backend URL is intentionally not guessed.

The API client sends cookies for session authentication and CSRF-protected writes. The backend must allow credentialed CORS requests from the Vercel deployment origin and use cross-site session cookies (`SameSite=None; Secure`) when the two hosts are on different sites. Google OAuth redirects to the backend origin, so register the backend's callback URL with Google. Do not store secrets in `VITE_` variables; they are public in the built frontend.

## Project structure

```text
src/
├── api/                 # HTTP client, auth, and order API functions
├── components/
│   ├── auth/            # Login page composition
│   └── ui/              # Shared shadcn-style primitives and sign-in button
├── hooks/               # Auth and inventory state/data orchestration
├── lib/                 # Shared utility functions
├── pages/               # Inventory, customers, and order screens
└── state/               # Cart state
```

The `@/components/ui` alias is configured for shadcn component conventions. Add UI primitives there; keep data fetching and state orchestration in `api/` and `hooks/`.
