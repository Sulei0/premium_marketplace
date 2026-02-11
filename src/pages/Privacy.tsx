import React from "react";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";

export default function Privacy() {
    return (
        <Layout>
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm"
                >
                    <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primary">Gizlilik Politikası</h1>

                    <div className="space-y-8 text-muted-foreground">
                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-4">1. Toplanan Veriler</h2>
                            <p className="mb-4">Giyenden olarak, hizmetlerimizi sunabilmek için şu verileri toplayabiliriz:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Kimlik Bilgileri (Ad, Soyad veya Kullanıcı Adı)</li>
                                <li>İletişim Bilgileri (E-posta adresi)</li>
                                <li>İşlem Güvenliği Bilgileri (IP adresi, Giriş/Çıkış kayıtları)</li>
                                <li>Kullanıcı tarafından yüklenen ürün görselleri.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-4">2. Verilerin Kullanım Amacı</h2>
                            <p>
                                Toplanan veriler; üyeliğinizin oluşturulması, platform güvenliğinin sağlanması, yasal yükümlülüklerin (log tutma) yerine getirilmesi amacıyla kullanılır. Verileriniz, yasal zorunluluklar haricinde üçüncü şahıslarla paylaşılmaz.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-4">3. Veri Güvenliği</h2>
                            <p>
                                Verileriniz, uluslararası standartlarda güvenli sunucularda (Supabase) saklanmaktadır. Ancak internet üzerinden %100 güvenliğin garanti edilemeyeceğini hatırlatırız. Şifrenizin güvenliğinden Kullanıcı sorumludur.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-4">4. Çerezler (Cookies)</h2>
                            <p>
                                Sitemizde kullanıcı deneyimini iyileştirmek ve oturumunuzu açık tutmak için çerezler kullanılmaktadır. Tarayıcı ayarlarınızdan çerezleri reddedebilirsiniz.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
}
