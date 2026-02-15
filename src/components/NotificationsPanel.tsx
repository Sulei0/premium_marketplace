import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, MessageSquare, Heart, Star, Gift, Check, CheckCheck } from "lucide-react";
import { useNotifications, type Notification } from "@/contexts/NotificationsContext";
import { cn } from "@/lib/index";

function getIcon(type: string) {
    switch (type) {
        case "new_message": return <MessageSquare className="w-4 h-4 text-blue-400" />;
        case "new_offer": return <Gift className="w-4 h-4 text-purple-400" />;
        case "new_review": return <Star className="w-4 h-4 text-yellow-400" />;
        case "new_favorite": return <Heart className="w-4 h-4 text-pink-400" />;
        default: return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
}

function timeAgo(dateStr: string): string {
    const now = Date.now();
    const diff = now - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Az önce";
    if (mins < 60) return `${mins} dk`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} sa`;
    const days = Math.floor(hours / 24);
    return `${days} gün`;
}

export function NotificationsPanel({ className }: { className?: string }) {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClick);
            return () => document.removeEventListener("mousedown", handleClick);
        }
    }, [isOpen]);

    const handleNotifClick = (notif: Notification) => {
        markAsRead(notif.id);
        if (notif.link) {
            navigate(notif.link);
        }
        setIsOpen(false);
    };

    return (
        <div className={cn("relative", className)} ref={panelRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
                title="Bildirimler"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-10 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                            <h3 className="text-sm font-bold">Bildirimler</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-[11px] text-primary hover:underline flex items-center gap-1"
                                >
                                    <CheckCheck className="w-3 h-3" />
                                    Tümünü okundu işaretle
                                </button>
                            )}
                        </div>

                        {/* Notification List */}
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <Bell className="w-8 h-8 text-muted-foreground/30 mb-3" />
                                    <p className="text-sm text-muted-foreground">Henüz bildirim yok</p>
                                </div>
                            ) : (
                                notifications.slice(0, 20).map((notif) => (
                                    <button
                                        key={notif.id}
                                        onClick={() => handleNotifClick(notif)}
                                        className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors border-b border-border/30 last:border-0 ${!notif.is_read ? "bg-primary/5" : ""
                                            }`}
                                    >
                                        <div className="mt-0.5 flex-shrink-0">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm line-clamp-1 ${!notif.is_read ? "font-semibold" : "text-muted-foreground"}`}>
                                                {notif.title}
                                            </p>
                                            {notif.body && (
                                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{notif.body}</p>
                                            )}
                                            <span className="text-[10px] text-muted-foreground/60 mt-1 block">{timeAgo(notif.created_at)}</span>
                                        </div>
                                        {!notif.is_read && (
                                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
