import { ShieldCheck, Truck, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TrustIndicatorProps {
  className?: string;
}

const indicators = [
  {
    icon: Truck,
    title: "Gizli Gönderim",
    description: "Paket içeriği asla belli olmaz, isimsiz ve gizli kutularda teslim edilir.",
  },
  {
    icon: UserCheck,
    title: "Doğrulanmış Profiller",
    description: "Tüm satıcılarımız kimlik doğrulaması aşamasından geçmiş, %100 gerçek kişilerdir.",
  },
  {
    icon: ShieldCheck,
    title: "Güvenli Bölge",
    description: "Ödemeleriniz ve kişisel verileriniz uçtan uca şifrelenmiş altyapımızda korunur.",
  },
];

export function TrustIndicators({ className }: TrustIndicatorProps) {
  return (
    <div className={cn("w-full py-12 px-4", className)}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {indicators.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1, 
                type: "spring", 
                stiffness: 100 
              }}
              className="relative group p-6 rounded-2xl bg-card/40 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-colors"
            >
              {/* Accent Glow Background */}
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
              
              <div className="relative flex flex-col items-center text-center space-y-4">
                <div className="p-3 rounded-full bg-primary/10 text-primary shadow-[0_0_15px_-3px_rgba(var(--primary),0.3)] group-hover:shadow-[0_0_20px_-2px_rgba(var(--primary),0.5)] transition-all">
                  <item.icon className="w-8 h-8" />
                </div>
                
                <h3 className="text-lg font-semibold tracking-wide text-foreground">
                  {item.title}
                </h3>
                
                <p className="text-sm text-muted-foreground leading-relaxed font-light">
                  {item.description}
                </p>
              </div>

              {/* Bottom Neon Accent Line */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary group-hover:w-1/3 transition-all duration-300" />
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 flex justify-center"
        >
          <div className="flex items-center space-x-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-[10px] uppercase tracking-widest font-mono text-primary font-bold">
              Digital Boudoir Certified
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
