import React, { useState, useEffect } from 'react';
import { usePageMeta } from '@/hooks/usePageMeta';
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
import { useFavorites } from '@/contexts/FavoritesContext';
import { AddProductModal, type DbProductForEdit } from '@/components/AddProductModal';
import { toast } from '@/hooks/use-toast';

const PRICE_PER_DAY = 15;

interface DbProduct {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  image_urls?: string[];
  is_active: boolean;
  created_at: string;
  base_duration: number;
  max_duration: number;
  extras: { id: string; label: string; price: number }[];
  seller?: {
    username: string;
    role: string;
    avatar_url?: string;
  };
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCart((state) => state.addItem);
  const { user } = useAuth();

  const [dbProduct, setDbProduct] = useState<DbProduct | null>(null);
  const [loadingDb, setLoadingDb] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);

  usePageMeta(
    dbProduct ? dbProduct.title : undefined,
    dbProduct ? dbProduct.description?.substring(0, 160) : undefined
  );

  useEffect(() => {
    if (!supabase || !id) {
      setLoadingDb(false);
      return;
    }
    async function fetchProduct() {
      // 1. Fetch product
      const { data: productData, error: productError } = await supabase!
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (productError || !productData) {
        console.error("Error fetching product:", productError);
        setLoadingDb(false);
        return;
      }

      // 2. Fetch seller profile
      let sellerData: { username: string; role: string } | null = null;

      const { data: profileResult, error: profileFetchError } = await supabase!
        .from("profiles")
        .select("username, role, avatar_url")
        .eq("id", productData.user_id)
        .maybeSingle();

      if (profileFetchError) {
        // Profile fetch failed silently
      }

      if (profileResult) {
        sellerData = profileResult;
      } else {
        // Profile doesn't exist — try to auto-create it
        // Profile not found — attempting auto-creation

        const { error: upsertError } = await supabase!
          .from("profiles")
          .upsert({
            id: productData.user_id,
            username: "Kullanıcı",
            role: "seller"
          }, { onConflict: "id" });

        if (upsertError) {
          // Auto-create failed silently
        } else {
          // Re-fetch after creation
          const { data: newProfile } = await supabase!
            .from("profiles")
            .select("username, role, avatar_url")
            .eq("id", productData.user_id)
            .maybeSingle();

          if (newProfile) {
            sellerData = newProfile;
          }
        }
      }



      // Always provide seller info — fallback to defaults if profile still not found
      const sellerInfo = sellerData || { username: 'Satıcı', role: 'seller' };

      setDbProduct({ ...productData, seller: sellerInfo } as DbProduct);
      setLoadingDb(false);
    }
    fetchProduct();
  }, [id]);

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
  const { user } = useAuth();
  const { isFavorite, toggleFavorite, getFavoriteCount } = useFavorites();
  const baseDuration = product.base_duration || 1;
  const maxDuration = product.max_duration || 7;
  const extras = product.extras || [];

  // Image carousel
  const allImages = (product.image_urls?.length ? product.image_urls : product.image_url ? [product.image_url] : []);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const currentImage = allImages[activeImageIndex] || "/images/placeholder.webp";
  const fav = isFavorite(product.id);
  const favCount = getFavoriteCount(product.id);

  const [duration, setDuration] = useState(baseDuration);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [isWhispering, setIsWhispering] = useState(false);

  const extrasTotal = extras
    .filter(e => selectedExtras.includes(e.id))
    .reduce((s, e) => s + e.price, 0);
  const durationExtra = (duration - 1) * PRICE_PER_DAY;
  const totalPrice = product.price + durationExtra + extrasTotal;



  const handleWhisper = async () => {
    if (!user) {
      toast({ title: "Giriş yapmalısınız", description: "Fısıldamak için lütfen giriş yapın.", variant: "destructive" });
      window.dispatchEvent(new Event('open-login'));
      return;
    }

    if (isOwner) {
      toast({ title: "Hata", description: "Kendi ilanınıza fısıldayamazsınız.", variant: "destructive" });
      return;
    }

    if (!supabase) {
      toast({ title: "Bağlantı hatası", description: "Lütfen sayfayı yenileyin.", variant: "destructive" });
      return;
    }

    setIsWhispering(true);

    try {
      // 1. Check if chat exists
      const { data: chatData, error: fetchError } = await supabase!
        .from('chats')
        .select('id')
        .eq('product_id', product.id)
        .eq('buyer_id', user.id)
        .eq('seller_id', product.user_id)
        .maybeSingle();

      if (fetchError) {
        toast({ title: "Hata", description: "Sohbet kontrolü başarısız. Lütfen tekrar deneyin.", variant: "destructive" });
        throw fetchError;
      }

      let chatId = chatData?.id;

      if (!chatId) {
        const { data: newChat, error: createError } = await supabase!
          .from('chats')
          .insert({
            buyer_id: user.id,
            seller_id: product.user_id,
            product_id: product.id
          })
          .select()
          .single();

        if (createError) {
          toast({ title: "Hata", description: `Sohbet oluşturulamadı: ${createError.message}`, variant: "destructive" });
          throw createError;
        }

        chatId = newChat.id;
      }

      // 2. Send offer message

      const offerDetails = {
        duration,
        extras: extras.filter(e => selectedExtras.includes(e.id)),
        totalPrice
      };

      const { error: msgError } = await supabase!
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          content: `Merhaba, "${product.title}" için bir teklifim var.`,
          is_offer: true,
          offer_details: offerDetails
        });

      if (msgError) {
        toast({ title: "Hata", description: `Mesaj gönderilemedi: ${msgError.message}`, variant: "destructive" });
        throw msgError;
      }

      // 3. Navigate to chat
      navigate(ROUTE_PATHS.CHAT_DETAIL.replace(':id', chatId));

    } catch (error: any) {
      // Error already handled via toast notifications
    } finally {
      setIsWhispering(false);
    }
  };

  const editData: DbProductForEdit = {
    id: product.id,
    user_id: product.user_id,
    title: product.title,
    description: product.description,
    price: product.price,
    category: product.category,
    image_url: product.image_url,
    image_urls: product.image_urls,
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

          {/* Sol Kolon: Görsel Carousel */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImageIndex}
                  src={currentImage}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onError={(e) => { (e.target as HTMLImageElement).src = "/images/placeholder.webp"; }}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

              {/* Arrow Navigation */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev + 1) % allImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  {/* Image counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImageIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === activeImageIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'}`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Category Badge */}
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-black/40 backdrop-blur-md border-white/10 text-white">
                  {product.category}
                </Badge>
              </div>

              {/* Fav Button */}
              <button
                onClick={() => toggleFavorite(product.id)}
                className="absolute top-4 right-4 mt-10 p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-all"
              >
                <Heart className={`w-5 h-5 transition-all duration-300 ${fav ? 'text-pink-500 fill-pink-500' : 'text-white/70 hover:text-pink-400'}`} />
                {favCount > 0 && (
                  <span className="absolute -bottom-1 -right-1 bg-primary text-[10px] text-white font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {favCount}
                  </span>
                )}
              </button>

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

            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${i === activeImageIndex ? 'border-primary ring-2 ring-primary/30' : 'border-white/10 hover:border-white/30'}`}
                  >
                    <img src={url} alt={`Görsel ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sağ Kolon: Detaylar */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="space-y-4"
            >
              {/* Seller Card (DB) */}
              {product.seller && (
                <motion.div
                  whileHover={{ x: 4 }}
                  onClick={() => navigate(getProfilePath(product.user_id))}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/40 transition-colors cursor-pointer group mb-4"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg border-2 border-white/10 overflow-hidden">
                      {product.seller.avatar_url ? (
                        <img src={product.seller.avatar_url} alt={product.seller.username} className="w-full h-full object-cover" />
                      ) : (
                        product.seller.username.substring(0, 1).toUpperCase()
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold group-hover:text-primary transition-colors">
                        {product.seller.username}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-pink-400 tracking-widest bg-pink-500/10 px-1.5 py-0.5 rounded border border-pink-500/20">
                        {product.seller.role === 'seller' ? 'Satıcı' : 'Kullanıcı'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Profili görüntüle →
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </motion.div>
              )}
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


