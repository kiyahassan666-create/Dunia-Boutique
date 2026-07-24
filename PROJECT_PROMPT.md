# DUNIA BOUTIQUE — Full Project Prompt for AI Development

## PROJECT IDENTITY
- **Name:** Dunia Boutique
- **Type:** Luxury Modest Fashion E-Commerce Landing Page
- **Stack:** Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- **State:** Static landing page — NO backend, NO database, NO API, NO dynamic routes
- **Live Routes:** Only `/` (home page) exists

---

## 1. WHAT EXISTS NOW (Completed)

### 1.1 Foundation & Configuration
- [x] Next.js 15 project with TypeScript strict mode
- [x] Tailwind CSS v4 with custom `@theme` tokens (colors: cream, gold, espresso, charcoal, warm-gray, ivory; fonts: Playfair Display headings, Cormorant Garamond sub, Inter body)
- [x] PostCSS configured with `@tailwindcss/postcss`
- [x] Dark mode via CSS class (`<html class="dark">`), toggled in Navbar, persisted to `localStorage` under key `"theme"`
- [x] Google Fonts integration via `next/font/google` (Playfair Display, Cormorant Garamond, Inter)
- [x] Image remote patterns allowed for `images.unsplash.com` and `plus.unsplash.com`

### 1.2 Layout & Shell
- [x] Root layout (`app/layout.tsx`) sets CSS custom properties on `<html>`, wraps all pages with `<Navbar>` then `<main>` then `<Footer>`
- [x] Metadata: title = "Dunia Boutique — Luxury Modest Fashion", description covers 7 product categories
- [x] Body: `min-h-screen bg-cream text-charcoal font-body antialiased`
- [x] `suppressHydrationWarning` on `<html>` for dark mode

### 1.3 Components Built

**Navbar (`components/Navbar.tsx`) — CLIENT COMPONENT**
- Fixed top header, scroll-driven transparency & backdrop-blur
- Desktop nav links: Abayas, VIP Abayas, Wedding Dirah, Perfumes, Bags, Jewelry, Shoes (links to `/{slugified-name}`)
- Icons: Search, Heart, ShoppingBag (badge="3"), User, Menu/X (hamburger)
- Mobile slide-out menu with full nav + icon row
- Dark mode toggle

**Hero (`components/Hero.tsx`) — SERVER COMPONENT**
- Full-width 65vh (min 480px) with Unsplash background image (priority loaded)
- Black-to-transparent gradient overlay
- Heading: "Modest Fashion, *Reimagined*" (gold emphasis via `<span>`)
- CTAs: "Explore Collection" → `/#collection`, "Shop Now" → `/#categories`

**CategoryGrid (`components/CategoryGrid.tsx`) — SERVER COMPONENT**
- Section `#categories`, heading "Shop by Category"
- Responsive grid: 2→3→4→7 cols
- Maps `categories` from `lib/constants.ts`, each linking to `/{cat.slug}`
- Gradient overlay + category name + product count

**FeaturedProducts (`components/FeaturedProducts.tsx`) — SERVER COMPONENT**
- Section `#collection`, heading "The Signature Collection"
- 3-column grid of 6 featured products from constants
- Each card: image, optional badge (New/Best Seller/Sale), category, name, price
- Hover overlay with "Quick View" button

**Values (`components/Values.tsx`) — SERVER COMPONENT**
- Dark section, heading "Crafted With Purpose"
- 3 columns: Artisanal Craft, Sustainable Luxury, Inclusive Design
- Circular icon containers with gold hover animation

**Testimonials (`components/Testimonials.tsx`) — SERVER COMPONENT**
- Infinite marquee (CSS `@keyframes marquee`, 40s linear)
- Duplicated array for seamless loop
- Each card: 5 stars, quote, author, border, cream bg

**Newsletter (`components/Newsletter.tsx`) — CLIENT COMPONENT**
- Gradient section, heading "Join The Inner Circle"
- Email input + Subscribe button
- On submit: `alert("Welcome to the Dunia family.")` (placeholder)

**Footer (`components/Footer.tsx`) — SERVER COMPONENT**
- Dark background, 4-column grid
- Column 1: Brand (DUNIA. + description)
- Column 2: Discover (New Arrivals, Best Sellers, The Abaya Edit, Jewelry Collection, Accessories)
- Column 3: Support (Size Guide, Shipping & Returns, Care Instructions, Contact Us, FAQ)
- Column 4: Connect (Instagram, Pinterest, TikTok, YouTube)
- Bottom bar: ©2025 + social initials

### 1.4 Data Layer (`lib/constants.ts`)
- [x] `Product` interface: id, name, category, price, image, badge?
- [x] `Category` interface: id, name, slug, image, count
- [x] `categories[]` — 7 categories with slugs and product counts
- [x] `featuredProducts[]` — 6 products with Unsplash images
- [x] `testimonials[]` — 5 customer reviews

### 1.5 Global CSS (`app/globals.css`)
- [x] Tailwind import + `@theme` design tokens
- [x] Dark mode variant
- [x] Base layer: smooth scroll, selection styling
- [x] Marquee keyframes

---

## 2. WHAT IS NEEDED (Architecture & Vision)

### 2.1 Brand & Business Context
- **Luxury modest fashion** targeting modern Muslim women
- 7 product categories: Abayas, VIP Abayas, Wedding Dirah, Perfumes, Luxury Bags, Jewelry, Shoes
- Tone: elegant, sophisticated, warm, premium
- Target audience: women seeking luxurious modest wear for daily, formal, bridal occasions

### 2.2 Full Website Journey (User Flow)

```
VISITOR → Homepage → Browse Categories → Category Page → Product Detail → Add to Cart → Checkout → Order Confirmation
                     ↓                    ↓                  ↓
                Newsletter Signup    Wishlist          Account/Login
```

Desired pages (none exist yet beyond home):
1. **Category Listing Page** — `/abayas`, `/vip-abayas`, `/wedding-dirah`, `/perfumes`, `/luxury-bags`, `/jewelry`, `/shoes`
2. **Product Detail Page** — `/products/[slug]`
3. **Cart Page** — `/cart`
4. **Checkout Page** — `/checkout`
5. **Wishlist Page** — `/wishlist`
6. **Account/Profile Page** — `/account`
7. **Search Results Page** — `/search`
8. **Order Confirmation Page** — `/order-confirmation`
9. **Contact Page** — `/contact`
10. **FAQ Page** — `/faq`
11. **Size Guide Page** — `/size-guide`
12. **Shipping & Returns Page** — `/shipping-returns`

### 2.3 Functional Requirements (Needed)
- [ ] **Product catalog** — dynamic listing with filtering (by category, price, size, color), sorting, pagination
- [ ] **Product detail** — image gallery, size selector, color selector, quantity, add to cart, wishlist toggle, reviews
- [ ] **Shopping cart** — full state management (add, remove, update quantity, promo codes)
- [ ] **Checkout** — multi-step: shipping info → payment → review order
- [ ] **User accounts** — registration, login, order history, saved addresses, wishlist persistence
- [ ] **Search** — product search with autocomplete
- [ ] **Wishlist** — add/remove, view all
- [ ] **Order management** — confirmation page, email notification (future)
- [ ] **Payment integration** — placeholder or Stripe (to be decided)
- [ ] **Admin/CMS** — product management, inventory, orders (future)

### 2.4 Technical Requirements (Needed)
- [ ] **Routing** — dynamic routes for categories, products, and all other pages
- [ ] **Data persistence** — database (PostgreSQL/Supabase, or headless CMS like Sanity/Strapi)
- [ ] **API layer** — Next.js API routes or external backend
- [ ] **State management** — React Context / Zustand / Redux for cart + auth
- [ ] **Authentication** — NextAuth.js / Clerk / Auth.js
- [ ] **Image optimization** — migrate from Unsplash hotlinks to local/optimized images or CMS-hosted
- [ ] **Loading states** — React Suspense boundaries, loading skeletons
- [ ] **Error handling** — error boundaries, 404 page, 500 page
- [ ] **SEO** — per-page metadata, Open Graph, structured data (JSON-LD)
- [ ] **Performance** — image lazy loading, code splitting, ISR/SSG for product pages
- [ ] **Security** — input validation, CSRF, rate limiting on auth endpoints
- [ ] **Analytics** — Google Analytics / Plausible / Vercel Analytics
- [ ] **PWA** — progressive web app capabilities (optional)

### 2.5 Infrastructure (Needed)
- [ ] **Hosting** — Vercel (recommended for Next.js)
- [ ] **Database** — Supabase / MongoDB / PostgreSQL
- [ ] **Storage** — Cloudinary / AWS S3 for product images
- [ ] **Domain** — production domain + custom email
- [ ] **CI/CD** — GitHub Actions for lint/test/deploy

### 2.6 Missing Components (Needed)
- [ ] Loading skeletons for all pages
- [ ] 404 error page (`app/not-found.tsx`)
- [ ] Error boundary (`app/error.tsx`)
- [ ] Loading state (`app/loading.tsx`)
- [ ] Empty states for cart, wishlist, search results
- [ ] Breadcrumb navigation component
- [ ] Pagination component
- [ ] Product filter/sort component
- [ ] Image gallery/lightbox component
- [ ] Size/color selector component
- [ ] Quantity selector component
- [ ] Review/rating component
- [ ] Auth forms (login, register, forgot password)
- [ ] Checkout steps component
- [ ] Order summary component
- [ ] Address form component
- [ ] Payment form component
- [ ] Toast/notification component
- [ ] Back to top button

---

## 3. WHAT IS TO BE DONE (Prioritized Roadmap)

### PHASE 1: Core Pages & Data Layer (HIGH priority)
```
1. Create database schema / CMS models for Products, Categories, Orders, Users
2. Implement API routes or server actions for product fetching
3. Build category listing page with dynamic routing: /[category]
4. Build product detail page with dynamic routing: /products/[slug]
5. Build cart page with full state management
6. Build 404, loading, and error pages
```

### PHASE 2: User Features (MEDIUM priority)
```
1. Implement authentication (register/login/logout)
2. Build account page (profile, order history)
3. Build wishlist functionality (toggle + dedicated page)
4. Build search page with filtering/sorting
5. Build contact form page
6. Build FAQ page
```

### PHASE 3: Commerce & Checkout (MEDIUM priority)
```
1. Build multi-step checkout page (shipping → payment → review)
2. Integrate payment gateway (Stripe)
3. Build order confirmation page
4. Implement promo code system
5. Email notifications for orders
```

### PHASE 4: Polish & Admin (LOWER priority)
```
1. Build admin dashboard (product management, order management)
2. SEO optimization (structured data, sitemap, meta tags)
3. Analytics integration
4. Performance optimization (Lighthouse score >90)
5. Accessibility audit
6. PWA support
7. Internationalization (Arabic language support)
```

---

## 4. CURRENT ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────┐
│                   Next.js 15 App                  │
├─────────────────────────────────────────────────┤
│  app/                                             │
│  ├── layout.tsx  ← Navbar + Footer wrapper        │
│  ├── page.tsx    ← Hero → CategoryGrid →          │
│  │                  FeaturedProducts → Values →    │
│  │                  Testimonials → Newsletter      │
│  └── globals.css ← Tailwind + custom theme         │
├─────────────────────────────────────────────────┤
│  components/                                       │
│  ├── Navbar.tsx         (client, scroll-aware)     │
│  ├── Hero.tsx           (server, fullscreen)       │
│  ├── CategoryGrid.tsx   (server, grid of 7)        │
│  ├── FeaturedProducts.tsx (server, 6 cards)        │
│  ├── Values.tsx         (server, 3 columns)        │
│  ├── Testimonials.tsx   (server, marquee)          │
│  ├── Newsletter.tsx     (client, alert placeholder)│
│  └── Footer.tsx         (server, 4 columns)        │
├─────────────────────────────────────────────────┤
│  lib/                                              │
│  └── constants.ts ← all hardcoded data (static)    │
├─────────────────────────────────────────────────┤
│  public/  (empty — all images from Unsplash)       │
└─────────────────────────────────────────────────┘
```

---

## 5. DESIGN SYSTEM (Built-in Tailwind Theme)

| Token | Light | Dark |
|---|---|---|
| `bg-cream` | `#FAF7F2` | body bg |
| `text-charcoal` | `#2C2C2C` | body text |
| `text-gold` | `#C9A84C` | accents |
| `bg-espresso` | `#3C2A1F` | dark sections |
| `bg-ivory` | `#F5F0E8` | cards |
| `font-heading` | Playfair Display | — |
| `font-sub` | Cormorant Garamond | — |
| `font-body` | Inter | — |

---

## 6. KEY CONSTRAINTS & NOTES FOR AI

1. **No backend exists** — every link beyond `/` leads nowhere. The data layer (`lib/constants.ts`) is entirely static arrays with no API.
2. **All images** are Unsplash hotlinks — will need migration to local/CMS/storage.
3. **Cart badge** shows hardcoded "3" — no cart state management exists.
4. **Dark mode** works but is only toggled from Navbar — no system-preference-first approach.
5. **No route groups, layouts, or templates** exist beyond root layout.
6. **No data fetching** patterns are used — everything is compile-time static.
7. **Newsletter** is a mock `alert()` — no actual subscription integration.
8. **Footer links** all point to `#` — no destination pages exist.
9. **Public directory** is empty — no SVGs, no favicon, no manifest.
10. **No form validation** library is included.
11. **Package.json** only has `next`, `react`, `lucide-react`, `tailwindcss`, `typescript` — no state management, auth, or UI libraries are installed.

---

## 7. IMMEDIATE NEXT STEPS FOR THE AI

1. Read all existing files to understand current code conventions (file structure, import patterns, styling approach)
2. Create the first dynamic route page (e.g., `app/[category]/page.tsx`) and its supporting API/data layer
3. Add a database or CMS connection for product data
4. Set up state management (Zustand recommended for simplicity)
5. Build the cart system (state + UI + persistence)
6. Create missing core pages in order: 404 → Category → Product → Cart → Checkout
7. Add authentication (NextAuth.js / Clerk)
