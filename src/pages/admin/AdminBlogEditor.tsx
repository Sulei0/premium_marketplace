import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Save, Eye, Upload, X, Plus } from "lucide-react";
import { toast } from "sonner";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
        .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
        .replace(/^-+|-+$/g, "");
}

const quillModules = {
    toolbar: [
        [{ header: [2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote"],
        ["link", "image"],
        ["clean"],
    ],
};

const quillFormats = [
    "header", "bold", "italic", "underline", "strike",
    "list", "bullet", "blockquote", "link", "image",
];

export default function AdminBlogEditor() {
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [slugManual, setSlugManual] = useState(false);
    const [excerpt, setExcerpt] = useState("");
    const [content, setContent] = useState("");
    const [coverImage, setCoverImage] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [isPublished, setIsPublished] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Auto-generate slug from title
    useEffect(() => {
        if (!slugManual && !isEditMode) {
            setSlug(slugify(title));
        }
    }, [title, slugManual, isEditMode]);

    // Load post for editing
    useEffect(() => {
        if (!isEditMode) return;
        async function load() {
            const { data, error } = await supabase
                .from("blog_posts")
                .select("*")
                .eq("id", id)
                .single();

            if (error || !data) {
                toast.error("Yazı bulunamadı.");
                navigate("/admin/blog");
                return;
            }

            setTitle(data.title);
            setSlug(data.slug);
            setSlugManual(true);
            setExcerpt(data.excerpt || "");
            setContent(data.content || "");
            setCoverImage(data.cover_image || "");
            setTags(data.tags || []);
            setIsPublished(data.is_published);
            setLoading(false);
        }
        load();
    }, [id, isEditMode]);

    const addTag = () => {
        const t = tagInput.trim().toLowerCase();
        if (t && !tags.includes(t)) {
            setTags([...tags, t]);
        }
        setTagInput("");
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };

    const handleSave = async (publish?: boolean) => {
        if (!title.trim()) {
            toast.error("Başlık zorunludur.");
            return;
        }
        if (!slug.trim()) {
            toast.error("Slug oluşturulamadı.");
            return;
        }

        setSaving(true);
        const publishState = publish !== undefined ? publish : isPublished;

        const postData = {
            title: title.trim(),
            slug: slug.trim(),
            excerpt: excerpt.trim() || null,
            content,
            cover_image: coverImage.trim() || null,
            tags,
            is_published: publishState,
            updated_at: new Date().toISOString(),
        };

        try {
            if (isEditMode) {
                const { error } = await supabase
                    .from("blog_posts")
                    .update(postData)
                    .eq("id", id);
                if (error) throw error;
                toast.success("Yazı güncellendi!");
            } else {
                const { error } = await supabase
                    .from("blog_posts")
                    .insert({ ...postData, author_id: user?.id });
                if (error) throw error;
                toast.success(publishState ? "Yazı yayınlandı!" : "Taslak kaydedildi!");
            }
            navigate("/admin/blog");
        } catch (error: any) {
            toast.error("Kayıt başarısız: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/admin/blog")}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isEditMode ? "Yazıyı Düzenle" : "Yeni Yazı"}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                        className="gap-1.5"
                    >
                        <Eye className="w-4 h-4" />
                        {showPreview ? "Editör" : "Önizleme"}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSave(false)}
                        disabled={saving}
                        className="gap-1.5"
                    >
                        <Save className="w-4 h-4" />
                        Taslak Kaydet
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => handleSave(true)}
                        disabled={saving}
                        className="gap-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500"
                    >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Yayınla
                    </Button>
                </div>
            </div>

            {showPreview ? (
                /* ── Preview Mode ── */
                <div className="bg-card border border-border rounded-xl p-8 space-y-6">
                    {coverImage && (
                        <img src={coverImage} alt="" className="w-full h-64 object-cover rounded-xl" />
                    )}
                    <h1 className="text-4xl font-black tracking-tight">{title || "Başlıksız"}</h1>
                    {excerpt && <p className="text-lg text-muted-foreground">{excerpt}</p>}
                    <div className="flex flex-wrap gap-2">
                        {tags.map((t) => (
                            <Badge key={t} variant="secondary">{t}</Badge>
                        ))}
                    </div>
                    <div
                        className="prose prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
            ) : (
                /* ── Editor Mode ── */
                <div className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Başlık</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Yazının başlığı..."
                            className="text-lg font-semibold h-12"
                        />
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            URL Slug
                            <span className="text-muted-foreground/60 normal-case ml-2">(/kose/{slug || "..."})</span>
                        </label>
                        <Input
                            value={slug}
                            onChange={(e) => { setSlug(slugify(e.target.value)); setSlugManual(true); }}
                            placeholder="url-slug"
                            className="font-mono text-sm"
                        />
                    </div>

                    {/* Cover Image */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kapak Görseli (URL)</label>
                        <div className="flex gap-2">
                            <Input
                                value={coverImage}
                                onChange={(e) => setCoverImage(e.target.value)}
                                placeholder="https://..."
                                className="flex-1"
                            />
                        </div>
                        {coverImage && (
                            <img src={coverImage} alt="" className="h-32 w-full object-cover rounded-lg border border-border mt-2" />
                        )}
                    </div>

                    {/* Excerpt */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kısa Özet</label>
                        <Textarea
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            placeholder="Bu yazı hakkında kısa bir açıklama..."
                            rows={2}
                        />
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Etiketler</label>
                        <div className="flex gap-2">
                            <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                                placeholder="Etiket ekle..."
                                className="flex-1"
                            />
                            <Button variant="outline" size="sm" onClick={addTag} className="gap-1">
                                <Plus className="w-3 h-3" /> Ekle
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                                    {tag}
                                    <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Content Editor */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">İçerik</label>
                        <div className="rounded-xl border border-border overflow-hidden bg-card [&_.ql-toolbar]:bg-secondary/50 [&_.ql-toolbar]:border-border [&_.ql-container]:border-none [&_.ql-editor]:min-h-[400px] [&_.ql-editor]:text-foreground [&_.ql-editor]:text-base [&_.ql-editor]:leading-relaxed [&_.ql-snow_.ql-stroke]:stroke-muted-foreground [&_.ql-snow_.ql-fill]:fill-muted-foreground [&_.ql-snow_.ql-picker-label]:text-muted-foreground [&_.ql-snow_.ql-picker-options]:bg-card [&_.ql-snow_.ql-picker-options]:border-border [&_.ql-editor.ql-blank::before]:text-muted-foreground/40">
                            <ReactQuill
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={quillModules}
                                formats={quillFormats}
                                placeholder="Yazının içeriğini buraya yazın..."
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
