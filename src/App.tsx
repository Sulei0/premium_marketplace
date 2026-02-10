import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ROUTE_PATHS } from "@/lib/index";
import { AuthProvider } from "@/contexts/AuthContext";
import { AgeGate } from "@/components/AgeGate";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Profile from "@/pages/Profile";
import ChatList from "@/pages/ChatList";
import ChatDetail from "@/pages/ChatDetail";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

/**
 * Root application component for Giyenden marketplace.
 * Sets up the routing, global state providers, and UI notifications.
 * Focuses on the 'Digital Boudoir' dark luxury aesthetic.
 */
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" expand={false} richColors />
        <AuthProvider>
          <AgeGate>
            <HashRouter>
              <Routes>
                {/* Ana Sayfa: Vitrin ve Hero Bölümü */}
                <Route path={ROUTE_PATHS.HOME} element={<Home />} />

                {/* Ürünler: Filtreleme ve Liste Sayfası */}
                <Route path={ROUTE_PATHS.PRODUCTS} element={<Products />} />

                {/* Ürün Detay: Fetiş odaklı özel seçim araçları ve satıcı hikayesi */}
                <Route path={ROUTE_PATHS.PRODUCT_DETAIL} element={<ProductDetail />} />

                {/* Profil: Satıcı bilgileri, doğrulanmış durum ve ürünleri */}
                <Route path={ROUTE_PATHS.PROFILE} element={<Profile />} />

                {/* Sohbet: Mesajlaşma ve Teklifler */}
                <Route path={ROUTE_PATHS.CHATS} element={<ChatList />} />
                <Route path={ROUTE_PATHS.CHAT_DETAIL} element={<ChatDetail />} />

                {/* 404 - Sayfa Bulunamadı: Gizemli ve estetik bir hata sayfası */}
                <Route
                  path="*"
                  element={
                    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
                      <h1 className="text-6xl font-bold text-primary mb-4 drop-shadow-[0_0_15px_rgba(255,46,126,0.5)]">
                        404
                      </h1>
                      <p className="text-xl text-muted-foreground mb-8">
                        Aradığınız gizli oda burada değil...
                      </p>
                      <a
                        href="#/"
                        className="px-8 py-3 bg-primary text-primary-foreground rounded-full hover:scale-105 transition-transform duration-300 font-medium"
                      >
                        Girişe Dön
                      </a>
                    </div>
                  }
                />
              </Routes>
            </HashRouter>
          </AgeGate>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
