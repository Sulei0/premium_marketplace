import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";

interface FavoritesContextType {
    favorites: Set<string>;
    favoriteCounts: Map<string, number>;
    toggleFavorite: (productId: string, sellerId?: string) => Promise<void>;
    isFavorite: (productId: string) => boolean;
    getFavoriteCount: (productId: string) => number;
    loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [favoriteCounts, setFavoriteCounts] = useState<Map<string, number>>(new Map());
    const [loading, setLoading] = useState(false);

    // Fetch user's favorites
    useEffect(() => {
        if (!user || !supabase) {
            setFavorites(new Set());
            return;
        }

        async function fetchFavorites() {
            setLoading(true);
            try {
                const { data } = await supabase!
                    .from("favorites")
                    .select("product_id")
                    .eq("user_id", user!.id);

                if (data) {
                    setFavorites(new Set(data.map((f) => f.product_id)));
                }
            } catch {
                // silent
            } finally {
                setLoading(false);
            }
        }

        fetchFavorites();
    }, [user]);

    // Fetch favorite counts for all products
    useEffect(() => {
        if (!supabase) return;

        async function fetchCounts() {
            try {
                // Use a raw count grouped by product_id
                const { data } = await supabase!
                    .from("favorites")
                    .select("product_id");

                if (data) {
                    const counts = new Map<string, number>();
                    for (const row of data) {
                        counts.set(row.product_id, (counts.get(row.product_id) || 0) + 1);
                    }
                    setFavoriteCounts(counts);
                }
            } catch {
                // silent
            }
        }

        fetchCounts();
    }, [favorites]); // Re-fetch when favorites change

    const toggleFavorite = useCallback(async (productId: string, sellerId?: string) => {
        if (!user || !supabase) return;

        const isFav = favorites.has(productId);

        // Optimistic update
        setFavorites((prev) => {
            const next = new Set(prev);
            if (isFav) {
                next.delete(productId);
            } else {
                next.add(productId);
            }
            return next;
        });

        // Optimistic count update
        setFavoriteCounts((prev) => {
            const next = new Map(prev);
            const current = next.get(productId) || 0;
            next.set(productId, isFav ? Math.max(0, current - 1) : current + 1);
            return next;
        });

        try {
            if (isFav) {
                await supabase
                    .from("favorites")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("product_id", productId);
            } else {
                await supabase
                    .from("favorites")
                    .insert({ user_id: user.id, product_id: productId });

                // Send notification to seller if:
                // 1. We have a sellerId
                // 2. The seller is NOT the current user (don't notify self)
                if (sellerId && sellerId !== user.id) {
                    // Check if notification already exists to avoid spam (optional but good)
                    // For now, simple insert.
                    await supabase
                        .from("notifications")
                        .insert({
                            user_id: sellerId,
                            type: "new_favorite",
                            title: "Yeni Favori!",
                            body: "Bir kullanıcı ürününü favorilerine ekledi.",
                            link: `/product/${productId}`,
                            is_read: false
                        });
                }
            }
        } catch {
            // Revert on error
            setFavorites((prev) => {
                const next = new Set(prev);
                if (isFav) {
                    next.add(productId);
                } else {
                    next.delete(productId);
                }
                return next;
            });
        }
    }, [user, favorites]);

    const isFavorite = useCallback((productId: string) => {
        return favorites.has(productId);
    }, [favorites]);

    const getFavoriteCount = useCallback((productId: string) => {
        return favoriteCounts.get(productId) || 0;
    }, [favoriteCounts]);

    return (
        <FavoritesContext.Provider value={{ favorites, favoriteCounts, toggleFavorite, isFavorite, getFavoriteCount, loading }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error("useFavorites must be used within a FavoritesProvider");
    }
    return context;
}
