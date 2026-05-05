import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { ShoppingBag, CheckCircle2, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TrustIndicatorProps {
  className?: string;
}

/* ───────────────────────────────────────────────
   Count-Up Hook
   Sayıyı 0'dan hedefe smooth tırmandırır.
   - `isVisible` true olunca animasyon BAŞLAR
   - Sadece bir kez çalışır (hasAnimated ref)
   ─────────────────────────────────────────────── */
function useCountUp(target: number, duration: number, isVisible: boolean): number {
  const [value, setValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Hedef 0 ise veya zaten animasyon yapıldıysa → atla
    if (!isVisible || target === 0 || hasAnimated.current) return;

    hasAnimated.current = true;

    let startTime: number | null = null;
    let rafId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // EaseOutExpo — hızlı başla, yavaş bitir
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setValue(target); // Tam değeri göster
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafId);
  }, [isVisible, target, duration]);

  return value;
}

/* ───────────────────────────────────────────────
   Rakamları binlik ayraçla formatla (1247 → 1.247)
   ─────────────────────────────────────────────── */
function formatNumber(num: number): string {
  return num.toLocaleString("tr-TR");
}

/* ───────────────────────────────────────────────
   Ana Bileşen
   ─────────────────────────────────────────────── */
export function TrustIndicators({ className }: TrustIndicatorProps) {
  const [stats, setStats] = useState({ activeListings: 0, completedSales: 0, members: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasFetched = useRef(false); // Sonsuz loop koruması

  /* Supabase'den istatistikleri çek — TEK SEFER */
  const fetchStats = useCallback(async () => {
    if (!supabase || hasFetched.current) return;
    hasFetched.current = true;

    try {
      const [activeRes, soldRes, membersRes] = await Promise.all([
        supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true)
          .eq("is_approved", true)
          .eq("is_sold", false),
        supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("is_sold", true),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true }),
      ]);

      setStats({
        activeListings: activeRes.count ?? 0,
        completedSales: soldRes.count ?? 0,
        members: membersRes.count ?? 0,
      });
    } catch {
      // Hata olursa sessizce geç, sayılar 0 kalır
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  /* IntersectionObserver — bölüm ekrana girince animasyonu tetikle */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Bir kez tetikle, sonra bırak
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const activeCount = useCountUp(stats.activeListings, 2000, isVisible);
  const salesCount = useCountUp(stats.completedSales, 2200, isVisible);
  const membersCount = useCountUp(stats.members, 2400, isVisible);

  const statCards = [
    {
      label: "Aktif İlan",
      value: activeCount,
      icon: ShoppingBag,
      color: "from-pink-500 to-rose-500",
      glow: "bg-pink-500/20",
      iconBg: "bg-pink-500/10",
      iconColor: "text-pink-500",
      description: "Şu anda vitrine açık",
    },
    {
      label: "Tamamlanan Satış",
      value: salesCount,
      icon: CheckCircle2,
      color: "from-emerald-500 to-teal-500",
      glow: "bg-emerald-500/20",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      description: "Kadın kadına el değiştirdi",
    },
    {
      label: "Topluluk Üyesi",
      value: membersCount,
      icon: Users,
      color: "from-violet-500 to-purple-500",
      glow: "bg-violet-500/20",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-500",
      description: "Giyenden ailesinde",
    },
  ];

  return (
    <div ref={sectionRef} className={cn("w-full py-12 sm:py-24 px-3 sm:px-4 relative overflow-hidden", className)}>
      {/* Background Glow Effects — GPU-optimized, mobilde küçültüldü */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[800px] h-[200px] sm:h-[400px] bg-primary/5 blur-[100px] sm:blur-[150px] pointer-events-none rounded-full will-change-transform" />
      <div className="hidden sm:block absolute top-0 right-1/4 w-[300px] h-[300px] bg-purple-500/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="hidden sm:block absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-pink-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Canlı Veriler
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-tight">
            Topluluk{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Büyüyor.
              </span>
              <motion.span
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              />
            </span>
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-5 text-muted-foreground text-base sm:text-lg max-w-lg mx-auto"
          >
            Her gelen üye, her yeni ilan, her satış — döngünün parçası.
          </motion.p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="group relative"
              >
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/50 bg-card/60 dark:bg-white/[0.03] p-3 sm:p-8 text-center transition-all duration-500 hover:border-primary/30 sm:hover:shadow-lg sm:hover:shadow-primary/5">
                  {/* Hover glow — yalnızca desktop, mobilde performans için devre dışı */}
                  <div className={`hidden sm:block absolute inset-0 ${card.glow} opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-700 pointer-events-none`} />

                  {/* Top gradient line */}
                  <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${card.color} opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500`} />

                  {/* Icon */}
                  <div className={`w-9 h-9 sm:w-14 sm:h-14 mx-auto mb-2 sm:mb-5 rounded-xl sm:rounded-2xl ${card.iconBg} flex items-center justify-center transition-transform duration-500 sm:group-hover:scale-110`}>
                    <Icon className={`w-4 h-4 sm:w-7 sm:h-7 ${card.iconColor}`} />
                  </div>

                  {/* Number */}
                  <div className="relative">
                    <span
                      className={`text-2xl sm:text-6xl font-black tracking-tighter bg-gradient-to-b ${card.color} bg-clip-text text-transparent tabular-nums`}
                    >
                      {formatNumber(card.value)}
                    </span>
                  </div>

                  {/* Label */}
                  <p className="mt-1 sm:mt-3 text-[10px] sm:text-base font-bold text-foreground/90 tracking-tight">
                    {card.label}
                  </p>

                  {/* Subtitle — mobilde gizle, alan kazandır */}
                  <p className="hidden sm:block mt-1 text-xs text-muted-foreground/70">
                    {card.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Animated Marquee — Mevcut Giyenden şeridi KORUNUYOR */}
      <div className="mt-16 relative w-[100vw] left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] overflow-hidden">
        <div className="flex items-center w-max animate-marquee">
          {[...Array(16)].map((_, i) => (
            <span key={i} className="flex items-center shrink-0">
              <span
                className="text-3xl md:text-4xl font-black italic text-[#ff0080]/30 hover:text-[#ff0080]/70 transition-colors duration-500 select-none px-6 whitespace-nowrap"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Giyenden
              </span>
              <span className="text-[#ff0080]/20 text-lg mx-2">✦</span>
            </span>
          ))}
        </div>

        {/* Gradient Overlay for Fade Out Effect */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
