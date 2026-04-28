import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Edit3, Eye, EyeOff, Plus, ExternalLink, Calendar, Tag } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    cover_image: string | null;
    tags: string[];
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export default function AdminBlog() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("blog_posts")
            .select("id, title, slug, excerpt, cover_image, tags, is_published, created_at, updated_at")
            .order("created_at", { ascending: false });

        if (error) {
            toast.error("Yazılar yüklenemedi: " + error.message);
        } else {
            setPosts(data || []);
        }
        setLoading(false);
    };

    useEffect(() => { fetchPosts(); }, []);

    const togglePublish = async (post: BlogPost) => {
        const { error } = await supabase
            .from("blog_posts")
            .update({ is_published: !post.is_published, updated_at: new Date().toISOString() })
            .eq("id", post.id);

        if (error) {
            toast.error("İşlem başarısız: " + error.message);
        } else {
            toast.success(post.is_published ? "Yazı taslağa alındı." : "Yazı yayınlandı!");
            fetchPosts();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu yazıyı kalıcı olarak silmek istediğinize emin misiniz?")) return;

        const { error } = await supabase.from("blog_posts").delete().eq("id", id);
        if (error) {
            toast.error("Silme başarısız: " + error.message);
        } else {
            toast.success("Yazı silindi.");
            fetchPosts();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Köşe Yazıları</h1>
                    <p className="text-muted-foreground text-sm mt-1">Blog içeriklerini yönetin.</p>
                </div>
                <Button
                    onClick={() => navigate("/admin/blog/new")}
                    className="gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    Yeni Yazı
                </Button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                            <TableHead>Görsel</TableHead>
                            <TableHead>Başlık</TableHead>
                            <TableHead>Etiketler</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>Tarih</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <div className="flex justify-center items-center gap-2 text-muted-foreground">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Yükleniyor...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : posts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <p>Henüz yazı yok.</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate("/admin/blog/new")}
                                            className="gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> İlk yazıyı oluştur
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            posts.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell>
                                        <div className="w-16 h-10 rounded-md bg-secondary overflow-hidden border border-border">
                                            {post.cover_image ? (
                                                <img src={post.cover_image} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">—</div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium">{post.title}</span>
                                        <span className="block text-xs text-muted-foreground mt-0.5">/kose/{post.slug}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {(post.tags || []).slice(0, 3).map((tag) => (
                                                <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {post.is_published ? (
                                            <Badge className="bg-green-600 hover:bg-green-700">Yayında</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-muted-foreground">Taslak</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {format(new Date(post.created_at), "d MMM yyyy", { locale: tr })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost" size="icon" className="h-8 w-8"
                                                title={post.is_published ? "Taslağa Al" : "Yayınla"}
                                                onClick={() => togglePublish(post)}
                                            >
                                                {post.is_published ? (
                                                    <EyeOff className="w-4 h-4 text-orange-500" />
                                                ) : (
                                                    <Eye className="w-4 h-4 text-green-500" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost" size="icon" className="h-8 w-8"
                                                title="Düzenle"
                                                onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                                            >
                                                <Edit3 className="w-4 h-4 text-blue-500" />
                                            </Button>
                                            {post.is_published && (
                                                <Button
                                                    variant="ghost" size="icon" className="h-8 w-8"
                                                    title="Sayfada Görüntüle"
                                                    onClick={() => window.open(`/kose/${post.slug}`, '_blank')}
                                                >
                                                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost" size="icon"
                                                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                                title="Sil"
                                                onClick={() => handleDelete(post.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden space-y-3">
                {loading ? (
                    <div className="flex justify-center items-center gap-2 text-muted-foreground py-12">
                        <Loader2 className="w-5 h-5 animate-spin" /> Yükleniyor...
                    </div>
                ) : posts.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
                        <p>Henüz yazı yok.</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/admin/blog/new")}
                            className="gap-1"
                        >
                            <Plus className="w-3 h-3" /> İlk yazıyı oluştur
                        </Button>
                    </div>
                ) : (
                    posts.map((post) => (
                        <div key={post.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-16 h-12 rounded-lg bg-secondary overflow-hidden border border-border shrink-0">
                                    {post.cover_image ? (
                                        <img src={post.cover_image} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">—</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold leading-snug">{post.title}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">/kose/{post.slug}</p>
                                </div>
                            </div>

                            {(post.tags || []).length > 0 && (
                                <div className="flex items-center gap-1 flex-wrap">
                                    <Tag className="w-3 h-3 text-muted-foreground" />
                                    {(post.tags || []).slice(0, 4).map((tag) => (
                                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {post.is_published ? (
                                        <Badge className="bg-green-600 hover:bg-green-700 text-xs">Yayında</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-muted-foreground text-xs">Taslak</Badge>
                                    )}
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(post.created_at), "d MMM yyyy", { locale: tr })}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost" size="icon" className="h-8 w-8"
                                        title={post.is_published ? "Taslağa Al" : "Yayınla"}
                                        onClick={() => togglePublish(post)}
                                    >
                                        {post.is_published ? (
                                            <EyeOff className="w-4 h-4 text-orange-500" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-green-500" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost" size="icon" className="h-8 w-8"
                                        title="Düzenle"
                                        onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                                    >
                                        <Edit3 className="w-4 h-4 text-blue-500" />
                                    </Button>
                                    {post.is_published && (
                                        <Button
                                            variant="ghost" size="icon" className="h-8 w-8"
                                            title="Sayfada Görüntüle"
                                            onClick={() => window.open(`/kose/${post.slug}`, '_blank')}
                                        >
                                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost" size="icon"
                                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                        title="Sil"
                                        onClick={() => handleDelete(post.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
