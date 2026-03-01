import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    cover_image: string | null;
    tags: string[];
    created_at: string;
}

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
    }),
};

export default function BlogList() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    useEffect(() => {
        async function fetch() {
            const { data, error } = await supabase
                .from("blog_posts")
                .select("id, title, slug, excerpt, cover_image, tags, created_at")
                .eq("is_published", true)
                .order("created_at", { ascending: false });

            if (!error && data) setPosts(data);
            setLoading(false);
        }
        fetch();
    }, []);

    // Collect all unique tags
    const allTags = [...new Set(posts.flatMap((p) => p.tags || []))];

    const filteredPosts = selectedTag
        ? posts.filter((p) => p.tags?.includes(selectedTag))
        : posts;

    return (
        <Layout>
            <SEO
                title="Köşe | Giyenden"
                description="Sürdürülebilir moda, kadın dayanışması ve bilinçli tüketim üzerine yazılar."
                url="https://giyenden.com/kose"
            />

            {/* Hero */}
            <section className="pt-32 pb-16 container mx-auto px-4 max-w-5xl">
                <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
                        Giyenden Köşesi
                    </p>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4">Köşe</h1>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                        Sürdürülebilir moda, kadın dayanışması ve bilinçli tüketim üzerine derinlemesine yazılar.
                    </p>
                </motion.div>

                {/* Tag Filters */}
                {allTags.length > 0 && (
                    <motion.div
                        initial="hidden" animate="visible" variants={fadeUp} custom={1}
                        className="flex flex-wrap justify-center gap-2 mt-10"
                    >
                        <button
                            onClick={() => setSelectedTag(null)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border ${!selectedTag
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                }`}
                        >
                            Tümü
                        </button>
                        {allTags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border ${selectedTag === tag
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </motion.div>
                )}
            </section>

            {/* Posts Grid */}
            <section className="pb-24 container mx-auto px-4 max-w-5xl">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <p className="text-lg">Henüz yazı yayınlanmadı.</p>
                        <p className="text-sm mt-2">Yakında burada olacağız ✨</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {filteredPosts.map((post, i) => (
                            <motion.div
                                key={post.id}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                custom={i}
                            >
                                <Link
                                    to={`/kose/${post.slug}`}
                                    className="group block rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-300"
                                >
                                    {/* Cover Image */}
                                    <div className="aspect-video bg-secondary/30 overflow-hidden">
                                        {post.cover_image ? (
                                            <img
                                                src={post.cover_image}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-500/10 to-purple-500/10">
                                                <span className="text-5xl opacity-30">📝</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 space-y-3">
                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {(post.tags || []).slice(0, 3).map((tag) => (
                                                <Badge key={tag} variant="secondary" className="text-[10px] font-medium">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>

                                        <h2 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                                            {post.title}
                                        </h2>

                                        {post.excerpt && (
                                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                                {post.excerpt}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between pt-2">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                {format(new Date(post.created_at), "d MMMM yyyy", { locale: tr })}
                                            </div>
                                            <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                Devamını Oku <ArrowRight className="w-3 h-3" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>
        </Layout>
    );
}
