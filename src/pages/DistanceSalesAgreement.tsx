import React from "react";
import { Layout } from "@/components/Layout";
import { motion } from "motion/react";
import { SEO } from "@/components/SEO";

export default function DistanceSalesAgreement() {
    return (
        <Layout>
            <SEO
                title="Mesafeli Satış Sözleşmesi | Giyenden"
                description="Giyenden.com mesafeli satış sözleşmesi. 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında hazırlanmıştır."
            />
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-[#121212] border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl"
                >
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                        MESAFELİ SATIŞ SÖZLEŞMESİ
                    </h1>
                    <p className="text-gray-400 mb-8 italic">Son Güncelleme: 19 Mart 2026</p>

                    <div className="space-y-8 text-gray-300">
                        {/* MADDE 1 */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">MADDE 1 — TARAFLAR</h2>
                            <div className="space-y-3">
                                <div>
                                    <h3 className="text-base font-semibold text-white/90 mb-1">1.1. Platform (Aracı Hizmet Sağlayıcı)</h3>
                                    <ul className="list-disc list-inside space-y-1 pl-2 text-sm">
                                        <li><strong>Unvan:</strong> Giyenden.com</li>
                                        <li><strong>Web Adresi:</strong> www.giyenden.com</li>
                                        <li><strong>E-posta:</strong> destek@giyenden.com</li>
                                    </ul>
                                    <p className="mt-2 text-sm">
                                        Giyenden.com, 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun kapsamında "Aracı Hizmet Sağlayıcı" ve
                                        5651 sayılı Kanun kapsamında "Yer Sağlayıcı" sıfatıyla faaliyet göstermektedir. Platform, satıcı ile alıcı arasında
                                        gerçekleşen satışlarda yalnızca aracılık hizmeti sunmakta olup satışın tarafı değildir.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-white/90 mb-1">1.2. Satıcı</h3>
                                    <p className="text-sm">
                                        Platform üzerinden ürün satışı gerçekleştiren, kayıtlı kullanıcı profili üzerinden ilan oluşturan gerçek kişidir.
                                        Satıcının kimlik ve iletişim bilgileri, sipariş onayı sırasında Alıcı'ya iletilir.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-white/90 mb-1">1.3. Alıcı (Tüketici)</h3>
                                    <p className="text-sm">
                                        Platform üzerinden ürün satın alan, 18 yaşını doldurmuş gerçek kişidir. İşbu sözleşmede "Alıcı" olarak anılacaktır.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* MADDE 2 */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">MADDE 2 — TANIMLAR</h2>
                            <p className="mb-3 text-sm">İşbu sözleşmede geçen terimler aşağıdaki anlamları taşır:</p>
                            <ul className="list-disc list-inside space-y-2 pl-2 text-sm">
                                <li><strong>Platform:</strong> Giyenden.com web sitesi ve/veya mobil uygulaması.</li>
                                <li><strong>Hizmet:</strong> Satıcı tarafından ilan edilen ürünlerin sergilenmesi, satışına aracılık edilmesi ve ilgili iletişim altyapısının sağlanması.</li>
                                <li><strong>Ürün:</strong> Platform üzerinden satışa sunulan ikinci el giyim, aksesuar ve moda ürünleri.</li>
                                <li><strong>Sipariş:</strong> Alıcının bir ürünü satın almak amacıyla Platform üzerinden yaptığı talep.</li>
                                <li><strong>Mesafeli Sözleşme:</strong> 6502 sayılı Kanun'un 48. maddesi ve Mesafeli Sözleşmeler Yönetmeliği kapsamında, tarafların eş zamanlı fiziksel varlığı aranmaksızın, uzaktan iletişim araçlarıyla kurulan sözleşme.</li>
                            </ul>
                        </section>

                        {/* MADDE 3 */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">MADDE 3 — SÖZLEŞMENİN KONUSU</h2>
                            <p className="text-sm">
                                İşbu sözleşmenin konusu, Alıcı'nın Platform üzerinden elektronik ortamda sipariş verdiği, sözleşmede belirtilen niteliklere sahip
                                ürün(lerin) satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği
                                hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.
                            </p>
                            <p className="text-sm mt-2">
                                Alıcı, satışa konu ürünün temel nitelikleri, satış fiyatı, ödeme şekli ve teslimat koşullarına ilişkin tüm ön bilgileri
                                okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli onayı verdiğini kabul, beyan ve taahhüt eder.
                            </p>
                        </section>

                        {/* MADDE 4 */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">MADDE 4 — ÖN BİLGİLENDİRME</h2>
                            <p className="text-sm mb-2">
                                Alıcı, sipariş vermeden önce Platform tarafından aşağıdaki bilgilerin sunulduğunu ve bunları okuduğunu kabul eder:
                            </p>
                            <ul className="list-disc list-inside space-y-1 pl-2 text-sm">
                                <li>Ürünün temel nitelikleri (tür, renk, beden, durum, marka vb.)</li>
                                <li>Satıcının unvanı veya kullanıcı adı ve iletişim bilgileri</li>
                                <li>Vergiler dahil toplam satış fiyatı</li>
                                <li>Ödeme ve teslimat şekli</li>
                                <li>Cayma hakkı ve bu hakkın kullanım koşulları</li>
                                <li>Ürünün tahmini teslimat süresi</li>
                                <li>Uyuşmazlık halinde başvurulabilecek merciler</li>
                            </ul>
                        </section>

                        {/* MADDE 5 */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">MADDE 5 — ÜRÜNÜN TEMEL NİTELİKLERİ</h2>
                            <p className="text-sm">
                                Satışa konu ürünün türü, adı, markası, bedeni, rengi, durumu (kullanılmışlık derecesi) ve diğer tüm nitelikleri
                                ürün ilan sayfasında belirtilmektedir. Ürünün satış fiyatı, ilan sayfasında gösterilen fiyattır ve tüm vergiler dahildir.
                            </p>
                            <p className="text-sm mt-2">
                                Ürün fotoğrafları temsili olabilir; Satıcı, ürünün gerçek durumunu doğru ve eksiksiz biçimde yansıtan
                                görseller ve açıklamalar sunmakla yükümlüdür.
                            </p>
                        </section>

                        {/* MADDE 6 */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">MADDE 6 — FİYAT VE ÖDEME KOŞULLARI</h2>
                            <ul className="list-disc list-inside space-y-2 pl-2 text-sm">
                                <li>Ürün fiyatları, ilan sayfasında Türk Lirası (TRY) cinsinden belirtilir ve tüm vergiler dahildir.</li>
                                <li>Kargo ve teslimat ücreti varsa, sipariş özetinde ayrıca gösterilir.</li>
                                <li>Ödeme yöntemi, Platform'un sunduğu güvenli ödeme altyapısı üzerinden veya Satıcı ile Alıcı arasında kararlaştırılan şekilde gerçekleştirilir.</li>
                                <li>Platform, ödeme aracılık hizmeti sunması durumunda, ödemeyi Satıcı'nın ürünü kargolamasının ardından emanet hesapta tutabilir ve ürün Alıcı'ya teslim edilip cayma süresi sona erdikten sonra Satıcı'ya aktarabilir.</li>
                            </ul>
                        </section>

                        {/* MADDE 7 */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">MADDE 7 — TESLİMAT KOŞULLARI</h2>
                            <ul className="list-disc list-inside space-y-2 pl-2 text-sm">
                                <li>Ürün, Alıcı'nın sipariş formunda belirttiği adrese teslim edilir.</li>
                                <li>Satıcı, siparişi onayladıktan sonra en geç <strong>30 (otuz) iş günü</strong> içinde ürünü kargoya vermekle yükümlüdür (Mesafeli Sözleşmeler Yönetmeliği m. 16).</li>
                                <li>Kargo sırasında oluşabilecek hasarlardan kargo firması sorumludur. Alıcı, teslim anında ürünü kontrol etmeli ve hasar tespit etmesi halinde tutanak tutturmalıdır.</li>
                                <li>Teslimat süresi içinde ürünün teslim edilememesi halinde Alıcı sözleşmeyi feshedebilir.</li>
                            </ul>
                        </section>

                        {/* MADDE 8 */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">MADDE 8 — CAYMA HAKKI</h2>
                            <div className="space-y-3 text-sm">
                                <p>
                                    Alıcı, hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin ürünün kendisine veya
                                    gösterdiği adresteki kişi/kuruluşa teslim tarihinden itibaren <strong>14 (on dört) gün</strong> içinde cayma hakkını kullanabilir
                                    (6502 sayılı Kanun m. 48/4, Mesafeli Sözleşmeler Yönetmeliği m. 9).
                                </p>
                                <p>
                                    Cayma hakkının kullanılabilmesi için bu süre içinde Satıcı'ya ve/veya Platform'a yazılı bildirimde
                                    (e-posta, platform içi mesaj veya noter aracılığıyla) bulunulması yeterlidir.
                                </p>

                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-3">
                                    <h3 className="text-base font-semibold text-white mb-2">8.1. Cayma Hakkının Kullanım Şartları</h3>
                                    <ul className="list-disc list-inside space-y-1 pl-2">
                                        <li>Ürün, orijinal ambalajında, kullanılmamış ve hasar görmemiş olmalıdır.</li>
                                        <li>Ürünle birlikte teslim edilen tüm aksesuarlar (varsa etiket, kutu vb.) eksiksiz iade edilmelidir.</li>
                                        <li>Ürün, Alıcı tarafından cayma bildirimi tarihinden itibaren <strong>10 (on) gün</strong> içinde Satıcı'ya iade edilmelidir.</li>
                                        <li>İade kargo ücreti, aksi kararlaştırılmadıkça Alıcı'ya aittir.</li>
                                    </ul>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-3">
                                    <h3 className="text-base font-semibold text-white mb-2">8.2. Cayma Hakkının Kullanılamayacağı Durumlar</h3>
                                    <p className="mb-2">Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesi uyarınca, aşağıdaki durumlarda cayma hakkı kullanılamaz:</p>
                                    <ul className="list-disc list-inside space-y-1 pl-2">
                                        <li>Fiyatı finansal piyasadaki dalgalanmalara bağlı olarak değişen ürünler.</li>
                                        <li>Tüketicinin istekleri doğrultusunda kişiye özel hazırlanan, üzerinde değişiklik yapılan ürünler.</li>
                                        <li>Çabuk bozulma veya son kullanma tarihi geçme ihtimali olan ürünler.</li>
                                        <li>Tesliminden sonra ambalaj, bant, mühür, paket gibi koruyucu unsurları açılmış olan ürünlerden; iadesi sağlık ve hijyen açısından uygun olmayanlar (iç giyim, çorap, mayo vb.).</li>
                                        <li>Tesliminden sonra başka ürünlerle karışan ve doğası gereği ayrıştırılamayan ürünler.</li>
                                    </ul>
                                </div>

                                <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-xl p-4 mt-3">
                                    <h3 className="text-base font-semibold text-white mb-2">⚠️ İkinci El Ürünlerde Cayma Hakkı</h3>
                                    <p>
                                        Giyenden.com ikinci el ürünlerin alım-satımına aracılık etmektedir. İkinci el ürünlerde cayma hakkı geçerlidir;
                                        ancak ürünün teslim alındığı durumuyla iade edilmesi şarttır. Kullanım sonucu oluşan değer kayıplarından
                                        Alıcı sorumludur.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* MADDE 9 */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">MADDE 9 — GERİ ÖDEME</h2>
                            <ul className="list-disc list-inside space-y-2 pl-2 text-sm">
                                <li>Cayma hakkının kullanılması halinde, Satıcı veya Platform cayma bildiriminin ulaştığı tarihten itibaren en geç <strong>14 (on dört) gün</strong> içinde toplam bedeli Alıcı'ya iade eder.</li>
                                <li>Geri ödeme, Alıcı'nın ödeme yaptığı yöntemle aynı şekilde yapılır.</li>
                                <li>Satıcı, ürün kendisine ulaşmadan önce geri ödemeyi geciktirebilir veya ürünün gönderildiğine dair kargo takip belgesi ibraz edilene kadar bekletebilir.</li>
                                <li>Kredi kartı ile yapılan ödemelerde, iade tutarı banka tarafından Alıcı'nın hesabına en geç 2-3 hafta içinde yansıtılır.</li>
                            </ul>
                        </section>

                        {/* MADDE 10 */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">MADDE 10 — TARAFLARIN HAK VE YÜKÜMLÜLÜKLERİ</h2>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <h3 className="text-base font-semibold text-white/90 mb-1">10.1. Satıcının Yükümlülükleri</h3>
                                    <ul className="list-disc list-inside space-y-1 pl-2">
                                        <li>Ürünü ilan sayfasında belirtilen niteliklere uygun, eksiksiz ve hasarsız olarak kargoya vermek.</li>
                                        <li>Teslimatı yasal süre (30 iş günü) içinde gerçekleştirmek.</li>
                                        <li>Cayma hakkı kapsamında iade edilen ürün bedelini süresinde iade etmek.</li>
                                        <li>Ürün hakkında doğru ve yanıltıcı olmayan bilgi vermek.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-white/90 mb-1">10.2. Alıcının Yükümlülükleri</h3>
                                    <ul className="list-disc list-inside space-y-1 pl-2">
                                        <li>Sipariş onayı öncesinde ürün bilgilerini ve sözleşme koşullarını incelemek.</li>
                                        <li>Teslimat adresini doğru ve eksiksiz bildirmek.</li>
                                        <li>Ürünü teslim aldığında kontrol etmek ve hasarlı teslimat durumunda tutanak tutturmak.</li>
                                        <li>Cayma hakkı kullanırken ürünü belirlenen koşullara uygun şekilde iade etmek.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-white/90 mb-1">10.3. Platform'un Konumu</h3>
                                    <ul className="list-disc list-inside space-y-1 pl-2">
                                        <li>Giyenden.com, Satıcı ile Alıcı arasındaki işlemlerde aracı hizmet sağlayıcı konumundadır.</li>
                                        <li>Platform, ürünün ayıplı olması, geç teslim edilmesi veya hiç teslim edilmemesinden doğrudan sorumlu değildir; ancak Alıcı'nın uyuşmazlık çözüm sürecini kolaylaştırmak adına gerekli desteği sağlar.</li>
                                        <li>Platform, 6563 sayılı Kanun ve ilgili yönetmelikler kapsamındaki bilgilendirme ve aracılık yükümlülüklerini yerine getirir.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* MADDE 11 */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">MADDE 11 — AYIPLI ÜRÜN VE GARANTİ</h2>
                            <div className="space-y-2 text-sm">
                                <p>
                                    Teslim alınan ürünün, ilan sayfasında belirtilen niteliklere uygun olmaması halinde Alıcı,
                                    6502 sayılı Kanun'un 11. maddesi kapsamında aşağıdaki seçimlik haklarını kullanabilir:
                                </p>
                                <ul className="list-disc list-inside space-y-1 pl-2">
                                    <li>Satılanı geri verip ödenen bedelin iadesini istemek,</li>
                                    <li>Satılanı alıkoyup ayıp oranında indirim istemek,</li>
                                    <li>Ücretsiz onarım istemek (mümkünse),</li>
                                    <li>İmkân varsa satılanın ayıpsız benzeriyle değiştirilmesini istemek.</li>
                                </ul>
                                <p className="mt-2">
                                    İkinci el ürünlerde garanti süresi, ürüne özel olarak Satıcı tarafından ilanda belirtilmektedir.
                                    Aksi belirtilmedikçe, ikinci el ürünlerde yasal garanti süresi <strong>1 (bir) yıldır</strong> (6502 sayılı Kanun m. 12).
                                </p>
                            </div>
                        </section>

                        {/* MADDE 12 */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">MADDE 12 — KİŞİSEL VERİLERİN KORUNMASI</h2>
                            <p className="text-sm">
                                Alıcı ve Satıcı'nın kişisel verileri, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında işlenmektedir.
                                Detaylı bilgi için{" "}
                                <a href="/kvkk" className="text-pink-400 hover:text-pink-300 underline transition-colors">KVKK Aydınlatma Metni</a>
                                {" "}ve{" "}
                                <a href="/privacy" className="text-pink-400 hover:text-pink-300 underline transition-colors">Gizlilik Politikası</a>
                                {" "}sayfalarımız incelenebilir.
                            </p>
                        </section>

                        {/* MADDE 13 */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">MADDE 13 — UYUŞMAZLIK ÇÖZÜMÜ</h2>
                            <div className="space-y-2 text-sm">
                                <p>
                                    İşbu sözleşmeden doğan uyuşmazlıklarda, Ticaret Bakanlığı tarafından ilan edilen değere kadar
                                    Tüketici Hakem Heyetleri, bu değerin üzerindeki uyuşmazlıklarda Tüketici Mahkemeleri yetkilidir
                                    (6502 sayılı Kanun m. 68).
                                </p>
                                <p>
                                    Alıcı, şikâyet ve itirazlarını ayrıca Ticaret Bakanlığı Tüketici Şikâyet Hattı (ALO 175) ve
                                    Tüketici Bilgi Sistemi (TÜBİS) üzerinden iletebilir.
                                </p>
                                <p>
                                    Platform, taraflar arasındaki uyuşmazlıkların çözümünde arabuluculuk desteği sağlayabilir ancak
                                    nihai karar yetkisi yasal mercilere aittir.
                                </p>
                            </div>
                        </section>

                        {/* MADDE 14 */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">MADDE 14 — YÜRÜRLÜK</h2>
                            <div className="space-y-2 text-sm">
                                <p>
                                    İşbu sözleşme, Alıcı tarafından sipariş onayının verilmesi ile birlikte elektronik ortamda
                                    kurulmuş ve yürürlüğe girmiş sayılır.
                                </p>
                                <p>
                                    Sözleşmenin bir nüshası Alıcı'nın kayıtlı e-posta adresine gönderilir ve Platform'da
                                    Alıcı'nın hesap bilgileri altında erişilebilir durumda tutulur.
                                </p>
                                <p>
                                    Giyenden.com, işbu sözleşmeyi ilgili mevzuat değişikliklerine uygun olarak güncelleme
                                    hakkını saklı tutar. Güncellemeler, Platform üzerinden yayınlandığı tarihte yürürlüğe girer.
                                </p>
                            </div>
                        </section>

                        {/* MADDE 15 */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">MADDE 15 — UYGULANACAK HUKUK</h2>
                            <p className="text-sm">
                                İşbu sözleşme, Türkiye Cumhuriyeti kanunlarına tabidir. Sözleşmede hüküm bulunmayan hallerde
                                6502 sayılı Tüketicinin Korunması Hakkında Kanun, Mesafeli Sözleşmeler Yönetmeliği, Türk Borçlar Kanunu
                                ve ilgili mevzuat hükümleri uygulanır.
                            </p>
                        </section>

                        {/* Bilgilendirme Notu */}
                        <section className="bg-gradient-to-r from-pink-500/5 to-purple-500/5 border border-white/10 rounded-xl p-5 mt-4">
                            <p className="text-xs text-gray-400 leading-relaxed">
                                <strong className="text-white">Bilgilendirme:</strong> İşbu Mesafeli Satış Sözleşmesi, 6502 sayılı Tüketicinin Korunması Hakkında Kanun
                                ve 27 Kasım 2014 tarihli Mesafeli Sözleşmeler Yönetmeliği (son değişiklik: 23 Ağustos 2022) hükümleri çerçevesinde
                                hazırlanmıştır. Sözleşme, Platform üzerinden gerçekleştirilen her satış işlemi için ayrı ayrı geçerlidir.
                                Alıcı, sipariş onayı vererek işbu sözleşmenin tüm maddelerini okuduğunu, anladığını ve kabul ettiğini beyan eder.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
}
