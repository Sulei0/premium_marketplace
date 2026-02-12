import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Sparkles, X, Loader2, Heart } from "lucide-react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/index";
import { useFavorites } from "@/contexts/FavoritesContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { ImageWithSkeleton } from "@/components/ImageWithSkeleton";
import { DbProductCard } from "@/components/DbProductCard";

interface DbProduct {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

const CATEGORIES = ["Tümü", "Çorap", "İç Giyim", "Aksesuar", "Özel Parçalar"] as const;

export default function Products() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number]>("Tümü");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  usePageMeta("Koleksiyon", "Giyenden'de en yeni ürünleri keşfet. Güvenli ve gizli alışveriş.");

  useEffect(() => {
    async function fetchProducts() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, title, description, price, category, image_url, created_at, user_id, is_active")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setProducts(data as DbProduct[]);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "Tümü" || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  return (
    <Layout>
      <div className="min-h-screen pb-20">
        {/* Header & Search Section */}
        <section className="relative pt-32 pb-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-primary mb-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-mono uppercase tracking-widest">Özel Koleksiyon</span>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60"
                >
                  Koleksiyonu Keşfet
                </motion.h1>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="relative w-full md:w-96 group"
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Bir arzu nesnesi ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            </div>

            {/* Filters Navigation */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm font-medium hover:border-primary/50 transition-all"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtrele
              </button>

              <div className="h-6 w-px bg-border mx-2 hidden sm:block" />

              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                      ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="container mx-auto px-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground text-sm">Ürünler yükleniyor...</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredProducts.length > 0 ? (
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
                >
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <DbProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-24 text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Sparkles className="w-10 h-10 text-primary" />
                  </div>
                  {products.length === 0 ? (
                    <>
                      <h3 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
                        Henüz ürün eklenmedi
                      </h3>
                      <p className="text-muted-foreground max-w-md mb-6 leading-relaxed">
                        Koleksiyonumuz şu an boş görünüyor. İlk ilanı sen ver, vitrini sen aç! ✨
                      </p>
                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent('open-register', { detail: { role: 'seller' } }))}
                        className="px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold rounded-full shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all transform hover:scale-105 active:scale-95"
                      >
                        İlk İlanı Ver 🚀
                      </button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-semibold mb-2">Sonuç Bulunamadı</h3>
                      <p className="text-muted-foreground max-w-xs">
                        Aradığınız kriterlere uygun bir parça bulunamadı. Lütfen aramayı genişletmeyi deneyin.
                      </p>
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedCategory("Tümü");
                        }}
                        className="mt-6 text-primary hover:underline font-medium text-sm"
                      >
                        Tüm filtreleri temizle
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </section>

        {/* Bottom Trust CTA */}
        <section className="container mx-auto px-4 mt-24">
          <div className="relative overflow-hidden rounded-3xl bg-card border border-border/50 p-8 md:p-12 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Aradığını Bulamadın mı?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Favori satıcına özel isteklerini iletebilir veya kendi boudoir koleksiyonunu oluşturmaya başlayabilirsin.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-register', { detail: { role: 'seller' } }))}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:opacity-90 transition-all"
              >
                Satıcı Olmaya Başla
              </button>
              <button className="px-8 py-3 bg-secondary text-secondary-foreground rounded-full font-semibold hover:bg-secondary/80 transition-all">
                Destek Al
              </button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

// ... (DbProductCard removed) ...

