import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, ShoppingBag, LogOut, ExternalLink, ShieldAlert, Flag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/index";
import { Button } from "@/components/ui/button";

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { signOut } = useAuth();

    const menuItems = [
        {
            label: "Genel Bakış",
            icon: LayoutDashboard,
            path: "/admin",
        },
        {
            label: "Kullanıcılar",
            icon: Users,
            path: "/admin/users",
        },
        {
            label: "İlanlar",
            icon: ShoppingBag,
            path: "/admin/products",
        },
        {
            label: "Raporlar",
            icon: Flag,
            path: "/admin/reports",
        }
    ];

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 border-r border-border bg-card/50 backdrop-blur-xl z-50">
                <div className="flex h-16 items-center border-b border-border px-6 gap-2">
                    <ShieldAlert className="w-6 h-6 text-primary" />
                    <span className="font-bold text-lg tracking-tight">Admin<span className="text-primary">Panel</span></span>
                </div>

                <nav className="p-4 space-y-1">
                    <div className="text-xs font-semibold text-muted-foreground mb-4 px-2 uppercase tracking-wider">Yönetim</div>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={cn(
                                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                        : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                                )}
                            >
                                <Icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 w-full p-4 border-t border-border bg-card/30">
                    <div className="space-y-2">
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-2 text-xs h-9"
                            onClick={() => navigate('/')}
                        >
                            <ExternalLink className="w-3 h-3" /> Siteye Dön
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2 text-xs h-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => signOut()}
                        >
                            <LogOut className="w-3 h-3" /> Çıkış Yap
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="pl-64 w-full">
                <div className="min-h-screen bg-secondary/5 p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
