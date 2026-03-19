import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ROUTE_PATHS } from "@/lib/index";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { FollowProvider } from "@/contexts/FollowContext";
import { BlockProvider } from "@/contexts/BlockContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { SellerRoute } from "@/components/SellerRoute";
import { SEOCanonical } from "@/components/SEOCanonical";
import { CookieConsent } from "@/components/CookieConsent";
import { UsernameSetupModal } from "@/components/UsernameSetupModal";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

// ─── Lazy-loaded pages (code splitting) ───
const Home = lazy(() => import("@/pages/Home"));
const Products = lazy(() => import("@/pages/Products"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Profile = lazy(() => import("@/pages/Profile"));
const ChatList = lazy(() => import("@/pages/ChatList"));
const ChatDetail = lazy(() => import("@/pages/ChatDetail"));
const Favorites = lazy(() => import("@/pages/Favorites"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const NotFound = lazy(() => import("@/pages/not-found/Index"));
const Terms = lazy(() => import("@/pages/Terms"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Kvkk = lazy(() => import("@/pages/Kvkk"));
const About = lazy(() => import("@/pages/About"));
const DistanceSalesAgreement = lazy(() => import("@/pages/DistanceSalesAgreement"));
const CancellationReturn = lazy(() => import("@/pages/CancellationReturn"));
const BlogList = lazy(() => import("@/pages/BlogList"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const MyProducts = lazy(() => import("@/pages/dashboard/MyProducts"));
const AdminLayout = lazy(() => import("@/components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("@/pages/admin/Index"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminProducts = lazy(() => import("@/pages/admin/AdminProducts"));
const AdminReports = lazy(() => import("@/pages/admin/AdminReports"));
const AdminBlog = lazy(() => import("@/pages/admin/AdminBlog"));
const AdminBlogEditor = lazy(() => import("@/pages/admin/AdminBlogEditor"));

/** Minimal full-screen spinner shown while a lazy chunk loads */
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 dk — taze sayılır
      gcTime: 10 * 60 * 1000,           // 10 dk — cache bellekte tutulur
      refetchOnWindowFocus: false,       // Sekme değişiminde refetch kapalı
      retry: 1,
    },
  },
});

// Wrapper to access AuthContext for the username setup modal
const UsernameSetupGate = ({ children }: { children: React.ReactNode }) => {
  const { needsUsername, setNeedsUsername } = useAuth();
  return (
    <>
      <UsernameSetupModal
        isOpen={needsUsername}
        onComplete={() => setNeedsUsername(false)}
      />
      {children}
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" expand={false} richColors />
        <ThemeProvider>
          <AuthProvider>
            <UsernameSetupGate>
              <NotificationsProvider>
                <FollowProvider>
                  <BlockProvider>
                    <FavoritesProvider>
                    <>
                      <BrowserRouter>
                        <SEOCanonical />
                        <CookieConsent />
                        <Suspense fallback={<PageLoader />}>
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
                            <Route path="/mesafeli-satis-sozlesmesi" element={<DistanceSalesAgreement />} />
                            <Route path="/iptal-iade" element={<CancellationReturn />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/kose" element={<BlogList />} />
                            <Route path="/kose/:slug" element={<BlogPost />} />
                            {/* Satıcı rotaları */}
                            <Route path="/dashboard/products" element={<SellerRoute><MyProducts /></SellerRoute>} />

                            {/* Admin paneli */}
                            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                              <Route index element={<AdminDashboard />} />
                              <Route path="users" element={<AdminUsers />} />
                              <Route path="products" element={<AdminProducts />} />
                              <Route path="reports" element={<AdminReports />} />
                              <Route path="blog" element={<AdminBlog />} />
                              <Route path="blog/new" element={<AdminBlogEditor />} />
                              <Route path="blog/edit/:id" element={<AdminBlogEditor />} />
                            </Route>

                            {/* 404 */}
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </Suspense>
                      </BrowserRouter>
                    </>
                    </FavoritesProvider>
                  </BlockProvider>
                </FollowProvider>
              </NotificationsProvider>
            </UsernameSetupGate>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
