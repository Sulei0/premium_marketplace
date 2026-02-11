import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";

export interface Notification {
    id: string;
    user_id: string;
    type: "new_message" | "new_offer" | "new_review" | "new_favorite";
    title: string;
    body: string | null;
    link: string | null;
    is_read: boolean;
    created_at: string;
}

interface NotificationsContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    loading: boolean;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch notifications
    useEffect(() => {
        if (!user || !supabase) {
            setNotifications([]);
            return;
        }

        async function fetchNotifications() {
            setLoading(true);
            try {
                const { data } = await supabase!
                    .from("notifications")
                    .select("*")
                    .eq("user_id", user!.id)
                    .order("created_at", { ascending: false })
                    .limit(50);

                if (data) {
                    setNotifications(data as Notification[]);
                }
            } catch {
                // silent
            } finally {
                setLoading(false);
            }
        }

        fetchNotifications();

        // Subscribe to realtime notifications
        const channel = supabase!
            .channel("notifications-realtime")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    const newNotif = payload.new as Notification;
                    setNotifications((prev) => [newNotif, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase!.removeChannel(channel);
        };
    }, [user]);

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const markAsRead = useCallback(async (id: string) => {
        if (!supabase) return;

        // Optimistic update
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );

        try {
            await supabase.from("notifications").update({ is_read: true }).eq("id", id);
        } catch {
            // silent
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        if (!supabase || !user) return;

        // Optimistic update
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

        try {
            await supabase
                .from("notifications")
                .update({ is_read: true })
                .eq("user_id", user.id)
                .eq("is_read", false);
        } catch {
            // silent
        }
    }, [user]);

    return (
        <NotificationsContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, loading }}>
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationsContext);
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationsProvider");
    }
    return context;
}
