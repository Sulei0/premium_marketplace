import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ROUTE_PATHS } from "@/lib/index";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { AgeGate } from "@/components/AgeGate";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { SellerRoute } from "@/components/SellerRoute";
import MyProducts from "@/pages/dashboard/MyProducts";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Profile from "@/pages/Profile";
import ChatList from "@/pages/ChatList";
import ChatDetail from "@/pages/ChatDetail";
import Favorites from "@/pages/Favorites";
import NotFound from "@/pages/not-found/Index";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/Index";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminReports from "@/pages/admin/AdminReports";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Kvkk from "@/pages/Kvkk";
import Notifications from "@/pages/Notifications";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" expand={false} richColors />
        <ThemeProvider>
          <AuthProvider>
            <NotificationsProvider>
              <FavoritesProvider>
                <AgeGate>
                  <HashRouter>
                    <Routes>
                      <Route path={ROUTE_PATHS.HOME} element={<Home />} />
                      <Route path={ROUTE_PATHS.PRODUCTS} element={<Products />} />
                      <Route path={ROUTE_PATHS.PRODUCT_DETAIL} element={<ProductDetail />} />
                      <Route path={ROUTE_PATHS.PROFILE} element={<Profile />} />

                      {/* Korumalı rotalar */}
                      <Route path={ROUTE_PATHS.CHATS} element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
                      <Route path={ROUTE_PATHS.CHAT_DETAIL} element={<ProtectedRoute><ChatDetail /></ProtectedRoute>} />
                      <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

                      {/* Yasal sayfalar */}

                      <Route path="/terms" element={<Terms />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/kvkk" element={<Kvkk />} />
                      {/* Satıcı rotaları */}
                      <Route path="/dashboard/products" element={<SellerRoute><MyProducts /></SellerRoute>} />

                      {/* Admin paneli */}
                      {/* Admin paneli */}
                      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="reports" element={<AdminReports />} />
                      </Route>

                      {/* 404 */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </HashRouter>
                </AgeGate>
              </FavoritesProvider>
            </NotificationsProvider>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
