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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreVertical, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import { AdminBanButton } from "@/components/admin/AdminBanButton";

interface Report {
    id: string;
    reason: string;
    status: 'pending' | 'resolved' | 'dismissed';
    created_at: string;
    product_id: string;
    reporter_id: string;
    product: {
        title: string;
        user_id: string; // seller id
    } | null;
    reporter: {
        username: string;
    } | null;
}

export default function AdminReports() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        setLoading(true);

        try {
            // Step 1: fetch reports only (no joins to avoid FK cache errors)
            const { data: reportData, error: reportError } = await supabase!
                .from("reports")
                .select("*")
                .order("created_at", { ascending: false });

            if (reportError) throw reportError;

            const reports = reportData || [];

            // Step 2: fetch related products by product_ids
            const productIds = [...new Set(reports.map((r: any) => r.product_id).filter(Boolean))];
            let productMap: Record<string, { title: string; user_id: string }> = {};
            if (productIds.length > 0) {
                const { data: productData } = await supabase!
                    .from("products")
                    .select("id, title, user_id")
                    .in("id", productIds);
                if (productData) {
                    productData.forEach((p: any) => {
                        productMap[p.id] = { title: p.title, user_id: p.user_id };
                    });
                }
            }

            // Step 3: fetch reporter usernames by reporter_ids
            const reporterIds = [...new Set(reports.map((r: any) => r.reporter_id).filter(Boolean))];
            let reporterMap: Record<string, string | null> = {};
            if (reporterIds.length > 0) {
                const { data: profileData } = await supabase!
                    .from("profiles")
                    .select("id, username")
                    .in("id", reporterIds);
                if (profileData) {
                    profileData.forEach((p: any) => {
                        reporterMap[p.id] = p.username;
                    });
                }
            }

            // Step 4: merge everything together
            const merged = reports.map((r: any) => ({
                ...r,
                product: productMap[r.product_id] ?? null,
                reporter: { username: reporterMap[r.reporter_id] ?? null },
            }));

            setReports(merged as Report[]);
        } catch (err: any) {
            console.error("Error fetching reports:", err);
            toast.error("Raporlar yüklenirken hata oluştu: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const updateStatus = async (id: string, newStatus: 'resolved' | 'dismissed') => {
        const { error } = await supabase!
            .from("reports")
            .update({ status: newStatus })
            .eq("id", id);

        if (error) {
            toast.error("Durum güncellenemedi.");
        } else {
            toast.success("Rapor durumu güncellendi.");
            fetchReports();
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

        const { error } = await supabase!
            .from("products")
            .delete()
            .eq("id", productId);

        if (error) {
            toast.error("Ürün silinemedi: " + error.message);
        } else {
            toast.success("Ürün silindi.");
            // Update status to resolved automatically
            // find report with this product
            const report = reports.find(r => r.product_id === productId);
            if (report) {
                updateStatus(report.id, 'resolved');
            } else {
                fetchReports();
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Raporlanan İlanlar</CardTitle>
                <CardDescription>
                    Kullanıcılar tarafından bildirilen ilanları buradan yönetebilirsiniz.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tarih</TableHead>
                            <TableHead>Raporlayan</TableHead>
                            <TableHead>İlan</TableHead>
                            <TableHead>Sebep</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Henüz rapor bulunmuyor.
                                </TableCell>
                            </TableRow>
                        ) : (
                            reports.map((report) => (
                                <TableRow key={report.id}>
                                    <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                                        {format(new Date(report.created_at), "d MMM yyyy HH:mm", { locale: tr })}
                                    </TableCell>
                                    <TableCell>
                                        {report.reporter?.username || "Silinmiş Kullanıcı"}
                                        <div className="text-[10px] text-muted-foreground font-mono">{report.reporter_id.slice(0, 8)}...</div>
                                    </TableCell>
                                    <TableCell>
                                        {report.product ? (
                                            <div className="flex flex-col gap-1">
                                                <Link to={`/product/${report.product_id}`} target="_blank" className="font-medium hover:underline flex items-center gap-1">
                                                    {report.product.title}
                                                    <ExternalLink className="w-3 h-3" />
                                                </Link>
                                                <div className="text-xs text-muted-foreground">Satıcı ID: {report.product.user_id.slice(0, 8)}...</div>
                                            </div>
                                        ) : (
                                            <span className="text-destructive italic">Silinmiş İlan</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={report.reason}>
                                        {report.reason}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            report.status === 'pending' ? 'destructive' :
                                                report.status === 'resolved' ? 'default' : 'secondary'
                                        }>
                                            {report.status === 'pending' ? 'Bekliyor' :
                                                report.status === 'resolved' ? 'Çözüldü' : 'Reddedildi'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => updateStatus(report.id, 'resolved')}>
                                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Mevzuyu Kapat (Çözüldü)
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => updateStatus(report.id, 'dismissed')}>
                                                    <XCircle className="w-4 h-4 mr-2" /> Yoksay (Reddet)
                                                </DropdownMenuItem>
                                                {report.product && (
                                                    <>
                                                        <DropdownMenuItem onClick={() => handleDeleteProduct(report.product_id)} className="text-destructive">
                                                            İlanı Sil
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                {report.product && (
                                                    <div className="p-2 border-t mt-1">
                                                        <div className="text-[10px] text-muted-foreground mb-1">Satıcı İşlemleri:</div>
                                                        <AdminBanButton targetUserId={report.product.user_id} />
                                                    </div>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
