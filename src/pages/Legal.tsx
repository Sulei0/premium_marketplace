import { usePageMeta } from "@/hooks/usePageMeta";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function TermsOfService() {
    usePageMeta("Kullanıcı Sözleşmesi");

    return (
        <Layout>
            <div className="container mx-auto px-4 py-16 max-w-3xl min-h-[60vh]">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8">
                        <ArrowLeft className="w-4 h-4" /> Ana Sayfaya Dön
                    </Link>
                    <h1 className="text-3xl font-bold mb-8">Kullanıcı Sözleşmesi</h1>
                    <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
                        <h2 className="text-xl font-semibold text-foreground">1. Taraflar</h2>
                        <p>
                            Bu sözleşme, Giyenden platformunu kullanan tüm kullanıcılar ("Kullanıcı") ile
                            Giyenden ("Platform") arasında, Kullanıcı'nın Platforma kayıt olması ile
                            birlikte yürürlüğe girer.
                        </p>

                        <h2 className="text-xl font-semibold text-foreground">2. Hizmet Kapsamı</h2>
                        <p>
                            Platform, kullanıcılar arasında kişisel eşyaların alım-satımına aracılık eden
                            bir C2C (Consumer-to-Consumer) pazar yeri hizmeti sunar. Platform, satılan ürünlerin
                            sahibi veya satıcısı değildir.
                        </p>

                        <h2 className="text-xl font-semibold text-foreground">3. Üyelik ve Hesap Güvenliği</h2>
                        <p>
                            Kullanıcılar 18 yaşından büyük olmalıdır. Hesap bilgilerin gizliliğinden
                            Kullanıcı sorumludur. Platform, hesap güvenliği ihlallerinden kaynaklanan
                            zararlardan sorumlu tutulamaz.
                        </p>

                        <h2 className="text-xl font-semibold text-foreground">4. Ürün İlanları</h2>
                        <p>
                            Kullanıcılar, yalnızca yasal düzenlemelere uygun ürünleri listeleyebilir.
                            Platform, uygunsuz içerikleri önceden haber vermeksizin kaldırma hakkını saklı tutar.
                        </p>

                        <h2 className="text-xl font-semibold text-foreground">5. Ödeme ve İadeler</h2>
                        <p>
                            Ödemeler, Platform tarafından belirlenen güvenli ödeme yöntemleri üzerinden
                            gerçekleştirilir. İade ve iptal koşulları, her işleme özel olarak belirlenir.
                        </p>

                        <h2 className="text-xl font-semibold text-foreground">6. Sorumluluk Sınırı</h2>
                        <p>
                            Platform, kullanıcılar arası işlemlerden doğan anlaşmazlıklarda doğrudan
                            taraf değildir. Ancak arabuluculuk hizmeti sunabilir.
                        </p>

                        <p className="text-xs text-muted-foreground/60 pt-8 border-t border-border">
                            Son güncelleme: Şubat 2026 · Bu sözleşme örnek amaçlıdır ve yasal danışmanlık yerine geçmez.
                        </p>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
}

export function PrivacyPolicy() {
    usePageMeta("Gizlilik Politikası");

    return (
        <Layout>
            <div className="container mx-auto px-4 py-16 max-w-3xl min-h-[60vh]">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8">
                        <ArrowLeft className="w-4 h-4" /> Ana Sayfaya Dön
                    </Link>
                    <h1 className="text-3xl font-bold mb-8">Gizlilik Politikası</h1>
                    <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
                        <h2 className="text-xl font-semibold text-foreground">1. Toplanan Veriler</h2>
                        <p>
                            Platform; e-posta adresi, kullanıcı adı ve profil bilgileri gibi işlem için
                            gerekli minimum veriyi toplar. Ödeme bilgileri üçüncü taraf ödeme sağlayıcıları
                            tarafından işlenir ve Platform'da saklanmaz.
                        </p>

                        <h2 className="text-xl font-semibold text-foreground">2. Veri Kullanımı</h2>
                        <p>
                            Toplanan veriler; hizmet sunumu, kullanıcı deneyiminin iyileştirilmesi,
                            güvenlik önlemleri ve yasal yükümlülükler kapsamında kullanılır.
                        </p>

                        <h2 className="text-xl font-semibold text-foreground">3. Çerezler</h2>
                        <p>
                            Platform, oturum yönetimi ve kullanıcı tercihlerini kaydetmek amacıyla çerezler
                            kullanır. Analitik çerezler yalnızca kullanıcı onayı ile aktifleştirilir.
                        </p>

                        <h2 className="text-xl font-semibold text-foreground">4. Veri Güvenliği</h2>
                        <p>
                            Tüm veriler SSL/TLS şifreleme ile korunur. Kullanıcı parolaları
                            tek yönlü hash algoritmaları ile saklanır.
                        </p>

                        <h2 className="text-xl font-semibold text-foreground">5. Üçüncü Taraflarla Paylaşım</h2>
                        <p>
                            Kişisel veriler, yasal zorunluluklar ve hizmet sağlayıcı gereksinimler dışında
                            üçüncü taraflarla paylaşılmaz.
                        </p>

                        <p className="text-xs text-muted-foreground/60 pt-8 border-t border-border">
                            Son güncelleme: Şubat 2026 · Bu politika örnek amaçlıdır ve yasal danışmanlık yerine geçmez.
                        </p>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
}

export function KVKKPolicy() {
    usePageMeta("KVKK Aydınlatma Metni");

    return (
        <Layout>
            <div className="container mx-auto px-4 py-16 max-w-3xl min-h-[60vh]">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8">
                        <ArrowLeft className="w-4 h-4" /> Ana Sayfaya Dön
                    </Link>
                    <h1 className="text-3xl font-bold mb-8">KVKK Aydınlatma Metni</h1>
                    <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
                        <h2 className="text-xl font-semibold text-foreground">Veri Sorumlusu</h2>
                        <p>
                            6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında,
                            Giyenden platformu veri sorumlusu sıfatıyla hareket etmektedir.
                        </p>

                        <h2 className="text-xl font-semibold text-foreground">İşlenen Kişisel Veriler</h2>
                        <p>
                            Kimlik bilgileri (ad-soyad, kullanıcı adı), iletişim bilgileri (e-posta adresi),
                            işlem güvenliği bilgileri (IP adresi, log kayıtları) işlenmektedir.
                        </p>

                        <h2 className="text-xl font-semibold text-foreground">İşleme Amaçları</h2>
                        <p>
                            Üyelik işlemlerinin yürütülmesi, hizmet sunumu, güvenlik tedbirlerinin alınması,
                            yasal yükümlülüklerin yerine getirilmesi amacıyla kişisel verileriniz işlenmektedir.
                        </p>

                        <h2 className="text-xl font-semibold text-foreground">Veri Aktarımı</h2>
                        <p>
                            Kişisel verileriniz; yasal zorunluluklar, hizmet sağlayıcılar ve ödeme
                            kuruluşları ile sınırlı olarak paylaşılabilir.
                        </p>

                        <h2 className="text-xl font-semibold text-foreground">Haklarınız</h2>
                        <p>
                            KVKK'nın 11. maddesi kapsamında; kişisel verilerinizin işlenip işlenmediğini
                            öğrenme, düzeltilmesini veya silinmesini talep etme haklarına sahipsiniz.
                            Başvurularınızı destek@giyenden.com adresine iletebilirsiniz.
                        </p>

                        <p className="text-xs text-muted-foreground/60 pt-8 border-t border-border">
                            Son güncelleme: Şubat 2026 · Bu metin örnek amaçlıdır ve yasal danışmanlık yerine geçmez.
                        </p>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
}
