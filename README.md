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

## Deploy the backend to Render

Choose **Docker** for the Render service and leave **Root Directory** blank so Render uses the repository root. The [root `Dockerfile`](Dockerfile) builds the Java 17 Spring Boot API and binds Spring Boot to Render's `PORT` environment variable (defaulting to 8080 for local containers).

For the current Neon database setup, configure these Render environment variables:

| Variable | Value |
| --- | --- |
| `SPRING_PROFILES_ACTIVE` | `neon` |
| `DATABASE_URL` | Neon connection string, stored as a secret |
| `GOOGLE_OAUTH_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Google OAuth client secret, stored as a secret |
| `OAUTH_REDIRECT_URI` | `https://<your-render-service>.onrender.com/login/oauth2/code/google` |

Add the callback URL above to the Google OAuth client's authorized redirect URIs. Once deployed, set `VITE_API_BASE_URL` in Vercel to the Render service origin (for example, `https://<your-render-service>.onrender.com`). The backend still needs credentialed CORS for the Vercel origin and cross-site session-cookie settings before browser sign-in will work across the two hosts.
