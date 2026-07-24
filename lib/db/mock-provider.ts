import type { DataProvider, Product, Category, Order, User, Review } from "./types";
import { seedProducts, seedCategories, seedOrders, seedUsers } from "./seed/seed";

let products = [...seedProducts];
let categories = [...seedCategories];
let orders = [...seedOrders];
let users = [...seedUsers];
let reviews: Review[] = [];

function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function now() {
  return new Date().toISOString();
}

export const mockProvider: DataProvider = {
  // Products
  async getProducts() { return products; },
  async getProductBySlug(slug) { return products.find((p) => p.slug === slug) ?? null; },
  async getProductById(id) { return products.find((p) => p.id === id) ?? null; },
  async createProduct(data) {
    const p: Product = { id: id("prod"), ...data, createdAt: now(), updatedAt: now() };
    products.push(p); return p;
  },
  async updateProduct(id, data) {
    const i = products.findIndex((p) => p.id === id);
    if (i === -1) throw new Error(`Product ${id} not found`);
    products[i] = { ...products[i], ...data, updatedAt: now() };
    return products[i];
  },
  async deleteProduct(id) { products = products.filter((p) => p.id !== id); },

  // Categories
  async getCategories() { return categories; },
  async getCategoryBySlug(slug) { return categories.find((c) => c.slug === slug) ?? null; },
  async createCategory(data) {
    const c: Category = { id: id("cat"), ...data, createdAt: now(), updatedAt: now() };
    categories.push(c); return c;
  },
  async updateCategory(id, data) {
    const i = categories.findIndex((c) => c.id === id);
    if (i === -1) throw new Error(`Category ${id} not found`);
    categories[i] = { ...categories[i], ...data, updatedAt: now() };
    return categories[i];
  },
  async deleteCategory(id) { categories = categories.filter((c) => c.id !== id); },

  // Orders
  async getOrders() { return orders; },
  async getOrderById(id) { return orders.find((o) => o.id === id) ?? null; },
  async createOrder(data) {
    const o: Order = { id: id("ord"), ...data, createdAt: now(), updatedAt: now() };
    orders.push(o); return o;
  },
  async updateOrder(id, data) {
    const i = orders.findIndex((o) => o.id === id);
    if (i === -1) throw new Error(`Order ${id} not found`);
    orders[i] = { ...orders[i], ...data, updatedAt: now() };
    return orders[i];
  },
  async deleteOrder(id) { orders = orders.filter((o) => o.id !== id); },

  // Users
  async getUsers() { return users; },
  async getUserById(id) { return users.find((u) => u.id === id) ?? null; },
  async createUser(data) {
    const u: User = { id: id("usr"), ...data, createdAt: now(), updatedAt: now() };
    users.push(u); return u;
  },
  async updateUser(id, data) {
    const i = users.findIndex((u) => u.id === id);
    if (i === -1) throw new Error(`User ${id} not found`);
    users[i] = { ...users[i], ...data, updatedAt: now() };
    return users[i];
  },
  async deleteUser(id) { users = users.filter((u) => u.id !== id); },

  // Reviews
  async getReviews(productId) { return reviews.filter((r) => r.productId === productId); },
  async createReview(data) {
    const r: Review = { id: id("rev"), ...data, createdAt: now() };
    reviews.push(r); return r;
  },
};
