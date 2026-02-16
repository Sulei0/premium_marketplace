import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already accepted cookies
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            // Show banner after a small delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'true');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="fixed bottom-6 right-6 z-[60] max-w-sm w-full md:w-auto"
                >
                    <div className="bg-[#121212]/95 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl flex flex-col gap-3 relative overflow-hidden">
                        {/* Decorative Gradient */}
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-50" />

                        <div className="flex items-start gap-3">
                            <span className="text-xl">🍪</span>
                            <div className="flex-1">
                                <p className="text-xs text-gray-300 leading-relaxed">
                                    Size daha iyi bir deneyim sunmak için çerezleri kullanıyoruz.
                                    <Link to="/privacy" className="text-pink-400 hover:text-pink-300 hover:underline ml-1">
                                        Politikayı İncele
                                    </Link>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 ml-auto">
                            <button
                                onClick={() => setIsVisible(false)}
                                className="text-xs text-gray-500 hover:text-white px-3 py-1.5 transition-colors"
                            >
                                Kapat
                            </button>
                            <button
                                onClick={handleAccept}
                                className="bg-white text-black hover:bg-gray-200 text-xs font-bold py-2 px-6 rounded-lg transition-transform active:scale-95 shadow-lg"
                            >
                                Kabul Et
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
