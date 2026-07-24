# DUNIA BOUTIQUE — UI Redesign + Mock Database Integration Brief

**Purpose of this document:** Feed this directly to the AI coding tool working on the existing Next.js codebase (see `PROJECT_PROMPT.md` for current architecture). This brief covers two combined objectives:

1. **Redesign** — simplify and elevate the current UI to match a cleaner, more luxurious reference layout.
2. **Mock Database Layer** — add a local mock database (Firestore-shaped, since real Firebase credentials aren't ready yet) so the admin dashboard can be built and tested on localhost, without touching or risking the live storefront.

---

## 1. CONTEXT: TWO VERSIONS BEING COMPARED

- **Current build (`localhost:3000`)** — functional but visually heavy: dark navbar with a lot of icon clutter, an orange promo bar, boxy product cards with hard borders and multiple stacked badges, a dense filter sidebar, broken/placeholder product images, and no motion — pages feel static and "loaded all at once."
- **Reference build (v0 preview)** — cream/ivory background, generous whitespace, refined serif headline type paired with small-caps labels, minimal single-line navbar, soft-edge product cards with subtle hover reveals, and a calmer overall pace.

**Goal:** Rebuild the current site's visual language to match the reference build's simplicity and polish — not by throwing away the current functionality (routing, categories, cart badge, etc.), just by restyling and reorganizing it.

---

## 2. REDESIGN REQUIREMENTS

### 2.1 Navbar
- Reduce visual weight: switch from solid black to a transparent/cream backdrop-blur bar (dark mode keeps a deep espresso tone, not pure black).
- Trim icon row to essentials; keep icon color low-contrast until hovered.
- Use small-caps, letter-spaced nav labels (matches reference) instead of default-weight text.
- Promo bar (if kept) should be a thin, low-saturation strip — not bright orange.

### 2.2 Typography & Layout Rhythm
- Establish a clear scale contrast: large serif (Playfair Display) headlines vs. tiny tracked-out uppercase labels above them (e.g. "SHOP BY CATEGORY" as a small label, not a big heading).
- Increase section padding/whitespace throughout — the reference build "breathes" more than the current one.
- Reduce the number of simultaneous visual elements per section (badges, borders, overlays) — one clear focal point per card.

### 2.3 Product & Category Cards
- Remove heavy borders and multiple stacked badges; keep at most one soft badge (e.g. "New").
- Fix broken/placeholder images — confirm all Unsplash URLs resolve, add a graceful fallback (blurred placeholder or skeleton, not a blank gray box).
- Hover state should be a gentle image scale/fade + a single understated CTA, not a heavy dark overlay with multiple buttons.

### 2.4 Filters / Shop Page
- Simplify the filter sidebar: fewer visual dividers, lighter checkboxes, collapsed sections by default.
- Keep sort and product count, but reduce competing UI weight so the product grid stays the visual focus.

### 2.5 Motion & Loading
- Add subtle scroll-triggered fade/slide-in for sections (Framer Motion recommended — install `framer-motion`).
- Add image and card skeleton loaders instead of blank/broken states while content mounts.
- Smooth page-level transitions where feasible (App Router `template.tsx` or Framer Motion `AnimatePresence`).

### 2.6 Color Discipline
- Gold (`#C9A84C`) stays an **accent only** (labels, dividers, hover states) — not a dominant fill color.
- Dark sections use espresso (`#3C2A1F`), not pure black, to match the warmer luxury tone from the reference.

---

## 3. MOCK DATABASE LAYER (Firebase-ready, non-breaking)

### 3.1 Principle: Adapter Pattern
Build a single **data-access abstraction** so the storefront and admin dashboard never call a database directly — they call an interface. Today that interface is backed by mock/local data; later, flipping one environment variable swaps it to real Firebase with **zero component changes**.

```
lib/db/
├── types.ts              ← shared interfaces (Product, Category, Order, User, etc.)
├── index.ts              ← exports the ACTIVE provider based on env var
├── mock-provider.ts       ← local implementation (used now)
└── firebase-provider.ts   ← real implementation (stubbed now, wired later)
```

`lib/db/index.ts`:
```ts
const provider = process.env.NEXT_PUBLIC_DB_PROVIDER === "firebase"
  ? firebaseProvider
  : mockProvider;

export default provider;
```

Default `.env.local` value: `NEXT_PUBLIC_DB_PROVIDER=mock`

### 3.2 Interface Shape (example)
```ts
interface DataProvider {
  getProducts(): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
  createProduct(data: Omit<Product, "id">): Promise<Product>;
  updateProduct(id: string, data: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  getCategories(): Promise<Category[]>;
  getOrders(): Promise<Order[]>;
  createOrder(data: Omit<Order, "id">): Promise<Order>;
  getUsers(): Promise<User[]>;
}
```
Every admin dashboard screen (products, categories, orders, users) is built against this interface only — never against `lib/constants.ts` or a Firestore SDK call directly.

### 3.3 Mock Data Shape — Firestore-Compatible
Structure the mock JSON to already look like Firestore documents, so the future swap is truly a no-op:
- `id: string` (not numeric index)
- Timestamps as ISO strings (`createdAt`, `updatedAt`) — Firestore Timestamps convert cleanly later
- Nested objects instead of flattened fields where Firestore would naturally use them (e.g. `shippingAddress: { line1, city, ... }` inside an order)

Seed files (convert from existing `lib/constants.ts`):
```
lib/db/seed/
├── products.json
├── categories.json
├── orders.json     ← new mock data, doesn't exist yet
└── users.json       ← new mock data, doesn't exist yet
```

### 3.4 Local Persistence (so admin edits stick across reloads)
Use **lowdb** (zero-config, JSON-file-backed, no server process needed) inside `mock-provider.ts`. It reads/writes a local `.data/db.json` file through Next.js Route Handlers (`app/api/...`), so CRUD from the admin UI persists during local testing without any external service.

> Add `.data/` to `.gitignore` — this is local test data only, never deployed.

### 3.5 Firebase Stub
`firebase-provider.ts` should implement the same `DataProvider` interface with real Firestore SDK calls (`collection`, `getDocs`, `addDoc`, etc.), reading config from env vars (`NEXT_PUBLIC_FIREBASE_API_KEY`, etc.) that are currently placeholders. Leave clear `// TODO: confirm once Firebase project is created` comments — the file should compile and be structurally complete, just unconnected until real credentials are added.

### 3.6 Non-Interference Guarantee
- The **public storefront** (home, shop, product pages) keeps rendering from the existing static data during this phase — do not point live pages at the mock DB unless explicitly asked, so nothing about the current site's behavior changes.
- The **admin dashboard** (new, under `app/admin/`) is the only consumer of the mock provider for now. This isolates all testing to a section of the site the public never sees, satisfying "test the admin UI/logic without affecting the live site."
- Add a simple local-only admin gate (hardcoded password or NextAuth Credentials provider) — flag clearly that this must be replaced with real auth before any production use.

---

## 4. STEP-BY-STEP BUILD ORDER FOR THE AI

1. Read existing files (`PROJECT_PROMPT.md`, `lib/constants.ts`, all components) to match current conventions.
2. Create `lib/db/` abstraction layer with `types.ts`, `index.ts`, `mock-provider.ts`, `firebase-provider.ts` (stub).
3. Convert `lib/constants.ts` data into Firestore-shaped seed JSON (`products.json`, `categories.json`) and add new seed files for `orders.json`, `users.json`.
4. Wire `mock-provider.ts` to lowdb + local API routes for persistent CRUD.
5. Add `.env.local.example` with `NEXT_PUBLIC_DB_PROVIDER=mock` and placeholder `FIREBASE_*` keys.
6. Build `app/admin/` routes (dashboard overview, products CRUD, categories, orders, users) against the `DataProvider` interface only.
7. Add a local-only admin login gate.
8. Confirm admin CRUD changes persist locally and do **not** touch the public storefront's static data.
9. Apply the Section 2 redesign pass component-by-component: Navbar → Hero → CategoryGrid → FeaturedProducts → product/category listing pages → cards.
10. Install `framer-motion`; add scroll-in animation and skeleton loaders per Section 2.5.
11. Sanity check: fix any broken product images, confirm dark mode still uses the espresso/cream tokens correctly after restyle.

---

## 5. CONSTRAINTS TO PRESERVE

- No changes to production deploy/build config.
- Mock provider and admin routes stay dev/local-only in scope for this phase.
- Keep TypeScript strict mode, existing App Router file conventions, and the Tailwind v4 `@theme` tokens already defined in `globals.css`.
- Don't delete `lib/constants.ts` — keep it as the storefront's data source until an explicit decision is made to point the live site at the same provider abstraction.
