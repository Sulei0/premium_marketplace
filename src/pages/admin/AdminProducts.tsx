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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2, Search, ExternalLink, CheckCircle, XCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { formatCurrency } from "@/lib/index";

interface Product {
    id: string;
    title: string;
    price: number;
    category: string;
    user_id: string;
    is_active: boolean; // Active/Passive by seller
    is_approved: boolean; // Approved by admin
    created_at: string;
    image_url: string | null;
    seller: {
        username: string;
    }
}

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Step 1: fetch all products (no join — no FK between products and profiles)
            const { data: productData, error: productError } = await supabase
                .from("products")
                .select("*")
                .order("created_at", { ascending: false });

            if (productError) throw productError;

            // Step 2: fetch profiles for all unique user_ids
            const userIds = [...new Set((productData || []).map((p: any) => p.user_id))];
            let usernameMap: Record<string, string> = {};

            if (userIds.length > 0) {
                const { data: profileData } = await supabase
                    .from("profiles")
                    .select("id, username")
                    .in("id", userIds);

                if (profileData) {
                    profileData.forEach((p: any) => {
                        usernameMap[p.id] = p.username;
                    });
                }
            }

            // Step 3: merge seller username into each product
            const merged = (productData || []).map((p: any) => ({
                ...p,
                seller: { username: usernameMap[p.user_id] || null },
            }));

            setProducts(merged as any);
        } catch (error: any) {
            toast.error("İlanlar yüklenirken hata oluştu: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (productId: string) => {
        if (!confirm("Bu ilanı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;

        try {
            const { error } = await supabase
                .from("products")
                .delete()
                .eq("id", productId);

            if (error) throw error;
            toast.success("İlan silindi.");
            fetchProducts();
        } catch (error: any) {
            toast.error("Silme işlemi başarısız: " + error.message);
        }
    };

    const handleApprovalToggle = async (productId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from("products")
                .update({ is_approved: !currentStatus })
                .eq("id", productId);

            if (error) throw error;
            toast.success(currentStatus ? "İlan yayından kaldırıldı (Onay çekildi)." : "İlan onaylandı ve yayına alındı.");
            fetchProducts();
        } catch (error: any) {
            toast.error("İşlem başarısız: " + error.message);
        }
    }

    const filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase()) ||
        product.seller?.username?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">İlan Yönetimi</h1>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-muted-foreground">
                        Toplam: {products.length}
                    </Badge>
                </div>
            </div>

            <div className="flex items-center gap-2 bg-card p-2 rounded-lg border border-border w-full max-w-md">
                <Search className="w-4 h-4 text-muted-foreground ml-2" />
                <Input
                    placeholder="İlan başlığı, kategori veya satıcı ara..."
                    className="border-none shadow-none focus-visible:ring-0"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                            <TableHead>Görsel</TableHead>
                            <TableHead>Başlık</TableHead>
                            <TableHead>Satıcı</TableHead>
                            <TableHead>Fiyat</TableHead>
                            <TableHead>Durum (Satıcı)</TableHead>
                            <TableHead>Onay (Admin)</TableHead>
                            <TableHead>Tarih</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    <div className="flex justify-center items-center gap-2 text-muted-foreground">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Yükleniyor...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                    İlan bulunamadı.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <div className="w-12 h-12 rounded-md bg-secondary overflow-hidden border border-border">
                                            {product.image_url ? (
                                                <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Yok</div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium truncate max-w-[200px]" title={product.title}>{product.title}</span>
                                            <span className="text-xs text-muted-foreground">{product.category}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">{product.seller?.username || 'Bilinmiyor'}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm font-semibold">{formatCurrency(product.price)}</div>
                                    </TableCell>
                                    <TableCell>
                                        {product.is_active ? (
                                            <Badge variant="outline" className="text-green-500 bg-green-500/10 border-green-500/20">Aktif</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-muted-foreground">Pasif</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {product.is_approved ? (
                                            <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">Onaylı</Badge>
                                        ) : (
                                            <Badge variant="destructive">Onay Bekliyor</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        {format(new Date(product.created_at), 'd MMM yyyy', { locale: tr })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                title="İlanı Görüntüle"
                                                onClick={() => window.open(`/#/products/${product.id}`, '_blank')}
                                            >
                                                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                title={product.is_approved ? "Onayı Kaldır" : "Onayla"}
                                                onClick={() => handleApprovalToggle(product.id, product.is_approved)}
                                            >
                                                {product.is_approved ? (
                                                    <XCircle className="w-4 h-4 text-orange-500" />
                                                ) : (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                )}
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                                title="Sil"
                                                onClick={() => handleDelete(product.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
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
