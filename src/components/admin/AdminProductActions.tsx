import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Trash2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AdminProductActionsProps {
    productId: string;
    sellerId: string;
}

export function AdminProductActions({ productId, sellerId }: AdminProductActionsProps) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Strict admin check
        const checkAdmin = async () => {
            if (!user) return;

            // 1. Metadata check
            if (user.user_metadata?.role === 'admin') {
                setIsAdmin(true);
                return;
            }

            // 2. DB check
            const { data } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (data?.role === 'admin') {
                setIsAdmin(true);
            }
        };
        checkAdmin();
    }, [user]);

    if (!isAdmin) return null;

    const handleDeleteProduct = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId);

            if (error) throw error;

            toast.success("İlan admin yetkisiyle silindi.");
            navigate('/');
        } catch (error: any) {
            toast.error("Silme işlemi başarısız: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2 mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <span className="text-sm font-bold text-red-500 mr-auto">Admin İşlemleri</span>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={loading}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        İlanı Sil
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>İlanı silmek istediğinize emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu işlem admin yetkisiyle yapılmaktadır ve geri alınamaz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700">
                            {loading ? "Siliniyor..." : "Evet, Sil"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
