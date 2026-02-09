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

export function RegistrationModal({
  open,
  onOpenChange,
  role,
}: RegistrationModalProps) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { email, username, password, role };
    console.log("Kayıt bilgileri:", data);
    setEmail("");
    setUsername("");
    setPassword("");
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setEmail("");
      setUsername("");
      setPassword("");
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-primary/20 bg-card/60 backdrop-blur-2xl sm:max-w-[420px] p-0 overflow-hidden rounded-2xl">
        <div className="relative">
          {/* Glassmorphism inner glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none rounded-lg" />
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-xl font-bold text-foreground">
              {ROLE_TITLES[role]}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
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
                minLength={6}
                className="bg-background/80 border-border/80 focus-visible:ring-primary"
              />
            </div>
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="pt-2"
            >
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 rounded-full font-semibold"
              >
                Kayıt Ol
              </Button>
            </motion.div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
