import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Heart, 
  Eye, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { SAMPLE_PRODUCTS } from '@/data/products';
import { 
  formatCurrency, 
  ROUTE_PATHS, 
  ProductExtra, 
  getProfilePath, 
  cn 
} from '@/lib/index';
import { useCart } from '@/hooks/useCart';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { springPresets, fadeInUp, hoverLift } from '@/lib/motion';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCart((state) => state.addItem);

  const product = useMemo(() => 
    SAMPLE_PRODUCTS.find((p) => p.id === id), 
    [id]
  );

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [duration, setDuration] = useState<number>(product?.baseDuration || 1);
  const [selectedExtras, setSelectedExtras] = useState<ProductExtra[]>([]);
  const [isWhispering, setIsWhispering] = useState(false);

  if (!product) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <h2 className="text-2xl font-bold mb-4">Ürün Bulunamadı</h2>
          <p className="text-muted-foreground mb-8">Aradığınız özel parça boudoir koleksiyonumuzda yer almıyor olabilir.</p>
          <Button onClick={() => navigate(ROUTE_PATHS.PRODUCTS)} variant="outline">
            Koleksiyona Dön
          </Button>
        </div>
      </Layout>
    );
  }

  const handleExtraToggle = (extra: ProductExtra) => {
    setSelectedExtras((prev) =>
      prev.find((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra]
    );
  };

  const totalPrice = useMemo(() => {
    const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
    // Duration might affect price if business logic requires it, here we just sum them
    return product.price + extrasTotal;
  }, [product.price, selectedExtras]);

  const handleWhisper = () => {
    setIsWhispering(true);
    setTimeout(() => {
      addItem({
        product,
        selectedDuration: duration,
        selectedExtras,
        totalPrice,
      });
      setIsWhispering(false);
      // Navigate to cart or show success toast (simulated by redirect)
      navigate(ROUTE_PATHS.HOME);
    }, 800);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sol Kolon: Görsel Galerisi (Instagram Tarzı) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImageIndex}
                  src={product.images[activeImageIndex]}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Galeri Navigasyon */}
              {product.images.length > 1 && (
                <>
                  <button 
                    onClick={() => setActiveImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={() => setActiveImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Görsel Sayacı */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
                {product.images.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      activeImageIndex === idx ? "w-6 bg-primary" : "w-2 bg-white/40"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Küçük Resimler */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={cn(
                    "relative w-24 aspect-[4/5] rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all",
                    activeImageIndex === idx ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Sağ Kolon: Ürün Bilgileri & Aksiyonlar */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={fadeInUp}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-accent/10 text-primary border-primary/20">
                  {product.category}
                </Badge>
                <div className="flex items-center gap-4 text-xs text-muted-foreground ml-auto">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {product.stats.views}</span>
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {product.stats.likes}</span>
                </div>
              </div>

              <h1 className="text-4xl font-bold tracking-tight">{product.name}</h1>

              {/* Satıcı Kartı */}
              <motion.div 
                whileHover={{ x: 4 }}
                onClick={() => navigate(getProfilePath(product.seller.id))}
                className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/40 transition-colors cursor-pointer group"
              >
                <div className="relative">
                  <img 
                    src={product.seller.avatar} 
                    alt={product.seller.username} 
                    className="w-12 h-12 rounded-full object-cover border border-border"
                  />
                  {product.seller.isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                      <ShieldCheck className="w-4 h-4 text-primary fill-primary/10 drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold group-hover:text-primary transition-colors">{product.seller.username}</span>
                    {product.seller.isVerified && (
                      <span className="text-[10px] uppercase font-bold text-primary tracking-widest bg-primary/5 px-1.5 py-0.5 rounded border border-primary/20">
                        Doğrulanmış
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{product.seller.whisperCount} Fısıltı • {product.seller.rating} Puan</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </motion.div>
            </motion.div>

            <Separator className="bg-border/30" />

            {/* Ürün Hikayesi */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Ürün Hikayesi</h3>
              <p className="text-muted-foreground leading-relaxed italic">
                "{product.story}"
              </p>
            </div>

            {/* Tenin Sıcaklığı Slider */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Tenin Sıcaklığı (Gün)</h3>
                <span className="text-lg font-mono text-primary font-bold">{duration} Gün</span>
              </div>
              <div className="px-2">
                <Slider
                  defaultValue={[duration]}
                  min={product.baseDuration}
                  max={product.maxDuration}
                  step={1}
                  onValueChange={(val: number[]) => setDuration(val[0])}
                  className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_[role=slider]]:shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                />
                <div className="flex justify-between mt-2 text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">
                  <span>Taze</span>
                  <span>Yoğun</span>
                  <span>Mühürlenmiş</span>
                </div>
              </div>
            </div>

            {/* Ekstra Haz Menüsü */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Ekstra Haz Seçenekleri</h3>
              <div className="grid gap-3">
                {product.availableExtras.map((extra) => (
                  <div 
                    key={extra.id}
                    onClick={() => handleExtraToggle(extra)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group",
                      selectedExtras.find(e => e.id === extra.id) 
                        ? "bg-primary/5 border-primary/40 shadow-[inset_0_0_20px_rgba(var(--primary),0.05)]"
                        : "bg-card border-border/50 hover:border-border"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={selectedExtras.some(e => e.id === extra.id)}
                        onCheckedChange={() => handleExtraToggle(extra)}
                        className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <span className="text-sm font-medium">{extra.label}</span>
                    </div>
                    <span className="text-sm font-mono text-primary">+{formatCurrency(extra.price)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fiyat ve Aksiyon */}
            <div className="pt-6 space-y-6">
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Tahmini Bedel</p>
                  <p className="text-4xl font-bold text-foreground">{formatCurrency(totalPrice)}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-[10px] font-mono border-green-500/30 text-green-500 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> GİZLİ ÖDEME
                  </Badge>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full h-16 rounded-2xl bg-primary text-primary-foreground text-lg font-bold shadow-[0_8px_30px_rgba(var(--primary),0.3)] hover:shadow-[0_12px_40px_rgba(var(--primary),0.4)] hover:scale-[1.01] active:scale-[0.98] transition-all group overflow-hidden relative"
                onClick={handleWhisper}
                disabled={isWhispering}
              >
                {isWhispering ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:0.4s]" />
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    Satıcıya Fısılda <MessageSquare className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Button>

              <div className="flex items-center justify-center gap-6 text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-primary" />
                  Anonim Gönderim
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-primary" />
                  Güvenli Ödeme
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-primary" />
                  7/24 Destek
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
