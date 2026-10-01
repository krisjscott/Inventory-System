# Inventory System

Inventory System is a React + TypeScript frontend backed by a Spring Boot API. It supports Google sign-in and inventory, customer, and order workflows. The frontend is deployed separately from the API, so production requires a backend host and a configured API origin.

## Run locally

Start the Spring Boot API from the repository root:

```bash
mvn spring-boot:run
```

In a second terminal, start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>. The Vite development server proxies `/api`, `/oauth2`, and `/login` to `http://localhost:8080`; `VITE_API_BASE_URL` is not needed for local development.

## Deploy the frontend to Vercel

Create a Vercel project with `frontend` as its Root Directory. Use:

- Build command: `npm run build`
- Output directory: `dist`
- Framework preset: Vite

Add `VITE_API_BASE_URL` as a Vercel Production environment variable, set to the backend origin only (for example, `https://api.example.com`, with no `/api` suffix). The backend host has not been selected yet, so this value must be supplied before production deployment. See [`frontend/.env.production.example`](frontend/.env.production.example).

The backend must allow credentialed CORS requests from the deployed Vercel origin, use cross-site session cookies (`SameSite=None; Secure`) if the hosts are on different sites, and configure Google OAuth's authorized redirect URI on the backend host. `VITE_` variables are bundled into public browser code: never put OAuth client secrets, database credentials, or other secrets in them. Keep secrets in the backend's environment.

More frontend details are in [`frontend/README.md`](frontend/README.md).
