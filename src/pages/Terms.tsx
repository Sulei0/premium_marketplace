import React from "react";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function Terms() {
    usePageMeta("Kullanıcı Sözleşmesi", "Giyenden kullanıcı sözleşmesi ve hizmet şartları.");
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
                        GİYENDEN.COM KULLANICI SÖZLEŞMESİ
                    </h1>
                    <p className="text-gray-400 mb-8 italic">Son Güncelleme: 16 Şubat 2026</p>

                    <div className="space-y-8 text-gray-300">
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">1. TARAFLAR VE KABUL</h2>
                            <p className="mb-2">
                                İşbu Kullanıcı Sözleşmesi ("Sözleşme"), Giyenden.com ("Platform") ile Platform’a üye olan veya Platform’u ziyaret eden kullanıcı ("Kullanıcı") arasında akdedilmiştir.
                            </p>
                            <p>
                                Platform'a giriş yapan veya üye olan her Kullanıcı, bu sözleşme hükümlerini hiçbir sınırlama olmaksızın kabul etmiş sayılır.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">2. YASAL STATÜ VE YER SAĞLAYICI BİLDİRİMİ</h2>
                            <p className="mb-2">
                                Giyenden.com, 5651 Sayılı Kanun kapsamında "Yer Sağlayıcı" sıfatına sahiptir.
                            </p>
                            <p className="mb-2">
                                Platform, Kullanıcılar tarafından oluşturulan içerikleri kontrol etmek veya hukuka aykırı bir faaliyetin söz konusu olup olmadığını araştırmakla yükümlü değildir.
                            </p>
                            <p>
                                Platform üzerinde paylaşılan tüm görsel, metin ve ilan içeriklerinin hukuki sorumluluğu tamamen içeriği oluşturan Kullanıcı’ya aittir.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">3. ÜYELİK ŞARTLARI VE YAŞ SINIRI</h2>
                            <p className="mb-2">
                                Giyenden.com’u kullanabilmek için 18 yaşını doldurmuş olmak zorunludur.
                            </p>
                            <p className="mb-2">
                                Kullanıcı, üyelik formunda verdiği bilgilerin doğruluğunu ve anonimlik haklarını saklı tutarken platform kurallarına uyacağını beyan eder.
                            </p>
                            <p>
                                Admin ekibi, topluluk kurallarına aykırı hareket eden profilleri önceden bildirim yapmaksızın askıya alma veya kalıcı olarak yasaklama (ban) hakkını saklı tutar.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">4. İÇERİK POLİTİKASI VE "UYAR-KALDIR"</h2>
                            <p className="mb-2">
                                Platform’da sadece "yaşanmışlık" temalı koleksiyon ürünleri ve ikinci el aksesuarlar sergilenebilir.
                            </p>
                            <p className="mb-2">
                                Yasaklı İçerikler: Çocuk istismarı, rıza dışı görsel paylaşımı, yasadışı madde tanıtımı veya şiddet içeren unsurların paylaşılması kesinlikle yasaktır.
                            </p>
                            <p>
                                "Uyar-Kaldır" prensibi uyarınca, telif hakkı veya kişilik hakkı ihlali bildirimleri en geç 48 saat içinde değerlendirilerek ihlale konu içerik yayından kaldırılır.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">5. ÖDEME VE TİCARİ İŞLEMLER (P2P MODELİ)</h2>
                            <p className="mb-2">
                                Giyenden.com, alıcı ve satıcı arasındaki ödeme işlemlerine aracılık etmez ve hiçbir komisyon almaz.
                            </p>
                            <p>
                                Tüm ödemeler kullanıcılar arasında doğrudan (Peer-to-Peer) gerçekleştirilir. Platform, ödeme süreçlerinden kaynaklanabilecek dolandırıcılık veya uyuşmazlıklardan sorumlu tutulamaz.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">6. GİZLİLİK VE VERİ KORUMA</h2>
                            <p className="mb-2">
                                Kullanıcı verileri, KVKK ve Gizlilik Politikası kapsamında işlenmektedir.
                            </p>
                            <p>
                                Kullanıcıların birbirlerine mesaj yoluyla gönderdiği kişisel bilgiler veya ödeme detayları kendi sorumluluklarındadır.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
}
