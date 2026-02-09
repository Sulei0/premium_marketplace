import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { TrustIndicators } from "@/components/TrustIndicators";
import { RegistrationModal, type RegistrationRole } from "@/components/RegistrationModal";
import { SAMPLE_PRODUCTS } from "@/data/products";
import { IMAGES } from "@/assets/images";
import { springPresets, fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { Button } from "@/components/ui/button";

/**
 * Giyenden (KirliSepeti) Ana Sayfa
 * Dijital Boudoir atmosferinde, premium ve gizemli bir C2C pazar yeri deneyimi.
 */
export default function Home() {
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [regRole, setRegRole] = useState<RegistrationRole>("buyer");

  const openRegistration = (role: RegistrationRole) => {
    setRegRole(role);
    setRegModalOpen(true);
  };

  return (
    <Layout>
      <div className="flex flex-col w-full overflow-hidden">
        {/* Hero Section - Dijital Boudoir Girişi */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Background Layer */}
          <div className="absolute inset-0 z-0">
            <img
              src={IMAGES.HERO_BG_7}
              alt="Boudoir Background"
              className="w-full h-full object-cover opacity-40 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/60 to-background" />
            <div 
              className="absolute inset-0 opacity-20"
              style={{ 
                backgroundImage: `url(${IMAGES.TEXTURE_BG_2})`, 
                backgroundSize: 'cover', 
                mixBlendMode: 'overlay' 
              }}
            />
          </div>

          {/* Content */}
          <div className="container relative z-10 px-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={springPresets.smooth}
              className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Seçkin ve Gizli: Yeni Koleksiyon Yayında</span>
            </motion.div>

            <motion.h1 
              className="hero-shimmer-text text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springPresets.gentle, delay: 0.2 }}
            >
              Bir kadının Kirli Sepetini karıştırmaya ne dersin?
            </motion.h1>

            <motion.p 
              className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springPresets.gentle, delay: 0.4 }}
            >
              Sıradanlığın ötesinde, her parçanın bir ruhu ve yaşanmışlığı var. 
              Dijital boudoir atmosferinde güvenli, gizli ve premium bir alışveriş deneyimi.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springPresets.gentle, delay: 0.6 }}
            >
              <Button
                size="lg"
                className="h-14 px-8 rounded-full text-lg font-semibold group"
                onClick={() => openRegistration("seller")}
              >
                Satıcıyım
                <ChevronRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 rounded-full text-lg border-primary/20 hover:bg-primary/5"
                onClick={() => openRegistration("buyer")}
              >
                Alıcıyım
              </Button>
            </motion.div>

            <RegistrationModal
              open={regModalOpen}
              onOpenChange={setRegModalOpen}
              role={regRole}
            />
          </div>

          {/* Bottom Accent Glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/20 blur-[120px] rounded-full z-0" />
        </section>

        {/* Featured Feed - Instagram Tarzı Vitrin */}
        <section className="py-24 bg-background relative">
          <div className="container px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                  <Zap className="text-primary fill-primary/20" />
                  Öne Çıkan Fısıltılar
                </h2>
                <p className="text-muted-foreground max-w-lg">
                  Topluluğumuzun en çok ilgi gören, doğrulanmış satıcılarından özel seçkiler.
                </p>
              </div>
              <Button variant="link" className="text-primary p-0 h-auto text-lg">
                Tümünü Gör
              </Button>
            </div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {SAMPLE_PRODUCTS.map((product) => (
                <motion.div key={product.id} variants={staggerItem}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Trust & Atmosphere Banner */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src={IMAGES.ACCENT_GLOW_6} 
              alt="Neon Accent" 
              className="w-full h-full object-cover opacity-10 blur-xl"
            />
          </div>
          
          <div className="container relative z-10 px-4">
            <div className="bg-card/40 border border-border/50 backdrop-blur-2xl rounded-3xl p-8 md:p-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 text-primary font-mono text-sm tracking-widest uppercase">
                    <ShieldCheck className="w-4 h-4" />
                    Güvenli Bölge
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                    Gizliliğin, <br />
                    Bizim <span className="text-primary">Önceliğimiz.</span>
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Giyenden, kullanıcılarının güvenliğini ve gizliliğini en üst düzeyde tutmak için tasarlanmıştır. 
                    Uçtan uca şifreli mesajlaşma, anonim ödeme sistemleri ve gizli gönderim seçenekleri ile huzur içinde keşfedin.
                  </p>
                  <TrustIndicators className="justify-start" />
                </div>

                <div className="relative aspect-square rounded-2xl overflow-hidden border border-primary/20 group">
                   <img 
                    src={IMAGES.HERO_BG_10}
                    alt="Verified Security"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-60" />
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="flex items-center gap-4 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold">%100 Doğrulanmış</p>
                        <p className="text-xs text-muted-foreground">Tüm profiller manuel olarak incelenir.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="container px-4 max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-8">Kendi Hikayeni Yazmaya Hazır Mısın?</h2>
            <p className="text-xl text-muted-foreground mb-12">
              Satıcı ol, kendi dünyanı yarat veya eşsiz parçaları keşfetmek için aramıza katıl.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Button size="lg" className="h-16 px-12 rounded-full text-xl shadow-[0_0_20px_rgba(235,54,121,0.3)] hover:shadow-[0_0_30px_rgba(235,54,121,0.5)] transition-all">
                Şimdi Katıl
              </Button>
              <Button variant="outline" size="lg" className="h-16 px-12 rounded-full text-xl border-primary/40">
                Satıcı Ol
              </Button>
            </div>
          </motion.div>
        </section>
      </div>
    </Layout>
  );
}
