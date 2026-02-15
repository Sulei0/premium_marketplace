import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TrustIndicatorProps {
  className?: string;
}

// --- Custom SVGs for "Digital Boudoir" Theme ---

// 1. Yelpaze Arkasına Saklanan Yüz (Face Hiding Behind Fan)
const FanFaceIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Eyes peeking */}
    <path d="M7 9C7 9 8 7.5 10 7.5C12 7.5 13 9 13 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 9C16 9 17 7.5 19 7.5C21 7.5 22 9 22 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="10" cy="9.5" r="1" fill="currentColor" />
    <circle cx="19" cy="9.5" r="1" fill="currentColor" />
    {/* Fan covering lower face */}
    <path d="M12 22L4 14C4 14 6 11 12 11C18 11 20 14 20 14L12 22Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 22L9 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 22L12 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 22L15 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 2. Taç (Crown / Queen Vibe)
const CrownIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M2 4L5 20H19L22 4L15 9L12 4L9 9L2 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="15" r="2" fill="currentColor" fillOpacity="0.3" />
    <circle cx="12" cy="4" r="1" fill="currentColor" />
    <circle cx="2" cy="4" r="1" fill="currentColor" />
    <circle cx="22" cy="4" r="1" fill="currentColor" />
  </svg>
);

// 3. Kulağa Fısıldayan Dudaklar (Whispering Lips)
const WhisperIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Ear */}
    <path d="M16 4C18.5 4 21 6 21 10C21 15 18 19 16 19C15 19 14.5 18 14 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 7C16 7 17 8 17 10C17 12 15.5 13 15.5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

    {/* Lips / Mouth */}
    <path d="M2 13C2 13 4 11 7 11C10 11 12 13 12 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M2 13C2 13 4 16 7 16C10 16 12 13 12 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

    {/* Sound/Whisper waves */}
    <path d="M13 10L14 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M13 16L14 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);


const indicators = [
  {
    icon: FanFaceIcon,
    title: "Tam Anonimlik",
    description: "Gerçek kimliğinizi paylaşmak zorunda değilsiniz. Takma isimlerinizle gizli ve özgür bir deneyimin tadını çıkarın.",
  },
  {
    icon: CrownIcon,
    title: "Rozet Sistemi",
    description: "Güvenilir üyeler, admin onaylı özel rozetlerle profillerini öne çıkarır ve topluluk içindeki saygınlığını artırır.",
  },
  {
    icon: WhisperIcon,
    title: "Doğrudan İletişim",
    description: "Alıcı ve satıcı arasındaki tüm süreçler tamamen kişiye özeldir. Mesajlaşma sistemimizle tüm detayları doğrudan kararlaştırın.",
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

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 flex justify-center"
        >
          <div className="flex items-center space-x-3 px-5 py-2 rounded-full border border-[#ff0080]/20 bg-[#ff0080]/5 backdrop-blur-sm shadow-[0_0_20px_-5px_rgba(255,0,128,0.2)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff0080] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ff0080] shadow-[0_0_10px_#ff0080]"></span>
            </span>
            <span className="text-[11px] uppercase tracking-[0.2em] font-mono text-[#ff0080] font-bold text-shadow-sm">
              Digital Boudoir Certified
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

