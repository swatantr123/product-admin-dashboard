# Northstar Ops

Northstar Ops is a responsive product administration dashboard built with Next.js 16, React 19, TypeScript, Axios, and the DummyJSON API.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The demo login is prefilled with:

- Username: `emilys`
- Password: `emilyspass`

Useful commands:

```bash
npm run lint
npm run build
npm run start
```

## Features

- Login, logout, session persistence, route protection, and expired-session handling
- Product search with debounce and cancellation of stale requests
- URL-driven page, page size, search, category, and sort state
- Category filtering, sorting, pagination, loading, empty, error, and retry states
- Responsive desktop product table and mobile product cards
- Product details with image gallery, description, metrics, and reviews
- Validated create and edit forms
- Product deletion with confirmation

## Architecture

```text
src/
  app/                         App Router pages and route entry points
  components/                  Auth guard, dashboard navigation, forms, and product list
  lib/api/                     Axios client, routes, API functions, and types
  lib/auth/                    Session storage and auth types
  lib/products/                Product types and local mutation overlay
```

API calls live in `src/lib/api`; UI components do not construct DummyJSON URLs or manage authorization headers. The shared Axios client reads the stored token, supports `AbortSignal`, normalizes errors, and emits an `auth-expired` event after a `401` response.

## DummyJSON Behavior

DummyJSON does not combine search and category filtering server-side. When both values are present, the app requests `/products/search?q=...` and applies the category filter to the returned products in the browser. This is intentional.

The list uses `limit` and `skip` for pagination. Search, category, sort, and page-size changes reset the page to `1`. Invalid page, limit, and sort values are canonicalized to safe values. The product API accepts an optional `delay` parameter for stale-response testing, for example `delay=2000`.

## Local Mutation Persistence

DummyJSON accepts product mutations but does not persist them on the server. The app stores successful creates, edits, and deletes in browser local storage under `northstar-product-mutations` and overlays those values on subsequent catalog and detail requests.

Clearing browser site data removes the local mutation overlay.

## Validation Checklist

The following commands pass:

```bash
npm run lint
npm run build
```

Manual release checks:

| Area | Check |
| --- | --- |
| Login | Valid credentials, invalid credentials, empty fields, and repeated clicks while pending |
| Protection | Open `/products` without a session, log out, and handle a `401` expired token |
| Search | Confirm debounce and stale-response protection with a `delay=2000` request |
| URL state | Try `page=abc`, `page=999`, unsupported limits, and invalid sort values |
| Filtering | Combine search and category and confirm browser-side category filtering |
| Pagination | Change 10/20/50 page sizes and use Previous/Next controls |
| States | Verify loading, empty, API error, and Retry states |
| Details | Open valid and invalid IDs, image gallery, reviews, edit, and delete confirmation |
| Mutations | Create, edit, delete, refresh, and confirm local overlays remain visible |
| Responsive UI | Verify the desktop table and mobile product cards/navigation/forms |

For API-level delayed search testing, call `searchProducts("phone", { limit: 10, skip: 0, delay: 2000, signal })` from a client test harness and abort it when a newer query starts.

## Deployment

The project can be deployed to Vercel or Netlify as a standard Next.js application. No environment variables are required because the API base URL is currently `https://dummyjson.com`.

Deployment requires an authenticated hosting account. For Vercel:

```bash
npx vercel
npx vercel --prod
```