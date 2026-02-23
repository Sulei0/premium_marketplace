import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TrustIndicatorProps {
  className?: string;
}

// --- Custom SVGs for Giyenden Trust Theme ---

// 1. Kalkan + Kalp (Shield with Heart — Women-Only Safe Space)
const ShieldHeartIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Shield */}
    <path d="M12 2L3 6V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V6L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
    {/* Heart inside */}
    <path d="M12 17.5C12 17.5 7 14.5 7 11.5C7 10 8 9 9.5 9C10.5 9 11.5 9.5 12 10.5C12.5 9.5 13.5 9 14.5 9C16 9 17 10 17 11.5C17 14.5 12 17.5 12 17.5Z" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 2. Askı + Yıldız (Hanger with Sparkle — Verified Wardrobes)
const VerifiedHangerIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Hanger hook */}
    <path d="M12 2C12 2 12 4 14 4C15.1 4 16 4.9 16 6C16 7.1 14.5 8 14.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Hanger body */}
    <path d="M2 18L12 10L22 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 18H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Sparkle star */}
    <path d="M19 3L19.5 4.5L21 5L19.5 5.5L19 7L18.5 5.5L17 5L18.5 4.5L19 3Z" fill="currentColor" />
    {/* Small sparkle */}
    <path d="M5 5L5.3 5.9L6 6L5.3 6.1L5 7L4.7 6.1L4 6L4.7 5.9L5 5Z" fill="currentColor" fillOpacity="0.6" />
    {/* Check badge */}
    <circle cx="19" cy="15" r="3" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M17.5 15L18.5 16L20.5 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 3. Sohbet Balonları + Kalp (Chat Bubbles — Fashion Messaging)
const FashionChatIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Main chat bubble */}
    <path d="M21 12C21 16.418 16.97 20 12 20C10.5 20 9.1 19.7 7.8 19.1L3 21L4.3 17.1C3.5 15.7 3 14 3 12C3 7.582 7.03 4 12 4C16.97 4 21 7.582 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
    {/* Heart in bubble */}
    <path d="M12 15C12 15 9 13 9 11.5C9 10.8 9.5 10 10.5 10C11 10 11.5 10.3 12 11C12.5 10.3 13 10 13.5 10C14.5 10 15 10.8 15 11.5C15 13 12 15 12 15Z" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    {/* Style dots */}
    <circle cx="8" cy="12" r="0.8" fill="currentColor" fillOpacity="0.4" />
    <circle cx="16" cy="12" r="0.8" fill="currentColor" fillOpacity="0.4" />
  </svg>
);

const indicators = [
  {
    icon: ShieldHeartIcon,
    title: "Sadece Kadınlara Özel",
    description: "Erkeklerin giremediği, kadınların gardıroplarını özgürce paylaştığı güvenli bir moda alanı. Burada sadece sen ve senin tarzın var.",
  },
  {
    icon: VerifiedHangerIcon,
    title: "Onaylı Gardıroplar",
    description: "Toplulukta öne çıkan satıcılar özel rozetleriyle parlar. Her rozet, güvenilirliğin ve kaliteli gardırobun işareti.",
  },
  {
    icon: FashionChatIcon,
    title: "Moda Sohbetleri",
    description: "Stil ilhamı al, teklif ver, detayları konuş. Kadınlar arası doğrudan mesajlaşmayla alışverişin keyfini çıkar.",
  },
];

export function TrustIndicators({ className }: TrustIndicatorProps) {
  return (
    <div className={cn("w-full py-12 px-4 relative overflow-hidden", className)}>
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#ff0080]/5 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {indicators.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                type: "spring",
                stiffness: 80
              }}
              className="relative group p-8 rounded-3xl bg-black/20 border border-white/5 backdrop-blur-md hover:border-[#ff0080]/30 transition-all duration-500 hover:shadow-[0_0_30px_-5px_elseif(#ff0080,0.15)]"
            >
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#ff0080]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />

              <div className="relative flex flex-col items-center text-center space-y-5">
                {/* Icon Container with Neon Glow */}
                <div className="relative">
                  <div className="absolute inset-0 bg-[#ff0080] blur-xl opacity-20 group-hover:opacity-60 transition-opacity duration-500" />
                  <div className="relative p-4 rounded-full bg-black/40 border border-[#ff0080]/20 text-[#ff0080] shadow-[0_0_15px_-3px_rgba(255,0,128,0.3)] group-hover:shadow-[0_0_25px_-2px_rgba(255,0,128,0.6)] group-hover:scale-110 transition-all duration-500">
                    <item.icon className="w-10 h-10 drop-shadow-[0_0_8px_rgba(255,0,128,0.5)]" />
                  </div>
                </div>

                <h3 className="text-xl font-bold tracking-wide text-foreground group-hover:text-[#ff0080] transition-colors duration-300">
                  {item.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed font-light group-hover:text-white/80 transition-colors duration-300">
                  {item.description}
                </p>
              </div>

              {/* Bottom Neon Accent Line */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[2px] bg-[#ff0080]/20 group-hover:w-1/2 group-hover:bg-[#ff0080] transition-all duration-500" />
            </motion.div>
          ))}
        </div>

        {/* Animated Marquee — Brand Text */}
        <div className="mt-16 relative w-full overflow-hidden">
          <motion.div
            className="flex items-center w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 25,
            }}
          >
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
          </motion.div>

          {/* Gradient Overlay for Fade Out Effect */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

