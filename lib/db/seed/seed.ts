import type { Product, Category, Order, User } from "../types";

export const seedProducts: Product[] = [
  {
    id: "prod_1", name: "Artisan Linen Abaya", slug: "artisan-linen-abaya",
    category: "Abayas", categoryId: "cat_abayas",
    description: "Hand-finished linen abaya with intricate embroidery.",
    price: 289, compareAtPrice: null,
    images: ["https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80&auto=format&fit=crop"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Ivory", hex: "#FFFCF8" }, { name: "Charcoal", hex: "#2C2C2C" }],
    badge: "New", inStock: true, featured: true,
    createdAt: "2025-06-01T00:00:00.000Z", updatedAt: "2025-06-01T00:00:00.000Z",
  },
  {
    id: "prod_2", name: "Silk Borealis Abaya", slug: "silk-borealis-abaya",
    category: "VIP Abayas", categoryId: "cat_vip",
    description: "Luxurious silk abaya with hand-beaded celestial patterns.",
    price: 445, compareAtPrice: 520,
    images: ["https://images.unsplash.com/photo-1623609871568-073325bf6b21?w=600&q=80&auto=format&fit=crop"],
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Midnight", hex: "#1A1A2E" }, { name: "Burgundy", hex: "#800020" }],
    badge: null, inStock: true, featured: true,
    createdAt: "2025-06-01T00:00:00.000Z", updatedAt: "2025-06-01T00:00:00.000Z",
  },
  {
    id: "prod_3", name: "Celestial Wedding Dirah", slug: "celestial-wedding-dirah",
    category: "Wedding Dirah", categoryId: "cat_wedding",
    description: "Ethereal wedding dirah with silver-thread embroidery.",
    price: 590, compareAtPrice: null,
    images: ["https://images.unsplash.com/photo-1608236415050-8d3d65c3523e?w=600&q=80&auto=format&fit=crop"],
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Ivory", hex: "#FFFCF8" }, { name: "Champagne", hex: "#F7E7CE" }],
    badge: "Best Seller", inStock: true, featured: true,
    createdAt: "2025-05-15T00:00:00.000Z", updatedAt: "2025-05-15T00:00:00.000Z",
  },
  {
    id: "prod_4", name: "Oud Royale Perfume", slug: "oud-royale-perfume",
    category: "Perfumes", categoryId: "cat_perfumes",
    description: "Captivating blend of Cambodian oud, rose absolute, and amber.",
    price: 198, compareAtPrice: null,
    images: ["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80&auto=format&fit=crop"],
    sizes: [], colors: [], badge: null, inStock: true, featured: true,
    createdAt: "2025-04-20T00:00:00.000Z", updatedAt: "2025-04-20T00:00:00.000Z",
  },
  {
    id: "prod_5", name: "Satin Tote Bag", slug: "satin-tote-bag",
    category: "Luxury Bags", categoryId: "cat_bags",
    description: "Luxurious satin tote with gold-toned hardware.",
    price: 380, compareAtPrice: 450,
    images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80&auto=format&fit=crop"],
    sizes: [], colors: [{ name: "Blush", hex: "#F5D6C6" }, { name: "Black", hex: "#000000" }],
    badge: "Sale", inStock: true, featured: true,
    createdAt: "2025-06-10T00:00:00.000Z", updatedAt: "2025-06-10T00:00:00.000Z",
  },
  {
    id: "prod_6", name: "Gold Pendant Set", slug: "gold-pendant-set",
    category: "Jewelry", categoryId: "cat_jewelry",
    description: "18k gold-plated pendant and earring set with moonstones.",
    price: 520, compareAtPrice: null,
    images: ["https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80&auto=format&fit=crop"],
    sizes: [], colors: [], badge: null, inStock: true, featured: true,
    createdAt: "2025-03-01T00:00:00.000Z", updatedAt: "2025-03-01T00:00:00.000Z",
  },
];

export const seedCategories: Category[] = [
  { id: "cat_abayas", name: "Abayas", slug: "abayas", image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80&auto=format&fit=crop", description: "Timeless abayas for everyday elegance.", count: 24, createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
  { id: "cat_vip", name: "VIP Abayas", slug: "vip-abayas", image: "https://images.unsplash.com/photo-1623609871568-073325bf6b21?w=800&q=80&auto=format&fit=crop", description: "Hand-embroidered abayas for special occasions.", count: 12, createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
  { id: "cat_wedding", name: "Wedding Dirah", slug: "wedding-dirah", image: "https://images.unsplash.com/photo-1608236415050-8d3d65c3523e?w=800&q=80&auto=format&fit=crop", description: "Bridal ensembles for unforgettable days.", count: 18, createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
  { id: "cat_perfumes", name: "Perfumes", slug: "perfumes", image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80&auto=format&fit=crop", description: "Luxury fragrances inspired by heritage.", count: 32, createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
  { id: "cat_bags", name: "Luxury Bags", slug: "luxury-bags", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80&auto=format&fit=crop", description: "Handcrafted bags for every ensemble.", count: 15, createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
  { id: "cat_jewelry", name: "Jewelry", slug: "jewelry", image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80&auto=format&fit=crop", description: "Fine jewelry with ethically sourced gemstones.", count: 28, createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
  { id: "cat_shoes", name: "Shoes", slug: "shoes", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80&auto=format&fit=crop", description: "Elegant footwear for every step.", count: 20, createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
];

export const seedOrders: Order[] = [
  {
    id: "ord_001",
    items: [{ productId: "prod_1", name: "Artisan Linen Abaya", price: 289, quantity: 1, size: "M", color: "Ivory", image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80&auto=format&fit=crop" }],
    subtotal: 289, shipping: 15, tax: 23.12, total: 327.12, status: "delivered",
    shippingAddress: { line1: "42 Modest Lane", line2: "Apt 7B", city: "Dubai", state: "Dubai", zip: "00000", country: "UAE" },
    billingAddress: { line1: "42 Modest Lane", line2: "Apt 7B", city: "Dubai", state: "Dubai", zip: "00000", country: "UAE" },
    paymentMethod: "Credit Card", userId: "usr_001", email: "aisha@example.com", notes: "Please gift wrap.",
    createdAt: "2025-07-01T10:30:00.000Z", updatedAt: "2025-07-10T14:00:00.000Z",
  },
  {
    id: "ord_002",
    items: [
      { productId: "prod_4", name: "Oud Royale Perfume", price: 198, quantity: 2, image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80&auto=format&fit=crop" },
      { productId: "prod_6", name: "Gold Pendant Set", price: 520, quantity: 1, image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80&auto=format&fit=crop" },
    ],
    subtotal: 916, shipping: 0, tax: 73.28, total: 989.28, status: "shipped",
    shippingAddress: { line1: "15 Pearl Tower", city: "Kuala Lumpur", state: "Wilayah Persekutuan", zip: "50000", country: "Malaysia" },
    billingAddress: { line1: "15 Pearl Tower", city: "Kuala Lumpur", state: "Wilayah Persekutuan", zip: "50000", country: "Malaysia" },
    paymentMethod: "PayPal", userId: "usr_002", email: "layla@example.com",
    createdAt: "2025-07-15T08:15:00.000Z", updatedAt: "2025-07-16T12:00:00.000Z",
  },
  {
    id: "ord_003",
    items: [{ productId: "prod_3", name: "Celestial Wedding Dirah", price: 590, quantity: 1, size: "L", color: "Ivory", image: "https://images.unsplash.com/photo-1608236415050-8d3d65c3523e?w=600&q=80&auto=format&fit=crop" }],
    subtotal: 590, shipping: 25, tax: 47.2, total: 662.2, status: "pending",
    shippingAddress: { line1: "88 Garden Road", city: "London", state: "England", zip: "SW1A 1AA", country: "United Kingdom" },
    billingAddress: { line1: "88 Garden Road", city: "London", state: "England", zip: "SW1A 1AA", country: "United Kingdom" },
    paymentMethod: "Credit Card", userId: "usr_003", email: "nadia@example.com", notes: "Need before August 1st for my wedding.",
    createdAt: "2025-07-20T16:45:00.000Z", updatedAt: "2025-07-20T16:45:00.000Z",
  },
];

export const seedUsers: User[] = [
  { id: "usr_001", email: "aisha@example.com", name: "Aisha M.", role: "customer", avatar: null, addresses: [{ line1: "42 Modest Lane", line2: "Apt 7B", city: "Dubai", state: "Dubai", zip: "00000", country: "UAE" }], createdAt: "2025-01-15T00:00:00.000Z", updatedAt: "2025-07-01T00:00:00.000Z" },
  { id: "usr_002", email: "layla@example.com", name: "Layla K.", role: "customer", avatar: null, addresses: [{ line1: "15 Pearl Tower", city: "Kuala Lumpur", state: "Wilayah Persekutuan", zip: "50000", country: "Malaysia" }], createdAt: "2025-02-10T00:00:00.000Z", updatedAt: "2025-07-15T00:00:00.000Z" },
  { id: "usr_003", email: "nadia@example.com", name: "Nadia T.", role: "customer", avatar: null, addresses: [{ line1: "88 Garden Road", city: "London", state: "England", zip: "SW1A 1AA", country: "United Kingdom" }], createdAt: "2025-03-20T00:00:00.000Z", updatedAt: "2025-07-20T00:00:00.000Z" },
  { id: "usr_admin", email: "admin@duniaboutique.com", name: "Dunia Admin", role: "admin", avatar: null, addresses: [], createdAt: "2024-12-01T00:00:00.000Z", updatedAt: "2025-06-01T00:00:00.000Z" },
];
