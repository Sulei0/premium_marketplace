import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Loader2, Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTE_PATHS } from "@/lib/index";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(true);

  // Listen for the PASSWORD_RECOVERY event from Supabase
  useEffect(() => {
    if (!supabase) {
      setSessionChecking(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
        setSessionChecking(false);
      }
    });

    // Also check if user already has an active session (e.g. recovery token was already processed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      }
      setSessionChecking(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase!.auth.updateUser({
        password,
      });

      if (updateError) {
        if (updateError.message.includes("same_password")) {
          setError("Yeni şifreniz eski şifrenizle aynı olamaz.");
        } else {
          throw updateError;
        }
      } else {
        setSuccess(true);
        // Redirect to profile after 3 seconds
        setTimeout(() => {
          navigate(ROUTE_PATHS.HOME);
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || "Şifre güncellenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Loading state while checking for recovery session
  if (sessionChecking) {
    return (
      <Layout>
        <SEO title="Şifre Sıfırlama | Giyenden" description="Şifrenizi sıfırlayın" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title="Şifre Sıfırlama | Giyenden" description="Şifrenizi sıfırlayın" />
      <div className="flex items-center justify-center min-h-[60vh] px-4 py-12">
        <div className="w-full max-w-md">

          {/* Success State */}
          {success ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold">Şifreniz Güncellendi!</h1>
              <p className="text-muted-foreground text-sm">
                Şifreniz başarıyla değiştirildi. Yönlendiriliyorsunuz...
              </p>
              <div className="flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            </div>
          ) : !sessionReady ? (
            /* No Recovery Session */
            <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold">Geçersiz veya Süresi Dolmuş Bağlantı</h1>
              <p className="text-muted-foreground text-sm">
                Bu şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş olabilir.
                Lütfen tekrar şifre sıfırlama talebinde bulunun.
              </p>
              <Button
                onClick={() => navigate(ROUTE_PATHS.HOME)}
                className="mt-4 rounded-xl"
              >
                Ana Sayfaya Dön
              </Button>
            </div>
          ) : (
            /* Password Reset Form */
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center space-y-2">
                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Lock className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">Yeni Şifre Belirle</h1>
                <p className="text-muted-foreground text-sm">
                  Hesabınız için güçlü bir şifre oluşturun.
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 text-sm text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground ml-1">
                    Yeni Şifre
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-background/50 border border-border rounded-xl p-3 pr-12 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                      placeholder="En az 6 karakter"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground ml-1">
                    Şifre Tekrar
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-background/50 border border-border rounded-xl p-3 pr-12 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                      placeholder="Şifrenizi tekrar girin"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Match indicator */}
                  {confirmPassword.length > 0 && (
                    <p className={`text-xs ml-1 mt-1 ${password === confirmPassword ? 'text-green-500' : 'text-red-400'}`}>
                      {password === confirmPassword ? '✓ Şifreler eşleşiyor' : '✗ Şifreler eşleşmiyor'}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading || password.length < 6 || password !== confirmPassword}
                  className="w-full h-12 rounded-xl text-sm font-bold bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Güncelleniyor...
                    </span>
                  ) : (
                    'Şifreyi Güncelle'
                  )}
                </Button>
              </form>

              <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest">
                🔒 Verileriniz güvenle şifrelenmektedir
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
