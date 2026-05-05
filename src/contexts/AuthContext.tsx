import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User, Provider } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type UserRole = "buyer" | "seller" | "admin";

interface AuthContextType {
  user: User | null;
  role: UserRole;
  setRole: (role: UserRole) => Promise<void>;
  signUp: (email: string, pass: string, username: string, role: string) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signInWithOAuth: (provider: Provider) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  needsUsername: boolean;
  setNeedsUsername: (val: boolean) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<UserRole>("buyer");
  const [needsUsername, setNeedsUsername] = useState(false);
  const [loading, setLoading] = useState(!!supabase);

  // Fetch role and username_set from profiles table
  const fetchRole = useCallback(async (userId: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role, username_set")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching role:", error);
        setRoleState("buyer");
      } else {
        if (data?.role) {
          setRoleState(data.role as UserRole);
        }
        // If username_set is false, show username setup modal
        if (data?.username_set === false) {
          setNeedsUsername(true);
        }
      }
    } catch (e) {
      console.error("Exception fetching role:", e);
      setRoleState("buyer");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // Fallback role from metadata if available to prevent flash
        if (currentUser.user_metadata?.role) {
          setRoleState(currentUser.user_metadata.role);
        }
        // Fetch source-of-truth role async (sets loading=false in finally)
        fetchRole(currentUser.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        if (currentUser.user_metadata?.role) {
          setRoleState(currentUser.user_metadata.role);
        }
        // Fetch async (sets loading=false in finally)
        fetchRole(currentUser.id);
      } else {
        setRoleState("buyer");
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchRole]);

  // Update role in Supabase profiles
  const setRole = useCallback(async (newRole: UserRole) => {
    if (!user || !supabase) return;

    // Sadece alıcı veya satıcı rolü verilebilir
    if (newRole !== 'buyer' && newRole !== 'seller') {
      console.error("Yetkisiz rol ataması girişimi.");
      throw new Error("Yalnızca alıcı ve satıcı rolleri seçilebilir.");
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", user.id);

      if (error) throw error;

      setRoleState(newRole);
    } catch (error) {
      console.error("Error updating role:", error);
      throw error;
    }
  }, [user]);

  const signUp = async (email: string, password: string, username: string, signupRole: string) => {
    const { error } = await supabase!.auth.signUp({
      email,
      password,
      options: {
        data: { username, role: signupRole },
        emailRedirectTo: import.meta.env.VITE_SITE_URL || window.location.origin,
      },
    });
    if (error) throw error;
  };

  const signInWithOAuth = async (provider: Provider) => {
    if (!supabase) throw new Error("Supabase bağlantısı kurulamadı.");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${import.meta.env.VITE_SITE_URL || window.location.origin}`,
      },
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase!.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.VITE_SITE_URL || window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase!.auth.signOut();
      if (error) {
        console.error("AuthContext: Supabase signOut error:", error);
      } else {
        console.log("AuthContext: Supabase signOut successful");
      }
      setRoleState("buyer");
      setUser(null); // Explicitly clear user state immediately
    } catch (err) {
      console.error("AuthContext: Unexpected error during signOut:", err);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, setRole, signUp, signIn, signInWithOAuth, signOut, resetPassword, needsUsername, setNeedsUsername, loading }}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground animate-pulse">Yükleniyor...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};