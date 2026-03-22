
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SEO } from "@/components/SEO";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getOptimizedImageUrl, getOptimizedAvatarUrl, getOptimizedDetailUrl } from "@/lib/utils";
import { springPresets, fadeInUp } from '@/lib/motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useBlock } from '@/contexts/BlockContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { AddProductModal, type DbProductForEdit } from '@/components/AddProductModal';
import { toast } from '@/hooks/use-toast';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import { AdminProductActions } from '@/components/admin/AdminProductActions';
import { ReportModal } from '@/components/ReportModal';
import { Flag } from 'lucide-react';
import { DbProductCard } from '@/components/DbProductCard';



interface DbProduct {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  size?: string;
  image_url: string | null;
  image_urls?: string[];
  is_active: boolean;
  is_sold: boolean;
  created_at: string;
  extras: { id: string; label: string; price: number }[];
  seller?: {
    username: string;
    role: string;
    avatar_url?: string;
    badges?: string[];
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
      let sellerData: { username: string; role: string; badges?: string[] } | null = null;

      const { data: profileResult, error: profileFetchError } = await supabase!
        .from("profiles")
        .select("username, role, avatar_url, badges")
        .eq("id", productData.user_id)
        .maybeSingle();

      if (profileFetchError) {
        console.error("Profil alınamadı:", profileFetchError);
      }

      if (profileResult) {
        sellerData = profileResult;
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
      <>
        <SEO
          title={`${dbProduct.title} | Giyenden`}
          description={dbProduct.description?.substring(0, 160) || "Giyenden üzerinden harika bir ürün."}
          image={dbProduct.image_url || undefined}
          url={`https://giyenden.com/product/${dbProduct.id}`}
          type="product"
        >
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": dbProduct.title,
              "image": dbProduct.image_url ? [dbProduct.image_url] : [],
              "description": dbProduct.description,
              "offers": {
                "@type": "Offer",
                "url": `https://giyenden.com/product/${dbProduct.id}`,
                "priceCurrency": "TRY",
                "price": dbProduct.price,
                "itemCondition": "https://schema.org/UsedCondition",
                "availability": dbProduct.is_sold ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
                "seller": {
                  "@type": "Person",
                  "name": dbProduct.seller?.username || "Giyenden Satıcısı"
                }
              }
            })}
          </script>
        </SEO>
        <DbProductView
          product={dbProduct}
          isOwner={user?.id === dbProduct.user_id}
          onEdit={() => setEditModalOpen(true)}
          editModalOpen={editModalOpen}
          onCloseEdit={() => setEditModalOpen(false)}
        />
      </>
    );
  }

  // Not found
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl font-bold mb-4">Ürün Bulunamadı</h2>
        <p className="text-muted-foreground mb-8">Aradığınız ürün koleksiyonumuzda yer almıyor olabilir.</p>
        <Button onClick={() => navigate(ROUTE_PATHS.HOME)} variant="outline">
          Ana Sayfaya Dön
        </Button>
      </div>
    </Layout>
  );
}

/** DB Product Detail View — with extras and edit button for owner */

/* ── CSS for heart burst particles ── */
const heartBurstStyles = `
@keyframes heart-particle {
  0% { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
}
.heart-burst-particle {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ec4899;
  pointer-events: none;
  animation: heart-particle 0.55s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
}
@keyframes heart-ring {
  0% { transform: scale(0.3); opacity: 0.8; }
  100% { transform: scale(1.8); opacity: 0; }
}
.heart-burst-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid #ec4899;
  pointer-events: none;
  animation: heart-ring 0.5s ease-out forwards;
}
`;

const PARTICLES = [
  { tx: "-14px", ty: "-16px" },
  { tx: "14px", ty: "-16px" },
  { tx: "-18px", ty: "2px" },
  { tx: "18px", ty: "2px" },
  { tx: "-10px", ty: "14px" },
  { tx: "10px", ty: "14px" },
];
function DbProductView({ product, isOwner, onEdit, editModalOpen, onCloseEdit }: {
  product: DbProduct;
  isOwner: boolean;
  onEdit: () => void;
  editModalOpen: boolean;
  onCloseEdit: () => void;
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isBlocked: checkBlocked, isBlockedByMe: checkBlockedByMe } = useBlock();
  const { isFavorite, toggleFavorite, getFavoriteCount, fetchFavoriteCount } = useFavorites();
  const extras = product.extras || [];

  // Image carousel
  const allImages = (product.image_urls?.length ? product.image_urls : product.image_url ? [product.image_url] : []);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const currentImage = allImages[activeImageIndex] || "/images/placeholder.webp";
  const fav = isFavorite(product.id);
  const favCount = getFavoriteCount(product.id);

  // Fetch count when product changes
  useEffect(() => {
    fetchFavoriteCount(product.id);
  }, [product.id]);

  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [isWhispering, setIsWhispering] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [showPaymentDisclaimer, setShowPaymentDisclaimer] = useState(false);
  const [favBurst, setFavBurst] = useState(false);

  // If sold, we might want to disable interactions
  const isSold = product.is_sold;

  const extrasTotal = extras
    .filter(e => selectedExtras.includes(e.id))
    .reduce((s, e) => s + e.price, 0);
  const totalPrice = product.price + extrasTotal;



  const handleWhisperClick = () => {
    if (!user) {
      toast({ title: "Giriş yapmalısınız", description: "Fısıldamak için lütfen giriş yapın.", variant: "destructive" });
      window.dispatchEvent(new Event('open-login'));
      return;
    }
    if (isOwner) {
      toast({ title: "Hata", description: "Kendi ilanınıza fısıldayamazsınız.", variant: "destructive" });
      return;
    }
    // Block check
    if (checkBlocked(product.user_id)) {
      toast({
        title: "Engelleme mevcut",
        description: checkBlockedByMe(product.user_id)
          ? "Bu satıcıyı engellediniz. Teklif göndermek için engeli kaldırın."
          : "Bu satıcı tarafından engellendiniz. Teklif gönderemezsiniz.",
        variant: "destructive",
      });
      return;
    }
    // Show disclaimer first
    setShowPaymentDisclaimer(true);
  };

  const executeWhisper = async () => {
    setShowPaymentDisclaimer(false);

    if (!user) return; // Should be handled by click check but for safety

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
          toast({ title: "Hata", description: `Sohbet oluşturulamadı: ${createError.message} `, variant: "destructive" });
          throw createError;
        }

        chatId = newChat.id;
      }

      // 2. Send offer message

      const offerDetails = {
        extras: extras.filter(e => selectedExtras.includes(e.id)),
        totalPrice
      };

      const { error: msgError } = await supabase!
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          content: `Teklif: ${totalPrice} TL`,
          is_offer: true,
          offer_amount: parseFloat(totalPrice.toFixed(2)),
          offer_status: "pending",
          offer_details: offerDetails
        });

      if (msgError) {
        toast({ title: "Hata", description: `Mesaj gönderilemedi: ${msgError.message} `, variant: "destructive" });
        throw msgError;
      }

      // 3. Send notification to the owner
      if (product.user_id !== user.id) {
        await supabase!
          .from("notifications")
          .insert({
            user_id: product.user_id,
            type: "new_offer",
            title: "Yeni Teklif!",
            body: `@${user.user_metadata?.username || "kullanıcı"} ürünün için ${totalPrice} TL teklif verdi.`,
            link: `/chats/${chatId}`,
            is_read: false
          });
      }

      // 4. Navigate to chat
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
    size: product.size,
    image_url: product.image_url,
    image_urls: product.image_urls,
    extras: extras.map(e => ({ ...e, enabled: true })),
    is_sold: product.is_sold,
  };

  return (
    <Layout>
      <style>{heartBurstStyles}</style>
      {/* Edit Modal */}
      <AddProductModal
        isOpen={editModalOpen}
        onClose={onCloseEdit}
        editProduct={editData}
      />

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        productId={product.id}
        productTitle={product.title}
      />

      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">

          {/* Sol Kolon: Görsel Carousel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-square md:aspect-[4/5] lg:max-h-[600px] rounded-2xl overflow-hidden bg-[#1a1a1a] border border-white/5 group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImageIndex}
                  src={currentImage}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onError={(e) => { (e.target as HTMLImageElement).src = "/images/placeholder.webp"; }}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

              {isSold && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20 pointer-events-none">
                  <div className="transform -rotate-12 border-2 sm:border-4 border-red-500 text-red-500 font-black text-2xl sm:text-4xl md:text-5xl uppercase tracking-[0.2em] px-4 sm:px-6 py-1 sm:py-2 rounded-sm opacity-90 shadow-[0_0_30px_rgba(239,68,68,0.4)] backdrop-blur-sm">
                    SATILDI
                  </div>
                </div>
              )}

              {/* Arrow Navigation */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-all opacity-70 sm:opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev + 1) % allImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-all opacity-70 sm:opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  {/* Image counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImageIndex(i)}
                        className={`w - 2 h - 2 rounded - full transition - all ${i === activeImageIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'} `}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Category & Size Badges */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Badge variant="secondary" className="bg-black/40 backdrop-blur-md border-white/10 text-white">
                  {product.category}
                </Badge>
                {product.size && (
                  <Badge variant="secondary" className="bg-pink-500/30 backdrop-blur-md border-pink-500/20 text-white font-semibold">
                    {product.size}
                  </Badge>
                )}
              </div>

              {/* Fav Button */}
              <button
                onClick={() => {
                  toggleFavorite(product.id, product.user_id);
                  setFavBurst(true);
                  setTimeout(() => setFavBurst(false), 600);
                }}
                className="absolute top-4 right-4 mt-10 p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-all"
              >
                <Heart className={`w - 5 h - 5 transition - all duration - 300 ${fav ? 'text-pink-500 fill-pink-500' : 'text-white/70 hover:text-pink-400'} `} />
                {favCount > 0 && (
                  <span className="absolute -bottom-1 -right-1 bg-primary text-[10px] text-white font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {favCount}
                  </span>
                )}
                {/* Burst particles */}
                {favBurst && (
                  <>
                    <span className="heart-burst-ring" />
                    {PARTICLES.map((p, i) => (
                      <span
                        key={i}
                        className="heart-burst-particle"
                        style={{ "--tx": p.tx, "--ty": p.ty, left: "50%", top: "50%", marginLeft: "-3px", marginTop: "-3px" } as React.CSSProperties}
                      />
                    ))}
                  </>
                )}
              </button>

              {/* Owner Edit Badge */}
              {isOwner && !isSold && (
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
                    className={`relative w - 16 h - 20 rounded - lg overflow - hidden flex - shrink - 0 border - 2 transition - all ${i === activeImageIndex ? 'border-primary ring-2 ring-primary/30' : 'border-white/10 hover:border-white/30'} `}
                  >
                    <img src={getOptimizedImageUrl(url, 200, 200)} alt={`Görsel ${i + 1} `} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sağ Kolon: Detaylar */}
          <div className="lg:col-span-7 space-y-6 lg:pl-4">
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
                        <img src={getOptimizedAvatarUrl(product.seller.avatar_url)} alt={product.seller.username} className="w-full h-full object-cover" loading="lazy" />
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
                      <BadgeDisplay badges={product.seller.badges || []} size="sm" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Profili görüntüle →
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </motion.div>
              )}
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">{product.title}</h1>

              <div className="text-muted-foreground leading-relaxed">
                <p>{product.description}</p>
              </div>

              <div className="text-xs text-muted-foreground">
                {new Date(product.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </motion.div>

            <Separator className="bg-border/30" />

            {/* Ekstra Hizmetler */}
            {extras.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-purple-400">
                  ✨ Ekstra Hizmetler
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
                  <p className="text-3xl sm:text-4xl font-bold text-foreground">{formatCurrency(totalPrice)}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Taban {formatCurrency(product.price)}
                    {extrasTotal > 0 && ` + Ekstra ${formatCurrency(extrasTotal)} `}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono border-green-500/30 text-green-500 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> P2P ÖDEME
                </Badge>
              </div>

              {isSold && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                  <p className="text-red-500 font-bold uppercase tracking-widest text-sm">
                    💔 Üzgünüz, bu ürün artık başkasının.
                  </p>
                </div>
              )}

              <Button
                size="lg"
                className={cn(
                  "w-full h-16 rounded-2xl text-lg font-bold shadow-[0_8px_30px_rgba(var(--primary),0.3)] hover:shadow-[0_12px_40px_rgba(var(--primary),0.4)] hover:scale-[1.01] active:scale-[0.98] transition-all group overflow-hidden relative",
                  isSold ? "bg-muted text-muted-foreground shadow-none hover:shadow-none hover:scale-100 cursor-not-allowed" : "bg-primary text-primary-foreground"
                )}
                onClick={handleWhisperClick}
                disabled={isWhispering || isSold}
              >
                {isSold ? (
                  <span className="flex items-center gap-2">
                    <Lock className="w-5 h-5" /> BU ÜRÜN SATILDI
                  </span>
                ) : isWhispering ? (
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
                {!isSold && <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />}
              </Button>

              <div className="flex items-center justify-center gap-6 text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-primary" /> Anonim Gönderim
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-primary" /> Doğrudan İletişim
                </div>
              </div>

              {/* Admin Actions */}
              <AdminProductActions productId={product.id} sellerId={product.user_id} />

              {/* Report Button */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Flag className="w-3 h-3" /> İlanı Bildir
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showPaymentDisclaimer} onOpenChange={setShowPaymentDisclaimer}>
        <AlertDialogContent className="max-w-md bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
              <ShieldCheck className="w-6 h-6" />
              🎯 Teklif başarıyla iletildi.
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed space-y-3 pt-2">
              <p>
                Satıcı kabul ettiğinde, işlem detayları taraflar arasında sohbet üzerinden organize edilir.
              </p>
              <div className="space-y-1">
                <p>💳 <strong>Ödeme:</strong> IBAN</p>
                <p>📦 <strong>Gönderim:</strong> Satıcı tarafından sağlanır</p>
              </div>
              <p>
                🔒 Giyenden topluluğunda güven esastır. Alışveriş öncesi satıcı profilini ve değerlendirmeleri incelemenizi öneririz.
              </p>
              <p>
                🛡️ Olası bir sorun durumunda Giyenden ekibi süreci inceleyerek taraflara destek olur ve çözüm için yardımcı olur.
              </p>
              <p>
                💬 Süreci mesajlar bölümünden takip edebilirsiniz.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:space-x-4">
            <AlertDialogCancel className="rounded-xl">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeWhisper}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
            >
              ✅ Devam Et
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Similar Products */}
      <SimilarProducts category={product.category} currentId={product.id} />
    </Layout>
  );
}

/** Similar products — same category, max 4 items */
function SimilarProducts({ category, currentId }: { category: string; currentId: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchMultipleFavoriteCounts } = useFavorites();

  useEffect(() => {
    if (!supabase || !category) {
      setLoading(false);
      return;
    }
    async function fetch() {
      const { data, error } = await supabase!
        .from('products')
        .select('id, title, description, price, category, size, image_url, created_at, user_id, is_active, is_sold')
        .eq('category', category)
        .eq('is_active', true)
        .eq('is_approved', true)
        .neq('id', currentId)
        .order('created_at', { ascending: false })
        .limit(4);

      if (!error && data && data.length > 0) {
        setProducts(data);
        fetchMultipleFavoriteCounts(data.map((p: any) => p.id));
      }
      setLoading(false);
    }
    fetch();
  }, [category, currentId]);

  // Don't render anything if no similar products or loading resulted in nothing
  if (!loading && products.length === 0) return null;

  return (
    <div className="container mx-auto px-4 pb-16 max-w-6xl">
      <Separator className="bg-border/30 mb-12" />
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Benzer Ürünler</h2>
        <p className="text-muted-foreground text-sm mt-1">Aynı kategorideki diğer ürünler</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[4/5] rounded-xl bg-card/40 border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <DbProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
