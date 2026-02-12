import React, { useState } from "react";
import { Plus, X, ShieldCheck, Crown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { BadgeType, BADGE_CONFIG } from "./BadgeDisplay";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/index";

interface AdminBadgeManagerProps {
    targetUserId: string;
    currentBadges: string[];
    onBadgeUpdate: () => void;
}

export function AdminBadgeManager({ targetUserId, currentBadges = [], onBadgeUpdate }: AdminBadgeManagerProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Allow only if current user is admin
    // Note: RLS/RPC will also block it, but UI should be hidden too
    const [isAdmin, setIsAdmin] = useState(false);
    const [checkingRole, setCheckingRole] = useState(true);

    // Check admin role source of truth (Database)
    React.useEffect(() => {
        const checkAdminStatus = async () => {
            if (!user) {
                setCheckingRole(false);
                return;
            }

            // 1. Fast check: Metadata (optimization)
            if (user.user_metadata?.role === 'admin') {
                setIsAdmin(true);
                setCheckingRole(false);
                // We could still verify against DB in background, but metadata is usually trusted for UI
                // However, for this specific "I manually made them admin" case, we MUST check DB if metadata fails
                return;
            }

            // 2. Deep check: Database
            // If metadata says NOT admin, we double check DB because maybe it was just updated manually
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (data && data.role === 'admin') {
                    setIsAdmin(true);

                    // Optional: Sync metadata if out of sync (nice to have)
                    await supabase.auth.updateUser({
                        data: { role: 'admin' }
                    });
                }
            } catch (e) {
                console.error("Admin check failed", e);
            } finally {
                setCheckingRole(false);
            }
        };

        checkAdminStatus();
    }, [user]);

    if (checkingRole) return null; // Or a transparent placeholder
    if (!isAdmin) return null;

    const handleAssignBadge = async (badgeName: BadgeType) => {
        if (loading) return;
        setLoading(true);
        try {
            const { error } = await supabase.rpc('assign_badge', {
                target_user_id: targetUserId,
                badge_name: badgeName
            });

            if (error) throw error;

            toast.success(`${BADGE_CONFIG[badgeName].label} rozeti verildi.`);
            onBadgeUpdate();
        } catch (error: any) {
            toast.error("Hata: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveBadge = async (badgeName: string) => {
        if (loading) return;
        if (!confirm("Bu rozeti kaldırmak istediğinize emin misiniz?")) return;

        setLoading(true);
        try {
            const { error } = await supabase.rpc('remove_badge', {
                target_user_id: targetUserId,
                badge_name: badgeName
            });

            if (error) throw error;

            toast.success("Rozet kaldırıldı.");
            onBadgeUpdate();
        } catch (error: any) {
            toast.error("Hata: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const availableBadges = (Object.keys(BADGE_CONFIG) as BadgeType[]).filter(
        (b) => !currentBadges.includes(b)
    );

    return (
        <div className="mt-6 p-4 border border-yellow-500/20 bg-yellow-500/5 rounded-xl">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-yellow-500 flex items-center gap-2">
                    <Crown className="w-4 h-4" /> Admin Paneli: Rozet Yönetimi
                </h3>
            </div>

            <div className="flex flex-wrap gap-2">
                {/* Existing Badges (Click to remove) */}
                {currentBadges.map((badge) => {
                    const config = BADGE_CONFIG[badge as BadgeType];
                    if (!config) return null;
                    const Icon = config.icon;
                    return (
                        <div
                            key={badge}
                            className="flex items-center gap-1 bg-background border border-border px-2 py-1 rounded-full text-xs cursor-pointer hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-colors group"
                            onClick={() => handleRemoveBadge(badge)}
                            title="Rozeti Kaldır"
                        >
                            <Icon className="w-3 h-3" />
                            <span>{config.label}</span>
                            <X className="w-3 h-3 ml-1 opacity-50 group-hover:opacity-100" />
                        </div>
                    );
                })}

                {/* Add Badge Button */}
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                            <Plus className="w-3 h-3" /> Rozet Ekle
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Rozet Ekle</DialogTitle>
                            <DialogDescription>
                                Kullanıcıya atamak istediğiniz rozeti seçin.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 gap-2 py-4">
                            {availableBadges.length === 0 ? (
                                <p className="text-center text-muted-foreground text-sm">Tüm rozetler zaten verilmiş.</p>
                            ) : (
                                availableBadges.map((badge) => {
                                    const config = BADGE_CONFIG[badge];
                                    const Icon = config.icon;
                                    return (
                                        <button
                                            key={badge}
                                            onClick={() => {
                                                handleAssignBadge(badge);
                                                setIsOpen(false);
                                            }}
                                            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-left"
                                        >
                                            <div className={cn("p-2 rounded-full bg-background", config.className)}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-sm">{config.label}</div>
                                                <div className="text-xs text-muted-foreground">{config.description}</div>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            {loading && <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> İşlem yapılıyor...</div>}
        </div>
    );
}
