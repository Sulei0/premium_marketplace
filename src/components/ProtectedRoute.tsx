import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * Korumalı Rota Bileşeni
 * Giriş yapmamış kullanıcıları otomatik olarak ana sayfaya yönlendirir.
 * Kullanım: <ProtectedRoute><ChatList /></ProtectedRoute>
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading } = useAuth();

    // Auth durumu yüklenirken loading göster
    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Giriş yapmamışsa ana sayfaya yönlendir
    if (!user) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
