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
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);

  if (!isOpen) return null;

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

          {/* Legal Consent Checkboxes */}
          <div className="space-y-3 pt-2">
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