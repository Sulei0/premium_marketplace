import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Loader2, ArrowLeft, Save, Eye, X, Plus, PenLine,
    Bold, Italic, Heading2, Heading3, List, ListOrdered,
    Quote, Link2, Image, Code2, FileText, Minus
} from "lucide-react";
import { toast } from "sonner";
import { marked } from "marked";

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
    const [content, setContent] = useState(""); // Stored as markdown
    const [coverImage, setCoverImage] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [isPublished, setIsPublished] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showMarkdownImport, setShowMarkdownImport] = useState(false);
    const [markdownImportText, setMarkdownImportText] = useState("");

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Convert markdown to HTML for preview
    const renderedHtml = useMemo(() => {
        if (!content) return "";
        return marked.parse(content, { async: false }) as string;
    }, [content]);

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

    // ── Markdown toolbar helpers ──
    const insertMarkdown = useCallback((before: string, after: string = "", placeholder: string = "") => {
        const ta = textareaRef.current;
        if (!ta) return;

        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const selectedText = content.substring(start, end);
        const insertText = selectedText || placeholder;

        const newContent =
            content.substring(0, start) +
            before + insertText + after +
            content.substring(end);

        setContent(newContent);

        // Set cursor position after insert
        setTimeout(() => {
            ta.focus();
            const cursorPos = start + before.length + insertText.length + after.length;
            ta.setSelectionRange(
                selectedText ? cursorPos : start + before.length,
                selectedText ? cursorPos : start + before.length + insertText.length
            );
        }, 0);
    }, [content]);

    const insertLinePrefix = useCallback((prefix: string) => {
        const ta = textareaRef.current;
        if (!ta) return;

        const start = ta.selectionStart;
        const lineStart = content.lastIndexOf("\n", start - 1) + 1;
        const newContent = content.substring(0, lineStart) + prefix + content.substring(lineStart);
        setContent(newContent);

        setTimeout(() => {
            ta.focus();
            ta.setSelectionRange(start + prefix.length, start + prefix.length);
        }, 0);
    }, [content]);

    const toolbarActions = [
        { icon: Bold, label: "Kalın", action: () => insertMarkdown("**", "**", "kalın metin") },
        { icon: Italic, label: "İtalik", action: () => insertMarkdown("*", "*", "italik metin") },
        { type: "divider" as const },
        { icon: Heading2, label: "Başlık 2", action: () => insertLinePrefix("## ") },
        { icon: Heading3, label: "Başlık 3", action: () => insertLinePrefix("### ") },
        { type: "divider" as const },
        { icon: List, label: "Liste", action: () => insertLinePrefix("- ") },
        { icon: ListOrdered, label: "Sıralı Liste", action: () => insertLinePrefix("1. ") },
        { icon: Quote, label: "Alıntı", action: () => insertLinePrefix("> ") },
        { type: "divider" as const },
        {
            icon: Link2, label: "Link", action: () => {
                const url = prompt("Link URL'si:");
                if (url) insertMarkdown("[", `](${url})`, "link metni");
            }
        },
        {
            icon: Image, label: "Görsel", action: () => {
                const url = prompt("Görsel URL'si:");
                if (url) insertMarkdown(`![`, `](${url})`, "açıklama");
            }
        },
        { type: "divider" as const },
        { icon: Minus, label: "Ayırıcı", action: () => insertMarkdown("\n---\n", "") },
    ];

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
            content, // Saved as raw markdown
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
        <div className="max-w-5xl mx-auto space-y-6">
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
                        onClick={() => setShowMarkdownImport(true)}
                        className="gap-1.5"
                    >
                        <Code2 className="w-4 h-4" />
                        Markdown İçe Aktar
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                        className={`gap-1.5 ${showPreview ? 'border-purple-500 text-purple-400' : ''}`}
                    >
                        {showPreview ? <PenLine className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

            {/* Markdown Import Modal */}
            {showMarkdownImport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Code2 className="w-5 h-5 text-purple-400" />
                                <h2 className="text-lg font-bold">Markdown İçe Aktar</h2>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowMarkdownImport(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                            SEO aracından kopyaladığınız markdown metni aşağıya yapıştırın.
                        </p>
                        <Textarea
                            value={markdownImportText}
                            onChange={(e) => setMarkdownImportText(e.target.value)}
                            placeholder={`# Başlık\n\nParagraf metni...\n\n## Alt Başlık\n\n- Liste öğesi\n\n| Kategori | Açıklama |\n|----------|----------|\n| Moda     | Detay    |`}
                            rows={14}
                            className="font-mono text-sm bg-secondary/30 flex-1 resize-none"
                        />
                        <div className="flex items-center justify-between mt-4">
                            {content && (
                                <p className="text-xs text-orange-400">
                                    ⚠️ Mevcut içeriğin üzerine yazılacak.
                                </p>
                            )}
                            <div className="flex gap-2 ml-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => { setShowMarkdownImport(false); setMarkdownImportText(""); }}
                                >
                                    İptal
                                </Button>
                                <Button
                                    size="sm"
                                    className="gap-1.5 bg-purple-600 hover:bg-purple-500"
                                    onClick={() => {
                                        if (!markdownImportText.trim()) {
                                            toast.error("Markdown içeriği boş.");
                                            return;
                                        }
                                        setContent(markdownImportText);
                                        setShowMarkdownImport(false);
                                        setMarkdownImportText("");
                                        toast.success("Markdown başarıyla içe aktarıldı!");
                                    }}
                                >
                                    <FileText className="w-4 h-4" />
                                    İçe Aktar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Form Fields */}
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
                    <Input
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        placeholder="https://..."
                    />
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

                {/* Content — Editor or Preview */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        İçerik
                    </label>

                    {showPreview ? (
                        /* ── Preview ── */
                        <div className="rounded-xl border border-border bg-card p-8">
                            {coverImage && (
                                <img src={coverImage} alt="" className="w-full h-64 object-cover rounded-xl mb-6" />
                            )}
                            <h1 className="text-4xl font-black tracking-tight mb-4">{title || "Başlıksız"}</h1>
                            {excerpt && <p className="text-lg text-muted-foreground mb-4 italic border-l-4 border-primary/30 pl-4">{excerpt}</p>}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {tags.map((t) => (
                                    <Badge key={t} variant="secondary">{t}</Badge>
                                ))}
                            </div>
                            <div
                                className="prose prose-invert max-w-none prose-lg prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-blockquote:border-l-primary/30 prose-blockquote:text-muted-foreground prose-strong:text-foreground prose-table:w-full prose-table:border-collapse prose-th:border prose-th:border-border prose-th:bg-secondary/30 prose-th:px-4 prose-th:py-3 prose-th:text-left prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-3"
                                dangerouslySetInnerHTML={{ __html: renderedHtml }}
                            />
                        </div>
                    ) : (
                        /* ── Editor with Toolbar ── */
                        <div className="rounded-xl border border-border overflow-hidden bg-card">
                            {/* Toolbar */}
                            <div className="flex items-center gap-0.5 p-2 border-b border-border bg-secondary/30 flex-wrap">
                                {toolbarActions.map((item, i) => {
                                    if ('type' in item && item.type === 'divider') {
                                        return <div key={i} className="w-px h-6 bg-border mx-1" />;
                                    }
                                    const Icon = (item as any).icon;
                                    return (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={(item as any).action}
                                            title={(item as any).label}
                                            className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <Icon className="w-4 h-4" />
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Textarea */}
                            <textarea
                                ref={textareaRef}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder={`Yazının içeriğini buraya yazın veya "Markdown İçe Aktar" ile yapıştırın...`}
                                className="w-full min-h-[450px] p-6 bg-transparent text-foreground text-base leading-relaxed resize-y focus:outline-none font-mono placeholder:text-muted-foreground/40"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
