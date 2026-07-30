# Dunia Boutique — Luxury Modest Fashion E-Commerce

A full-featured e-commerce storefront for luxury modest fashion, built with Next.js and Firebase, serving customers across Kenya.

## Tech Stack

- **Framework:** Next.js 15 (App Router) with TypeScript
- **Styling:** Tailwind CSS v4 with custom design tokens
- **Authentication:** Firebase Authentication (Email/Password)
- **Database:** Firebase Firestore
- **Storage:** Firebase Storage (product images, media)
- **Payments:** M-Pesa Daraja API (Safaricom)
- **Deployment:** Vercel

## Key Features

- Product catalog with 7 categories (Abayas, VIP Abayas, Wedding Dirah, Perfumes, Bags, Jewelry, Shoes)
- Shopping cart with guest and registered user support
- Checkout with M-Pesa payment instructions and order tracking
- Guest order tracking by order ID
- Customer self-service "Mark as Delivered" confirmation
- Admin dashboard with order management, product CRUD, and analytics
- Admin Settings with password change and security management
- Dark mode support
- Responsive design

## Local Development

### Prerequisites

- Node.js 18+
- A Firebase project with Authentication (Email/Password) and Firestore enabled

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/kiyahassan666-create/Dunia-Boutique.git
   cd Dunia-Boutique
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.local.example` to `.env.local` and fill in your Firebase project credentials:
   ```bash
   cp .env.local.example .env.local
   ```
   See `.env.local.example` for the required variables — no secret values should ever be committed to the repository.

4. Start the development server:
   ```bash
   npm run dev
   ```

### Admin Access

Admin authentication uses Firebase Auth with a role check against the `admins` Firestore collection:

1. Create an admin user in Firebase Console (Authentication → Add User)
2. Add a document to the `admins` collection in Firestore with the user's UID:
   ```json
   {
     "email": "admin@example.com",
     "role": "admin",
     "addedAt": "<timestamp>"
   }
   ```
3. Log in at `/admin/login` with the created credentials

**Important:** Only users with a document in the `admins` collection can access the admin panel. Customer accounts authenticated via Firebase Auth will be rejected.

### Firestore Rules

Security rules are in `firestore.rules`. After making changes, deploy with:
```bash
firebase deploy --only firestore:rules
```

## Deployment

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

In summary:
1. Push to GitHub (auto-deploys to Vercel)
2. Set the 6 `NEXT_PUBLIC_FIREBASE_*` environment variables in Vercel Dashboard
3. Deploy Firestore rules via Firebase CLI

## Project Structure

```
app/                    # Next.js App Router pages
├── admin/              # Admin panel (protected)
├── checkout/           # Guest + registered checkout
├── login/              # Customer login
├── signup/             # Customer registration
├── order-status/       # Guest order tracking
└── product/            # Product detail pages
components/             # Shared React components
contexts/               # React contexts (Auth, etc.)
lib/                    # Utilities and Firebase helpers
types/                  # TypeScript type definitions
```
