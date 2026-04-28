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
import { Loader2, MoreVertical, ExternalLink, CheckCircle2, XCircle, Flag, User, Calendar } from "lucide-react";
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
        user_id: string;
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
            const { data: reportData, error: reportError } = await supabase!
                .from("reports")
                .select("*")
                .order("created_at", { ascending: false });

            if (reportError) throw reportError;

            const reports = reportData || [];

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
            const report = reports.find(r => r.product_id === productId);
            if (report) {
                updateStatus(report.id, 'resolved');
            } else {
                fetchReports();
            }
        }
    };

    const StatusBadge = ({ status }: { status: Report['status'] }) => (
        <Badge variant={
            status === 'pending' ? 'destructive' :
                status === 'resolved' ? 'default' : 'secondary'
        }>
            {status === 'pending' ? 'Bekliyor' :
                status === 'resolved' ? 'Çözüldü' : 'Reddedildi'}
        </Badge>
    );

    const ReportActionsMenu = ({ report }: { report: Report }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => updateStatus(report.id, 'resolved')}>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Çözüldü olarak kapat
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus(report.id, 'dismissed')}>
                    <XCircle className="w-4 h-4 mr-2" /> Yoksay (Reddet)
                </DropdownMenuItem>
                {report.product && (
                    <DropdownMenuItem onClick={() => handleDeleteProduct(report.product_id)} className="text-destructive">
                        İlanı Sil
                    </DropdownMenuItem>
                )}
                {report.product && (
                    <div className="p-2 border-t mt-1">
                        <div className="text-[10px] text-muted-foreground mb-1">Satıcı İşlemleri:</div>
                        <AdminBanButton targetUserId={report.product.user_id} />
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center gap-2 text-muted-foreground py-16">
                <Loader2 className="animate-spin w-5 h-5" /> Yükleniyor...
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Raporlanan İlanlar</CardTitle>
                <CardDescription>
                    Kullanıcılar tarafından bildirilen ilanları buradan yönetebilirsiniz.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">

                {/* Desktop Table */}
                <div className="hidden md:block rounded-xl border border-border overflow-hidden">
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
                                            <StatusBadge status={report.status} />
                                        </TableCell>
                                        <TableCell>
                                            <ReportActionsMenu report={report} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden space-y-3 p-4">
                    {reports.length === 0 ? (
                        <div className="text-center text-muted-foreground py-12">
                            Henüz rapor bulunmuyor.
                        </div>
                    ) : (
                        reports.map((report) => (
                            <div key={report.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Flag className="w-4 h-4 text-destructive shrink-0" />
                                        <div className="min-w-0">
                                            {report.product ? (
                                                <Link
                                                    to={`/product/${report.product_id}`}
                                                    target="_blank"
                                                    className="font-semibold hover:underline flex items-center gap-1 text-sm"
                                                >
                                                    <span className="truncate max-w-[180px]">{report.product.title}</span>
                                                    <ExternalLink className="w-3 h-3 shrink-0" />
                                                </Link>
                                            ) : (
                                                <span className="text-destructive italic text-sm">Silinmiş İlan</span>
                                            )}
                                        </div>
                                    </div>
                                    <ReportActionsMenu report={report} />
                                </div>

                                <p className="text-sm text-muted-foreground bg-secondary/40 rounded-lg p-2">
                                    <span className="font-medium text-foreground">Sebep: </span>
                                    {report.reason}
                                </p>

                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {report.reporter?.username || "Silinmiş Kullanıcı"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(report.created_at), "d MMM yyyy HH:mm", { locale: tr })}
                                    </span>
                                </div>

                                <div>
                                    <StatusBadge status={report.status} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
