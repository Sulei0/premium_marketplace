import React from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Heart, Star, Gift, CheckCheck, Bell, ChevronLeft } from "lucide-react";
import { useNotifications, type Notification } from "@/contexts/NotificationsContext";
import { SEO } from "@/components/SEO";

function getIcon(type: string) {
    switch (type) {
        case "new_message": return <MessageSquare className="w-5 h-5 text-blue-400" />;
        case "new_offer": return <Gift className="w-5 h-5 text-purple-400" />;
        case "new_review": return <Star className="w-5 h-5 text-yellow-400" />;
        case "new_favorite": return <Heart className="w-5 h-5 text-pink-400" />;
        default: return <Bell className="w-5 h-5 text-muted-foreground" />;
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

export default function Notifications() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const navigate = useNavigate();

    const handleNotifClick = (notif: Notification) => {
        markAsRead(notif.id);
        if (notif.link) {
            navigate(notif.link);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl min-h-[60vh]">
            <SEO
                title="Bildirimler | Giyenden"
                description="Bildirimlerinizi ve güncellemelerinizi buradan takip edebilirsiniz."
            />

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 hover:bg-accent rounded-full transition-colors md:hidden"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold">Bildirimler</h1>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="text-sm text-primary hover:underline flex items-center gap-1.5 font-medium"
                    >
                        <CheckCheck className="w-4 h-4" />
                        <span className="hidden sm:inline">Tümünü okundu işaretle</span>
                        <span className="sm:hidden">Okundu yap</span>
                    </button>
                )}
            </div>

            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Bell className="w-8 h-8 text-muted-foreground/40" />
                        </div>
                        <h3 className="font-semibold text-lg mb-1">Henüz bildirim yok</h3>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                            Yeni mesajlar, teklifler ve güncellemeler burada görünecek.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/40">
                        {notifications.map((notif) => (
                            <button
                                key={notif.id}
                                onClick={() => handleNotifClick(notif)}
                                className={`w-full flex items-start gap-4 px-5 py-4 text-left hover:bg-accent/40 transition-colors ${!notif.is_read ? "bg-primary/5" : ""
                                    }`}
                            >
                                <div className={`mt-1 flex-shrink-0 p-2 rounded-full ${!notif.is_read ? "bg-background shadow-sm" : "bg-muted/50"}`}>
                                    {getIcon(notif.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <p className={`text-base ${!notif.is_read ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}`}>
                                            {notif.title}
                                        </p>
                                        <span className="text-xs text-muted-foreground/60 whitespace-nowrap mt-1">
                                            {timeAgo(notif.created_at)}
                                        </span>
                                    </div>

                                    {notif.body && (
                                        <p className={`text-sm ${!notif.is_read ? "text-foreground/80" : "text-muted-foreground/80"} line-clamp-2`}>
                                            {notif.body}
                                        </p>
                                    )}
                                </div>

                                {!notif.is_read && (
                                    <div className="self-center">
                                        <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
