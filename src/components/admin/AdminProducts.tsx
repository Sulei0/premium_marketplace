import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Trash2, ExternalLink, ImageOff } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/lib/index";

interface Product {
    id: string;
    title: string;
    price: number;
    category: string;
    is_active: boolean;
    created_at: string;
    image_url: string | null;
    user_id: string; // seller
}

export function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);
            toast.error("Ürünler yüklenemedi.");
        } else {
            setProducts(data || []);
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const { error } = await supabase
                .from("products")
                .delete()
                .eq("id", deleteId);

            if (error) throw error;

            setProducts(products.filter(p => p.id !== deleteId));
            toast.success("Ürün silindi.");
        } catch (error: any) {
            toast.error("Silme başarısız: " + error.message);
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Görsel</TableHead>
                            <TableHead>Başlık</TableHead>
                            <TableHead>Fiyat</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    Ürün bulunamadı.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <div className="w-10 h-10 rounded overflow-hidden bg-muted">
                                            {product.image_url ? (
                                                <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageOff className="w-4 h-4 m-auto mt-3 text-muted-foreground" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium max-w-[200px] truncate" title={product.title}>
                                        {product.title}
                                    </TableCell>
                                    <TableCell>{formatCurrency(product.price)}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{product.category}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {product.is_active ? (
                                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">Aktif</Badge>
                                        ) : (
                                            <Badge variant="secondary">Pasif</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link to={`/product/${product.id}`} target="_blank">
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                                            onClick={() => setDeleteId(product.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Ürünü silmek istiyor musun?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu işlem geri alınamaz. Admin yetkisiyle bu ürünü kalıcı olarak sileceksiniz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
