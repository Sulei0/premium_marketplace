import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface SellerRouteProps {
    children: React.ReactNode;
}

/**
 * Sadece role === 'seller' olan kullanıcıların erişebildiği rota wrapper'ı.
 * Alıcı rolündeki biri girmeye çalışırsa uyarı verip ana sayfaya atar.
 */
export function SellerRoute({ children }: SellerRouteProps) {
    const { user, role, loading } = useAuth();
    const navigate = useNavigate();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (loading) return;

        if (!user) {
            navigate("/", { replace: true });
            return;
        }

        if (role !== "seller" && role !== "admin") {
            toast({
                title: "Erişim Engellendi",
                description: "Bu sayfayı görüntülemek için Satıcı hesabına geçiş yapmalısınız.",
                variant: "destructive",
            });
            navigate("/", { replace: true });
            return;
        }

        setChecked(true);
    }, [user, role, loading, navigate]);

    if (loading || !checked) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
