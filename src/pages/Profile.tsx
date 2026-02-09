import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Calendar, 
  MessageCircle, 
  Star, 
  CheckCircle2, 
  ShieldCheck, 
  Eye, 
  Heart,
  ArrowLeft
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { SAMPLE_PRODUCTS } from "@/data/products";
import { ROUTE_PATHS, User, cn } from "@/lib/index";
import { springPresets, fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

/**
 * Satıcı Profil Sayfası
 * Premium 'Digital Boudoir' estetiği ile tasarlanmış, doğrulama ve itibar odaklı.
 */
export default function Profile() {
  const { id } = useParams<{ id: string }>();

  // Örnek veriden satıcıyı ve ürünlerini bul
  const { seller, sellerProducts } = useMemo(() => {
    const products = SAMPLE_PRODUCTS.filter((p) => p.seller.id === id);
    // Eğer ürün yoksa (ID geçersizse), ilk üründeki satıcıyı gösterelim (demo amaçlı)
    const sellerInfo = products.length > 0 ? products[0].seller : SAMPLE_PRODUCTS[0].seller;
    return { 
      seller: sellerInfo, 
      sellerProducts: products 
    };
  }, [id]);

  if (!seller) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h2 className="text-2xl font-bold mb-4">Profil bulunamadı.</h2>
          <Link to={ROUTE_PATHS.HOME} className="text-primary hover:underline">
            Ana Sayfaya Dön
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        {/* Geri Dön Navigasyonu */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link 
            to={ROUTE_PATHS.PRODUCTS} 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Koleksiyonlara Dön</span>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sol Kolon: Satıcı Bilgileri */}
          <motion.div 
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="lg:col-span-4 space-y-8"
          >
            <div className="relative group">
              {/* Avatar ve Neon Efekti */}
              <div className="relative z-10 w-48 h-48 mx-auto lg:mx-0 rounded-2xl overflow-hidden border-2 border-primary/20 bg-card">
                <img 
                  src={seller.avatar} 
                  alt={seller.username} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {seller.isVerified && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                )}
              </div>
              {/* Arka plan ışıması */}
              <div className="absolute -inset-4 bg-primary/5 blur-2xl rounded-full -z-0 opacity-50" />
            </div>

            <div className="space-y-4 text-center lg:text-left">
              <div className="flex flex-col gap-2 items-center lg:items-start">
                <h1 className="text-4xl font-bold tracking-tight">
                  {seller.username}
                </h1>
                {seller.isVerified && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-pulse">
                    <ShieldCheck size={14} />
                    <span>Doğrulanmış Satıcı</span>
                  </div>
                )}
              </div>

              <p className="text-muted-foreground leading-relaxed italic text-lg">
                "{seller.bio || "Sessizliğin içindeki hikayeleri keşfedin."}"
              </p>

              <div className="flex flex-wrap gap-4 pt-4 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin size={16} className="text-primary" />
                  <span>{seller.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={16} className="text-primary" />
                  <span>{new Date(seller.joinedDate).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}'den beri</span>
                </div>
              </div>
            </div>

            {/* İtibar Kartı */}
            <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-6 grid grid-cols-2 gap-4">
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-primary">
                  <Star size={18} fill="currentColor" />
                  <span className="text-xl font-bold">{seller.rating}</span>
                </div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Puan</p>
              </div>
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-primary">
                  <MessageCircle size={18} fill="currentColor" />
                  <span className="text-xl font-bold">{seller.whisperCount}</span>
                </div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Fısıltı</p>
              </div>
            </div>

            <button className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-2">
              <MessageCircle size={20} />
              Satıcıya Fısılda
            </button>

            <div className="pt-4 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Güvenlik Rozetleri
              </h3>
              <div className="flex gap-4">
                <div className="p-3 rounded-lg bg-secondary/50 border border-border/50 group hover:border-primary/50 transition-colors">
                  <ShieldCheck className="text-primary" size={24} />
                </div>
                <div className="p-3 rounded-lg bg-secondary/50 border border-border/50 group hover:border-primary/50 transition-colors">
                  <CheckCircle2 className="text-primary" size={24} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sağ Kolon: Ürünler */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">
                Gardırop <span className="text-muted-foreground font-light font-mono ml-2">({sellerProducts.length})</span>
              </h2>
              <div className="h-px flex-1 bg-border/30 mx-6 hidden sm:block" />
              <select className="bg-transparent border-none text-sm text-muted-foreground focus:ring-0 cursor-pointer hover:text-primary transition-colors">
                <option>En Yeniler</option>
                <option>Fiyata Göre</option>
                <option>Popülerlik</option>
              </select>
            </div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {sellerProducts.length > 0 ? (
                sellerProducts.map((product) => (
                  <motion.div key={product.id} variants={staggerItem}>
                    <ProductCard product={product} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed border-border/30 rounded-3xl">
                  <p>Bu satıcının henüz aktif ilanı bulunmuyor.</p>
                </div>
              )}
            </motion.div>

            {/* Satıcı İstatistikleri (Detay) */}
            <div className="mt-16 pt-8 border-t border-border/30">
              <h3 className="text-xl font-semibold mb-6">Profil Etkinliği</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-secondary/20 p-4 rounded-xl border border-border/20">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Eye size={14} />
                    <span className="text-xs">Toplam Görüntülenme</span>
                  </div>
                  <div className="text-xl font-mono">12.4K+</div>
                </div>
                <div className="bg-secondary/20 p-4 rounded-xl border border-border/20">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Heart size={14} />
                    <span className="text-xs">Beğeniler</span>
                  </div>
                  <div className="text-xl font-mono">842</div>
                </div>
                <div className="bg-secondary/20 p-4 rounded-xl border border-border/20">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <ShieldCheck size={14} />
                    <span className="text-xs">Güven Skoru</span>
                  </div>
                  <div className="text-xl font-mono text-primary">%98</div>
                </div>
                <div className="bg-secondary/20 p-4 rounded-xl border border-border/20">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar size={14} />
                    <span className="text-xs">Teslimat Hızı</span>
                  </div>
                  <div className="text-xl font-mono">2 Gün</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
