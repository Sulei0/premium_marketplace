import React from "react";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { RotateCcw, Clock, PackageCheck, ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function CancellationReturn() {
    return (
        <Layout>
            <SEO
                title="İptal ve İade Koşulları | Giyenden"
                description="Giyenden.com iptal ve iade koşulları. 14 günlük cayma hakkı, iade süreci ve istisnalar hakkında bilgi edinin."
            />
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-[#121212] border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl"
                >
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                        İPTAL VE İADE KOŞULLARI
                    </h1>
                    <p className="text-gray-400 mb-8 italic">Son Güncelleme: 19 Mart 2026</p>

                    {/* Özet Kartlar */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                            <Clock className="w-8 h-8 mx-auto mb-2 text-pink-400" />
                            <p className="text-2xl font-bold text-white">14 Gün</p>
                            <p className="text-xs text-gray-400">Cayma Hakkı Süresi</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                            <RotateCcw className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                            <p className="text-2xl font-bold text-white">10 Gün</p>
                            <p className="text-xs text-gray-400">İade Gönderim Süresi</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                            <PackageCheck className="w-8 h-8 mx-auto mb-2 text-green-400" />
                            <p className="text-2xl font-bold text-white">14 Gün</p>
                            <p className="text-xs text-gray-400">Geri Ödeme Süresi</p>
                        </div>
                    </div>

                    <div className="space-y-8 text-gray-300">
                        {/* BÖLÜM 1 */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-pink-400 flex-shrink-0" />
                                1. Cayma Hakkı
                            </h2>
                            <div className="space-y-3 text-sm">
                                <p>
                                    6502 sayılı Tüketicinin Korunması Hakkında Kanun'un 48. maddesi ve Mesafeli Sözleşmeler Yönetmeliği'nin
                                    9. maddesi uyarınca, Alıcı (Tüketici) mesafeli sözleşme ile satın aldığı ürünü, teslim aldığı tarihten
                                    itibaren <strong className="text-white">14 (on dört) gün</strong> içinde hiçbir gerekçe göstermeksizin ve
                                    cezai şart ödemeksizin iade edebilir.
                                </p>
                                <p>
                                    Cayma hakkı süresi, ürünün Alıcı'ya veya Alıcı'nın belirlediği üçüncü kişiye teslim edildiği günden başlar.
                                    Ancak Alıcı, sözleşmenin kurulmasından ürünün teslimine kadar olan süre içinde de cayma hakkını kullanabilir.
                                </p>
                            </div>
                        </section>

                        {/* BÖLÜM 2 */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                                2. İade Süreci — Adım Adım
                            </h2>
                            <div className="space-y-4 text-sm">
                                <div className="relative pl-8 border-l-2 border-pink-500/30 space-y-6">
                                    <div className="relative">
                                        <div className="absolute -left-[25px] top-0 w-4 h-4 rounded-full bg-pink-500 border-2 border-[#121212]"></div>
                                        <h3 className="font-semibold text-white">Adım 1: İade Talebi Oluşturun</h3>
                                        <p className="text-gray-400 mt-1">
                                            Ürünü teslim aldığınız tarihten itibaren 14 gün içinde Platform üzerindeki mesaj sistemi,
                                            e-posta (destek@giyenden.com) veya noter aracılığıyla cayma iradenizi Satıcı'ya ve/veya
                                            Platform'a bildirin.
                                        </p>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -left-[25px] top-0 w-4 h-4 rounded-full bg-pink-500 border-2 border-[#121212]"></div>
                                        <h3 className="font-semibold text-white">Adım 2: Ürünü Hazırlayın</h3>
                                        <p className="text-gray-400 mt-1">
                                            İade edeceğiniz ürünü orijinal ambalajıyla birlikte, kullanılmamış ve hasarsız bir şekilde paketleyin.
                                            Varsa etiket, kutu ve aksesuarları da ekleyin. Sipariş numaranızı kargo paketinin içine not edin.
                                        </p>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -left-[25px] top-0 w-4 h-4 rounded-full bg-pink-500 border-2 border-[#121212]"></div>
                                        <h3 className="font-semibold text-white">Adım 3: Kargoya Verin</h3>
                                        <p className="text-gray-400 mt-1">
                                            Cayma bildiriminden itibaren <strong className="text-white">10 (on) gün</strong> içinde ürünü
                                            Satıcı'nın adresine kargolayın. Kargo takip numarasını Platform üzerinden Satıcı ile paylaşın.
                                            İade kargo ücreti, aksi kararlaştırılmadıkça Alıcı'ya aittir.
                                        </p>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -left-[25px] top-0 w-4 h-4 rounded-full bg-green-500 border-2 border-[#121212]"></div>
                                        <h3 className="font-semibold text-white">Adım 4: Geri Ödeme</h3>
                                        <p className="text-gray-400 mt-1">
                                            Satıcı, iade edilen ürünü teslim aldıktan sonra en geç <strong className="text-white">14 (on dört) gün</strong> içinde
                                            ödeme tutarını Alıcı'nın ödeme yaptığı yöntemle iade eder. Kredi kartı ödemelerinde bankanın
                                            yansıtma süresi 2-3 haftayı bulabilir.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* BÖLÜM 3 */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                                3. Cayma Hakkının Kullanılamayacağı Durumlar
                            </h2>
                            <div className="text-sm">
                                <p className="mb-3">
                                    Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesi gereğince, aşağıdaki hallerde cayma hakkı kullanılamaz:
                                </p>
                                <div className="grid gap-3">
                                    <div className="bg-white/5 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
                                        <span className="text-amber-400 font-bold mt-0.5 flex-shrink-0">1.</span>
                                        <div>
                                            <p className="font-medium text-white">Hijyen Ürünleri</p>
                                            <p className="text-gray-400 text-xs mt-1">
                                                Tesliminden sonra ambalajı, bandı, mühürü veya paketi açılmış olan ve iadesi
                                                sağlık ve hijyen açısından uygun olmayan ürünler. <strong>(iç giyim, çorap, mayo, bikini vb.)</strong>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
                                        <span className="text-amber-400 font-bold mt-0.5 flex-shrink-0">2.</span>
                                        <div>
                                            <p className="font-medium text-white">Kişiye Özel Ürünler</p>
                                            <p className="text-gray-400 text-xs mt-1">
                                                Tüketicinin istekleri doğrultusunda veya açıkça kişisel ihtiyaçlarına göre
                                                hazırlanan, üzerinde değişiklik veya ilaveler yapılarak kişiye özel hale getirilen ürünler.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
                                        <span className="text-amber-400 font-bold mt-0.5 flex-shrink-0">3.</span>
                                        <div>
                                            <p className="font-medium text-white">Karışan / Ayrıştırılamayan Ürünler</p>
                                            <p className="text-gray-400 text-xs mt-1">
                                                Tesliminden sonra başka ürünlerle karışan ve doğası gereği ayrıştırılamayan ürünler.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
                                        <span className="text-amber-400 font-bold mt-0.5 flex-shrink-0">4.</span>
                                        <div>
                                            <p className="font-medium text-white">Finansal Dalgalanmaya Bağlı Ürünler</p>
                                            <p className="text-gray-400 text-xs mt-1">
                                                Fiyatı finansal piyasadaki dalgalanmalara bağlı olarak değişen ve Platform'un kontrolünde olmayan ürünler.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* BÖLÜM 4 */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">4. İkinci El Ürünlerde İade</h2>
                            <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-xl p-5">
                                <div className="space-y-3 text-sm">
                                    <p>
                                        Giyenden.com, ikinci el giyim ve aksesuar ürünlerinin alım-satımına aracılık eden bir platformdur.
                                        İkinci el ürünlerde cayma hakkı geçerlidir; ancak aşağıdaki kurallar uygulanır:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 pl-2">
                                        <li>
                                            Ürün, teslim alındığı andaki durumuyla iade edilmelidir. Kullanım sonucu oluşan
                                            değer kayıplarından <strong className="text-white">Alıcı sorumludur</strong>.
                                        </li>
                                        <li>
                                            Ürünün ilan sayfasında tarif edilen durumuna uygun olup olmadığı, iade değerlendirmesinde dikkate alınır.
                                        </li>
                                        <li>
                                            <strong className="text-white">Hijyen istisnası:</strong> İç giyim, çorap ve benzeri hijyene duyarlı
                                            ürünlerde, ambalajı açılmış ise cayma hakkı kullanılamaz.
                                        </li>
                                        <li>
                                            Ürünün ayıplı çıkması (ilanda belirtilenden farklı olması) durumunda, tüketicinin seçimlik hakları saklıdır.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* BÖLÜM 5 */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">5. Sipariş İptali</h2>
                            <div className="space-y-3 text-sm">
                                <p>
                                    Alıcı, ürün kargoya verilmeden önce siparişini iptal edebilir. Sipariş iptali durumunda:
                                </p>
                                <ul className="list-disc list-inside space-y-2 pl-2">
                                    <li>Alıcı, Platform üzerinden veya destek kanalı aracılığıyla iptal talebini iletir.</li>
                                    <li>Satıcı, henüz kargoya vermediği sipariş için iptal talebini kabul eder.</li>
                                    <li>Ödeme alınmışsa, iptal onayından itibaren en geç <strong className="text-white">14 (on dört) gün</strong> içinde iade edilir.</li>
                                    <li>Ürün kargoya verildikten sonra iptal talebi cayma hakkı prosedürüne dönüşür.</li>
                                </ul>
                            </div>
                        </section>

                        {/* BÖLÜM 6 */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">6. Ayıplı Ürün İadesi</h2>
                            <div className="space-y-3 text-sm">
                                <p>
                                    Teslim alınan ürünün, ilan sayfasındaki açıklamayla uyuşmaması (ayıplı ürün) halinde
                                    Alıcı aşağıdaki haklardan birini kullanabilir (6502 sayılı Kanun m. 11):
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                        <p className="font-semibold text-white text-sm mb-1">🔄 Bedel İadesi</p>
                                        <p className="text-xs text-gray-400">Ürünü iade edip ödenen tutarın tamamını geri almak.</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                        <p className="font-semibold text-white text-sm mb-1">📉 Ayıp Oranında İndirim</p>
                                        <p className="text-xs text-gray-400">Ürünü alıkoyup ayıp oranında fiyat indirimi talep etmek.</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                        <p className="font-semibold text-white text-sm mb-1">🔧 Ücretsiz Onarım</p>
                                        <p className="text-xs text-gray-400">Mümkünse ürünün ücretsiz olarak onarılmasını istemek.</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                        <p className="font-semibold text-white text-sm mb-1">🔀 Ayıpsız Misli ile Değişim</p>
                                        <p className="text-xs text-gray-400">İmkân varsa ürünün ayıpsız benzeriyle değiştirilmesini istemek.</p>
                                    </div>
                                </div>
                                <p className="mt-3">
                                    Ayıplı ürün iadeleri için kargo ücreti <strong className="text-white">Satıcı'ya aittir</strong>.
                                    Alıcı, durumu fotoğrafla belgeleyerek Platform destek ekibine bildirmelidir.
                                </p>
                            </div>
                        </section>

                        {/* BÖLÜM 7 */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">7. Geri Ödeme Koşulları</h2>
                            <div className="space-y-3 text-sm">
                                <ul className="list-disc list-inside space-y-2 pl-2">
                                    <li>
                                        Cayma hakkı veya ayıplı ürün iadesi kapsamında yapılan geri ödemeler,
                                        iade edilen ürünün Satıcı'ya ulaştığı tarihten itibaren en geç <strong className="text-white">14 gün</strong> içinde yapılır.
                                    </li>
                                    <li>Geri ödeme, Alıcı'nın ödeme yaptığı yöntemle aynı şekilde gerçekleştirilir.</li>
                                    <li>
                                        <strong>Kredi kartı ödemeleri:</strong> İade tutarı, bankanın işlem süresine bağlı olarak
                                        kartınıza 2-3 hafta içinde yansıyabilir. Taksitli ödemelerde iade, kart sahibinin bankasıyla
                                        yapılan anlaşmaya göre taksitler halinde yapılabilir.
                                    </li>
                                    <li>
                                        <strong>Havale / EFT ödemeleri:</strong> İade tutarı, Alıcı'nın bildirdiği banka hesabına
                                        doğrudan aktarılır.
                                    </li>
                                    <li>
                                        Kısmi iade (sadece bazı ürünlerin iadesi) mümkündür; yalnızca iade edilen ürünlerin bedeli geri ödenir.
                                    </li>
                                </ul>
                            </div>
                        </section>

                        {/* BÖLÜM 8 */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">8. Kargo Sırasında Hasar</h2>
                            <div className="space-y-3 text-sm">
                                <p>
                                    Ürün teslimat sırasında hasar görmüşse, Alıcı aşağıdaki adımları izlemelidir:
                                </p>
                                <ul className="list-disc list-inside space-y-2 pl-2">
                                    <li>Kargo görevlisi huzurunda paket açılarak kontrol edilmelidir.</li>
                                    <li>Hasar tespit edilirse <strong className="text-white">tutanak tutturulmalıdır</strong>.</li>
                                    <li>Hasarlı ürün fotoğraflanarak Platform destek ekibine bildirilmelidir.</li>
                                    <li>Tutanak tutulmadan teslim alınan ürünlerdeki hasar iddiaları, kargo firmasının sorumluluk politikasına göre değerlendirilir.</li>
                                </ul>
                            </div>
                        </section>

                        {/* BÖLÜM 9 */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">9. Uyuşmazlık Çözümü</h2>
                            <div className="space-y-3 text-sm">
                                <p>
                                    İptal ve iade süreçlerine ilişkin uyuşmazlıklarda:
                                </p>
                                <ul className="list-disc list-inside space-y-2 pl-2">
                                    <li>Öncelikle Platform destek ekibine başvurulabilir.</li>
                                    <li>
                                        Ticaret Bakanlığı tarafından ilan edilen değere kadar olan uyuşmazlıklarda
                                        <strong className="text-white"> Tüketici Hakem Heyetleri</strong>, bu değerin üzerindeki
                                        uyuşmazlıklarda <strong className="text-white">Tüketici Mahkemeleri</strong> yetkilidir.
                                    </li>
                                    <li>
                                        Alıcı, şikâyetlerini <strong className="text-white">Ticaret Bakanlığı Tüketici Şikâyet Hattı (ALO 175)</strong>
                                        {" "}ve <strong className="text-white">Tüketici Bilgi Sistemi (TÜBİS)</strong> üzerinden de iletebilir.
                                    </li>
                                </ul>
                            </div>
                        </section>

                        {/* BÖLÜM 10 */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">10. İletişim</h2>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-sm">
                                <p className="mb-3">
                                    İptal ve iade talepleriniz için aşağıdaki kanallardan bize ulaşabilirsiniz:
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2">
                                        <span className="text-pink-400">📧</span>
                                        <span><strong>E-posta:</strong> destek@giyenden.com</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-pink-400">💬</span>
                                        <span><strong>Platform İçi Mesaj:</strong> Sipariş detaylarından "Destek" butonuna tıklayın</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-pink-400">🌐</span>
                                        <span><strong>Web:</strong> www.giyenden.com</span>
                                    </li>
                                </ul>
                            </div>
                        </section>

                        {/* Yasal Referans */}
                        <section className="bg-gradient-to-r from-pink-500/5 to-purple-500/5 border border-white/10 rounded-xl p-5 mt-4">
                            <p className="text-xs text-gray-400 leading-relaxed">
                                <strong className="text-white">Yasal Dayanak:</strong> İşbu İptal ve İade Koşulları,
                                6502 sayılı Tüketicinin Korunması Hakkında Kanun, 27 Kasım 2014 tarihli Mesafeli Sözleşmeler Yönetmeliği
                                (son değişiklik: 23 Ağustos 2022), 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun ve
                                ilgili ikincil mevzuat hükümleri çerçevesinde hazırlanmıştır. Giyenden.com, bu koşulları mevzuat
                                değişikliklerine uygun olarak güncelleme hakkını saklı tutar.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
}
