import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "giyenden_welcome_seen";

export function AgeGate({ children }: { children: React.ReactNode }) {
  const [isSeen, setIsSeen] = useState<boolean | null>(null);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY) === "true";
    setIsSeen(seen);
  }, []);

  const handleContinue = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsSeen(true);
  };

  useEffect(() => {
    if (isSeen === false) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSeen]);

  return (
    <>
      {children}
      {isSeen === false && (
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
                {/* Icon cluster */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center border border-primary/30">
                    <Heart className="w-8 h-8 text-primary" fill="currentColor" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Hoş Geldin! 💜
                  </h2>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Burası <span className="font-semibold text-primary">sadece kadınlara özel</span> güvenli bir alan. Gardırobundaki hazineleri paylaşabilir, yeni stiller keşfedebilirsin.
                  </p>
                </div>

                {/* Community rules */}
                <div className="w-full space-y-2.5 text-left bg-primary/5 rounded-xl p-4 border border-primary/10">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Kadın dayanışması</span> — Birbirimize saygılı ve destekleyici bir topluluk oluşturuyoruz.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Güvenli alan</span> — Gizliliğin ve güvenliğin her zaman ön planda tutulduğu bir platform.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Heart className="w-4 h-4 text-pink-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Butik deneyim</span> — Premium hissi olan, özenle seçilmiş 2. el parçalar.
                    </p>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={handleContinue}
                  className="w-full h-14 rounded-full text-lg font-semibold bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all"
                >
                  Anladım, Devam Et
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}
