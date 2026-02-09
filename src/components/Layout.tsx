import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { 
  Menu, 
  X, 
  MessageSquare, 
  User, 
  ShieldCheck, 
  Truck, 
  Verified, 
  Heart,
  Search,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ROUTE_PATHS, cn } from "@/lib/index";
import { useCart } from "@/hooks/useCart";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const whisperCount = useCart((state) => state.getTotalItems());

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: "Keşfet", path: ROUTE_PATHS.PRODUCTS },
    { name: "En Yeniler", path: ROUTE_PATHS.PRODUCTS },
    { name: "Koleksiyonlar", path: ROUTE_PATHS.PRODUCTS },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30">
      {/* --- HEADER --- */}
      <header
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300 border-b",
          isScrolled 
            ? "bg-background/90 backdrop-blur-md border-border h-16"
            : "bg-transparent border-transparent h-20"
        )}
      >
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <Link 
            to={ROUTE_PATHS.HOME} 
            className="text-2xl font-bold tracking-tighter text-foreground group"
          >
            GIYEN<span className="text-primary group-hover:drop-shadow-[0_0_8px_var(--primary)] transition-all">DEN</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-5">
            <button className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              <Search className="w-5 h-5" />
            </button>
            
            <Link 
              to={ROUTE_PATHS.PRODUCTS} 
              className="relative text-muted-foreground hover:text-primary transition-colors"
              title="Fısıltılarım"
            >
              <MessageSquare className="w-5 h-5" />
              {whisperCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-[0_0_10px_var(--primary)]">
                  {whisperCount}
                </span>
              )}
            </Link>

            <Link 
              to="/profile/guest" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ stiffness: 300, damping: 35 }}
            className="fixed inset-0 z-40 bg-background md:hidden pt-24 px-6"
          >
            <nav className="flex flex-col space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-2xl font-semibold border-b border-border pb-4 flex justify-between items-center group"
                >
                  {link.name}
                  <ChevronRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                </Link>
              ))}
              <div className="pt-8 flex flex-col space-y-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Hızlı Erişim</p>
                <Link to="/support" className="text-muted-foreground">Yardım Merkezi</Link>
                <Link to="/safety" className="text-muted-foreground">Güvenlik İpuçları</Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow pt-20">
        {children}
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-card border-t border-border mt-20">
        {/* Trust Indicators Section */}
        <div className="border-b border-border py-12">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center space-y-3 group">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_var(--primary)]">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="font-semibold">Gizli Gönderim</h3>
              <p className="text-sm text-muted-foreground px-4">
                Paket içeriği dışarıdan belli olmaz, gizliliğiniz bizim için kutsaldır.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-3 group">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_var(--primary)]">
                <Verified className="w-7 h-7" />
              </div>
              <h3 className="font-semibold">Doğrulanmış Profiller</h3>
              <p className="text-sm text-muted-foreground px-4">
                Tüm satıcılar kimlik ve biyometrik doğrulama sürecinden geçer.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-3 group">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_var(--primary)]">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="font-semibold">Güvenli Bölge</h3>
              <p className="text-sm text-muted-foreground px-4">
                Ödemeniz, ürünü onaylayana kadar havuz hesabımızda güvende tutulur.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Links & Info */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div className="col-span-2 md:col-span-1">
              <Link to={ROUTE_PATHS.HOME} className="text-2xl font-bold tracking-tighter">
                GIYEN<span className="text-primary">DEN</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Türkiye'nin ilk premium ve gizli odaklı C2C pazar yeri. 
                Kişisel eşyalarınızın hikayesini, en güvenli şekilde paylaşın.
              </p>
              <div className="flex space-x-4 mt-6">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                  <Heart className="w-4 h-4 text-primary" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">Keşfet</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link to={ROUTE_PATHS.PRODUCTS} className="hover:text-primary">Çoraplar</Link></li>
                <li><Link to={ROUTE_PATHS.PRODUCTS} className="hover:text-primary">İç Giyim</Link></li>
                <li><Link to={ROUTE_PATHS.PRODUCTS} className="hover:text-primary">Aksesuarlar</Link></li>
                <li><Link to={ROUTE_PATHS.PRODUCTS} className="hover:text-primary">Popüler Satıcılar</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">Kurumsal</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Hakkımızda</a></li>
                <li><a href="#" className="hover:text-primary">Gizlilik Politikası</a></li>
                <li><a href="#" className="hover:text-primary">Kullanım Koşulları</a></li>
                <li><a href="#" className="hover:text-primary">Satış Sözleşmesi</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">Destek</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Yardım Merkezi</a></li>
                <li><a href="#" className="hover:text-primary">Güvenlik Rehberi</a></li>
                <li><a href="#" className="hover:text-primary">Bize Ulaşın</a></li>
                <li><a href="#" className="hover:text-primary">SSS</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground space-y-4 md:space-y-0">
            <p>© 2026 Giyenden / KirliSepeti. Tüm hakları saklıdır.</p>
            <div className="flex space-x-6">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-primary" />
                <span>SSL Secure Payment</span>
              </span>
              <span>KVKK Uyumlu</span>
              <span>18+ Adult Content Only</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
