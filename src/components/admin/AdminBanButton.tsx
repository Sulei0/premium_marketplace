import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Ban, CheckCircle2 } from "lucide-react";
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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AdminBanButtonProps {
    targetUserId: string;
}

export function AdminBanButton({ targetUserId }: AdminBanButtonProps) {
    const [isBlocked, setIsBlocked] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch initial status
    useEffect(() => {
        const fetchStatus = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('is_blocked')
                .eq('id', targetUserId)
                .single();

            if (data) {
                setIsBlocked(data.is_blocked || false);
            }
            setLoading(false);
        };

        if (targetUserId) fetchStatus();
    }, [targetUserId]);

    const handleBlockToggle = async () => {
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ is_blocked: !isBlocked })
                .eq("id", targetUserId);

            if (error) throw error;

            setIsBlocked(!isBlocked);
            toast.success(isBlocked ? "Kullanıcının engeli kaldırıldı." : "Kullanıcı engellendi.");
        } catch (error: any) {
            toast.error("İşlem başarısız: " + error.message);
        }
    };

    if (loading) return null;

    return (
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Kullanıcı Erişimi:</span>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        variant={isBlocked ? "outline" : "destructive"}
                        size="sm"
                        className={isBlocked ? "border-green-500 text-green-500 hover:text-green-600 hover:bg-green-500/10" : ""}
                    >
                        {isBlocked ? (
                            <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Engeli Kaldır
                            </>
                        ) : (
                            <>
                                <Ban className="w-4 h-4 mr-2" />
                                Kullanıcıyı Engelle
                            </>
                        )}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {isBlocked ? "Engeli kaldırmak istiyor musunuz?" : "Kullanıcıyı engellemek istediğinize emin misiniz?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {isBlocked
                                ? "Kullanıcı tekrar giriş yapabilecek ve siteyi kullanabilecek."
                                : "Kullanıcı siteye erişimini kaybedecek."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBlockToggle}
                            className={isBlocked ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                        >
                            {isBlocked ? "Engeli Kaldır" : "Engelle"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
