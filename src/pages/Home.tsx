import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, ShoppingBag, Store, Heart, Check } from "lucide-react";
import { Layout } from "@/components/Layout";
import { IMAGES } from "@/assets/images";
import { springPresets, staggerItem } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/index";
import { useFavorites } from "@/contexts/FavoritesContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { ImageWithSkeleton } from "@/components/ImageWithSkeleton";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import { DbProductCard } from "@/components/DbProductCard";
import { toast } from "@/hooks/use-toast";

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
  const { user, role, setRole } = useAuth();
  const [dbProducts, setDbProducts] = useState<DbProduct[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);
  const [roleModal, setRoleModal] = useState<{ open: boolean; targetRole: UserRole }>({ open: false, targetRole: "buyer" });
  const [roleUpdating, setRoleUpdating] = useState(false);

  usePageMeta(undefined, "Türkiye'nin ilk premium C2C pazar yeri. Güvenli, gizli ve özel alışveriş deneyimi.");

  const handleRoleClick = (targetRole: UserRole) => {
    if (!user) {
      // Kullanıcı giriş yapmamış → Kayıt modalına yönlendir
      window.dispatchEvent(new CustomEvent('open-register', { detail: { role: targetRole } }));
      return;
    }

    if (role === 'admin') return;

    if (role === targetRole) {
      toast({
        title: targetRole === "seller" ? "Zaten Satıcısınız" : "Zaten Alıcısınız",
        description: `Hesap türünüz zaten ${targetRole === "seller" ? "Satıcı" : "Alıcı"} olarak ayarlanmış.`,
      });
      return;
    }

    // Onay modalı aç
    setRoleModal({ open: true, targetRole });
  };

  const confirmRoleChange = async () => {
    setRoleUpdating(true);
    try {
      await setRole(roleModal.targetRole);
      toast({
        title: "✅ Hesap Türü Güncellendi",
        description: `Hesabınız başarıyla ${roleModal.targetRole === "seller" ? "Satıcı" : "Alıcı"} olarak değiştirildi.`,
      });
      setRoleModal({ open: false, targetRole: "buyer" });
    } catch {
      toast({
        title: "Hata",
        description: "Hesap türü güncellenirken bir sorun oluştu. Tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setRoleUpdating(false);
    }
  };

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
          .select("id, title, description, price, category, image_url, created_at, user_id, is_active, is_sold")
          .select("id, title, description, price, category, image_url, created_at, user_id, is_active")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(20);

        if (!error && data) {
          setDbProducts(data as DbProduct[]);
        }
      } catch {
        // silently fail
      } finally {
        setLoadingDb(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <Layout>
      {/* Role Confirmation Modal */}
      <AnimatePresence>
        {roleModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => !roleUpdating && setRoleModal({ open: false, targetRole: "buyer" })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                {roleModal.targetRole === "seller" ? (
                  <Store className="w-8 h-8 text-primary" />
                ) : (
                  <ShoppingBag className="w-8 h-8 text-primary" />
                )}
              </div>

              <h3 className="text-xl font-bold mb-2">Hesap Türü Değişikliği</h3>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                Hesap türünüz{" "}
                <span className="font-semibold text-primary">
                  {roleModal.targetRole === "seller" ? "Satıcı" : "Alıcı"}
                </span>{" "}
                olarak güncellenecektir. Onaylıyor musunuz?
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full"
                  onClick={() => setRoleModal({ open: false, targetRole: "buyer" })}
                  disabled={roleUpdating}
                >
                  Vazgeç
                </Button>
                <Button
                  className="flex-1 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white"
                  onClick={confirmRoleChange}
                  disabled={roleUpdating}
                >
                  {roleUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Onayla
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              Kirli sepetleri karıştırmaya ne dersin?
            </motion.h1>

            <motion.p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springPresets.gentle, delay: 0.4 }}>
              Sıradan kıyafetlerin ötesinde; kokunun, sıcaklığın ve anıların dijital mabedine hoş geldiniz.
            </motion.p>

            <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springPresets.gentle, delay: 0.6 }}>
              <Button
                size="lg"
                className="h-14 px-8 rounded-full text-lg font-semibold group bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all"
                onClick={() => handleRoleClick("seller")}
              >
                <Store className="mr-2 w-5 h-5" />
                Satıcıyım
                {user && role === "seller" && <Check className="ml-2 w-4 h-4 text-green-300" />}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 rounded-full text-lg font-semibold group border-primary/40 hover:border-primary hover:bg-primary/10 hover:shadow-[0_0_20px_var(--primary)] transition-all"
                onClick={() => handleRoleClick("buyer")}
              >
                <ShoppingBag className="mr-2 w-5 h-5" />
                Alıcıyım
                {user && role === "buyer" && <Check className="ml-2 w-4 h-4 text-green-400" />}
              </Button>
            </motion.div>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/20 blur-[120px] rounded-full z-0" />
        </section>

        {/* DB Products Section */}
        <section id="products-section" className="py-24 bg-background relative">
          <div className="container px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Koleksiyonu Keşfet</h2>
                <p className="text-muted-foreground mt-2">Kullanıcılarımızın eklediği en yeni ürünler</p>
              </div>
              <div className="h-px flex-1 bg-border/30 mx-6 hidden sm:block" />
            </div>

            {loadingDb ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground text-sm">Ürünler yükleniyor...</p>
              </div>
            ) : dbProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {dbProducts.map((product) => (
                  <motion.div key={product.id} variants={staggerItem}>
                    <DbProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
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
              </motion.div>
            )}
          </div>
        </section>


      </div>
    </Layout>
  );
}

// ... (DbProductCard removed) ...
