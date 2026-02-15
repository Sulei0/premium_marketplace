import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productTitle: string;
}

const REPORT_REASONS = [
    "Uygunsuz İçerik / Müstehcenlik",
    "Dolandırıcılık Şüphesi",
    "Yasaklı Ürün Satışı",
    "Telif Hakkı İhlali",
    "Yanlış Kategori / Yanıltıcı Bilgi",
    "Diğer",
];

export function ReportModal({ isOpen, onClose, productId, productTitle }: ReportModalProps) {
    const { user } = useAuth();
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!user) {
            toast.error("Rapor oluşturmak için giriş yapmalısınız.");
            return;
        }
        if (!reason) {
            toast.error("Lütfen bir raporlama nedeni seçin.");
            return;
        }

        setLoading(true);

        try {
            const fullReason = description ? `${reason} - ${description}` : reason;

            const { error } = await supabase.from("reports").insert({
                reporter_id: user.id,
                product_id: productId,
                reason: fullReason,
                status: "pending",
            });

            if (error) throw error;

            toast.success("Raporunuz başarıyla iletildi. Teşekkür ederiz.");
            onClose();
            // Reset form
            setReason("");
            setDescription("");
        } catch (error: any) {
            console.error("Raporlama hatası:", error);
            toast.error("Rapor gönderilirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-5 h-5" />
                        İlanı Bildir
                    </DialogTitle>
                    <DialogDescription>
                        <span className="font-semibold text-foreground">{productTitle}</span> adlı ilanı
                        bildiriyorsunuz. Bu işlem geri alınamaz.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Bildirim Nedeni</Label>
                        <Select onValueChange={setReason} value={reason}>
                            <SelectTrigger>
                                <SelectValue placeholder="Bir neden seçin" />
                            </SelectTrigger>
                            <SelectContent>
                                {REPORT_REASONS.map((r) => (
                                    <SelectItem key={r} value={r}>
                                        {r}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Açıklama (İsteğe bağlı)</Label>
                        <Textarea
                            placeholder="Ek detaylar belirtebilirsiniz..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="resize-none"
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter className="flex gap-2 sm:justify-end">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        İptal
                    </Button>
                    <Button variant="destructive" onClick={handleSubmit} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Gönderiliyor
                            </>
                        ) : (
                            "Bildir"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
