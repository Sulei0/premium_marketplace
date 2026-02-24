import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";

interface FollowContextType {
    following: Set<string>;
    followerCounts: Map<string, number>;
    followingCounts: Map<string, number>;
    toggleFollow: (userId: string) => Promise<void>;
    isFollowing: (userId: string) => boolean;
    getFollowerCount: (userId: string) => number;
    getFollowingCount: (userId: string) => number;
    fetchFollowerCount: (userId: string) => Promise<number>;
    fetchFollowingCount: (userId: string) => Promise<number>;
    loading: boolean;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export function FollowProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [following, setFollowing] = useState<Set<string>>(new Set());
    const [followerCounts, setFollowerCounts] = useState<Map<string, number>>(new Map());
    const [followingCounts, setFollowingCounts] = useState<Map<string, number>>(new Map());
    const [loading, setLoading] = useState(false);

    // Fetch who the current user is following
    useEffect(() => {
        if (!user || !supabase) {
            setFollowing(new Set());
            return;
        }

        async function fetchFollowing() {
            setLoading(true);
            try {
                const { data } = await supabase!
                    .from("follows")
                    .select("following_id")
                    .eq("follower_id", user!.id);

                if (data) {
                    setFollowing(new Set(data.map((f) => f.following_id)));
                }
            } catch {
                // silent
            } finally {
                setLoading(false);
            }
        }

        fetchFollowing();
    }, [user]);

    const fetchFollowerCount = useCallback(async (userId: string) => {
        if (!supabase) return 0;
        try {
            const { data, error } = await supabase.rpc('get_user_follower_count', { p_user_id: userId });
            if (error) throw error;
            const count = Number(data) || 0;
            setFollowerCounts(prev => {
                const next = new Map(prev);
                next.set(userId, count);
                return next;
            });
            return count;
        } catch {
            return 0;
        }
    }, []);

    const fetchFollowingCount = useCallback(async (userId: string) => {
        if (!supabase) return 0;
        try {
            const { data, error } = await supabase.rpc('get_user_following_count', { p_user_id: userId });
            if (error) throw error;
            const count = Number(data) || 0;
            setFollowingCounts(prev => {
                const next = new Map(prev);
                next.set(userId, count);
                return next;
            });
            return count;
        } catch {
            return 0;
        }
    }, []);

    const toggleFollow = useCallback(async (userId: string) => {
        if (!user || !supabase) return;
        if (userId === user.id) return; // Can't follow yourself

        const isFollowingUser = following.has(userId);

        // Optimistic update
        setFollowing((prev) => {
            const next = new Set(prev);
            if (isFollowingUser) {
                next.delete(userId);
            } else {
                next.add(userId);
            }
            return next;
        });

        setFollowerCounts((prev) => {
            const next = new Map(prev);
            const current = next.get(userId) || 0;
            next.set(userId, isFollowingUser ? Math.max(0, current - 1) : current + 1);
            return next;
        });

        try {
            if (isFollowingUser) {
                await supabase
                    .from("follows")
                    .delete()
                    .eq("follower_id", user.id)
                    .eq("following_id", userId);
            } else {
                await supabase
                    .from("follows")
                    .insert({ follower_id: user.id, following_id: userId });

                // Send notification — wrapped separately so failures don't revert follow
                try {
                    await supabase
                        .from("notifications")
                        .insert({
                            user_id: userId,
                            type: "new_follower",
                            title: "Yeni Takipçi!",
                            body: `@${user.user_metadata?.username || "Bir kullanıcı"} seni takip etmeye başladı.`,
                            link: `/profile/${user.id}`,
                            is_read: false
                        });
                } catch {
                    console.warn("Takip bildirimi gönderilemedi");
                }
            }
        } catch {
            // Revert on error
            setFollowing((prev) => {
                const next = new Set(prev);
                if (isFollowingUser) {
                    next.add(userId);
                } else {
                    next.delete(userId);
                }
                return next;
            });
            setFollowerCounts((prev) => {
                const next = new Map(prev);
                const current = next.get(userId) || 0;
                next.set(userId, isFollowingUser ? current + 1 : Math.max(0, current - 1));
                return next;
            });
        }
    }, [user, following]);

    const isFollowing = useCallback((userId: string) => {
        return following.has(userId);
    }, [following]);

    const getFollowerCount = useCallback((userId: string) => {
        return followerCounts.get(userId) || 0;
    }, [followerCounts]);

    const getFollowingCount = useCallback((userId: string) => {
        return followingCounts.get(userId) || 0;
    }, [followingCounts]);

    return (
        <FollowContext.Provider value={{ following, followerCounts, followingCounts, toggleFollow, isFollowing, getFollowerCount, getFollowingCount, fetchFollowerCount, fetchFollowingCount, loading }}>
            {children}
        </FollowContext.Provider>
    );
}

export function useFollow() {
    const context = useContext(FollowContext);
    if (!context) {
        throw new Error("useFollow must be used within a FollowProvider");
    }
    return context;
}
