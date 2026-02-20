import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/index";
import { useFavorites } from "@/contexts/FavoritesContext";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Heart } from "lucide-react";

export interface DbProduct {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    image_url: string | null;
    created_at: string;
    user_id: string; // Required for notifications
    is_sold?: boolean;
}

interface DbProductCardProps {
    product: DbProduct;
}

export function DbProductCard({ product }: DbProductCardProps) {
    const defaultImage = "/images/placeholder.webp";
    const { isFavorite, toggleFavorite, getFavoriteCount } = useFavorites();
    const fav = isFavorite(product.id);
    const count = getFavoriteCount(product.id);

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-xl bg-card/40 border border-white/5 backdrop-blur-md transition-all hover:border-primary/30 cursor-pointer">
            <Link to={`/product/${product.id}`} className="block">
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-muted/20">
                    <OptimizedImage
                        src={product.image_url || defaultImage}
                        alt={product.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        fallbackSrc={defaultImage}
                        thumbnailWidth={400}
                        thumbnailHeight={500}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-black/20 opacity-60" />

                    {/* Category Badge */}
                    <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-black/40 backdrop-blur-md border border-white/10 text-[10px] uppercase tracking-wider text-white/90 rounded-full">
                            {product.category}
                        </span>
                    </div>

                    {product.is_sold && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-20">
                            <span className="transform -rotate-12 border-4 border-red-500 text-red-500 font-black text-2xl uppercase tracking-widest px-4 py-1 rounded-sm opacity-90 shadow-2xl">
                                SATILDI
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-col p-4 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold tracking-tight text-foreground/90 line-clamp-1 group-hover:text-primary transition-colors">
                                {product.title}
                            </h3>
                            <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                                {product.description}
                            </p>
                        </div>
                        <div className="text-right shrink-0">
                            <span className="text-sm font-mono font-bold text-primary">
                                {formatCurrency(product.price)}
                            </span>
                        </div>
                    </div>

                    {/* Time ago */}
                    <p className="text-[10px] text-muted-foreground/60">
                        {new Date(product.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                </div>
            </Link>

            {/* Fav Button */}
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(product.id, product.user_id); }}
                className="absolute top-3 left-3 z-10 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-all group/fav"
            >
                <Heart className={`w-4 h-4 transition-all duration-300 ${fav ? 'text-pink-500 fill-pink-500 scale-110' : 'text-white/70 hover:text-pink-400'}`} />
                {count > 0 && (
                    <span className="absolute -bottom-1 -right-1 bg-primary text-[9px] text-white font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {count}
                    </span>
                )}
            </button>

            {/* Hover Glow */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,rgba(255,46,126,0.1)_0%,transparent_70%)]" />
        </div>
    );
}
