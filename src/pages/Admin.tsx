import { Layout } from "@/components/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminProducts } from "@/components/admin/AdminProducts";

export default function AdminPanel() {
    usePageMeta("Admin Paneli");

    return (
        <Layout>
            <div className="container mx-auto px-4 py-12 min-h-screen">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Admin Paneli</h1>
                        <p className="text-muted-foreground">Platform yönetimi ve moderasyon.</p>
                    </div>
                </div>

                <Tabs defaultValue="users" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                        <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
                        <TabsTrigger value="products">Ürünler</TabsTrigger>
                    </TabsList>

                    <TabsContent value="users" className="space-y-4 animate-in fade-in-50 duration-500">
                        <div className="flex flex-col gap-2 mb-4">
                            <h2 className="text-xl font-semibold">Kullanıcı Yönetimi</h2>
                            <p className="text-sm text-muted-foreground">Kayıtlı kullanıcıları görüntüle, rolleri incele veya yasakla.</p>
                        </div>
                        <AdminUsers />
                    </TabsContent>

                    <TabsContent value="products" className="space-y-4 animate-in fade-in-50 duration-500">
                        <div className="flex flex-col gap-2 mb-4">
                            <h2 className="text-xl font-semibold">Ürün Yönetimi</h2>
                            <p className="text-sm text-muted-foreground">Tüm ilanları moderasyon için listele.</p>
                        </div>
                        <AdminProducts />
                    </TabsContent>
                </Tabs>
            </div>
        </Layout>
    );
}
