export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  images?: string[];
  badge?: "New" | "Best Seller" | "Sale";
  description?: string;
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  inStock?: boolean;
  stock?: number;
  material?: string;
  featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  count?: number;
}

export const categories: Category[] = [
  { id: "abayas", name: "Abayas", slug: "abayas", image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80&auto=format&fit=crop" },
  { id: "vip-abayas", name: "VIP Abayas", slug: "vip-abayas", image: "https://images.unsplash.com/photo-1623609871568-073325bf6b21?w=800&q=80&auto=format&fit=crop" },
  { id: "wedding-dirah", name: "Wedding Dirah", slug: "wedding-dirah", image: "https://images.unsplash.com/photo-1608236415050-8d3d65c3523e?w=800&q=80&auto=format&fit=crop" },
  { id: "perfumes", name: "Perfumes", slug: "perfumes", image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80&auto=format&fit=crop" },
  { id: "luxury-bags", name: "Luxury Bags", slug: "luxury-bags", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80&auto=format&fit=crop" },
  { id: "jewelry", name: "Jewelry", slug: "jewelry", image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80&auto=format&fit=crop" },
  { id: "shoes", name: "Shoes", slug: "shoes", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80&auto=format&fit=crop" },
];

export const testimonials = [
  { quote: "The quality is unparalleled. I receive compliments every time I wear my Dunia abaya.", author: "Aisha M." },
  { quote: "Finally, a brand that understands modest fashion without sacrificing style.", author: "Layla K." },
  { quote: "I ordered the Wedding Dirah for my nikah and felt like royalty.", author: "Nadia T." },
  { quote: "The attention to detail is extraordinary. This is what luxury should feel like.", author: "Fatima R." },
  { quote: "Dunia has completely transformed my wardrobe. Timeless, elegant, incredibly well-made.", author: "Samira H." },
];

export function getCategorySlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-");
}

export function getCategoryName(slug: string): string {
  const map: Record<string, string> = {
    abayas: "Abayas", "vip-abayas": "VIP Abayas", "wedding-dirah": "Wedding Dirah",
    perfumes: "Perfumes", "luxury-bags": "Luxury Bags", jewelry: "Jewelry", shoes: "Shoes",
  };
  return map[slug] || slug;
}
