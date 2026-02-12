import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, MoreHorizontal, Shield, Ban, Search, Crown, CheckCircle2, UserCog } from "lucide-react";
import { toast } from "sonner";
import { BadgeDisplay, BADGE_CONFIG, BadgeType } from "@/components/BadgeDisplay";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface UserProfile {
    id: string;
    username: string;
    email?: string; // May not be visible if not using admin API wrapper
    role: 'admin' | 'seller' | 'buyer';
    created_at: string;
    avatar_url?: string;
    badges: string[];
    is_blocked: boolean;
    is_verified: boolean;
}

export default function AdminUsers() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Fetch profiles
            // Note: RLS must allow admins to see all profiles
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error: any) {
            toast.error("Kullanıcılar yüklenirken hata oluştu: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ role: newRole })
                .eq("id", userId);

            if (error) throw error;
            toast.success("Kullanıcı rolü güncellendi.");
            fetchUsers();
        } catch (error: any) {
            toast.error("İşlem başarısız: " + error.message);
        }
    };

    const handleBlockToggle = async (userId: string, currentStatus: boolean) => {
        if (!confirm(currentStatus ? "Kullanıcının engelini kaldırmak istiyor musunuz?" : "Kullanıcıyı engellemek istediğinize emin misiniz?")) return;

        try {
            const { error } = await supabase
                .from("profiles")
                .update({ is_blocked: !currentStatus })
                .eq("id", userId);

            if (error) throw error;
            toast.success(currentStatus ? "Engel kaldırıldı." : "Kullanıcı engellendi.");
            fetchUsers();
        } catch (error: any) {
            toast.error("İşlem başarısız: " + error.message);
        }
    };

    const handleBadgeToggle = async (userId: string, badge: string, hasBadge: boolean) => {
        try {
            const rpcName = hasBadge ? 'remove_badge' : 'assign_badge';
            const { error } = await supabase.rpc(rpcName, {
                target_user_id: userId,
                badge_name: badge
            });

            if (error) throw error;
            toast.success("Rozet güncellendi.");
            fetchUsers();
        } catch (error: any) {
            toast.error("İşlem başarısız: " + error.message);
        }
    };


    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.role.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Kullanıcı Yönetimi</h1>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-muted-foreground">
                        Toplam: {users.length}
                    </Badge>
                </div>
            </div>

            <div className="flex items-center gap-2 bg-card p-2 rounded-lg border border-border w-full max-w-md">
                <Search className="w-4 h-4 text-muted-foreground ml-2" />
                <Input
                    placeholder="Kullanıcı adı veya rol ara..."
                    className="border-none shadow-none focus-visible:ring-0"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                            <TableHead>Kullanıcı</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>Rozetler</TableHead>
                            <TableHead>Katılma Tarihi</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <div className="flex justify-center items-center gap-2 text-muted-foreground">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Yükleniyor...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    Kullanıcı bulunamadı.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-xs font-bold overflow-hidden border border-border">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    user.username.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{user.username}</span>
                                                <span className="text-xs text-muted-foreground max-w-[150px] truncate">{user.id}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'admin' ? 'default' : user.role === 'seller' ? 'secondary' : 'outline'} className="capitalize">
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {user.is_blocked ? (
                                            <Badge variant="destructive" className="gap-1">
                                                <Ban className="w-3 h-3" /> Engelli
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Aktif
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <BadgeDisplay badges={user.badges || []} size="sm" />
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {format(new Date(user.created_at), 'd MMM yyyy', { locale: tr })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Menüyü aç</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                                                <DropdownMenuSeparator />

                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger>
                                                        <UserCog className="w-4 h-4 mr-2" /> Rol Değiştir
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuPortal>
                                                        <DropdownMenuSubContent>
                                                            <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'buyer')}>
                                                                Buyer (Alıcı)
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'seller')}>
                                                                Seller (Satıcı)
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'admin')} className="text-red-500 hover:text-red-500 focus:text-red-500">
                                                                Admin (Yönetici)
                                                            </DropdownMenuItem>
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuPortal>
                                                </DropdownMenuSub>

                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger>
                                                        <Crown className="w-4 h-4 mr-2" /> Rozet Yönetimi
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuPortal>
                                                        <DropdownMenuSubContent>
                                                            {(Object.keys(BADGE_CONFIG) as BadgeType[]).map((badgeKey) => {
                                                                const hasBadge = user.badges?.includes(badgeKey);
                                                                return (
                                                                    <DropdownMenuItem key={badgeKey} onClick={() => handleBadgeToggle(user.id, badgeKey, !!hasBadge)}>
                                                                        {hasBadge ? <span className="text-red-500 mr-2">-</span> : <span className="text-green-500 mr-2">+</span>}
                                                                        {BADGE_CONFIG[badgeKey].label}
                                                                    </DropdownMenuItem>
                                                                )
                                                            })}
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuPortal>
                                                </DropdownMenuSub>

                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleBlockToggle(user.id, user.is_blocked)} className="text-red-500 focus:text-red-500">
                                                    <Ban className="mr-2 h-4 w-4" />
                                                    {user.is_blocked ? "Engeli Kaldır" : "Kullanıcıyı Engelle"}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
