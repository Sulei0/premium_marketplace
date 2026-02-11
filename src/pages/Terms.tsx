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
                    className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm" // Removed extra shadow
                >
                    <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primary">Kullanıcı Sözleşmesi</h1>

                    <div className="space-y-8 text-muted-foreground">
                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-4">1. Taraflar</h2>
                            <p>
                                İşbu sözleşme, "Giyenden" (bundan böyle "Platform" olarak anılacaktır) ile Platform'a üye olan kullanıcı ("Kullanıcı") arasında akdedilmiştir.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-4">2. Konu</h2>
                            <p>
                                İşbu sözleşmenin konusu, Kullanıcı'nın Platform üzerinden sunduğu ürünleri listelemesi, satması veya satın alması ile ilgili şartların belirlenmesidir.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-4">3. Platformun Statüsü (Yer Sağlayıcı)</h2>
                            <p>
                                Giyenden, 5651 sayılı kanun kapsamında "Yer Sağlayıcı" statüsündedir. Platform, satıcılar ve alıcılar arasında sadece bir aracılık faaliyeti yürütmekte olup, satılan ürünlerin sahibi, satıcısı veya sağlayıcısı değildir. Platform üzerinden gerçekleşen alışverişlerdeki ayıplı mal, teslimat sorunları veya hijyen problemlerinden Giyenden sorumlu tutulamaz.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-4">4. Kullanıcının Yükümlülükleri</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>
                                    Kullanıcı, Türkiye Cumhuriyeti yasalarına aykırı, suç teşkil eden, tehditkar veya ahlaka aykırı içerik ve ürün paylaşamaz.
                                </li>
                                <li>
                                    Satıcı, sattığı ürünün niteliği, hijyeni ve temizliği konusunda alıcıya karşı bizzat sorumludur. İkinci el iç giyim ürünlerinin satışı konusundaki tüm hijyenik sorumluluk satıcıya ve alıcının takdirine aittir.
                                </li>
                                <li>
                                    Platform dışı ödeme yöntemlerinde (IBAN, Kripto vb.) yaşanacak dolandırıcılık veya anlaşmazlıklarda Giyenden taraf değildir.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-4">5. Fikri Mülkiyet</h2>
                            <p>
                                Platformda yer alan tasarım, logo ve yazılım kodları Giyenden'e aittir. İzinsiz kopyalanamaz.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-4">6. Sözleşme Değişiklikleri</h2>
                            <p>
                                Platform, işbu sözleşmeyi dilediği zaman güncelleme hakkını saklı tutar.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
}
