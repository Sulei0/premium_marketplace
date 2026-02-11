import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/Layout";
import { ImageWithSkeleton } from "@/components/ImageWithSkeleton";
import { AddProductModal, DbProductForEdit } from "@/components/AddProductModal";
import { Loader2, Edit, Trash2, Plus, Sparkles, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/index";
import { toast } from "sonner";
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
import { usePageMeta } from "@/hooks/usePageMeta";

interface MyProduct {
    id: string;
    title: string;
    price: number;
    image_url: string | null;
    image_urls: string[] | null;
    category: string;
    is_active: boolean;
    base_duration: number;
    max_duration: number;
    description: string;
    extras: any[]; // JSONB
    created_at: string;
}

export default function MyProducts() {
    usePageMeta("Ürünlerim", "Satışa çıkardığınız ürünleri yönetin.");
    const { user } = useAuth();
    const [products, setProducts] = useState<MyProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<DbProductForEdit | null>(null);

    // Delete confirm state
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchMyProducts();
    }, [user]);

    const fetchMyProducts = async () => {
        if (!user || !supabase) return;
        try {
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error: any) {
            toast.error("Ürünler yüklenirken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product: MyProduct) => {
        const editData: DbProductForEdit = {
            id: product.id,
            user_id: user!.id,
            title: product.title,
            description: product.description,
            price: product.price,
            category: product.category,
            image_url: product.image_url,
            image_urls: product.image_urls || (product.image_url ? [product.image_url] : []),
            base_duration: product.base_duration,
            max_duration: product.max_duration,
            extras: Array.isArray(product.extras) ? product.extras : [],
        };
        setEditingProduct(editData);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId || !supabase) return;
        try {
            // Soft delete (Active = false) or Hard Delete?
            // For now, let's do hard delete as per requirements (List/Edit/Delete)
            // But verify if RLS allows DELETE.
            const { error } = await supabase
                .from("products")
                .delete()
                .eq("id", deleteId);

            if (error) throw error;

            toast.success("Ürün silindi.");
            setProducts(prev => prev.filter(p => p.id !== deleteId));
        } catch (error: any) {
            console.error(error);
            toast.error("Silme işlemi başarısız: " + error.message);
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-12 min-h-screen">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
                            Ürünlerim
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Satışa çıkardığınız ürünlerinizi buradan yönetebilirsiniz.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingProduct(null);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
                    >
                        <Plus className="w-5 h-5" />
                        Yeni İlan Ver
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-all items-start md:items-center group"
                            >
                                {/* Image */}
                                <div className="w-full md:w-32 h-32 shrink-0 rounded-lg overflow-hidden bg-muted relative">
                                    <ImageWithSkeleton
                                        src={product.image_url || "/images/placeholder.webp"}
                                        alt={product.title}
                                        className="w-full h-full object-cover"
                                        fallbackSrc="/images/placeholder.webp"
                                    />
                                    {!product.is_active && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <span className="text-xs font-bold text-white uppercase tracking-wider">Pasif</span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 rounded text-[10px] bg-secondary text-secondary-foreground font-mono uppercase">
                                            {product.category}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(product.created_at).toLocaleDateString("tr-TR")}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-lg truncate pr-4">{product.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                        {product.description}
                                    </p>
                                    <div className="mt-3 flex items-center gap-4">
                                        <span className="text-lg font-bold text-primary">
                                            {formatCurrency(product.price)}
                                        </span>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Sparkles className="w-3 h-3 text-purple-400" />
                                            {product.extras?.length || 0} Ekstra
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-secondary hover:text-secondary-foreground transition-colors text-sm font-medium"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Düzenle
                                    </button>
                                    <button
                                        onClick={() => setDeleteId(product.id)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Sil
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-3xl bg-card/30">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                            <Sparkles className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Henüz Ürün Yok</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                            Dolabındaki özel parçaları satışa çıkarmak için harika bir zaman.
                        </p>
                        <button
                            onClick={() => {
                                setEditingProduct(null);
                                setIsModalOpen(true);
                            }}
                            className="px-8 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 font-semibold"
                        >
                            İlk İlanı Ver
                        </button>
                    </div>
                )}

                {/* Edit/Add Modal */}
                {isModalOpen && (
                    <AddProductModal
                        isOpen={isModalOpen}
                        onClose={() => {
                            setIsModalOpen(false);
                            setEditingProduct(null);
                            fetchMyProducts(); // Refresh list after close
                        }}
                        editProduct={editingProduct}
                    />
                )}

                {/* Delete Confirmation */}
                <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Ürünü silmek istiyor musun?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Bu işlem geri alınamaz. Ürün ve ilgili tüm veriler kalıcı olarak silinecektir.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Sil
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Layout>
    );
}
