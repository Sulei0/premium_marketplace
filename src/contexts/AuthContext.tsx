import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type UserRole = "buyer" | "seller" | "admin";

interface AuthContextType {
  user: User | null;
  role: UserRole;
  setRole: (role: UserRole) => Promise<void>;
  signUp: (email: string, pass: string, username: string, role: string) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<UserRole>("buyer");
  const [loading, setLoading] = useState(!!supabase);

  // Fetch role from profiles table
  const fetchRole = useCallback(async (userId: string) => {
    if (!supabase) return;
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (data?.role) {
      setRoleState(data.role as UserRole);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchRole(currentUser.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchRole(currentUser.id);
      } else {
        setRoleState("buyer");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchRole]);

  // Update role in Supabase profiles - REMOVED FOR SECURITY
  // Roles should only be updated via Admin panel or secure backend functions
  const setRole = useCallback(async (newRole: UserRole) => {
    console.warn("Manual role update from client is disabled for security.");
    // In a real app, you would call an Edge Function here
    // For now, we rely on the initial signup role and Admin changes
  }, []);

  const signUp = async (email: string, password: string, username: string, signupRole: string) => {
    if (!supabase)
      throw new Error("Supabase yapılandırılmamış. Lütfen .env dosyanızı kontrol edin.");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, role: signupRole },
        emailRedirectTo: import.meta.env.VITE_SITE_URL || window.location.origin,
      },
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase)
      throw new Error("Supabase yapılandırılmamış. Lütfen .env dosyanızı kontrol edin.");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setRoleState("buyer");
  };

  return (
    <AuthContext.Provider value={{ user, role, setRole, signUp, signIn, signOut, loading }}>
      {!loading && children}
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