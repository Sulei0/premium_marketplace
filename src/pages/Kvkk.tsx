import React from "react";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function Kvkk() {
    usePageMeta("KVKK Aydınlatma Metni", "Kişisel verilerin korunması kanunu aydınlatma metni.");
    return (
        <Layout>
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm"
                >
                    <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primary">Kişisel Verilerin Korunması Kanunu (KVKK) Aydınlatma Metni</h1>

                    <div className="space-y-8 text-muted-foreground">
                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-4">1. Veri Sorumlusu</h2>
                            <p>
                                6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz "Giyenden Platformu" (Bundan böyle "Veri Sorumlusu" olarak anılacaktır) tarafından aşağıda açıklanan kapsamda işlenebilecektir.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-4">2. Kişisel Verilerin İşlenme Amacı</h2>
                            <p className="mb-4">Kişisel verileriniz;</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Üyelik işlemlerinin gerçekleştirilmesi,</li>
                                <li>Platform üzerinden iletişim kurulabilmesi,</li>
                                <li>Bilgi güvenliği süreçlerinin yürütülmesi,</li>
                                <li>Yetkili kişi, kurum ve kuruluşlara bilgi verilmesi (Adli makamlarca talep edilmesi durumunda) amaçlarıyla işlenmektedir.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-4">3. Kişisel Verilerin Toplanma Yöntemi</h2>
                            <p>
                                Kişisel verileriniz, Giyenden web sitesi üzerinden elektronik ortamda, üyelik formu doldurulması suretiyle otomatik yollarla toplanmaktadır.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-4">4. İlgili Kişinin Hakları (Madde 11)</h2>
                            <p className="mb-4">KVKK'nın 11. maddesi uyarınca herkes, Veri Sorumlusu'na başvurarak kendisiyle ilgili;</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Kişisel veri işlenip işlenmediğini öğrenme,</li>
                                <li>Kişisel verileri işlenmişse buna ilişkin bilgi talep etme,</li>
                                <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
                                <li>Kişisel verilerin silinmesini veya yok edilmesini isteme haklarına sahiptir.</li>
                            </ul>
                            <p className="mt-6 pt-6 border-t border-border">
                                <span className="font-semibold text-foreground">İletişim:</span> KVKK kapsamındaki talepleriniz için <a href="mailto:oyunhesa67@gmail.com" className="text-primary hover:underline">oyunhesa67@gmail.com</a> adresi üzerinden bizimle iletişime geçebilirsiniz.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
}
