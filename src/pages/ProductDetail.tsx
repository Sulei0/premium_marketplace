import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Heart,
  Eye,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Lock,
  Loader2,
  Edit3,
  Check
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
import { springPresets, fadeInUp } from '@/lib/motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { AddProductModal, type DbProductForEdit } from '@/components/AddProductModal';

const PRICE_PER_DAY = 15;

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
  base_duration: number;
  max_duration: number;
  extras: { id: string; label: string; price: number }[];
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCart((state) => state.addItem);
  const { user } = useAuth();

  // Try sample products first
  const sampleProduct = useMemo(() =>
    SAMPLE_PRODUCTS.find((p) => p.id === id),
    [id]
  );

  // If not in sample, try DB
  const [dbProduct, setDbProduct] = useState<DbProduct | null>(null);
  const [loadingDb, setLoadingDb] = useState(!sampleProduct);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (sampleProduct || !supabase || !id) {
      setLoadingDb(false);
      return;
    }
    async function fetchProduct() {
      const { data, error } = await supabase!
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) {
        setDbProduct(data as DbProduct);
      }
      setLoadingDb(false);
    }
    fetchProduct();
  }, [id, sampleProduct]);

  // Loading
  if (loadingDb) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Route to appropriate view
  if (sampleProduct) {
    return <SampleProductView product={sampleProduct} />;
  }

  if (dbProduct) {
    return (
      <DbProductView
        product={dbProduct}
        isOwner={user?.id === dbProduct.user_id}
        onEdit={() => setEditModalOpen(true)}
        editModalOpen={editModalOpen}
        onCloseEdit={() => setEditModalOpen(false)}
      />
    );
  }

  // Not found
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl font-bold mb-4">Ürün Bulunamadı</h2>
        <p className="text-muted-foreground mb-8">Aradığınız özel parça boudoir koleksiyonumuzda yer almıyor olabilir.</p>
        <Button onClick={() => navigate(ROUTE_PATHS.HOME)} variant="outline">
          Ana Sayfaya Dön
        </Button>
      </div>
    </Layout>
  );
}

/** DB Product Detail View — with duration slider, extras, and edit button for owner */
function DbProductView({ product, isOwner, onEdit, editModalOpen, onCloseEdit }: {
  product: DbProduct;
  isOwner: boolean;
  onEdit: () => void;
  editModalOpen: boolean;
  onCloseEdit: () => void;
}) {
  const navigate = useNavigate();
  const baseDuration = product.base_duration || 1;
  const maxDuration = product.max_duration || 7;
  const extras = product.extras || [];

  const [duration, setDuration] = useState(baseDuration);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [isWhispering, setIsWhispering] = useState(false);

  const extrasTotal = extras
    .filter(e => selectedExtras.includes(e.id))
    .reduce((s, e) => s + e.price, 0);
  const durationExtra = (duration - 1) * PRICE_PER_DAY;
  const totalPrice = product.price + durationExtra + extrasTotal;

  const handleWhisper = () => {
    setIsWhispering(true);
    setTimeout(() => {
      setIsWhispering(false);
      navigate(ROUTE_PATHS.HOME);
    }, 800);
  };

  const editData: DbProductForEdit = {
    id: product.id,
    user_id: product.user_id,
    title: product.title,
    description: product.description,
    price: product.price,
    category: product.category,
    image_url: product.image_url,
    base_duration: baseDuration,
    max_duration: maxDuration,
    extras: extras.map(e => ({ ...e, enabled: true })),
  };

  return (
    <Layout>
      {/* Edit Modal */}
      <AddProductModal
        isOpen={editModalOpen}
        onClose={onCloseEdit}
        editProduct={editData}
      />

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Sol Kolon: Görsel */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted group">
              <img
                src={product.image_url || "/images/placeholder.webp"}
                alt={product.title}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = "/images/placeholder.webp"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

              {/* Category Badge */}
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-black/40 backdrop-blur-md border-white/10 text-white">
                  {product.category}
                </Badge>
              </div>

              {/* Owner Edit Badge */}
              {isOwner && (
                <button
                  onClick={onEdit}
                  className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-pink-600/80 backdrop-blur-md text-white text-sm font-semibold rounded-full hover:bg-pink-500 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  İlanı Düzenle
                </button>
              )}
            </div>
          </div>

          {/* Sağ Kolon: Detaylar */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="space-y-4"
            >
              <h1 className="text-4xl font-bold tracking-tight">{product.title}</h1>

              <div className="text-muted-foreground leading-relaxed">
                <p>{product.description}</p>
              </div>

              <div className="text-xs text-muted-foreground">
                {new Date(product.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </motion.div>

            <Separator className="bg-border/30" />

            {/* Tenin Sıcaklığı Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-pink-400">
                  🔥 Tenin Sıcaklığı (Gün)
                </h3>
                <span className="text-lg font-mono text-pink-400 font-bold">{duration} Gün</span>
              </div>
              <div className="px-1">
                <input
                  type="range"
                  min={baseDuration}
                  max={maxDuration}
                  step={1}
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${((duration - baseDuration) / Math.max(maxDuration - baseDuration, 1)) * 100}%, rgba(255,255,255,0.1) ${((duration - baseDuration) / Math.max(maxDuration - baseDuration, 1)) * 100}%, rgba(255,255,255,0.1) 100%)`,
                  }}
                />
                <style>{`
                  input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 22px; height: 22px; border-radius: 50%;
                    background: #ec4899; cursor: pointer;
                    box-shadow: 0 0 15px rgba(236,72,153,0.6), 0 0 30px rgba(236,72,153,0.3);
                    border: 2px solid white;
                  }
                  input[type="range"]::-moz-range-thumb {
                    width: 22px; height: 22px; border-radius: 50%;
                    background: #ec4899; cursor: pointer;
                    box-shadow: 0 0 15px rgba(236,72,153,0.6), 0 0 30px rgba(236,72,153,0.3);
                    border: 2px solid white;
                  }
                `}</style>
                <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground font-mono uppercase">
                  <span>Taze</span>
                  <span>Yoğun</span>
                  <span>Mühürlenmiş</span>
                </div>
              </div>
              {durationExtra > 0 && (
                <p className="text-xs text-pink-300/70 text-right">
                  +{formatCurrency(durationExtra)} süre ek ücreti
                </p>
              )}
            </div>

            {/* Ekstra Haz Menüsü */}
            {extras.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-purple-400">
                  ✨ Ekstra Haz Seçenekleri
                </h3>
                <div className="space-y-2">
                  {extras.map((extra) => {
                    const checked = selectedExtras.includes(extra.id);
                    return (
                      <div
                        key={extra.id}
                        onClick={() => setSelectedExtras(prev =>
                          checked ? prev.filter(id => id !== extra.id) : [...prev, extra.id]
                        )}
                        className={cn(
                          "flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer group",
                          checked
                            ? "bg-purple-500/10 border-purple-500/30"
                            : "bg-card border-border/50 hover:border-border"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                            checked ? "bg-purple-500 border-purple-500" : "border-muted-foreground/30"
                          )}>
                            {checked && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm font-medium">{extra.label}</span>
                        </div>
                        <span className="text-sm font-mono text-purple-400">+{formatCurrency(extra.price)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fiyat ve Aksiyon */}
            <div className="pt-4 space-y-5">
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Tahmini Bedel</p>
                  <p className="text-4xl font-bold text-foreground">{formatCurrency(totalPrice)}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Taban {formatCurrency(product.price)}
                    {durationExtra > 0 && ` + Süre ${formatCurrency(durationExtra)}`}
                    {extrasTotal > 0 && ` + Ekstra ${formatCurrency(extrasTotal)}`}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono border-green-500/30 text-green-500 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> GİZLİ ÖDEME
                </Badge>
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
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Button>

              <div className="flex items-center justify-center gap-6 text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-primary" /> Anonim Gönderim
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-primary" /> Güvenli Ödeme
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

/** Original Sample Product Detail View — kept as-is */
function SampleProductView({ product }: { product: typeof SAMPLE_PRODUCTS[number] }) {
  const navigate = useNavigate();
  const addItem = useCart((state) => state.addItem);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [duration, setDuration] = useState<number>(product.baseDuration || 1);
  const [selectedExtras, setSelectedExtras] = useState<ProductExtra[]>([]);
  const [isWhispering, setIsWhispering] = useState(false);

  const handleExtraToggle = (extra: ProductExtra) => {
    setSelectedExtras((prev) =>
      prev.find((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra]
    );
  };

  const totalPrice = useMemo(() => {
    const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
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
      navigate(ROUTE_PATHS.HOME);
    }, 800);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

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

          <div className="lg:col-span-5 space-y-8">
            <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="space-y-4">
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
              <motion.div
                whileHover={{ x: 4 }}
                onClick={() => navigate(getProfilePath(product.seller.id))}
                className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/40 transition-colors cursor-pointer group"
              >
                <div className="relative">
                  <img src={product.seller.avatar} alt={product.seller.username} className="w-12 h-12 rounded-full object-cover border border-border" />
                  {product.seller.isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                      <ShieldCheck className="w-4 h-4 text-primary fill-primary/10" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold group-hover:text-primary transition-colors">{product.seller.username}</span>
                    {product.seller.isVerified && (
                      <span className="text-[10px] uppercase font-bold text-primary tracking-widest bg-primary/5 px-1.5 py-0.5 rounded border border-primary/20">Doğrulanmış</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{product.seller.whisperCount} Fısıltı • {product.seller.rating} Puan</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </motion.div>
            </motion.div>

            <Separator className="bg-border/30" />

            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Ürün Hikayesi</h3>
              <p className="text-muted-foreground leading-relaxed italic">"{product.story}"</p>
            </div>

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
                        ? "bg-primary/5 border-primary/40"
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

            <div className="pt-6 space-y-6">
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Tahmini Bedel</p>
                  <p className="text-4xl font-bold text-foreground">{formatCurrency(totalPrice)}</p>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono border-green-500/30 text-green-500 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> GİZLİ ÖDEME
                </Badge>
              </div>

              <Button
                size="lg"
                className="w-full h-16 rounded-2xl bg-primary text-primary-foreground text-lg font-bold shadow-[0_8px_30px_rgba(var(--primary),0.3)] hover:scale-[1.01] active:scale-[0.98] transition-all group overflow-hidden relative"
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
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Button>

              <div className="flex items-center justify-center gap-6 text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-primary" /> Anonim Gönderim</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-primary" /> Güvenli Ödeme</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-primary" /> 7/24 Destek</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
