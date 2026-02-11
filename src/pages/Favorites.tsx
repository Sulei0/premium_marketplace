import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { formatCurrency } from "@/lib/index";

interface DbProduct {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    image_url: string | null;
    created_at: string;
}

export default function Favorites() {
    const { user } = useAuth();
    const { favorites, toggleFavorite, getFavoriteCount } = useFavorites();
    const [products, setProducts] = useState<DbProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFavoriteProducts() {
            if (!user || !supabase || favorites.size === 0) {
                setProducts([]);
                setLoading(false);
                return;
            }

            try {
                const { data } = await supabase
                    .from("products")
                    .select("id, title, description, price, category, image_url, created_at")
                    .in("id", Array.from(favorites))
                    .eq("is_active", true)
                    .order("created_at", { ascending: false });

                if (data) setProducts(data);
            } catch (error) {
                console.error("Favoriler yüklenirken hata:", error);
                toast.error("Favoriler yüklenirken bir sorun oluştu.");
            } finally {
                setLoading(false);
            }
        }

        fetchFavoriteProducts();
    }, [user, favorites]);

    if (!user) {
        return (
            <Layout>
                <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
                    <Heart className="w-16 h-16 text-primary/30 mb-6" />
                    <h2 className="text-2xl font-bold mb-3">Favorilerine erişmek için giriş yap</h2>
                    <p className="text-muted-foreground max-w-md mb-6">
                        Beğendiğin ürünleri kaydetmek ve sonra kolayca bulmak için hesabına giriş yap.
                    </p>
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent("open-login"))}
                        className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:opacity-90 transition-all"
                    >
                        Giriş Yap
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen pb-20">
                <section className="relative pt-32 pb-12 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
                    <div className="container mx-auto px-4 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 mb-2"
                        >
                            <Heart className="w-5 h-5 text-primary fill-primary" />
                            <span className="text-xs font-mono uppercase tracking-widest text-primary">Koleksiyonum</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60"
                        >
                            Favorilerim
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-muted-foreground mt-2"
                        >
                            Beğendiğin ve kaydettiğin ürünler
                        </motion.p>
                    </div>
                </section>

                <section className="container mx-auto px-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                            <p className="text-muted-foreground text-sm">Favoriler yükleniyor...</p>
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                            {products.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <FavProductCard
                                        product={product}
                                        onToggleFav={() => toggleFavorite(product.id)}
                                        favCount={getFavoriteCount(product.id)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-24 text-center"
                        >
                            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                                <Heart className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
                                Henüz favori eklemedin
                            </h3>
                            <p className="text-muted-foreground max-w-md mb-6 leading-relaxed">
                                Beğendiğin ürünlerin kalbine bas, burada biriktirsin. ❤️
                            </p>
                            <Link
                                to="/products"
                                className="px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold rounded-full shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all transform hover:scale-105 active:scale-95"
                            >
                                Koleksiyonu Keşfet
                            </Link>
                        </motion.div>
                    )}
                </section>
            </div>
        </Layout>
    );
}

function FavProductCard({ product, onToggleFav, favCount }: { product: DbProduct; onToggleFav: () => void; favCount: number }) {
    const defaultImage = "/images/placeholder.webp";

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-xl bg-card/40 border border-white/5 backdrop-blur-md transition-all hover:border-primary/30">
            <Link to={`/product/${product.id}`} className="block">
                <div className="relative aspect-[4/5] overflow-hidden bg-muted/20">
                    <img
                        src={product.image_url || defaultImage}
                        alt={product.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).src = defaultImage; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-black/20 opacity-60" />
                    <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-black/40 backdrop-blur-md border border-white/10 text-[10px] uppercase tracking-wider text-white/90 rounded-full">
                            {product.category}
                        </span>
                    </div>
                </div>
            </Link>

            {/* Fav Button */}
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFav(); }}
                className="absolute top-3 left-3 z-10 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-all group/fav"
            >
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500 transition-transform group-hover/fav:scale-125" />
                {favCount > 0 && (
                    <span className="absolute -bottom-1 -right-1 bg-primary text-[9px] text-white font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {favCount}
                    </span>
                )}
            </button>

            <div className="flex flex-col p-4 space-y-3">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold tracking-tight text-foreground/90 line-clamp-1 group-hover:text-primary transition-colors">
                            {product.title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{product.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                        <span className="text-sm font-mono font-bold text-primary">{formatCurrency(product.price)}</span>
                    </div>
                </div>
                <p className="text-[10px] text-muted-foreground/60">
                    {new Date(product.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
                </p>
            </div>

            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,rgba(255,46,126,0.1)_0%,transparent_70%)]" />
        </div>
    );
}
