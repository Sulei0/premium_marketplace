import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface UsernameSetupModalProps {
    isOpen: boolean;
    onComplete: () => void;
}

export function UsernameSetupModal({ isOpen, onComplete }: UsernameSetupModalProps) {
    const { user } = useAuth();
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen || !user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const trimmed = username.trim();

        // Validation
        if (trimmed.length < 3) {
            setError("Kullanıcı adı en az 3 karakter olmalıdır.");
            setLoading(false);
            return;
        }

        if (trimmed.length > 30) {
            setError("Kullanıcı adı en fazla 30 karakter olabilir.");
            setLoading(false);
            return;
        }

        if (!/^[a-zA-Z0-9_çÇğĞıİöÖşŞüÜ]+$/.test(trimmed)) {
            setError("Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir.");
            setLoading(false);
            return;
        }

        try {
            if (!supabase) throw new Error("Supabase bağlantısı kurulamadı.");

            // Check username uniqueness
            const { data: existingUser } = await supabase
                .from('profiles')
                .select('username')
                .eq('username', trimmed)
                .neq('id', user.id)
                .maybeSingle();

            if (existingUser) {
                setError("Bu kullanıcı adı zaten alınmış 😔 Lütfen başka bir tane dene.");
                setLoading(false);
                return;
            }

            // Update profile with chosen username
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ username: trimmed, username_set: true })
                .eq('id', user.id);

            if (updateError) throw updateError;

            onComplete();
        } catch (err: any) {
            setError(err.message || "Bir hata oluştu, lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Decorative glow */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none" />

                <div className="text-center mb-8 relative">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                        Hoş Geldin! 🎉
                    </h2>
                    <p className="text-gray-400 text-sm mt-2">
                        Son bir adım kaldı! Toplulukta seni tanıyacağımız bir kullanıcı adı seç.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-4 text-sm text-center border border-red-500/30">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 ml-1 font-medium">Kullanıcı Adı</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500/70 text-sm font-medium">@</span>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-8 text-white focus:border-pink-500 focus:outline-none transition-colors"
                                placeholder="Örn: GizliButik"
                                autoFocus
                                minLength={3}
                                maxLength={30}
                            />
                        </div>
                        <p className="text-xs text-gray-500 ml-1 mt-1">
                            3-30 karakter, harf, rakam ve alt çizgi kullanabilirsin
                        </p>
                    </div>

                    <button
                        disabled={loading || username.trim().length < 3}
                        className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="inline-block w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                                Kaydediliyor...
                            </span>
                        ) : (
                            'Devam Et →'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
