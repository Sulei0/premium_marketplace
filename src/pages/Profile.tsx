import React, { useState, useEffect } from "react";
import { toast } from "sonner";
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
  ArrowLeft,
  Package,
  Edit3,
  Loader2
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { ROUTE_PATHS, cn, formatCurrency } from "@/lib/index";
import { validateImageFile } from "@/lib/sanitize";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ReviewForm, ReviewList } from "@/components/Reviews";

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

/**
 * Profil Sayfası
 * /profile/me → Giriş yapan kullanıcının kendi profili
 * /profile/:id → Satıcı profili (veritabanından)
 */
export default function Profile() {
  const { id } = useParams<{ id: string }>();

  // If /profile/me, show the logged-in user's own profile
  if (id === "me") {
    return <MyProfile />;
  }

  // Otherwise, show seller profile from database
  return <SellerProfile sellerId={id} />;
}

/** Logged-in user's own profile */
function MyProfile() {
  const { user } = useAuth();
  const [myProducts, setMyProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Local state for immediate UI updates
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // 1. Initial Load from Auth
  useEffect(() => {
    if (user) {
      setUsername(user.user_metadata?.username || user.email?.split("@")[0] || "Kullanıcı");
      // Use existing metadata mainly for initial render
      setAvatarUrl(user.user_metadata?.avatar_url || null);
    }
  }, [user]);

  // 2. Refresh from Database (The Truth)
  useEffect(() => {
    async function fetchFreshData() {
      if (!supabase || !user) {
        setLoading(false);
        return;
      }
      try {
        // A. Profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", user.id)
          .maybeSingle(); // Use maybeSingle to avoid errors if profile missing

        if (profile) {
          if (profile.username) setUsername(profile.username);
          // If DB has an avatar, use it. Append time to force refresh if it's the same URL but content changed.
          if (profile.avatar_url) {
            setAvatarUrl(`${profile.avatar_url}?t=${Date.now()}`);
          }
        }

        // B. Products
        const { data: products } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (products) {
          setMyProducts(products as DbProduct[]);
        }
      } catch (err) {
        console.error("Data fetch error", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFreshData();
  }, [user]);

  const handleSaveUsername = async () => {
    if (!supabase || !user) return;
    setSaving(true);
    try {
      // 1. Update DB
      const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', user.id);

      if (error) throw error;

      // 2. Update Auth
      await supabase.auth.updateUser({ data: { username } });

      toast.success("Kullanıcı adı güncellendi");
      setEditing(false);
    } catch (error: any) {
      toast.error("Hata: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Avatar Upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase || !user) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Geçersiz dosya.");
      return;
    }

    try {
      // Create a unique filename to avoid strict RLS collisions on overwrite if policy is tight
      // or just to be clean.
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/avatar_${Date.now()}.${fileExt}`;

      // Upload
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;

      // 1. Update DB
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 2. Update Auth Metadata
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      // 3. Force UI Update with Timestamp to bust cache
      const uniqueUrl = `${publicUrl}?t=${Date.now()}`;
      setAvatarUrl(uniqueUrl);

      toast.success("Profil fotoğrafı güncellendi!");

    } catch (error: any) {
      console.error(error);
      toast.error("Yükleme hatası: " + (error.message || "Bilinmeyen hata"));
    }
  };

  const handleDeleteAccount = async () => {
    if (!supabase || !user) return;
    if (!window.confirm("Hesabınızı kalıcı olarak silmek istediğinize emin misiniz?")) return;
    try {
      setSaving(true);
      await supabase.rpc('delete_account');
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error: any) {
      toast.error("Hata: " + error.message);
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-2xl font-bold mb-3">Giriş Yapmanız Gerekiyor</h2>
          <Link to={ROUTE_PATHS.HOME} className="text-primary hover:underline font-medium">Ana Sayfaya Dön</Link>
        </div>
      </Layout>
    );
  }

  const role = user.user_metadata?.role || "buyer";
  const joinDate = user.created_at ? new Date(user.created_at) : new Date();
  const firstLetter = username.charAt(0).toUpperCase();

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-16">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-8 md:p-10 mb-10"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative group cursor-pointer">
              <label htmlFor="avatar-upload" className="cursor-pointer block">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-primary/50 transition-all shadow-lg shadow-primary/20">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      key={avatarUrl} // Key change forces React to re-mount the img
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-white">{firstLetter}</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit3 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-3 mb-2">
                {editing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xl font-bold text-foreground focus:border-pink-500 focus:outline-none"
                    />
                    <button onClick={handleSaveUsername} disabled={saving} className="btn-primary px-4 py-2 rounded-lg text-sm">Kaydet</button>
                    <button onClick={() => setEditing(false)} className="px-3 py-2 text-muted-foreground">İptal</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold">{username}</h1>
                    <button onClick={() => setEditing(true)} className="p-1.5 text-muted-foreground hover:text-primary"><Edit3 className="w-4 h-4" /></button>
                  </div>
                )}
                <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
                  {role === "seller" ? "Satıcı" : "Alıcı"}
                </span>
              </div>
              <p className="text-muted-foreground text-sm">{user.email}</p>
              <div className="flex items-center gap-4 mt-3 justify-center md:justify-start">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{joinDate.toLocaleDateString("tr-TR", { month: "long", year: "numeric" })}'den beri</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Package className="w-4 h-4 text-primary" />
                  <span>{myProducts.length} ürün</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* My Products */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">İlanlarım ({myProducts.length})</h2>
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : myProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProducts.map((product) => <MyProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="py-16 text-center text-muted-foreground border-2 border-dashed border-border/30 rounded-3xl">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
              <p>Henüz ilan eklemediniz.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function MyProductCard({ product }: { product: DbProduct }) {
  return (
    <Link to={`/product/${product.id}`} className="block">
      <div className="group relative flex flex-col overflow-hidden rounded-xl bg-card/40 border border-white/5 backdrop-blur-md cursor-pointer hover:border-primary/30 transition-all">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted/20">
          {product.image_url ? (
            <img src={product.image_url} alt={product.title} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground/30"><Package className="w-16 h-16" /></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
          <div className="absolute top-3 right-3">
            <span className={cn("px-2 py-1 rounded-full text-[10px] uppercase font-medium", product.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
              {product.is_active ? "Aktif" : "Pasif"}
            </span>
          </div>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-semibold line-clamp-1">{product.title}</h3>
            <span className="text-sm font-mono font-bold text-primary ml-2 shrink-0">{formatCurrency(product.price)}</span>
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-2">{product.description}</p>
        </div>
      </div>
    </Link>
  );
}

/** Seller profile — fetches real data from Supabase */
function SellerProfile({ sellerId }: { sellerId: string | undefined }) {
  const { user } = useAuth();
  const [sellerProfile, setSellerProfile] = useState<{ username: string; role: string; created_at: string } | null>(null);
  const [sellerProducts, setSellerProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchSellerData() {
      if (!supabase || !sellerId) {
        setLoading(false);
        setError(true);
        return;
      }

      try {
        // Fetch seller profile from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("username, role, created_at, avatar_url")
          .eq("id", sellerId)
          .single();

        if (profileError || !profileData) {
          console.error("Error fetching seller profile:", profileError);
          setError(true);
          setLoading(false);
          return;
        }

        setSellerProfile(profileData);

        // Fetch seller's products
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", sellerId)
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (!productsError && productsData) {
          setSellerProducts(productsData as DbProduct[]);
        }
      } catch (err) {
        console.error("Error fetching seller data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchSellerData();
  }, [sellerId]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !sellerProfile) {
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

  const joinDate = sellerProfile.created_at ? new Date(sellerProfile.created_at) : new Date();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        {/* Geri Dön */}
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
              <div className="relative z-10 w-48 h-48 mx-auto lg:mx-0 rounded-2xl overflow-hidden border-2 border-primary/20 bg-card flex items-center justify-center">
                <div className="w-full h-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-6xl font-bold text-white overflow-hidden">
                  {(sellerProfile as any).avatar_url ? (
                    <img src={(sellerProfile as any).avatar_url} alt={sellerProfile.username} className="w-full h-full object-cover" />
                  ) : (
                    sellerProfile.username.charAt(0).toUpperCase()
                  )}
                </div>
              </div>
              <div className="absolute -inset-4 bg-primary/5 blur-2xl rounded-full -z-0 opacity-50" />
            </div>

            <div className="space-y-4 text-center lg:text-left">
              <div className="flex flex-col gap-2 items-center lg:items-start">
                <h1 className="text-4xl font-bold tracking-tight">
                  {sellerProfile.username}
                </h1>
                <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
                  {sellerProfile.role === "seller" ? "Satıcı" : "Alıcı"}
                </span>
              </div>

              <p className="text-muted-foreground leading-relaxed italic text-lg">
                "Sessizliğin içindeki hikayeleri keşfedin."
              </p>

              <div className="flex flex-wrap gap-4 pt-4 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={16} className="text-primary" />
                  <span>{joinDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}'den beri</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="w-4 h-4 text-primary" />
                  <span>{sellerProducts.length} ürün</span>
                </div>
              </div>
            </div>

            {/* İtibar Kartı */}
            <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-6 grid grid-cols-2 gap-4">
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-primary">
                  <Star size={18} fill="currentColor" />
                  <span className="text-xl font-bold">—</span>
                </div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Puan</p>
              </div>
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-primary">
                  <MessageCircle size={18} fill="currentColor" />
                  <span className="text-xl font-bold">—</span>
                </div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Fısıltı</p>
              </div>
            </div>

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
                    <Link to={`/product/${product.id}`} className="block">
                      <div className="group relative flex flex-col overflow-hidden rounded-xl bg-card/40 border border-white/5 backdrop-blur-md cursor-pointer hover:border-primary/30 transition-all">
                        <div className="relative aspect-[4/5] overflow-hidden bg-muted/20">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.title} className="h-full w-full object-cover" loading="lazy" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground/30">
                              <Package className="w-16 h-16" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-semibold line-clamp-1">{product.title}</h3>
                            <span className="text-sm font-mono font-bold text-primary ml-2 shrink-0">
                              {formatCurrency(product.price)}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-2">{product.description}</p>
                          <p className="text-[10px] text-muted-foreground/60">
                            {new Date(product.created_at).toLocaleDateString("tr-TR")}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed border-border/30 rounded-3xl">
                  <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
                  <p>Bu satıcının henüz aktif ilanı bulunmuyor.</p>
                </div>
              )}
            </motion.div>

            {/* Reviews Section */}
            {sellerId && (
              <div className="mt-12 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">
                    Değerlendirmeler
                  </h2>
                  <div className="h-px flex-1 bg-border/30 mx-6 hidden sm:block" />
                </div>

                {/* Review Form — only for logged-in users who are not the seller */}
                {user && user.id !== sellerId && (
                  <ReviewForm sellerId={sellerId} />
                )}

                {/* Review List */}
                <ReviewList sellerId={sellerId} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
