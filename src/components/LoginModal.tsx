import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
  const { signIn, signInWithOAuth, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Forgot password state
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    setOauthLoading(provider);
    setError(null);
    try {
      await signInWithOAuth(provider);
      // Redirect happens automatically via Supabase
    } catch (err: any) {
      setError(err.message || "Sosyal giriş sırasında bir hata oluştu.");
      setOauthLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let loginEmail = email.trim();

      // If the input doesn't contain an '@', treat it as a username
      if (!loginEmail.includes('@')) {
        const { data, error: rpcError } = await supabase.rpc('get_email_by_username', {
          p_username: loginEmail
        });

        if (rpcError) throw rpcError;

        if (!data) {
          throw new Error("Kullanıcı adı veya şifre hatalı."); // Generic message for security
        }

        loginEmail = data;
      }

      await signIn(loginEmail, password);
      onClose();
      navigate('/profile/me');
    } catch (err: any) {
      if (err.message.includes("Invalid login") || err.message.includes("Kullanıcı adı veya şifre hatalı")) {
        setError("E-posta, kullanıcı adı veya şifre hatalı.");
      } else if (err.message.includes("Email not confirmed")) {
        setError("Lütfen önce e-postana gelen linki onayla! 📧");
      } else if (err.message.includes("Supabase")) {
        setError("Supabase bağlantısı kurulamadı. Lütfen .env dosyanızı kontrol edin.");
      } else {
        setError("Giriş hatası: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResetSuccess(false);

    try {
      let resetEmail = email.trim();

      if (!resetEmail.includes('@')) {
        const { data, error: rpcError } = await supabase.rpc('get_email_by_username', {
          p_username: resetEmail
        });

        if (rpcError) throw rpcError;

        if (!data) {
          throw new Error("Kullanıcı adı bulunamadı.");
        }

        resetEmail = data;
      }

      await resetPassword(resetEmail);
      setResetSuccess(true);
    } catch (err: any) {
      if (err.message.includes("Kullanıcı adı bulunamadı")) {
        setError("Kullanıcı adı bulunamadı.");
      } else {
        setError("E-posta adresi bulunamadı veya bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  const switchToForgot = () => {
    setForgotMode(true);
    setError(null);
    setResetSuccess(false);
  };

  const switchToLogin = () => {
    setForgotMode(false);
    setError(null);
    setResetSuccess(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl p-5 sm:p-7 shadow-2xl my-auto">
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>

        {/* ─── Header ─── */}
        <div className="text-center mb-4">
          {forgotMode ? (
            <>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Şifreni mi Unuttun?</h2>
              <p className="text-muted-foreground text-sm mt-1.5">E-posta adresini gir, sana sıfırlama bağlantısı gönderelim.</p>
            </>
          ) : (
            <>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Tekrar Hoşgeldin</h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-1.5">Hesabına erişmek için bilgilerini gir.</p>
            </>
          )}
        </div>

        {/* ─── Success Banner ─── */}
        {resetSuccess && (
          <div
            className="p-3 rounded-lg mb-4 text-sm text-center border"
            style={{
              backgroundColor: 'rgba(255, 0, 128, 0.15)',
              borderColor: 'rgba(255, 0, 128, 0.4)',
              color: '#ff80bf',
            }}
          >
            ✉️ Sıfırlama bağlantısı e-posta adresine gönderildi! Lütfen gelen kutunu kontrol et.
          </div>
        )}

        {/* ─── Error Banner ─── */}
        {error && <div className="bg-red-500/20 text-red-200 p-2.5 rounded mb-3 text-xs sm:text-sm text-center border border-red-500/30">{error}</div>}

        {/* ─── Social Login Buttons (shown only in login mode) ─── */}
        {!forgotMode && (
          <>
            <div className="mb-4">
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                disabled={!!oauthLoading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2.5 rounded-lg transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                {oauthLoading === 'google' ? (
                  <span className="inline-block w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                {oauthLoading === 'google' ? 'Yönlendiriliyor...' : 'Google ile Giriş Yap'}
              </button>
            </div>

            {/* ─── Divider ─── */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-gray-500 uppercase tracking-wider">veya</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
          </>
        )}

        {/* ─── Forgot Password Form ─── */}
        {forgotMode ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 ml-1">E-posta / Kullanıcı Adı</label>
              <input
                type="text" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-background/50 border border-border rounded-lg p-2.5 text-sm text-foreground focus:border-pink-500 focus:outline-none transition-colors"
                placeholder="mail@ornek.com veya kullanıcı adı"
              />
            </div>
            <button
              disabled={loading}
              className="w-full font-bold py-3 rounded-lg transition-all mt-1 text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #ff0080, #7928ca)' }}
            >
              {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
            </button>
            <button
              type="button"
              onClick={switchToLogin}
              className="w-full text-sm text-gray-400 hover:text-white transition-colors mt-2 py-2"
            >
              ← Giriş Yap'a Dön
            </button>
          </form>
        ) : (
          /* ─── Login Form ─── */
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 ml-1">E-posta / Kullanıcı Adı</label>
              <input
                type="text" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-background/50 border border-border rounded-lg p-2.5 text-sm text-foreground focus:border-pink-500 focus:outline-none transition-colors"
                placeholder="mail@ornek.com veya kullanıcı adı"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400 ml-1">Şifre</label>
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-background/50 border border-border rounded-lg p-2.5 text-sm text-foreground focus:border-pink-500 focus:outline-none transition-colors"
                placeholder="******"
              />
              {/* ─── Şifremi Unuttum Link ─── */}
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  onClick={switchToForgot}
                  className="text-xs italic transition-colors hover:underline"
                  style={{ color: '#ff0080' }}
                >
                  Şifremi Unuttum
                </button>
              </div>
            </div>
            <button
              disabled={loading}
              className="w-full bg-white text-black hover:bg-gray-200 font-bold py-3 rounded-lg transition-colors mt-1 text-sm"
            >
              {loading ? 'Giriliyor...' : 'Giriş Yap'}
            </button>
          </form>
        )}

        <div className="mt-4 pt-4 border-t border-white/10 text-center">
          <p className="text-sm text-gray-400">
            Hesabın yok mu?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-pink-500 hover:text-pink-400 font-medium transition-colors hover:underline ml-1"
            >
              Kayıt Ol
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}