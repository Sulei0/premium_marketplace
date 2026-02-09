import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export type RegistrationRole = "seller" | "buyer";

interface RegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: RegistrationRole;
}

const ROLE_TITLES: Record<RegistrationRole, string> = {
  seller: "Satıcı Olarak Aramıza Katıl",
  buyer: "Alışverişe Başla",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm(email: string, username: string, password: string): string | null {
  if (!email.trim()) return "E-posta adresi gerekli.";
  if (!EMAIL_REGEX.test(email)) return "Geçerli bir e-posta adresi girin.";
  if (!username.trim()) return "Kullanıcı adı gerekli.";
  if (username.trim().length < 2) return "Kullanıcı adı en az 2 karakter olmalı.";
  if (password.length < 6) return "Şifre en az 6 karakter olmalı.";
  return null;
}

function getErrorMessage(error: { message?: string; status?: number }): string {
  const msg = (error?.message ?? "").toLowerCase();
  if (msg.includes("already registered") || msg.includes("user already exists"))
    return "Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.";
  if (msg.includes("password") || msg.includes("weak"))
    return "Şifre çok zayıf. En az 6 karakter kullanın.";
  if (msg.includes("email"))
    return "Geçersiz e-posta adresi.";
  if (msg.includes("username") || msg.includes("unique"))
    return "Bu kullanıcı adı zaten kullanılıyor.";
  return error?.message ?? "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.";
}

export function RegistrationModal({
  open,
  onOpenChange,
  role,
}: RegistrationModalProps) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm(email, username, password);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setIsLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { username: username.trim(), role },
      },
    });

    setIsLoading(false);

    if (signUpError) {
      const message = getErrorMessage(signUpError);
      setError(message);
      toast.error(message);
      return;
    }

    setEmail("");
    setUsername("");
    setPassword("");
    setError("");
    onOpenChange(false);
    toast.success("Kayıt başarılı! Hoş geldiniz.");
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setEmail("");
      setUsername("");
      setPassword("");
      setError("");
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-primary/20 bg-card/60 backdrop-blur-2xl sm:max-w-[420px] p-0 overflow-hidden rounded-2xl">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none rounded-lg" />
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-xl font-bold text-foreground">
              {ROLE_TITLES[role]}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="reg-email" className="text-foreground">
                E-posta Adresi
              </Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-background/80 border-border/80 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-username" className="text-foreground">
                Kullanıcı Adı
              </Label>
              <Input
                id="reg-username"
                type="text"
                placeholder="kullanici_adi"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                minLength={2}
                className="bg-background/80 border-border/80 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password" className="text-foreground">
                Şifre
              </Label>
              <Input
                id="reg-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
                className="bg-background/80 border-border/80 focus-visible:ring-primary"
              />
            </div>
            <motion.div
              whileHover={!isLoading ? { scale: 1.01 } : undefined}
              whileTap={!isLoading ? { scale: 0.99 } : undefined}
              className="pt-2"
            >
              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="w-full h-12 rounded-full font-semibold"
              >
                {isLoading ? "Kaydediliyor..." : "Kayıt Ol"}
              </Button>
            </motion.div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
