import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface AdminRouteProps {
    children: React.ReactNode;
}

/**
 * Sadece is_admin === true olan kullanıcıların erişebildiği rota wrapper'ı.
 * Admin değilse ana sayfaya yönlendirir.
 */
export function AdminRoute({ children }: AdminRouteProps) {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            navigate("/", { replace: true });
            return;
        }

        async function checkAdmin() {
            if (!supabase || !user) return;

            const { data } = await supabase
                .from("profiles")
                .select("is_admin")
                .eq("id", user.id)
                .single();

            if (data?.is_admin) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
                navigate("/", { replace: true });
            }
        }

        checkAdmin();
    }, [user, authLoading, navigate]);

    if (authLoading || isAdmin === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAdmin) return null;

    return <>{children}</>;
}
