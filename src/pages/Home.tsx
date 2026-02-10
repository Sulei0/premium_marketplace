import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { TrustIndicators } from "@/components/TrustIndicators";
import { RegistrationModal } from "@/components/RegistrationModal"; 
import { LoginModal } from "@/components/LoginModal"; 
import { SAMPLE_PRODUCTS } from "@/data/products";
import { IMAGES } from "@/assets/images";
import { springPresets, fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { Button } from "@/components/ui/button";

export default function Home() {
  // Modal durumlarını yöneten değişkenler
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'seller' | 'buyer'>('buyer');

  // FONKSİYON 1: Kayıt penceresini açar (Girişi kapatır)
  const openRegistration = (role: 'seller' | 'buyer') => {
    setSelectedRole(role);
    setIsLoginOpen(false);      // Girişi Kapat
    setTimeout(() => {
      setIsRegisterOpen(true);  // Kayıdı Aç (Çakışmayı önlemek için milisaniyelik gecikme)
    }, 50);
  };

  // FONKSİYON 2: Giriş penceresini açar (Kayıdı kapatır)
  const openLogin = () => {
    setIsRegisterOpen(false);   // Kayıdı Kapat
    setTimeout(() => {
      setIsLoginOpen(true);     // Girişi Aç
    }, 50);
  };

  return (
    <Layout>
      <div className="flex flex-col w-full overflow-hidden">
        
        {/* --- MODALLAR BURADA YÖNETİLİYOR --- */}
        
        <RegistrationModal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
          initialRole={selectedRole}
          onSwitchToLogin={openLogin} // "Giriş Yap" butonuna bu fonksiyonu bağladık
        />

        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onSwitchToRegister={() => openRegistration('buyer')} // "Kayıt Ol" butonuna bu fonksiyonu bağladık
        />

        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src={IMAGES.HERO_BG_7} alt="Boudoir Background" className="w-full h-full object-cover opacity-40 scale-105" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/60 to-background" />
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${IMAGES.TEXTURE_BG_2})`, backgroundSize: 'cover', mixBlendMode: 'overlay' }} />
          </div>

          <div className="container relative z-10 px-4 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={springPresets.smooth} className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              <span>Seçkin ve Gizli: Yeni Koleksiyon Yayında</span>
            </motion.div>

            <motion.h1 className="hero-shimmer-text text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 leading-tight" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springPresets.gentle, delay: 0.2 }}>
              Bir kadının Kirli Sepetini karıştırmaya ne dersin?
            </motion.h1>

            <motion.p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springPresets.gentle, delay: 0.4 }}>
              Sıradanlığın ötesinde, her parçanın bir ruhu ve yaşanmışlığı var. 
              Dijital boudoir atmosferinde güvenli, gizli ve premium bir alışveriş deneyimi.
            </motion.p>

            <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springPresets.gentle, delay: 0.6 }}>
              {/* BUTONLAR */}
              <Button size="lg" className="h-14 px-8 rounded-full text-lg font-semibold group" onClick={() => openRegistration("seller")}>
                Satıcıyım <ChevronRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-8 rounded-full text-lg border-primary/20 hover:bg-primary/5" onClick={() => openRegistration("buyer")}>
                Alıcıyım
              </Button>
            </motion.div>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/20 blur-[120px] rounded-full z-0" />
        </section>

        {/* Featured Section */}
        <section className="py-24 bg-background relative">
          <div className="container px-4">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {SAMPLE_PRODUCTS.map((product) => (
                <motion.div key={product.id} variants={staggerItem}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}