import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import {
    Heart,
    Leaf,
    Users,
    Sparkles,
    Target,
    ArrowRight,
    Globe,
    ShieldCheck,
} from "lucide-react";

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
    }),
};

export default function About() {
    return (
        <Layout>
            <SEO
                title="Hakkımızda | Giyenden"
                description="Giyenden, kadın dayanışması ve sürdürülebilir moda ilkeleriyle kurulan Türkiye'nin ilk kadın odaklı 2. el moda platformudur."
                url="https://giyenden.com/about"
            />

            {/* ── Hero ── */}
            <section className="relative min-h-[50vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden pt-20 pb-10 md:pt-24 md:pb-16">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-950/40 via-background to-purple-950/30 pointer-events-none" />
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
                    <motion.h1
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={0}
                        className="text-4xl md:text-7xl font-black tracking-tight mb-4 md:mb-6 leading-tight"
                    >
                        Her{" "}
                        <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                            'eski'
                        </span>{" "}
                        parçada birileri hâlâ güzeldir.
                    </motion.h1>

                    <motion.p
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={2}
                        className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
                    >
                        Giyenden, modayı dayanışmaya, atığı değere, bireysel tercihi kolektif
                        bir farkındalığa dönüştüren bir platformdur.
                    </motion.p>
                    <motion.p
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={3}
                        className="mt-5 text-base text-muted-foreground/80 max-w-2xl mx-auto"
                    >
                        <span
                            className="relative inline-block font-medium text-foreground/90"
                            style={{
                                textDecoration: "underline",
                                textDecorationColor: "rgba(236,72,153,0.55)",
                                textDecorationThickness: "2px",
                                textUnderlineOffset: "5px",
                            }}
                        >
                            Giyenden, 20 yaşında bir üniversite öğrencisinin projesidir.
                        </span>
                    </motion.p>
                </div>
            </section>


            {/* ── Değerler ── */}
            <section className="py-12 md:py-20 bg-card/30 border-y border-border">
                <div className="container mx-auto px-4 max-w-6xl">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        className="text-center mb-8 md:mb-16"
                    >
                        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                            Bizi Biz Yapan
                        </p>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight">
                            Temel Değerlerimiz
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                        {[
                            {
                                icon: <Heart className="w-5 h-5 md:w-7 md:h-7" />,
                                color: "pink",
                                title: "Kadın Dayanışması",
                                body: `Giyenden, kadınların birbirini desteklediği bir ekosistem kurmak üzerine inşa edilmiştir. Her satış bir kadın girişimcinin kazancıdır; her satın alma başka bir kadına güçlenme fırsatı sunmaktır. Burada rekabet yoktur — birlikte büyüme vardır.`,
                            },
                            {
                                icon: <Leaf className="w-5 h-5 md:w-7 md:h-7" />,
                                color: "green",
                                title: "Sürdürülebilir Moda",
                                body: `Küresel tekstil endüstrisi, dünyanın ikinci büyük kirleticisidir. Her ikinci el parça satıldığında, yeni bir ürünün üretilmesine gerek kalmaz. Giyenden'de gerçekleşen her işlem, karbon ayak izinizi küçültür ve döngüsel ekonomiye katkı sağlar.`,
                            },
                            {
                                icon: <Users className="w-5 h-5 md:w-7 md:h-7" />,
                                color: "purple",
                                title: "Feminist Perspektif",
                                body: `Moda endüstrisi, tarihsel olarak kadın bedeni ve emeği üzerine kurulmuştur — çoğunlukla kadınlar aleyhine. Giyenden bu denklemi tersine çevirir: Kadınlar burada hem üreticidir hem tüketici, hem satıcı hem alıcı. Kendi ekonomilerini kendileri kurarlar.`,
                            },
                        ].map((card, i) => (
                            <motion.div
                                key={card.title}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                custom={i}
                                className={`group relative flex flex-row md:flex-col items-start gap-4 p-5 md:p-8 rounded-2xl md:rounded-3xl border bg-card hover:border-${card.color}-500/30 transition-all duration-300`}
                            >
                                <div
                                    className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-${card.color}-500/10 flex items-center justify-center text-${card.color}-400 shrink-0 md:mb-4 group-hover:scale-110 transition-transform`}
                                >
                                    {card.icon}
                                </div>
                                <div>
                                    <h3 className="text-base md:text-xl font-bold mb-1 md:mb-3">{card.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed text-xs md:text-sm">
                                        {card.body}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Hedef Kitle ── */}
            <section className="py-12 md:py-20 bg-card/30 border-y border-border">
                <div className="container mx-auto px-4 max-w-5xl">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        className="text-center mb-8 md:mb-14"
                    >
                        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                            Kimin İçin?
                        </p>
                        <h2 className="text-4xl font-black tracking-tight">
                            Giyenden Kiminle<br />
                            <span className="text-primary">Büyüyecek?</span>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                        {[
                            { emoji: "🎓", title: "Öğrenciler", desc: "Bütçesini yönetirken tarzından ödün vermeyen genç kadınlar." },
                            { emoji: "💼", title: "Çalışan Kadınlar", desc: "Dolaptaki değeri nakde çevirmek isteyen profesyoneller." },
                            { emoji: "🌱", title: "Çevre Bilinçliler", desc: "Hızlı modayı reddeden, sürdürülebilirliğe inanan bireyler." },
                            { emoji: "💜", title: "Topluluk Önderleri", desc: "Kadın dayanışmasını günlük pratiklere taşıyan aktivistler." },
                        ].map((item, i) => (
                            <motion.div
                                key={item.title}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                custom={i}
                                className="text-center p-4 md:p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all"
                            >
                                <div className="text-2xl md:text-4xl mb-2 md:mb-4">{item.emoji}</div>
                                <h4 className="text-sm md:text-base font-bold mb-1 md:mb-2">{item.title}</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Vizyon & Misyon ── */}
            <section className="py-12 md:py-24 container mx-auto px-4 max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        className="p-6 md:p-10 rounded-2xl md:rounded-3xl bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20 space-y-3 md:space-y-4"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Target className="w-6 h-6 text-pink-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-pink-400">Misyonumuz</span>
                        </div>
                        <h3 className="text-2xl font-black leading-tight">
                            Gardırobunuzu<br />Değere Dönüştürün
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Giyenden'in misyonu; kadınlara kendi ekonomik özgürlüklerini
                            inşa edecekleri güvenli, şeffaf ve ilham verici bir platform
                            sağlamaktır. Kullanılmayan her kıyafeti yeniden dolaşıma
                            kazandırırken, aralarındaki dayanışmayı da güçlendiririz.
                        </p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        custom={1}
                        className="p-6 md:p-10 rounded-2xl md:rounded-3xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 space-y-3 md:space-y-4"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Globe className="w-6 h-6 text-purple-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Vizyonumuz</span>
                        </div>
                        <h3 className="text-2xl font-black leading-tight">
                            Modada Adalet,<br />Doğada Denge
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Türkiye'nin en büyük kadın odaklı döngüsel moda topluluğunu
                            kurmayı hedefliyoruz. Yalnızca bir pazar yeri değil; feminist
                            değerleri, çevre bilincini ve ekonomik güçlenmeyi bir araya
                            getiren bir hareket inşa etmek istiyoruz.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ── Taahhütler ── */}
            <section className="py-12 md:py-24 container mx-auto px-4 max-w-4xl">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="text-center mb-6 md:mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3 md:mb-4">
                        Size Verdiğimiz Söz
                    </h2>
                    <p className="text-muted-foreground">
                        Giyenden yalnızca bir platform değil, bir taahhüttür.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    {[
                        { icon: <ShieldCheck className="w-5 h-5 text-green-400" />, title: "Güvenli Alan", desc: "Tüm kullanıcılar kimlik doğrulamasından geçer. İçerikler admin denetiminden geçer. Rahatsız edici davranışlar anında raporlanabilir." },
                        { icon: <Heart className="w-5 h-5 text-pink-400" />, title: "Kadın Önce İlkesi", desc: "Tüm kararlarımızda ve tasarımımızda kadın deneyimini merkeze alırız. Platformumuz kadınlar tarafından, kadınlar için şekillendirilir." },
                        { icon: <Leaf className="w-5 h-5 text-emerald-400" />, title: "Çevre Sorumluluğu", desc: "Her işlemde çevresel etkiyi minimize etmeyi hedefleriz. Dijital altyapımızı da mümkün olduğunca karbon açısından verimli tutarız." },
                        { icon: <Sparkles className="w-5 h-5 text-purple-400" />, title: "Sürekli Gelişim", desc: "Giyenden büyüdükçe değerlerimiz büyüyecek. Topluluk geri bildirimleri her zaman yol haritamızı şekillendirecek." },
                    ].map((item, i) => (
                        <motion.div
                            key={item.title}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            custom={i}
                            className="flex items-start gap-3 md:gap-5 p-4 md:p-6 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all group"
                        >
                            <div className="p-3 rounded-xl bg-muted group-hover:scale-110 transition-transform shrink-0">
                                {item.icon}
                            </div>
                            <div>
                                <h4 className="text-sm md:text-base font-bold mb-1">{item.title}</h4>
                                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-12 md:py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-950/30 to-purple-950/30 pointer-events-none" />
                <div className="container mx-auto px-4 max-w-3xl text-center relative z-10">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <div className="text-4xl md:text-5xl mb-4 md:mb-6">💜</div>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 md:mb-6">
                            Harekete Katıl
                        </h2>
                        <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
                            Gardırobun bir hikâye anlatır. Bizi seç; o hikâyenin sürdürülebilir,
                            dayanışmacı ve özgür bir bölümünü yaz.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/products"
                                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-full shadow-lg shadow-pink-500/25 transition-all hover:scale-105 active:scale-95"
                            >
                                Koleksiyonu Keşfet <ArrowRight className="w-4 h-4" />
                            </Link>
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent("open-register", { detail: { role: "seller" } }))}
                                className="flex items-center gap-2 px-8 py-4 border border-border hover:border-primary/50 text-foreground font-semibold rounded-full transition-all hover:bg-primary/5"
                            >
                                Satıcı Ol
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </Layout >
    );
}
