import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "giyenden_age_verified";

export function AgeGate({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const verified = localStorage.getItem(STORAGE_KEY) === "true";
    setIsVerified(verified);
  }, []);

  const handleConfirm = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVerified(true);
  };

  const handleExit = () => {
    window.location.href = "https://www.google.com";
  };

  useEffect(() => {
    if (isVerified === false) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVerified]);

  if (isVerified === null) {
    return null;
  }

  return (
    <>
      {children}
      {!isVerified && (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
      >
        {/* Blur background overlay */}
        <div className="absolute inset-0 backdrop-blur-xl bg-background/70" />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-2xl shadow-2xl shadow-primary/5 p-8 md:p-10"
        >
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Giriş Yapmadan Önce
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Bu platform 18 yaş ve üzeri kullanıcılar içindir. İçerik yetişkinlere
                yönelik ürünler barındırabilir.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
              <Button
                size="lg"
                onClick={handleConfirm}
                className="h-14 px-8 rounded-full text-lg font-semibold flex-1"
              >
                18 Yaşından Büyüğüm
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleExit}
                className="h-14 px-8 rounded-full text-lg border-primary/30 hover:bg-primary/10"
              >
                Çıkış
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
      )}
    </>
  );
}
