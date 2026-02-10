import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Loader2, ShoppingBag, Store } from "lucide-react";
import { Layout } from "@/components/Layout";
import { IMAGES } from "@/assets/images";
import { springPresets, staggerItem } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/index";

/** DB product row shape */
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

export default function Home() {
  const [dbProducts, setDbProducts] = useState<DbProduct[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  // Fetch products from Supabase
  useEffect(() => {
    async function fetchProducts() {
      if (!supabase) {
        setLoadingDb(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(20);

        if (!error && data) {
          setDbProducts(data as DbProduct[]);
        }
      } catch {
        // silently fail — fallback to SAMPLE_PRODUCTS
      } finally {
        setLoadingDb(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <Layout>
      <div className="flex flex-col w-full overflow-hidden">

        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src={IMAGES.HERO_BG_7} alt="Boudoir Background" className="w-full h-full object-cover opacity-40 scale-105" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/60 to-background" />
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${IMAGES.TEXTURE_BG_2})`, backgroundSize: 'cover', mixBlendMode: 'overlay' }} />
          </div>

          <div className="container relative z-10 px-4 text-center">



            <motion.h1 className="hero-shimmer-text text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 leading-tight" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springPresets.gentle, delay: 0.2 }}>
              Bir kadının Kirli Sepetini karıştırmaya ne dersin?
            </motion.h1>

            <motion.p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springPresets.gentle, delay: 0.4 }}>
              Sıradanlığın ötesinde, her parçanın bir ruhu ve yaşanmışlığı var.
              Dijital boudoir atmosferinde güvenli, gizli ve premium bir alışveriş deneyimi.
            </motion.p>

            <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springPresets.gentle, delay: 0.6 }}>
              <Button
                size="lg"
                className="h-14 px-8 rounded-full text-lg font-semibold group bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all"
                onClick={() => window.dispatchEvent(new CustomEvent('open-register', { detail: { role: 'seller' } }))}
              >
                <Store className="mr-2 w-5 h-5" />
                Satıcıyım
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 rounded-full text-lg font-semibold group border-primary/40 hover:border-primary hover:bg-primary/10 hover:shadow-[0_0_20px_var(--primary)] transition-all"
                onClick={() => window.dispatchEvent(new CustomEvent('open-register', { detail: { role: 'buyer' } }))}
              >
                <ShoppingBag className="mr-2 w-5 h-5" />
                Alıcıyım
              </Button>
            </motion.div>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/20 blur-[120px] rounded-full z-0" />
        </section>

        {/* DB Products Section */}
        {dbProducts.length > 0 && (
          <section id="products-section" className="py-24 bg-background relative">
            <div className="container px-4">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Yeni İlanlar</h2>
                  <p className="text-muted-foreground mt-2">Kullanıcılarımızın eklediği en yeni ürünler</p>
                </div>
                <div className="h-px flex-1 bg-border/30 mx-6 hidden sm:block" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {dbProducts.map((product) => (
                  <motion.div key={product.id} variants={staggerItem}>
                    <DbProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}


      </div>
    </Layout>
  );
}

/** Simple card for DB products */
function DbProductCard({ product }: { product: { id: string; title: string; description: string; price: number; category: string; image_url: string | null; created_at: string } }) {
  const defaultImage = "/images/placeholder.webp";

  return (
    <Link to={`/product/${product.id}`} className="block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="group relative flex flex-col overflow-hidden rounded-xl bg-card/40 border border-white/5 backdrop-blur-md transition-all hover:border-primary/30 cursor-pointer"
      >
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-muted/20">
          <img
            src={product.image_url || defaultImage}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultImage;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-black/20 opacity-60" />

          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 bg-black/40 backdrop-blur-md border border-white/10 text-[10px] uppercase tracking-wider text-white/90 rounded-full">
              {product.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col p-4 space-y-3">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <h3 className="text-sm font-semibold tracking-tight text-foreground/90 line-clamp-1 group-hover:text-primary transition-colors">
                {product.title}
              </h3>
              <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                {product.description}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-mono font-bold text-primary">
                {formatCurrency(product.price)}
              </span>
            </div>
          </div>

          {/* Time ago */}
          <p className="text-[10px] text-muted-foreground/60">
            {new Date(product.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>

        {/* Hover Glow */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,rgba(255,46,126,0.1)_0%,transparent_70%)]" />
      </motion.div>
    </Link >
  );
}