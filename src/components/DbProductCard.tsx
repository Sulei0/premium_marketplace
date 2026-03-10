import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/index";
import { useFavorites } from "@/contexts/FavoritesContext";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Heart } from "lucide-react";
import { normalizeCategoryLabel, getCategoryIcon } from "@/lib/categories";

export interface DbProduct {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    size?: string;
    image_url: string | null;
    created_at: string;
    user_id: string; // Required for notifications
    is_sold?: boolean;
}

interface DbProductCardProps {
    product: DbProduct;
}

const PARTICLES = [
    { tx: "-12px", ty: "-14px" },
    { tx: "12px", ty: "-14px" },
    { tx: "-16px", ty: "2px" },
    { tx: "16px", ty: "2px" },
    { tx: "-8px", ty: "12px" },
    { tx: "8px", ty: "12px" },
];

export function DbProductCard({ product }: DbProductCardProps) {
    const defaultImage = "/images/placeholder.webp";
    const { isFavorite, toggleFavorite, getFavoriteCount } = useFavorites();
    const fav = isFavorite(product.id);
    const count = getFavoriteCount(product.id);
    const [burst, setBurst] = useState(false);

    const handleFavClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(product.id, product.user_id);
        setBurst(true);
        setTimeout(() => setBurst(false), 600);
    };

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-xl bg-card/40 border border-white/5 backdrop-blur-md transition-all hover:border-primary/30 cursor-pointer">
            <Link to={`/product/${product.id}`} className="block">
                {/* Image */}
                <div className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden bg-muted/20">
                    <OptimizedImage
                        src={product.image_url || defaultImage}
                        alt={product.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        fallbackSrc={defaultImage}
                        thumbnailWidth={400}
                        thumbnailHeight={500}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-black/20 opacity-60" />

                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1 sm:gap-1.5 flex-wrap justify-end">
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-black/40 backdrop-blur-md border border-white/10 text-[8px] sm:text-[10px] uppercase tracking-wider text-white/90 rounded-full">
                            {getCategoryIcon(product.category)} <span className="hidden sm:inline">{normalizeCategoryLabel(product.category)}</span>
                        </span>
                        {product.size && (
                            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-pink-500/30 backdrop-blur-md border border-pink-500/20 text-[8px] sm:text-[10px] uppercase tracking-wider text-white/90 rounded-full font-semibold">
                                {product.size}
                            </span>
                        )}
                    </div>

                    {product.is_sold && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-20">
                            <span className="transform -rotate-12 border-2 sm:border-4 border-red-500 text-red-500 font-black text-base sm:text-2xl uppercase tracking-widest px-3 sm:px-4 py-0.5 sm:py-1 rounded-sm opacity-90 shadow-2xl">
                                SATILDI
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-col p-2.5 sm:p-4 space-y-1.5 sm:space-y-3">
                    <div className="flex justify-between items-start gap-1 sm:gap-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xs sm:text-sm font-semibold tracking-tight text-foreground/90 line-clamp-1 group-hover:text-primary transition-colors">
                                {product.title}
                            </h3>
                            <p className="text-[10px] sm:text-[11px] text-muted-foreground line-clamp-1 sm:line-clamp-2 mt-0.5">
                                {product.description}
                            </p>
                        </div>
                        <div className="text-right shrink-0">
                            <span className="text-xs sm:text-sm font-mono font-bold text-primary">
                                {formatCurrency(product.price)}
                            </span>
                        </div>
                    </div>

                    {/* Time ago */}
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground/60">
                        {new Date(product.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                </div>
            </Link>

            {/* Fav Button */}
            <button
                onClick={handleFavClick}
                className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10 p-1.5 sm:p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-all group/fav"
            >
                <Heart className={`w-4 h-4 transition-all duration-300 ${fav ? 'text-pink-500 fill-pink-500 scale-110' : 'text-white/70 hover:text-pink-400'}`} />
                {count > 0 && (
                    <span className="absolute -bottom-1 -right-1 bg-primary text-[9px] text-white font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {count}
                    </span>
                )}
                {/* Burst particles */}
                {burst && (
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

            {/* Hover Glow */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,rgba(255,46,126,0.1)_0%,transparent_70%)]" />
        </div>
    );
}
