import React from "react";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function Privacy() {
    usePageMeta("Gizlilik Politikası", "Giyenden gizlilik politikası ve veri güvenliği detayları.");
    return (
        <Layout>
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-[#121212] border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl"
                >
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                        GİYENDEN.COM GİZLİLİK POLİTİKASI
                    </h1>
                    <p className="text-gray-400 mb-8 italic">Son Güncelleme: 16 Şubat 2026</p>

                    <div className="space-y-8 text-gray-300">
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">1. VERİ SORUMLUSU VE KAPSAM</h2>
                            <p className="mb-2">
                                İşbu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, Giyenden.com ("Platform") tarafından toplanan verilerin işlenme amaçlarını ve kullanıcı haklarını belirlemek amacıyla hazırlanmıştır.
                            </p>
                            <p>
                                Giyenden, "Privacy-First" (Önce Gizlilik) prensibiyle hareket eder ve kullanıcı mahremiyetini teknik bir zorunluluk olarak kabul eder.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">2. TOPLANAN VERİLER VE İŞLEME AMAÇLARI</h2>
                            <p className="mb-4">Platform, sadece hizmetin verilebilmesi için gerekli olan minimum veriyi toplar:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Üyelik Bilgileri:</strong> E-posta adresi ve kullanıcı adı (takma ad). Bu veriler, hesabınızın oluşturulması ve güvenli giriş yapabilmeniz için işlenir.</li>
                                <li><strong>Profil Bilgileri:</strong> Tercihe bağlı olarak eklenen profil fotoğrafı ve bio bilgileri. Gerçek isim kullanma zorunluluğu yoktur; anonimlik esastır.</li>
                                <li><strong>İletişim Verileri:</strong> Kullanıcılar arasındaki mesajlaşma içerikleri. Bu veriler, sadece taraflar arasındaki iletişimi sağlamak amacıyla sistemlerimizde saklanır.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">3. VERİLERİN SAKLANMASI VE GÜVENLİĞİ</h2>
                            <p className="mb-2">
                                Verileriniz, üst düzey şifreleme yöntemleriyle korunan güvenli bulut sunucularında (Supabase) saklanmaktadır.
                            </p>
                            <p>
                                Veritabanına erişim yetkisi sadece sistem yöneticisi (Süper Admin) ile sınırlıdır ve yetkisiz erişimlere karşı çift aşamalı doğrulama ile korunmaktadır.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">4. ÜÇÜNCÜ TARAFLARLA VERİ PAYLAŞIMI</h2>
                            <p className="mb-2">
                                Giyenden.com, kullanıcıların kişisel verilerini asla üçüncü şahıslara satmaz, kiralamaz veya ticari amaçlarla paylaşmaz.
                            </p>
                            <p>
                                Veriler, sadece yasal bir zorunluluk veya adli makamlardan gelen resmi bir talep olması durumunda ilgili mercilerle paylaşılabilir.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">5. KULLANICI HAKLARI (KVKK Madde 11)</h2>
                            <p className="mb-2">Kullanıcılar, diledikleri zaman şu haklara sahiptir:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Kişisel verilerinin işlenip işlenmediğini öğrenme.</li>
                                <li>Yanlış işlenen verilerin düzeltilmesini talep etme.</li>
                                <li>Unutulma Hakkı: Hesabını silerek tüm verilerinin sistemden kalıcı olarak temizlenmesini talep etme.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">6. ÇEREZ (COOKIE) POLİTİKASI</h2>
                            <p>
                                Platform, sadece kullanıcı deneyimini iyileştirmek ve oturum yönetimini sağlamak amacıyla teknik çerezler kullanır. Reklam hedefleme amaçlı takip çerezleri kullanılmamaktadır.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
}
