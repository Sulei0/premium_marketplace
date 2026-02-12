import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/lib/supabase';

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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl p-8 shadow-2xl">
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
          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-lg transition-all transform active:scale-95 mt-2"
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