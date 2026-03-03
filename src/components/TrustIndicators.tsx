import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TrustIndicatorProps {
  className?: string;
}

const comparisonRows = [
  {
    bad: "İsimsiz eller, sömürü zincirleri",
    good: "Kadından Kadına",
    icon: "👥",
  },
  {
    bad: "92 milyon ton kıyafet çöpe gider",
    good: "Her ürün bir çöpü önler",
    icon: "🌱",
  },
  {
    bad: "Fabrikada doğar, çöpte ölür",
    good: "Gardıroptan çıkar, hayata döner",
    icon: "♻️",
  },
  {
    bad: "Şirket zenginleşir",
    good: "Kazanan sensin",
    icon: "💸",
  },
  {
    bad: "Sezon biter, moda değişir, atılır",
    good: "Stil kalıcıdır, döngü devam eder",
    icon: "✨",
  },
];

export function TrustIndicators({ className }: TrustIndicatorProps) {
  return (
    <div className={cn("w-full py-16 sm:py-24 px-4 relative overflow-hidden", className)}>
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-pink-500/8 dark:bg-pink-500/5 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/8 dark:bg-purple-500/5 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Title — Outfit Bold, No Serif */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14 sm:mb-20"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-tight">
            İki dünya var.{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Seç.
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
            Hızlı moda dünyayı tüketirken, biz kadın kadına döngü yaratıyoruz.
          </motion.p>
        </motion.div>

        {/* Comparison Container */}
        <div className="relative">
          {/* Desktop Layout */}
          <div className="hidden md:block">
            {/* Column Headers */}
            <div className="grid grid-cols-[1fr_56px_1fr] items-center mb-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-red-500/10 dark:bg-red-500/15 border border-red-500/20">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-red-400 dark:text-red-400">
                    Hızlı Moda
                  </span>
                </div>
              </motion.div>
              <div />
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-primary/10 dark:bg-primary/15 border border-primary/20">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    Giyenden
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Rows */}
            <div className="space-y-3">
              {comparisonRows.map((row, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="grid grid-cols-[1fr_56px_1fr] items-stretch group"
                >
                  {/* Bad Side */}
                  <div className="relative p-5 rounded-xl bg-card/60 dark:bg-white/[0.03] border border-border/50 group-hover:border-red-500/20 transition-all duration-400 overflow-hidden">
                    {/* Red tint on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-red-500/[0.04] dark:to-red-500/[0.06] opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-xl pointer-events-none" />
                    <div className="relative flex items-center gap-3">
                      <span className="shrink-0 w-7 h-7 rounded-full bg-red-500/10 dark:bg-red-500/15 flex items-center justify-center text-red-400 text-xs font-bold">✕</span>
                      <p className="text-sm sm:text-[15px] text-muted-foreground line-through decoration-red-400/40 decoration-[1.5px] leading-relaxed">
                        {row.bad}
                      </p>
                    </div>
                  </div>

                  {/* Center Icon */}
                  <div className="flex items-center justify-center relative">
                    <div className="w-px h-full bg-border/40 absolute" />
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 + 0.2, type: "spring", stiffness: 200 }}
                      className="relative z-10 w-10 h-10 rounded-full bg-card dark:bg-gray-900 border border-border/60 flex items-center justify-center shadow-sm group-hover:shadow-primary/20 group-hover:border-primary/30 transition-all duration-400"
                    >
                      <span className="text-base">{row.icon}</span>
                    </motion.div>
                  </div>

                  {/* Good Side */}
                  <div className="relative p-5 rounded-xl bg-card/60 dark:bg-white/[0.03] border border-border/50 group-hover:border-primary/30 transition-all duration-400 overflow-hidden">
                    {/* Pink glow on hover */}
                    <div className="absolute inset-0 bg-gradient-to-l from-primary/0 to-primary/[0.04] dark:to-primary/[0.08] opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-xl pointer-events-none" />
                    {/* Neon line accent */}
                    <div className="absolute right-0 top-2 bottom-2 w-[2px] bg-primary/0 group-hover:bg-primary/40 transition-all duration-500 rounded-full" />
                    <div className="relative flex items-center gap-3">
                      <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">✓</span>
                      <p className="text-sm sm:text-[15px] text-foreground font-bold leading-relaxed group-hover:text-primary transition-colors duration-300">
                        {row.good}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile Layout — Stacked Cards */}
          <div className="md:hidden space-y-3">
            {comparisonRows.map((row, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="rounded-2xl border border-border/50 overflow-hidden bg-card/60 dark:bg-white/[0.03] shadow-sm"
              >
                {/* Bad */}
                <div className="px-4 py-3.5 border-b border-border/30 bg-red-500/[0.03] dark:bg-red-500/[0.05]">
                  <div className="flex items-center gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 text-[10px] font-bold">✕</span>
                    <p className="text-[13px] text-muted-foreground line-through decoration-red-400/30 italic leading-relaxed">
                      {row.bad}
                    </p>
                  </div>
                </div>
                {/* Good */}
                <div className="px-4 py-3.5 bg-primary/[0.02] dark:bg-primary/[0.06]">
                  <div className="flex items-center gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">✓</span>
                    <p className="text-[13px] text-foreground font-bold leading-relaxed">
                      {row.good}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-14 sm:mt-20"
        >
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-register'))}
            className="group relative inline-flex items-center gap-2.5 px-10 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-lg rounded-full shadow-xl shadow-pink-500/20 hover:shadow-pink-500/40 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
          >
            Döngüye Katıl
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <p className="mt-4 text-xs text-muted-foreground/60">
            Sürdürülebilir modanın parçası ol 🌱
          </p>
        </motion.div>
      </div>

      {/* Animated Marquee - Brand Text (Full Width) */}
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
