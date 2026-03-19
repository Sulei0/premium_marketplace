import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

interface BlockContextType {
    /** Set of user IDs that the current user has blocked */
    blockedByMe: Set<string>;
    /** Set of user IDs that have blocked the current user */
    blockedMe: Set<string>;
    /** Block a user */
    blockUser: (userId: string) => Promise<void>;
    /** Unblock a user */
    unblockUser: (userId: string) => Promise<void>;
    /** Check if I blocked this user */
    isBlockedByMe: (userId: string) => boolean;
    /** Check if this user blocked me */
    isBlockedByThem: (userId: string) => boolean;
    /** Check if there's any block in either direction */
    isBlocked: (userId: string) => boolean;
    loading: boolean;
}

const BlockContext = createContext<BlockContextType | undefined>(undefined);

export function BlockProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [blockedByMe, setBlockedByMe] = useState<Set<string>>(new Set());
    const [blockedMe, setBlockedMe] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);

    // Fetch block lists
    useEffect(() => {
        if (!user || !supabase) {
            setBlockedByMe(new Set());
            setBlockedMe(new Set());
            return;
        }

        async function fetchBlocks() {
            setLoading(true);
            try {
                // Fetch users I blocked
                const { data: myBlocks } = await supabase!
                    .from("user_blocks")
                    .select("blocked_id")
                    .eq("blocker_id", user!.id);

                if (myBlocks) {
                    setBlockedByMe(new Set(myBlocks.map((b) => b.blocked_id)));
                }

                // Fetch users who blocked me
                const { data: theirBlocks } = await supabase!
                    .from("user_blocks")
                    .select("blocker_id")
                    .eq("blocked_id", user!.id);

                if (theirBlocks) {
                    setBlockedMe(new Set(theirBlocks.map((b) => b.blocker_id)));
                }
            } catch {
                // silent
            } finally {
                setLoading(false);
            }
        }

        fetchBlocks();
    }, [user]);

    const blockUser = useCallback(async (userId: string) => {
        if (!user || !supabase) return;
        if (userId === user.id) return;

        // Optimistic update
        setBlockedByMe((prev) => {
            const next = new Set(prev);
            next.add(userId);
            return next;
        });

        try {
            const { error } = await supabase
                .from("user_blocks")
                .insert({ blocker_id: user.id, blocked_id: userId });

            if (error) {
                // If already blocked (unique constraint), just ignore
                if (error.code === '23505') return;
                throw error;
            }

            // Also remove follow relationship in both directions
            await supabase
                .from("follows")
                .delete()
                .or(`and(follower_id.eq.${user.id},following_id.eq.${userId}),and(follower_id.eq.${userId},following_id.eq.${user.id})`);

            toast({
                title: "Kullanıcı engellendi",
                description: "Bu kullanıcı artık size mesaj gönderemez, teklif veremez, yorum yapamaz ve takip edemez.",
            });
        } catch (error) {
            // Revert optimistic update
            setBlockedByMe((prev) => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
            console.error("Block error:", error);
            toast({
                title: "Hata",
                description: "Engelleme işlemi sırasında bir hata oluştu.",
                variant: "destructive",
            });
        }
    }, [user]);

    const unblockUser = useCallback(async (userId: string) => {
        if (!user || !supabase) return;

        // Optimistic update
        setBlockedByMe((prev) => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
        });

        try {
            const { error } = await supabase
                .from("user_blocks")
                .delete()
                .eq("blocker_id", user.id)
                .eq("blocked_id", userId);

            if (error) throw error;

            toast({
                title: "Engel kaldırıldı",
                description: "Kullanıcının engeli başarıyla kaldırıldı.",
            });
        } catch (error) {
            // Revert optimistic update
            setBlockedByMe((prev) => {
                const next = new Set(prev);
                next.add(userId);
                return next;
            });
            console.error("Unblock error:", error);
            toast({
                title: "Hata",
                description: "Engel kaldırma işlemi sırasında bir hata oluştu.",
                variant: "destructive",
            });
        }
    }, [user]);

    const isBlockedByMe = useCallback((userId: string) => {
        return blockedByMe.has(userId);
    }, [blockedByMe]);

    const isBlockedByThem = useCallback((userId: string) => {
        return blockedMe.has(userId);
    }, [blockedMe]);

    const isBlocked = useCallback((userId: string) => {
        return blockedByMe.has(userId) || blockedMe.has(userId);
    }, [blockedByMe, blockedMe]);

    return (
        <BlockContext.Provider value={{
            blockedByMe,
            blockedMe,
            blockUser,
            unblockUser,
            isBlockedByMe,
            isBlockedByThem,
            isBlocked,
            loading,
        }}>
            {children}
        </BlockContext.Provider>
    );
}

export function useBlock() {
    const context = useContext(BlockContext);
    if (!context) {
        throw new Error("useBlock must be used within a BlockProvider");
    }
    return context;
}
