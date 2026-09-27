# Inventory System — frontend

React + TypeScript SPA for the `order-api` Spring Boot service.

## Running it

Two processes are needed. Start the API first:

```bash
mvn spring-boot:run          # order-api on :8080
```

Then the frontend:

```bash
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

The status pill in the top-right corner pings `GET /api/products` on load and shows
whether the API is reachable.

## How it talks to the API

`order-api` ships no CORS configuration, so the Vite dev server proxies `/api`
to `http://localhost:8080` (see `vite.config.ts`). The browser only ever talks to
`:5173`, which keeps every request same-origin — no backend change required.

The proxy only exists in `npm run dev`. For a production build you would either
serve `dist/` behind the same origin as the API or add CORS to the backend.

## Layout

| Path | Purpose |
| --- | --- |
| `src/api/types.ts` | TypeScript mirrors of the Java DTO records |
| `src/api/client.ts` | `fetch` wrapper and `ApiError` |
| `src/api/orderApi.ts` | One function per controller method |
| `src/hooks/useAsync.ts` | Loader hook with request-race protection |
| `src/state/` | Cart state, persisted to `localStorage` |
| `src/pages/` | Route components |

## API surface used

| Method | Path |
| --- | --- |
| GET | `/api/products` |
| GET | `/api/products/{id}` |
| GET | `/api/customers` |
| GET | `/api/customers/{id}` |
| GET | `/api/customers/{id}/orders` |
| GET | `/api/orders/{id}` |
| POST | `/api/orders` |
| POST | `/api/orders/{id}/cancel` |

There is no list-all-orders endpoint, so `/orders` is a per-customer entry point
into order history.

## Notes on current API behaviour

The frontend works around two things rather than changing them, since the backend
issues in `BUG.md` are being tracked separately:

- **Not-found responses arrive as HTTP 200** with an `ErrorResponse` body. The
  client inspects the body shape and raises an `ApiError` anyway, so the UI shows
  a real 404 instead of an empty page.
- **Quantities below 1 are not reliably rejected.** The basket clamps quantity
  inputs to a minimum of 1 and never sends a lower value.

Tier discounts are always rendered from the server's `subtotal`,
`discountAmount` and `total`. The UI does no discount arithmetic of its own, so
it stays correct regardless of the tier rates the API applies.
