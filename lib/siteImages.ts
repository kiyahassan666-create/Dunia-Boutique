import { getWebsiteImages as getFirestoreImages, setWebsiteImage as setFirestoreImage, deleteWebsiteImage as deleteFirestoreImage } from "./firebaseDb";

export interface SiteImage {
  key: string;
  label: string;
  defaultUrl: string;
  page: string;
  section: string;
}

export const IMAGE_DEFAULTS: SiteImage[] = [
  { key: "logo", label: "Brand Logo", defaultUrl: "", page: "Global", section: "Navbar / Header" },
  { key: "cat_abayas", label: "Abayas Card", defaultUrl: "", page: "Home", section: "Category Cards" },
  { key: "cat_vip_abayas", label: "VIP Abayas Card", defaultUrl: "", page: "Home", section: "Category Cards" },
  { key: "cat_wedding_dirah", label: "Wedding Dirah Card", defaultUrl: "", page: "Home", section: "Category Cards" },
  { key: "cat_perfumes", label: "Perfumes Card", defaultUrl: "", page: "Home", section: "Category Cards" },
  { key: "cat_bags", label: "Luxury Bags Card", defaultUrl: "", page: "Home", section: "Category Cards" },
  { key: "cat_jewelry", label: "Jewelry Card", defaultUrl: "", page: "Home", section: "Category Cards" },
  { key: "cat_shoes", label: "Shoes Card", defaultUrl: "", page: "Home", section: "Category Cards" },
  { key: "hero_home", label: "Homepage Hero", defaultUrl: "", page: "Home", section: "Hero Banner" },
  { key: "hero_abayas", label: "Abayas Hero", defaultUrl: "", page: "Abayas", section: "Hero Banner" },
  { key: "story_abayas", label: "Abayas Brand Story", defaultUrl: "", page: "Abayas", section: "Brand Story" },
  { key: "hero_vip", label: "VIP Abayas Hero", defaultUrl: "", page: "VIP Abayas", section: "Hero Banner" },
  { key: "story_vip", label: "VIP Abayas Brand Story", defaultUrl: "", page: "VIP Abayas", section: "Brand Story" },
  { key: "hero_wedding", label: "Wedding Dirah Hero", defaultUrl: "", page: "Wedding Dirah", section: "Hero Banner" },
  { key: "story_wedding", label: "Wedding Dirah Brand Story", defaultUrl: "", page: "Wedding Dirah", section: "Brand Story" },
  { key: "hero_perfumes", label: "Perfumes Hero", defaultUrl: "", page: "Perfumes", section: "Hero Banner" },
  { key: "story_perfumes", label: "Perfumes Brand Story", defaultUrl: "", page: "Perfumes", section: "Brand Story" },
  { key: "hero_bags", label: "Luxury Bags Hero", defaultUrl: "", page: "Luxury Bags", section: "Hero Banner" },
  { key: "story_bags", label: "Luxury Bags Brand Story", defaultUrl: "", page: "Luxury Bags", section: "Brand Story" },
  { key: "hero_jewelry", label: "Jewelry Hero", defaultUrl: "", page: "Jewelry", section: "Hero Banner" },
  { key: "story_jewelry", label: "Jewelry Brand Story", defaultUrl: "", page: "Jewelry", section: "Brand Story" },
  { key: "hero_shoes", label: "Shoes Hero", defaultUrl: "", page: "Shoes", section: "Hero Banner" },
  { key: "story_shoes", label: "Shoes Brand Story", defaultUrl: "", page: "Shoes", section: "Brand Story" },
  { key: "hero_login", label: "Login Page Background", defaultUrl: "", page: "Login", section: "Background" },
  { key: "hero_signup", label: "Sign Up Page Background", defaultUrl: "", page: "Sign Up", section: "Background" },
  { key: "hero_checkout", label: "Checkout Page Background", defaultUrl: "", page: "Checkout", section: "Background" },
  { key: "hero_cart", label: "Cart Page Background", defaultUrl: "", page: "Cart", section: "Background" },
  { key: "hero_wishlist", label: "Wishlist Page Background", defaultUrl: "", page: "Wishlist", section: "Background" },
];

const SESSION_KEY = "dunia_site_images";
let cachedImages: Record<string, string> | null = null;

function loadFromSession(): Record<string, string> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveToSession(images: Record<string, string>): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(images));
  } catch {}
}

export async function getSiteImages(): Promise<Record<string, string>> {
  if (cachedImages) return cachedImages;
  const session = loadFromSession();
  if (session) {
    cachedImages = session;
    return session;
  }
  try {
    const firestore = await getFirestoreImages();
    cachedImages = firestore;
    saveToSession(firestore);
    return firestore;
  } catch {
    cachedImages = {};
    return {};
  }
}

export async function getImage(key: string): Promise<string> {
  const images = await getSiteImages();
  return images[key] || "";
}

export async function updateImage(key: string, url: string): Promise<void> {
  cachedImages = null;
  clearSession();
  try {
    await setFirestoreImage(key, url);
  } catch {}
}

export async function deleteSiteImage(key: string): Promise<void> {
  cachedImages = null;
  clearSession();
  try {
    await deleteFirestoreImage(key);
  } catch {}
}

function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}

export async function getAllImageEntries(): Promise<(SiteImage & { currentUrl: string })[]> {
  const images = await getSiteImages();
  return IMAGE_DEFAULTS.map((def) => ({
    ...def,
    currentUrl: images[def.key] || "",
  }));
}
