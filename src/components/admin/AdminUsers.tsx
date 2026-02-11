import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Ban, CheckCircle, Search } from "lucide-react";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Profile {
    id: string;
    username: string;
    full_name: string;
    role: string;
    created_at: string;
    is_banned: boolean;
}

export function AdminUsers() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);
            toast.error("Kullanıcılar yüklenemedi.");
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    };

    const toggleBan = async (userId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ is_banned: !currentStatus })
                .eq("id", userId);

            if (error) throw error;

            setUsers(users.map(u => u.id === userId ? { ...u, is_banned: !currentStatus } : u));
            toast.success(currentStatus ? "Kullanıcı yasağı kaldırıldı." : "Kullanıcı yasaklandı.");
        } catch (error: any) {
            toast.error("İşlem başarısız: " + error.message);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.username?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (user.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Kullanıcı ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Kullanıcı</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Kayıt Tarihi</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    Kullanıcı bulunamadı.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{user.username || "İsimsiz"}</span>
                                            <span className="text-xs text-muted-foreground">{user.full_name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'admin' ? 'default' : user.role === 'seller' ? 'secondary' : 'outline'}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(user.created_at).toLocaleDateString("tr-TR")}
                                    </TableCell>
                                    <TableCell>
                                        {user.is_banned ? (
                                            <Badge variant="destructive" className="flex w-fit items-center gap-1">
                                                <Ban className="w-3 h-3" /> Yasaklı
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-green-500 border-green-500/20 flex w-fit items-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> Aktif
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant={user.is_banned ? "default" : "destructive"}
                                            size="sm"
                                            onClick={() => toggleBan(user.id, user.is_banned || false)}
                                        >
                                            {user.is_banned ? "Yasağı Kaldır" : "Yasakla"}
                                        </Button>
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
