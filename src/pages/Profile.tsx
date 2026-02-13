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
  Loader2,
  ShieldAlert,
  Save,
  X
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { ROUTE_PATHS, cn, formatCurrency } from "@/lib/index";
import { validateImageFile } from "@/lib/sanitize";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ReviewForm, ReviewList } from "@/components/Reviews";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import { AdminBadgeManager } from "@/components/AdminBadgeManager";
import { AdminBanButton } from "@/components/admin/AdminBanButton";

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

interface ProfileData {
  id: string;
  username: string;
  avatar_url: string | null;
  role: string;
  badges: string[];
  created_at: string;
  username_changes: number;
}

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  // If /profile/me
  if (id === "me") {
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
    return <UserProfile userId={user.id} isOwnProfile={true} />;
  }

  // If /profile/:id
  if (!id) return null;

  // Check if viewing own profile via ID
  const isOwnProfile = user?.id === id;
  return <UserProfile userId={id} isOwnProfile={isOwnProfile} />;
}

function UserProfile({ userId, isOwnProfile }: { userId: string, isOwnProfile: boolean }) {
  const { user, role } = useAuth();

  // Data State
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [stats, setStats] = useState({ averageRating: 0, whisperCount: 0, loading: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Edit State
  const [editing, setEditing] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch Data
  useEffect(() => {
    async function fetchData() {
      if (!supabase) return;
      setLoading(true);
      setError(false);

      try {
        // 1. Fetch Profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profileError || !profileData) {
          console.error("Profile fetch error:", profileError);
          setError(true);
          setLoading(false);
          return;
        }

        setProfile(profileData as ProfileData);
        setEditUsername(profileData.username);

        // 2. Fetch Products
        // If own profile, show all. If other, show only active.
        let query = supabase
          .from("products")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (!isOwnProfile) {
          query = query.eq("is_active", true);
        }

        const { data: productsData } = await query;
        if (productsData) setProducts(productsData as DbProduct[]);

        // 3. Fetch Stats (Reviews & Whispers)
        // Parallel fetch for potential performance win
        const [reviewsRes, chatsRes] = await Promise.all([
          supabase.from("reviews").select("rating").eq("seller_id", userId),
          supabase.from("chats").select("buyer_id").eq("seller_id", userId)
        ]);

        // Calculate Average Rating
        let avgRating = 0;
        if (reviewsRes.data && reviewsRes.data.length > 0) {
          const sum = reviewsRes.data.reduce((acc, curr) => acc + curr.rating, 0);
          avgRating = sum / reviewsRes.data.length;
        }

        // Calculate Unique Whispers
        const uniqueBuyers = new Set(chatsRes.data?.map(c => c.buyer_id) || []).size;

        setStats({
          averageRating: avgRating,
          whisperCount: uniqueBuyers,
          loading: false
        });

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId, isOwnProfile]);

  // Actions
  const handleSaveUsername = async () => {
    if (!supabase || !user || !profile) return;
    setSaving(true);
    try {
      if (profile.username === editUsername) {
        setEditing(false);
        setSaving(false);
        return;
      }

      // Check change limit
      if ((profile.username_changes || 0) >= 3) {
        toast.error("Kullanıcı adınızı en fazla 3 kez değiştirebilirsiniz.");
        setSaving(false);
        return;
      }

      // Check uniqueness
      const { data: existingUser, error: uniquenessError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', editUsername)
        .neq('id', user.id)
        .maybeSingle();

      if (uniquenessError) throw uniquenessError;
      if (existingUser) {
        toast.error("Bu kullanıcı adı başkası tarafından kullanılıyor.");
        setSaving(false);
        return;
      }

      // Update DB
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editUsername,
          username_changes: (profile.username_changes || 0) + 1
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update Auth
      await supabase.auth.updateUser({ data: { username: editUsername } });

      // Update Local State
      setProfile(prev => prev ? ({ ...prev, username: editUsername, username_changes: (prev.username_changes || 0) + 1 }) : null);

      toast.success(`Kullanıcı adı güncellendi. Kalan hakkınız: ${2 - (profile.username_changes || 0)}`);
      setEditing(false);
    } catch (error: any) {
      console.error(error);
      toast.error("Hata: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase || !user || !profile) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Geçersiz dosya.");
      return;
    }

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/avatar_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { contentType: file.type, upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;

      // Update DB
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update Auth
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });

      // Force UI Refresh (bust cache with timestamp)
      setProfile(prev => prev ? ({ ...prev, avatar_url: `${publicUrl}?t=${Date.now()}` }) : null);
      toast.success("Profil fotoğrafı güncellendi!");

    } catch (error: any) {
      console.error(error);
      toast.error("Yükleme hatası: " + error.message);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !profile) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h2 className="text-2xl font-bold mb-4">Profil bulunamadı.</h2>
          <Link to={ROUTE_PATHS.HOME} className="text-primary hover:underline">Ana Sayfaya Dön</Link>
        </div>
      </Layout>
    );
  }

  const joinDate = profile.created_at ? new Date(profile.created_at) : new Date();
  const firstLetter = profile.username.charAt(0).toUpperCase();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        {/* Back Button (Only if not own profile) */}
        {!isOwnProfile && (
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
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Profile Info */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="lg:col-span-4 space-y-8"
          >
            {/* Avatar Section */}
            <div className="relative group mx-auto lg:mx-0 w-48">
              {isOwnProfile ? (
                <label htmlFor="avatar-upload" className="cursor-pointer block relative">
                  <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-primary/50 transition-all shadow-lg shadow-primary/20">
                    {profile.avatar_url ? (
                      <img key={profile.avatar_url} src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-6xl font-bold text-white">{firstLetter}</span>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit3 className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              ) : (
                <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center overflow-hidden border-2 border-primary/20 shadow-lg">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-6xl font-bold text-white">{firstLetter}</span>
                  )}
                </div>
              )}
            </div>

            {/* Profile Details */}
            <div className="space-y-4 text-center lg:text-left">
              <div className="flex flex-col gap-2 items-center lg:items-start">

                {/* Username Editing */}
                {editing && isOwnProfile ? (
                  <div className="flex items-center gap-2 w-full justify-center lg:justify-start">
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xl font-bold text-foreground focus:border-pink-500 focus:outline-none w-full max-w-[200px]"
                    />
                    <button onClick={handleSaveUsername} disabled={saving} className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </button>
                    <button onClick={() => { setEditing(false); setEditUsername(profile.username); }} className="p-2 text-muted-foreground hover:bg-white/5 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
                    {profile.username}
                    <BadgeDisplay badges={profile.badges} size="lg" />
                    {isOwnProfile && (
                      <button onClick={() => setEditing(true)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </h1>
                )}

                <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
                  {profile.role === "seller" ? "Satıcı" : "Alıcı"}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={16} className="text-primary" />
                  <span>{joinDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}'den beri</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="w-4 h-4 text-primary" />
                  <span>{products.length} ürün</span>
                </div>
              </div>
            </div>

            {/* Stats Card (Always Visible now!) */}
            <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-6 grid grid-cols-2 gap-4">
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-primary">
                  <Star size={18} fill="currentColor" />
                  <span className="text-xl font-bold">
                    {stats.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "—")}
                  </span>
                </div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Puan</p>
              </div>
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-primary">
                  <MessageCircle size={18} fill="currentColor" />
                  <span className="text-xl font-bold">
                    {stats.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : stats.whisperCount}
                  </span>
                </div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Fısıltı</p>
              </div>
            </div>

            {/* Admin Controls */}
            {role === 'admin' && !isOwnProfile && (
              <div className="bg-card/50 backdrop-blur-md border border-red-500/20 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-red-500 font-bold border-b border-red-500/20 pb-2 mb-2">
                  <ShieldAlert className="w-5 h-5" />
                  Admin Kontrol Paneli
                </div>
                <AdminBadgeManager
                  targetUserId={userId}
                  currentBadges={profile.badges || []}
                  onBadgeUpdate={() => {
                    // Refresh logic could be improved, but simple re-fetch works
                    window.location.reload();
                  }}
                />
                <div className="pt-4 border-t border-border/50">
                  <AdminBanButton targetUserId={userId} />
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Column: Products & Reviews */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">
                {isOwnProfile ? "İlanlarım" : "Gardırop"}
                <span className="text-muted-foreground font-light font-mono ml-2">({products.length})</span>
              </h2>
              <div className="h-px flex-1 bg-border/30 mx-6 hidden sm:block" />
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {products.length > 0 ? (
                products.map((product) => <ProductCard key={product.id} product={product} />)
              ) : (
                <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed border-border/30 rounded-3xl">
                  <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
                  <p>{isOwnProfile ? "Henüz ilan eklemediniz." : "Bu satıcının henüz aktif ilanı bulunmuyor."}</p>
                </div>
              )}
            </motion.div>

            {/* Reviews Section (Always Visible!) */}
            <div className="mt-12 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Değerlendirmeler</h2>
                <div className="h-px flex-1 bg-border/30 mx-6 hidden sm:block" />
              </div>

              {/* Review Form: Only for others, if logged in */}
              {!isOwnProfile && user && (
                <ReviewForm sellerId={userId} />
              )}

              <ReviewList sellerId={userId} />
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}

function ProductCard({ product }: { product: DbProduct }) {
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

          {/* Active/Passive Badge (Useful for own profile) */}
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
          <p className="text-[10px] text-muted-foreground/60">
            {new Date(product.created_at).toLocaleDateString("tr-TR")}
          </p>
        </div>
      </div>
    </Link>
  );
}
