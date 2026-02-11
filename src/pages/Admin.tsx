import { Layout } from "@/components/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Shield, Users, Package, BarChart3 } from "lucide-react";

export default function AdminPanel() {
    usePageMeta("Admin Paneli");

    return (
        <Layout>
            <div className="container mx-auto px-4 py-16">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Admin Paneli</h1>
                        <p className="text-sm text-muted-foreground">Yönetim ve kontrol merkezi</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Placeholder cards */}
                    <div className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors">
                        <Users className="w-8 h-8 text-primary mb-4" />
                        <h3 className="font-semibold mb-1">Kullanıcı Yönetimi</h3>
                        <p className="text-sm text-muted-foreground">Kullanıcıları görüntüle, düzenle ve yönet.</p>
                        <span className="inline-block mt-4 text-xs text-muted-foreground/50 font-mono">Yakında</span>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors">
                        <Package className="w-8 h-8 text-purple-400 mb-4" />
                        <h3 className="font-semibold mb-1">Ürün Yönetimi</h3>
                        <p className="text-sm text-muted-foreground">Ürünleri incele, onayla veya kaldır.</p>
                        <span className="inline-block mt-4 text-xs text-muted-foreground/50 font-mono">Yakında</span>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors">
                        <BarChart3 className="w-8 h-8 text-green-400 mb-4" />
                        <h3 className="font-semibold mb-1">İstatistikler</h3>
                        <p className="text-sm text-muted-foreground">Platformun genel durumu ve metrikleri.</p>
                        <span className="inline-block mt-4 text-xs text-muted-foreground/50 font-mono">Yakında</span>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
