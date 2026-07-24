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
  { key: "hero_home", label: "Homepage Hero", defaultUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1600&q=85&auto=format&fit=crop", page: "Home", section: "Hero Banner" },
  { key: "hero_abayas", label: "Abayas Hero", defaultUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1600&q=85&auto=format&fit=crop", page: "Abayas", section: "Hero Banner" },
  { key: "story_abayas", label: "Abayas Brand Story", defaultUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&q=85&auto=format&fit=crop", page: "Abayas", section: "Brand Story" },
  { key: "hero_vip", label: "VIP Abayas Hero", defaultUrl: "https://images.unsplash.com/photo-1623609871568-073325bf6b21?w=1600&q=85&auto=format&fit=crop", page: "VIP Abayas", section: "Hero Banner" },
  { key: "story_vip", label: "VIP Abayas Brand Story", defaultUrl: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=900&q=85&auto=format&fit=crop", page: "VIP Abayas", section: "Brand Story" },
  { key: "hero_wedding", label: "Wedding Dirah Hero", defaultUrl: "https://images.unsplash.com/photo-1608236415050-8d3d65c3523e?w=1600&q=85&auto=format&fit=crop", page: "Wedding Dirah", section: "Hero Banner" },
  { key: "story_wedding", label: "Wedding Dirah Brand Story", defaultUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=85&auto=format&fit=crop", page: "Wedding Dirah", section: "Brand Story" },
  { key: "hero_perfumes", label: "Perfumes Hero", defaultUrl: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1600&q=85&auto=format&fit=crop", page: "Perfumes", section: "Hero Banner" },
  { key: "story_perfumes", label: "Perfumes Brand Story", defaultUrl: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=900&q=85&auto=format&fit=crop", page: "Perfumes", section: "Brand Story" },
  { key: "hero_bags", label: "Luxury Bags Hero", defaultUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1600&q=85&auto=format&fit=crop", page: "Luxury Bags", section: "Hero Banner" },
  { key: "story_bags", label: "Luxury Bags Brand Story", defaultUrl: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=900&q=85&auto=format&fit=crop", page: "Luxury Bags", section: "Brand Story" },
  { key: "hero_jewelry", label: "Jewelry Hero", defaultUrl: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1600&q=85&auto=format&fit=crop", page: "Jewelry", section: "Hero Banner" },
  { key: "story_jewelry", label: "Jewelry Brand Story", defaultUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=85&auto=format&fit=crop", page: "Jewelry", section: "Brand Story" },
  { key: "hero_shoes", label: "Shoes Hero", defaultUrl: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=1600&q=85&auto=format&fit=crop", page: "Shoes", section: "Hero Banner" },
  { key: "story_shoes", label: "Shoes Brand Story", defaultUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=900&q=85&auto=format&fit=crop", page: "Shoes", section: "Brand Story" },
  { key: "hero_login", label: "Login Page Background", defaultUrl: "", page: "Login", section: "Background" },
  { key: "hero_signup", label: "Sign Up Page Background", defaultUrl: "", page: "Sign Up", section: "Background" },
  { key: "hero_checkout", label: "Checkout Page Background", defaultUrl: "", page: "Checkout", section: "Background" },
  { key: "hero_cart", label: "Cart Page Background", defaultUrl: "", page: "Cart", section: "Background" },
  { key: "hero_wishlist", label: "Wishlist Page Background", defaultUrl: "", page: "Wishlist", section: "Background" },
];

let cachedImages: Record<string, string> | null = null;

export async function getSiteImages(): Promise<Record<string, string>> {
  if (cachedImages) return cachedImages;
  try {
    const firestore = await getFirestoreImages();
    if (Object.keys(firestore).length > 0) {
      cachedImages = firestore;
      return firestore;
    }
  } catch {}
  const defaults: Record<string, string> = {};
  for (const img of IMAGE_DEFAULTS) defaults[img.key] = img.defaultUrl;
  cachedImages = defaults;
  return defaults;
}

export async function getImage(key: string): Promise<string> {
  const images = await getSiteImages();
  return images[key] || IMAGE_DEFAULTS.find((i) => i.key === key)?.defaultUrl || "";
}

export async function updateImage(key: string, url: string): Promise<void> {
  cachedImages = null;
  try {
    await setFirestoreImage(key, url);
  } catch {}
}

export async function deleteSiteImage(key: string): Promise<void> {
  cachedImages = null;
  try {
    await deleteFirestoreImage(key);
  } catch {}
}

export async function getAllImageEntries(): Promise<(SiteImage & { currentUrl: string })[]> {
  const images = await getSiteImages();
  return IMAGE_DEFAULTS.map((def) => ({
    ...def,
    currentUrl: images[def.key] || def.defaultUrl,
  }));
}
