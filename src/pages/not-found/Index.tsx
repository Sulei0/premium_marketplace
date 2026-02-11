import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Layout } from "@/components/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function NotFound() {
  usePageMeta("Sayfa Bulunamadı", "Aradığınız sayfa bulunamadı.");

  return (
    <Layout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20">
        {/* Animated 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative mb-8"
        >
          <span className="text-[10rem] md:text-[14rem] font-black tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-b from-primary/40 to-primary/5 select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center backdrop-blur-sm border border-primary/20">
              <Search className="w-10 h-10 text-primary" />
            </div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl font-bold mb-4"
        >
          Aradığınız Gizli Oda Burada Değil...
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground max-w-md mb-10 leading-relaxed"
        >
          Bu adres mevcut değil veya taşınmış olabilir.
          Koleksiyonumuza göz atarak aradığınızı bulabilirsiniz.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link
            to="/"
            className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold rounded-full shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all transform hover:scale-105 active:scale-95"
          >
            <Home className="w-4 h-4" />
            Ana Sayfaya Dön
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-8 py-3.5 bg-card border border-border rounded-full text-sm font-medium hover:border-primary/50 hover:bg-card/80 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri Git
          </button>
        </motion.div>

        {/* Decorative glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
      </div>
    </Layout>
  );
}
