import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Menu,
  X,
  Bell,
  MessageSquare,
  User,
  ShieldCheck,
  Truck,
  Verified,
  Heart,
  Search,
  ChevronRight,
  Plus,
  LogOut,
  Sun,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ROUTE_PATHS, cn } from "@/lib/index";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { LoginModal } from "@/components/LoginModal";
import { RegistrationModal } from "@/components/RegistrationModal";
import { AddProductModal } from "@/components/AddProductModal";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { useNotifications } from "@/contexts/NotificationsContext";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerRole, setRegisterRole] = useState<'seller' | 'buyer'>('buyer');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Listen for custom events from child components (e.g. Home hero buttons)
  useEffect(() => {
    const handleOpenRegister = (e: Event) => {
      const role = (e as CustomEvent).detail?.role || 'buyer';
      setRegisterRole(role);
      openRegister();
    };
    const handleOpenLogin = () => openLogin();
    window.addEventListener('open-register', handleOpenRegister);
    window.addEventListener('open-login', handleOpenLogin);
    return () => {
      window.removeEventListener('open-register', handleOpenRegister);
      window.removeEventListener('open-login', handleOpenLogin);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleSignOut = () => {
    toast.custom((t) => (
      <div className="bg-background border border-border rounded-xl shadow-2xl p-4 w-full max-w-sm flex flex-col gap-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-500/10 rounded-full text-red-500">
            <LogOut size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">Çıkış Yapılıyor</h3>
            <p className="text-muted-foreground text-sm">
              Hesabınızdan çıkış yapmak istediğinize emin misiniz?
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => toast.dismiss(t)}
            className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
          >
            Vazgeç
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t);
              await signOut();
              navigate("/");
              toast.success("Başarıyla çıkış yapıldı", {
                description: "Tekrar görüşmek üzere!",
              });
            }}
            className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-lg shadow-red-500/20"
          >
            Çıkış Yap
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const openLogin = () => {
    setIsRegisterOpen(false);
    setTimeout(() => setIsLoginOpen(true), 50);
  };

  const openRegister = () => {
    setIsLoginOpen(false);
    setTimeout(() => setIsRegisterOpen(true), 50);
  };

  const scrollToProducts = () => {
    if (location.pathname === "/" || location.pathname === ROUTE_PATHS.HOME) {
      const el = document.getElementById("products-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById("products-section");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 500);
    }
  };

  const navLinks: { name: string; path: string | null; action?: () => void }[] = [
    { name: "Keşfet", path: ROUTE_PATHS.PRODUCTS },
    { name: "En Yeniler", path: null, action: scrollToProducts },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30">
      {/* --- MODALS --- */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={openRegister}
      />
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        initialRole={registerRole}
        onSwitchToLogin={openLogin}
      />
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />

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
            {role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  cn(
                    "text-sm font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1",
                    isActive ? "text-red-600" : ""
                  )
                }
              >
                <ShieldCheck className="w-4 h-4" />
                YÖNETİM
              </NavLink>
            )}
            {navLinks.map((link) =>
              link.action ? (
                <button
                  key={link.name}
                  onClick={link.action}
                  className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground cursor-pointer bg-transparent border-none"
                >
                  {link.name}
                </button>
              ) : (
                <NavLink
                  key={link.name}
                  to={link.path!}
                  className={({ isActive }) =>
                    cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )
                  }
                >
                  {link.name}
                </NavLink>
              )
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
              title={theme === 'dark' ? 'Aydınlık Mod' : 'Karanlık Mod'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>



            {user ? (
              <>
                {/* Sohbetlerim */}
                <Link
                  to={ROUTE_PATHS.CHATS}
                  className="relative text-muted-foreground hover:text-primary transition-colors hidden sm:block"
                  title="Sohbetlerim"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                {/* Bildirimler */}
                <div className="hidden sm:block">
                  <NotificationsPanel />
                </div>

                {/* Favorilerim */}
                <Link
                  to="/favorites"
                  className="relative text-muted-foreground hover:text-pink-500 transition-colors hidden sm:block"
                  title="Favorilerim"
                >
                  <Heart className="w-5 h-5" />
                </Link>

                {/* Ürün Sat Button — Sadece Satıcı */}
                {role === "seller" && (
                  <>
                    <Link
                      to="/dashboard/products"
                      className="relative text-muted-foreground hover:text-foreground transition-colors hidden sm:block font-medium"
                      title="Ürünlerim"
                    >
                      Ürünlerim
                    </Link>
                    <button
                      onClick={() => setIsAddProductOpen(true)}
                      className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-sm font-semibold rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ürün Sat</span>
                    </button>
                  </>
                )}

                {/* Profile Avatar Trigger in Header */}
                <Link
                  to="/profile/me"
                  className="relative group transition-all"
                  title="Profilim"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-border group-hover:border-primary transition-colors bg-muted flex items-center justify-center">
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={`${user.user_metadata.avatar_url}?t=${Date.now()}`} // Force fresh fetch on mount
                        alt="Profil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                    )}
                  </div>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleSignOut}
                  className="relative z-50 cursor-pointer text-muted-foreground hover:text-red-400 transition-colors hidden sm:block"
                  title="Çıkış Yap"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                {/* Login Button */}
                <button
                  onClick={openLogin}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
                >
                  Giriş Yap
                </button>

                {/* Register Button */}
                <button
                  onClick={openRegister}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-full hover:shadow-[0_0_15px_var(--primary)] transition-all"
                >
                  Kayıt Ol
                </button>
              </>
            )}

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
            className="fixed inset-0 z-40 bg-background md:hidden pt-24 px-6 overflow-y-auto"
          >
            <nav className="flex flex-col space-y-6">
              {role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-2xl font-bold border-b border-border pb-4 flex justify-between items-center group text-red-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6" />
                    YÖNETİM PANELİ
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all" />
                </Link>
              )}
              {navLinks.map((link) =>
                link.action ? (
                  <button
                    key={link.name}
                    onClick={() => { setIsMenuOpen(false); link.action!(); }}
                    className="text-2xl font-semibold border-b border-border pb-4 flex justify-between items-center group text-left bg-transparent cursor-pointer w-full"
                  >
                    {link.name}
                    <ChevronRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ) : (
                  <Link
                    key={link.name}
                    to={link.path!}
                    className="text-2xl font-semibold border-b border-border pb-4 flex justify-between items-center group"
                  >
                    {link.name}
                    <ChevronRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                )
              )}

              {/* Mobile Auth Actions */}
              <div className="pt-4 flex flex-col space-y-3">
                {user ? (
                  <>
                    <Link
                      to={ROUTE_PATHS.CHATS}
                      className="flex items-center gap-3 py-3 text-lg text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Sohbetlerim
                    </Link>
                    <Link
                      to="/notifications"
                      className="flex items-center gap-3 py-3 text-lg text-muted-foreground hover:text-foreground transition-colors relative"
                    >
                      <Bell className="w-5 h-5" />
                      Bildirimler
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/favorites"
                      className="flex items-center gap-3 py-3 text-lg text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Heart className="w-5 h-5" />
                      Favorilerim
                    </Link>
                    {role === "seller" && (
                      <button
                        onClick={() => { setIsMenuOpen(false); setIsAddProductOpen(true); }}
                        className="flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-xl transition-all active:scale-95"
                      >
                        <Plus className="w-5 h-5" />
                        Ürün Sat / İlan Ver
                      </button>
                    )}
                    <Link
                      to="/profile/me"
                      className="flex items-center gap-3 py-3 text-lg text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <User className="w-5 h-5" />
                      Profilim
                    </Link>
                    <button
                      onClick={() => { setIsMenuOpen(false); handleSignOut(); }}
                      className="flex items-center gap-3 py-3 text-lg text-red-400 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Çıkış Yap
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setIsMenuOpen(false); openLogin(); }}
                      className="py-4 border border-border rounded-xl text-lg font-semibold hover:bg-muted/50 transition-colors"
                    >
                      Giriş Yap
                    </button>
                    <button
                      onClick={() => { setIsMenuOpen(false); openRegister(); }}
                      className="py-4 bg-primary text-primary-foreground rounded-xl text-lg font-semibold hover:shadow-[0_0_15px_var(--primary)] transition-all"
                    >
                      Kayıt Ol
                    </button>
                  </>
                )}
              </div>

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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
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
                <li><Link to="/terms" className="hover:text-primary">Kullanıcı Sözleşmesi</Link></li>
                <li><Link to="/privacy" className="hover:text-primary">Gizlilik Politikası</Link></li>
                <li><Link to="/kvkk" className="hover:text-primary">KVKK Aydınlatma Metni</Link></li>
              </ul>
            </div>


          </div>

          <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground space-y-4 md:space-y-0">
            <p>© 2026 Giyenden.com. Her hakkı saklıdır. Platformumuz 5651 sayılı kanun uyarınca Yer Sağlayıcı olarak hizmet vermektedir. Kullanıcılar tarafından yüklenen içeriklerden Giyenden sorumlu tutulamaz.</p>
            <div className="flex space-x-6">

              <span>KVKK Uyumlu</span>
              <span>18+ Adult Content Only</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
