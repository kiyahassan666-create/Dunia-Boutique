"use client";

const categories = [
  { name:"Abayas", slug:"abayas", count:24 },
  { name:"VIP Abayas", slug:"vip-abayas", count:12 },
  { name:"Wedding Dirah", slug:"wedding-dirah", count:18 },
  { name:"Perfumes", slug:"perfumes", count:32 },
  { name:"Luxury Bags", slug:"luxury-bags", count:15 },
  { name:"Jewelry", slug:"jewelry", count:28 },
  { name:"Shoes", slug:"shoes", count:20 },
];

export default function AdminCategories() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-medium text-charcoal dark:text-[#E8E0D8]">Categories</h1>
        <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mt-1">{categories.length} categories</p>
      </div>
      <div className="border border-gold/10">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gold/10">
              <th className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body px-4 py-3">Name</th>
              <th className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body px-4 py-3">Slug</th>
              <th className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body px-4 py-3">Products</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.slug} className="border-b border-gold/5 hover:bg-gold/5 transition-colors">
                <td className="px-4 py-3 font-serif text-sm text-charcoal dark:text-[#E8E0D8]">{c.name}</td>
                <td className="px-4 py-3 text-[10px] tracking-[0.15em] text-warm-gray font-body">/{c.slug}</td>
                <td className="px-4 py-3 font-serif text-sm text-gold-dark">{c.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
