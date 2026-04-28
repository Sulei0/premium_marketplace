import { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, ShoppingBag, LogOut, ExternalLink, ShieldAlert, Flag, PenSquare, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/index";
import { Button } from "@/components/ui/button";

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { signOut } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
        },
        {
            label: "Köşe Yazıları",
            icon: PenSquare,
            path: "/admin/blog",
        }
    ];

    const handleNavigate = (path: string) => {
        navigate(path);
        setSidebarOpen(false);
    };

    const SidebarContent = () => (
        <>
            <div className="flex h-16 items-center border-b border-border px-6 gap-2 shrink-0">
                <ShieldAlert className="w-6 h-6 text-primary" />
                <span className="font-bold text-lg tracking-tight">Admin<span className="text-primary">Panel</span></span>
            </div>

            <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
                <div className="text-xs font-semibold text-muted-foreground mb-4 px-2 uppercase tracking-wider">Yönetim</div>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.path}
                            onClick={() => handleNavigate(item.path)}
                            className={cn(
                                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                    : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                            )}
                        >
                            <Icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border bg-card/30 shrink-0">
                <div className="space-y-2">
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2 text-xs h-9"
                        onClick={() => { navigate('/'); setSidebarOpen(false); }}
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
        </>
    );

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Desktop: fixed, Mobile: slide-in drawer */}
            <aside
                className={cn(
                    "fixed left-0 top-0 h-full w-64 border-r border-border bg-card/95 backdrop-blur-xl z-50 flex flex-col transition-transform duration-300 ease-in-out",
                    // Mobile: hidden by default, slides in when open
                    sidebarOpen ? "translate-x-0" : "-translate-x-full",
                    // Desktop: always visible
                    "lg:translate-x-0"
                )}
            >
                {/* Mobile close button */}
                <button
                    className="absolute top-4 right-4 lg:hidden p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                    onClick={() => setSidebarOpen(false)}
                >
                    <X className="w-5 h-5" />
                </button>

                <SidebarContent />
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
                {/* Mobile Top Bar */}
                <header className="sticky top-0 z-30 flex items-center h-14 px-4 border-b border-border bg-card/95 backdrop-blur-xl lg:hidden shrink-0">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors mr-3"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <ShieldAlert className="w-5 h-5 text-primary mr-2" />
                    <span className="font-bold text-base tracking-tight">Admin<span className="text-primary">Panel</span></span>
                </header>

                {/* Page Content */}
                <main className="flex-1 min-h-0">
                    <div className="min-h-full bg-secondary/5 p-4 sm:p-6 lg:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
