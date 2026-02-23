import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
  const { signIn, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password state
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn(email, password);
      onClose();
      navigate('/profile/me');
    } catch (err: any) {
      if (err.message.includes("Invalid login")) {
        setError("E-posta veya şifre hatalı.");
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
      await resetPassword(email);
      setResetSuccess(true);
    } catch (err: any) {
      setError("E-posta adresi bulunamadı veya bir hata oluştu.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl p-8 shadow-2xl my-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">✕</button>

        {/* ─── Header ─── */}
        <div className="text-center mb-6">
          {forgotMode ? (
            <>
              <h2 className="text-2xl font-bold text-white">Şifreni mi Unuttun?</h2>
              <p className="text-gray-400 text-sm mt-2">E-posta adresini gir, sana sıfırlama bağlantısı gönderelim.</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white">Tekrar Hoşgeldin</h2>
              <p className="text-gray-400 text-sm mt-2">Hesabına erişmek için bilgilerini gir.</p>
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
        {error && <div className="bg-red-500/20 text-red-200 p-3 rounded mb-4 text-sm text-center border border-red-500/30">{error}</div>}

        {/* ─── Forgot Password Form ─── */}
        {forgotMode ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 ml-1">E-posta</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-pink-500 focus:outline-none transition-colors"
                placeholder="mail@ornek.com"
              />
            </div>
            <button
              disabled={loading}
              className="w-full font-bold py-3.5 rounded-lg transition-all mt-2 text-white"
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 ml-1">E-posta</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-pink-500 focus:outline-none transition-colors"
                placeholder="mail@ornek.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400 ml-1">Şifre</label>
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-pink-500 focus:outline-none transition-colors"
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
              className="w-full bg-white text-black hover:bg-gray-200 font-bold py-3.5 rounded-lg transition-colors mt-2"
            >
              {loading ? 'Giriliyor...' : 'Giriş Yap'}
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-white/10 text-center">
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