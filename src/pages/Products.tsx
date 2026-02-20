import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Sparkles, X, Loader2, Heart, ArrowUpDown, ChevronDown } from "lucide-react";
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

const SORT_OPTIONS = [
  { label: "En Yeni", value: "newest" },
  { label: "En Eski", value: "oldest" },
  { label: "Fiyat: Düşükten Yükseğe", value: "price_asc" },
  { label: "Fiyat: Yüksekten Düşüğe", value: "price_desc" },
] as const;

const PRICE_RANGES = [
  { label: "Tümü", min: 0, max: Infinity },
  { label: "₺0 – ₺100", min: 0, max: 100 },
  { label: "₺100 – ₺250", min: 100, max: 250 },
  { label: "₺250 – ₺500", min: 250, max: 500 },
  { label: "₺500 – ₺1.000", min: 500, max: 1000 },
  { label: "₺1.000+", min: 1000, max: Infinity },
] as const;

export default function Products() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number]>("Tümü");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<typeof SORT_OPTIONS[number]["value"]>("newest");
  const [priceRange, setPriceRange] = useState<typeof PRICE_RANGES[number]>(PRICE_RANGES[0]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const ITEMS_PER_PAGE = 50;

  usePageMeta("Koleksiyon", "Giyenden'de en yeni ürünleri keşfet. Güvenli ve gizli alışveriş.");

  const fetchProducts = async (pageNumber: number) => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const from = pageNumber * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from("products")
        .select("id, title, description, price, category, image_url, created_at, user_id, is_active, is_sold")
        .eq("is_active", true)
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (!error && data) {
        const newProducts = data as DbProduct[];

        if (newProducts.length < ITEMS_PER_PAGE) {
          setHasMore(false);
        }

        setProducts(prev => pageNumber === 0 ? newProducts : [...prev, ...newProducts]);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(0);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage);
  };

  // Determine effective min/max for filtering
  const effectiveMin = minPrice !== "" ? Number(minPrice) : priceRange.min;
  const effectiveMax = maxPrice !== "" ? Number(maxPrice) : priceRange.max;

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "Tümü" || product.category === selectedCategory;

      const matchesPrice =
        product.price >= effectiveMin && product.price <= effectiveMax;

      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
    }

    return result;
  }, [products, searchTerm, selectedCategory, effectiveMin, effectiveMax, sortBy]);

  const activeFilterCount = [
    selectedCategory !== "Tümü",
    priceRange !== PRICE_RANGES[0] || minPrice !== "" || maxPrice !== "",
    sortBy !== "newest",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("Tümü");
    setPriceRange(PRICE_RANGES[0]);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
  };

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
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isFilterOpen || activeFilterCount > 0
                    ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                    : "bg-card border border-border hover:border-primary/50"
                  }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtrele
                {activeFilterCount > 0 && (
                  <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
                )}
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

            {/* Expanded Filter Panel */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 mb-6 space-y-6">
                    {/* Sort */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <ArrowUpDown className="w-4 h-4 text-primary" />
                        Sıralama
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {SORT_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setSortBy(option.value)}
                            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${sortBy === option.value
                                ? "bg-primary/20 text-primary border border-primary/30"
                                : "bg-secondary/50 text-muted-foreground border border-transparent hover:border-border"
                              }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3">💰 Fiyat Aralığı</h4>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {PRICE_RANGES.map((range, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setPriceRange(range);
                              setMinPrice("");
                              setMaxPrice("");
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${priceRange === range && minPrice === "" && maxPrice === ""
                                ? "bg-primary/20 text-primary border border-primary/30"
                                : "bg-secondary/50 text-muted-foreground border border-transparent hover:border-border"
                              }`}
                          >
                            {range.label}
                          </button>
                        ))}
                      </div>

                      {/* Custom price inputs */}
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₺</span>
                          <input
                            type="number"
                            placeholder="Min"
                            value={minPrice}
                            onChange={(e) => {
                              setMinPrice(e.target.value);
                              setPriceRange(PRICE_RANGES[0]); // Reset preset
                            }}
                            className="w-full bg-secondary/30 border border-border/50 rounded-xl py-2.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                          />
                        </div>
                        <span className="text-muted-foreground text-sm">—</span>
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₺</span>
                          <input
                            type="number"
                            placeholder="Max"
                            value={maxPrice}
                            onChange={(e) => {
                              setMaxPrice(e.target.value);
                              setPriceRange(PRICE_RANGES[0]); // Reset preset
                            }}
                            className="w-full bg-secondary/30 border border-border/50 rounded-xl py-2.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Filter Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/30">
                      <p className="text-xs text-muted-foreground">
                        {filteredProducts.length} ürün bulundu
                      </p>
                      <button
                        onClick={clearAllFilters}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Tüm filtreleri temizle
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
                <>
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

                  {/* Load More */}
                  {hasMore && (
                    <div className="flex justify-center mt-12">
                      <button
                        onClick={handleLoadMore}
                        className="px-8 py-3 bg-card border border-border rounded-full text-sm font-medium hover:border-primary/50 hover:bg-primary/5 transition-all"
                      >
                        Daha Fazla Yükle
                      </button>
                    </div>
                  )}
                </>
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
                        onClick={clearAllFilters}
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
