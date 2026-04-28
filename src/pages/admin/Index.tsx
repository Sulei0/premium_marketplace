import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, ShoppingBag, ShieldCheck, TrendingUp, Activity } from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalAdmins: 0,
        totalSellers: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            const p1 = supabase.from('profiles').select('*', { count: 'exact', head: true });
            const p2 = supabase.from('products').select('*', { count: 'exact', head: true });
            const p3 = supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin');
            const p4 = supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seller');

            const [r1, r2, r3, r4] = await Promise.all([p1, p2, p3, p4]);

            setStats({
                totalUsers: r1.count || 0,
                totalProducts: r2.count || 0,
                totalAdmins: r3.count || 0,
                totalSellers: r4.count || 0
            });
        };
        fetchStats();
    }, []);

    const cards = [
        { label: "Toplam Kullanıcı", value: stats.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Toplam İlan", value: stats.totalProducts, icon: ShoppingBag, color: "text-pink-500", bg: "bg-pink-500/10" },
        { label: "Satıcılar", value: stats.totalSellers, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
        { label: "Yöneticiler", value: stats.totalAdmins, icon: ShieldCheck, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    ];

    return (
        <div className="space-y-6 sm:space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Genel Bakış</h1>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base">Platform istatistikleri ve durum özeti.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {cards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div key={i} className="bg-card border border-border p-4 sm:p-6 rounded-xl flex items-start justify-between shadow-sm">
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-muted-foreground">{card.label}</p>
                                <h3 className="text-xl sm:text-2xl font-bold mt-1 sm:mt-2">{card.value}</h3>
                            </div>
                            <div className={`p-2 sm:p-3 rounded-lg ${card.bg} shrink-0`}>
                                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.color}`} />
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-card border border-border p-6 rounded-xl min-h-[200px] sm:min-h-[300px] flex flex-col items-center justify-center text-muted-foreground border-dashed">
                    <Activity className="w-8 h-8 sm:w-10 sm:h-10 mb-4 opacity-20" />
                    <p className="text-sm">Son Aktiviteler (Yakında)</p>
                </div>
                <div className="bg-card border border-border p-6 rounded-xl min-h-[200px] sm:min-h-[300px] flex flex-col items-center justify-center text-muted-foreground border-dashed">
                    <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 mb-4 opacity-20" />
                    <p className="text-sm">Satış Grafikleri (Yakında)</p>
                </div>
            </div>
        </div>
    );
}
