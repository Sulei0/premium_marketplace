import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole: 'seller' | 'buyer';
  onSwitchToLogin: () => void; // <-- İşte aranan özellik bu!
}

export function RegistrationModal({ isOpen, onClose, initialRole, onSwitchToLogin }: RegistrationModalProps) {
  const { signUp, signInWithOAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);

  if (!isOpen) return null;

  const handleOAuthRegister = async (provider: 'google' | 'facebook') => {
    if (!agreedTerms || !agreedPrivacy) {
      setError("Lütfen Kullanıcı Sözleşmesi ve Gizlilik Politikasını kabul edin.");
      return;
    }
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
    if (!agreedTerms || !agreedPrivacy) {
      setError("Lütfen Kullanıcı Sözleşmesi ve Gizlilik Politikasını kabul edin.");
      return;
    }

    setLoading(true);
    // ... rest of the submit logic
    setError(null);

    try {
      // 1. Check for username uniqueness
      if (supabase) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username)
          .maybeSingle(); // Use maybeSingle to avoid 406 error if not found

        if (existingUser) {
          throw new Error("Bu kullanıcı adı zaten alınmış 😔 Lütfen başka bir tane dene.");
        }
      }

      await signUp(email, password, username, initialRole);
      alert("🚀 Kayıt Başarılı! Lütfen e-postana gelen linki onayla.");
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl p-8 shadow-2xl my-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">✕</button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            {initialRole === 'seller' ? 'Satıcı Ol' : 'Alışverişe Başla'}
          </h2>
          <p className="text-gray-400 text-sm mt-2">Aramıza katıl ve keşfetmeye başla.</p>
        </div>

        {error && <div className="bg-red-500/20 text-red-200 p-3 rounded mb-4 text-sm text-center border border-red-500/30">{error}</div>}

        {/* ─── Legal Consent Checkboxes (placed before social buttons) ─── */}
        <div className="space-y-3 mb-5">
          <div className="flex items-start gap-3">
            <input
              id="terms-check"
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-600 bg-black/20 text-pink-500 focus:ring-pink-500/50 transition-colors cursor-pointer"
            />
            <label htmlFor="terms-check" className="text-xs text-gray-400 leading-snug cursor-pointer select-none">
              <Link to="/terms" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-pink-400 hover:text-pink-300 hover:underline">Kullanıcı Sözleşmesi</Link>'ni okudum ve kabul ediyorum.
            </label>
          </div>

          <div className="flex items-start gap-3">
            <input
              id="privacy-check"
              type="checkbox"
              checked={agreedPrivacy}
              onChange={(e) => setAgreedPrivacy(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-600 bg-black/20 text-pink-500 focus:ring-pink-500/50 transition-colors cursor-pointer"
            />
            <label htmlFor="privacy-check" className="text-xs text-gray-400 leading-snug cursor-pointer select-none">
              <Link to="/privacy" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-pink-400 hover:text-pink-300 hover:underline">Gizlilik Politikası / KVKK Aydınlatma Metni</Link>'ni okudum ve kabul ediyorum.
            </label>
          </div>
        </div>

        {/* ─── Social Register Buttons ─── */}
        <div className="mb-5">
          <button
            type="button"
            onClick={() => handleOAuthRegister('google')}
            disabled={!!oauthLoading || !agreedTerms || !agreedPrivacy}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
            {oauthLoading === 'google' ? 'Yönlendiriliyor...' : 'Google ile Kayıt Ol'}
          </button>
        </div>

        {/* ─── Divider ─── */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-gray-500 uppercase tracking-wider">veya</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-400 ml-1">Kullanıcı Adı</label>
            <input
              type="text" required value={username} onChange={e => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-pink-500 focus:outline-none transition-colors"
              placeholder="Örn: GizliButik"
            />
          </div>
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
              type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-pink-500 focus:outline-none transition-colors"
              placeholder="******"
            />
          </div>

          <button
            disabled={loading || !agreedTerms || !agreedPrivacy}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-lg transition-all transform active:scale-95 mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {loading ? 'İşleniyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-sm text-gray-400">
            Zaten hesabın var mı?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-pink-500 hover:text-pink-400 font-medium transition-colors hover:underline ml-1"
            >
              Giriş Yap
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}