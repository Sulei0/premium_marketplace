import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Calendar, ArrowLeft, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface BlogPostData {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    cover_image: string | null;
    tags: string[];
    created_at: string;
    updated_at: string;
}

interface RelatedPost {
    id: string;
    title: string;
    slug: string;
    cover_image: string | null;
    created_at: string;
}

export default function BlogPost() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<BlogPostData | null>(null);
    const [related, setRelated] = useState<RelatedPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;
        async function fetch() {
            setLoading(true);
            const { data, error } = await supabase
                .from("blog_posts")
                .select("*")
                .eq("slug", slug)
                .eq("is_published", true)
                .single();

            if (error || !data) {
                setPost(null);
                setLoading(false);
                return;
            }

            setPost(data);

            // Fetch related posts by same tags
            if (data.tags?.length > 0) {
                const { data: relatedData } = await supabase
                    .from("blog_posts")
                    .select("id, title, slug, cover_image, created_at")
                    .eq("is_published", true)
                    .neq("id", data.id)
                    .overlaps("tags", data.tags)
                    .order("created_at", { ascending: false })
                    .limit(3);

                if (relatedData) setRelated(relatedData);
            }

            setLoading(false);
        }
        fetch();
        window.scrollTo(0, 0);
    }, [slug]);

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </Layout>
        );
    }

    if (!post) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                    <h2 className="text-2xl font-bold mb-4">Yazı Bulunamadı</h2>
                    <p className="text-muted-foreground mb-8">Aradığınız yazı mevcut değil veya yayından kaldırılmış olabilir.</p>
                    <Button variant="outline" onClick={() => navigate("/kose")}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Köşe'ye Dön
                    </Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <SEO
                title={`${post.title} | Köşe — Giyenden`}
                description={post.excerpt || post.title}
                image={post.cover_image || undefined}
                url={`https://giyenden.com/kose/${post.slug}`}
            />

            <article className="pt-28 pb-20">
                {/* Header */}
                <div className="container mx-auto px-4 max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Back Link */}
                        <Link
                            to="/kose"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors mb-8"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Köşe'ye Dön
                        </Link>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {(post.tags || []).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
                            {post.title}
                        </h1>

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(post.created_at), "d MMMM yyyy", { locale: tr })}
                            </div>
                        </div>

                        {/* Excerpt */}
                        {post.excerpt && (
                            <p className="text-lg text-muted-foreground leading-relaxed border-l-4 border-primary/30 pl-6 mb-8 italic">
                                {post.excerpt}
                            </p>
                        )}
                    </motion.div>
                </div>

                {/* Cover Image */}
                {post.cover_image && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="container mx-auto px-4 max-w-4xl mb-12"
                    >
                        <img
                            src={post.cover_image}
                            alt={post.title}
                            className="w-full rounded-2xl border border-border object-cover max-h-[500px]"
                        />
                    </motion.div>
                )}

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="container mx-auto px-4 max-w-3xl"
                >
                    <div
                        className="prose prose-invert max-w-none prose-lg prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-blockquote:border-l-primary/30 prose-blockquote:text-muted-foreground prose-strong:text-foreground"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </motion.div>

                {/* Share / Back */}
                <div className="container mx-auto px-4 max-w-3xl mt-16">
                    <Separator className="mb-8" />
                    <div className="flex items-center justify-between">
                        <Link
                            to="/kose"
                            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Tüm Yazılar
                        </Link>
                    </div>
                </div>

                {/* Related Posts */}
                {related.length > 0 && (
                    <div className="container mx-auto px-4 max-w-4xl mt-16">
                        <h3 className="text-xl font-bold mb-6">Benzer Yazılar</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {related.map((r) => (
                                <Link
                                    key={r.id}
                                    to={`/kose/${r.slug}`}
                                    className="group block rounded-xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all"
                                >
                                    <div className="aspect-video bg-secondary/30 overflow-hidden">
                                        {r.cover_image ? (
                                            <img src={r.cover_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-500/10 to-purple-500/10">
                                                <span className="text-3xl opacity-30">📝</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">{r.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {format(new Date(r.created_at), "d MMM yyyy", { locale: tr })}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </article>
        </Layout>
    );
}
