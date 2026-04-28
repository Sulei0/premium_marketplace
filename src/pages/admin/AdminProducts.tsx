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
import { Loader2, Trash2, Search, ExternalLink, CheckCircle, XCircle, Eye, Clock, Filter } from "lucide-react";
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
    is_active: boolean;
    is_approved: boolean;
    created_at: string;
    image_url: string | null;
    seller: {
        username: string;
    }
}

type FilterType = "all" | "pending" | "approved";

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterType>("pending");

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data: productData, error: productError } = await supabase
                .from("products")
                .select("*")
                .order("created_at", { ascending: false });

            if (productError) throw productError;

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

    const handleApprove = async (product: Product) => {
        try {
            const { error } = await supabase
                .from("products")
                .update({ is_approved: true })
                .eq("id", product.id);

            if (error) throw error;

            await supabase
                .from("notifications")
                .insert({
                    user_id: product.user_id,
                    type: "product_approved",
                    title: "İlanınız Onaylandı! 🎉",
                    body: `"${product.title}" başlıklı ilanınız admin tarafından onaylandı ve yayına alındı.`,
                    link: `/product/${product.id}`,
                    is_read: false,
                });

            toast.success("İlan onaylandı ve kullanıcıya bildirim gönderildi.");
            fetchProducts();
        } catch (error: any) {
            toast.error("İşlem başarısız: " + error.message);
        }
    };

    const handleReject = async (product: Product) => {
        if (!confirm(`"${product.title}" ilanını reddetmek istediğinize emin misiniz?`)) return;

        try {
            const { error } = await supabase
                .from("products")
                .update({ is_approved: false, is_active: false })
                .eq("id", product.id);

            if (error) throw error;

            await supabase
                .from("notifications")
                .insert({
                    user_id: product.user_id,
                    type: "product_rejected",
                    title: "İlanınız Reddedildi",
                    body: `"${product.title}" başlıklı ilanınız platform kurallarına uygun bulunmadı. Lütfen düzenleyip tekrar gönderin.`,
                    link: `/profile/me`,
                    is_read: false,
                });

            toast.success("İlan reddedildi ve kullanıcıya bildirim gönderildi.");
            fetchProducts();
        } catch (error: any) {
            toast.error("İşlem başarısız: " + error.message);
        }
    };

    const handleRevokeApproval = async (product: Product) => {
        try {
            const { error } = await supabase
                .from("products")
                .update({ is_approved: false })
                .eq("id", product.id);

            if (error) throw error;

            await supabase
                .from("notifications")
                .insert({
                    user_id: product.user_id,
                    type: "product_rejected",
                    title: "İlanınızın Onayı Kaldırıldı",
                    body: `"${product.title}" başlıklı ilanınızın onayı kaldırıldı. İlan yayından alındı.`,
                    link: `/profile/me`,
                    is_read: false,
                });

            toast.success("İlan onayı kaldırıldı ve kullanıcıya bildirim gönderildi.");
            fetchProducts();
        } catch (error: any) {
            toast.error("İşlem başarısız: " + error.message);
        }
    };

    const pendingCount = products.filter(p => !p.is_approved).length;

    const filteredProducts = products
        .filter(product => {
            const matchesSearch =
                product.title.toLowerCase().includes(search.toLowerCase()) ||
                product.category.toLowerCase().includes(search.toLowerCase()) ||
                product.seller?.username?.toLowerCase().includes(search.toLowerCase());

            const matchesFilter =
                filter === "all" ? true :
                    filter === "pending" ? !product.is_approved :
                        product.is_approved;

            return matchesSearch && matchesFilter;
        });

    const ProductActions = ({ product }: { product: Product }) => (
        <div className="flex items-center gap-1">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="İlanı Görüntüle"
                onClick={() => window.open(`/#/products/${product.id}`, '_blank')}
            >
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </Button>

            {product.is_approved ? (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Onayı Kaldır"
                    onClick={() => handleRevokeApproval(product)}
                >
                    <XCircle className="w-4 h-4 text-orange-500" />
                </Button>
            ) : (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-green-500/10"
                        title="Onayla"
                        onClick={() => handleApprove(product)}
                    >
                        <CheckCircle className="w-4 h-4 text-green-500" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-red-500/10"
                        title="Reddet"
                        onClick={() => handleReject(product)}
                    >
                        <XCircle className="w-4 h-4 text-red-500" />
                    </Button>
                </>
            )}

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
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">İlan Yönetimi</h1>
                <div className="flex items-center gap-2 flex-wrap">
                    {pendingCount > 0 && (
                        <Badge variant="destructive" className="animate-pulse">
                            {pendingCount} Onay Bekliyor
                        </Badge>
                    )}
                    <Badge variant="outline" className="text-muted-foreground">
                        Toplam: {products.length}
                    </Badge>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 bg-card p-2 rounded-lg border border-border w-full">
                    <Search className="w-4 h-4 text-muted-foreground ml-2 shrink-0" />
                    <Input
                        placeholder="İlan başlığı, kategori veya satıcı ara..."
                        className="border-none shadow-none focus-visible:ring-0"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-1.5 bg-card p-1 rounded-lg border border-border self-start">
                    <button
                        onClick={() => setFilter("pending")}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === "pending" ? "bg-destructive text-destructive-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <Clock className="w-3 h-3 inline mr-1" />
                        Bekleyenler
                    </button>
                    <button
                        onClick={() => setFilter("approved")}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === "approved" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <CheckCircle className="w-3 h-3 inline mr-1" />
                        Onaylılar
                    </button>
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === "all" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <Filter className="w-3 h-3 inline mr-1" />
                        Tümü
                    </button>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block rounded-xl border border-border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                            <TableHead>Görsel</TableHead>
                            <TableHead>Başlık</TableHead>
                            <TableHead>Satıcı</TableHead>
                            <TableHead>Fiyat</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>Onay</TableHead>
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
                                    {filter === "pending" ? "Onay bekleyen ilan yok." : "İlan bulunamadı."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts.map((product) => (
                                <TableRow key={product.id} className={!product.is_approved ? "bg-yellow-500/5" : ""}>
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
                                            <Badge variant="destructive" className="animate-pulse">Onay Bekliyor</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        {format(new Date(product.created_at), 'd MMM yyyy', { locale: tr })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ProductActions product={product} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile & Tablet Card List */}
            <div className="lg:hidden space-y-3">
                {loading ? (
                    <div className="flex justify-center items-center gap-2 text-muted-foreground py-12">
                        <Loader2 className="w-5 h-5 animate-spin" /> Yükleniyor...
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                        {filter === "pending" ? "Onay bekleyen ilan yok." : "İlan bulunamadı."}
                    </div>
                ) : (
                    filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className={`bg-card border border-border rounded-xl p-4 space-y-3 ${!product.is_approved ? "border-yellow-500/30 bg-yellow-500/5" : ""}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-14 h-14 rounded-lg bg-secondary overflow-hidden border border-border shrink-0">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Yok</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate">{product.title}</p>
                                    <p className="text-xs text-muted-foreground">{product.category}</p>
                                    <p className="text-sm font-bold text-primary mt-1">{formatCurrency(product.price)}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-xs text-muted-foreground">Satıcı: <span className="text-foreground font-medium">{product.seller?.username || 'Bilinmiyor'}</span></span>
                                    <span className="text-xs text-muted-foreground">{format(new Date(product.created_at), 'd MMM yyyy', { locale: tr })}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex gap-2 flex-wrap">
                                    {product.is_active ? (
                                        <Badge variant="outline" className="text-green-500 bg-green-500/10 border-green-500/20 text-xs">Aktif</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-muted-foreground text-xs">Pasif</Badge>
                                    )}
                                    {product.is_approved ? (
                                        <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 text-xs">Onaylı</Badge>
                                    ) : (
                                        <Badge variant="destructive" className="animate-pulse text-xs">Onay Bekliyor</Badge>
                                    )}
                                </div>
                                <ProductActions product={product} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
