import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  MessageCircle,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  Reply,
  ShieldBan,
  Crown,
  AlertTriangle,
  Clock,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useBlock } from "@/contexts/BlockContext";
import { getOptimizedAvatarUrl } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

/* ─── Types ─── */
interface Comment {
  id: string;
  product_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  commenter?: {
    username: string;
    avatar_url?: string | null;
  };
  replies?: Comment[];
}

/* ─── Constants ─── */
const MAX_COMMENTS_PER_USER = 5; // Max comments a user can post per product
const COOLDOWN_SECONDS = 30; // Cooldown between consecutive comments
const MAX_COMMENT_LENGTH = 500;
const COMMENTS_PER_PAGE = 10;

/* ─── Styles ─── */
const commentStyles = `
@keyframes comment-slide-in {
  0% { opacity: 0; transform: translateY(12px); }
  100% { opacity: 1; transform: translateY(0); }
}
.comment-enter {
  animation: comment-slide-in 0.35s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
}
`;

/* ─── Helper: Time ago ─── */
function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "az önce";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} dk önce`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat önce`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} gün önce`;
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    CommentForm
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function CommentForm({
  productId,
  ownerId,
  parentId = null,
  parentCommentUserId,
  replyingTo,
  onSubmitted,
  onCancel,
  userCommentCount,
}: {
  productId: string;
  ownerId: string;
  parentId?: string | null;
  parentCommentUserId?: string;
  replyingTo?: string;
  onSubmitted: () => void;
  onCancel?: () => void;
  userCommentCount: number;
}) {
  const { user } = useAuth();
  const { isBlocked } = useBlock();
  const [content, setContent] = useState(replyingTo ? `@${replyingTo} ` : "");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto focus on reply
  useEffect(() => {
    if (parentId && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [parentId]);

  if (!user) {
    return (
      <div className="bg-card/30 border border-border/30 rounded-xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Yorum yapmak için{" "}
          <button
            onClick={() => window.dispatchEvent(new Event("open-login"))}
            className="text-primary hover:underline font-medium"
          >
            giriş yapın
          </button>
          .
        </p>
      </div>
    );
  }

  // Block check
  if (isBlocked(ownerId)) {
    return (
      <div className="bg-card/30 border border-border/30 rounded-xl p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldBan className="w-4 h-4 text-red-500" />
          <p className="text-sm">Engelleme nedeniyle yorum yapılamıyor.</p>
        </div>
      </div>
    );
  }

  // Spam limit reached (product owner is exempt — they need to answer questions)
  const isProductOwner = user.id === ownerId;
  if (!isProductOwner && userCommentCount >= MAX_COMMENTS_PER_USER) {
    return (
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 text-amber-400">
          <AlertTriangle className="w-4 h-4" />
          <p className="text-sm font-medium">
            Bu ilan için yorum sınırına ulaştınız ({MAX_COMMENTS_PER_USER}/{MAX_COMMENTS_PER_USER}).
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();

    if (!trimmed) {
      toast({
        title: "Hata",
        description: "Yorum boş olamaz.",
        variant: "destructive",
      });
      return;
    }

    if (trimmed.length > MAX_COMMENT_LENGTH) {
      toast({
        title: "Hata",
        description: `Yorum en fazla ${MAX_COMMENT_LENGTH} karakter olabilir.`,
        variant: "destructive",
      });
      return;
    }

    if (!supabase) return;

    setLoading(true);

    try {
      const { error } = await supabase.from("product_comments").insert({
        product_id: productId,
        user_id: user.id,
        parent_id: parentId,
        content: trimmed,
      });

      if (error) {
        if (error.message.includes("check")) {
          toast({
            title: "Hata",
            description: "Yorum 1-500 karakter arasında olmalıdır.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      // Build list of users to notify (avoid duplicates and self-notifications)
      const notifyUserIds = new Set<string>();

      // Always notify the product owner for any comment
      if (ownerId !== user.id) {
        notifyUserIds.add(ownerId);
      }

      // If this is a reply, also notify the parent comment author
      if (parentId && parentCommentUserId && parentCommentUserId !== user.id) {
        notifyUserIds.add(parentCommentUserId);
      }

      // Send notifications
      const notificationPromises = Array.from(notifyUserIds).map((targetUserId) => {
        const isReplyToUser = parentId && parentCommentUserId === targetUserId;
        return supabase.from("notifications").insert({
          user_id: targetUserId,
          type: isReplyToUser ? "comment_reply" : "new_comment",
          title: isReplyToUser ? "Yorumunuza Yanıt" : "Yeni Yorum",
          body: isReplyToUser
            ? `@${user.user_metadata?.username || "Bir kullanıcı"} yorumunuza yanıt verdi: "${trimmed.substring(0, 60)}${trimmed.length > 60 ? "..." : ""}"`
            : `@${user.user_metadata?.username || "Bir kullanıcı"} ilanınıza yorum yaptı: "${trimmed.substring(0, 60)}${trimmed.length > 60 ? "..." : ""}"`,
          link: `/product/${productId}`,
          is_read: false,
        });
      });

      await Promise.all(notificationPromises);

      setContent("");
      setCooldown(COOLDOWN_SECONDS);
      onSubmitted();

      toast({
        title: "Yorum gönderildi",
        description: "Yorumunuz başarıyla eklendi.",
      });
    } catch (err: any) {
      toast({
        title: "Hata",
        description: err.message || "Yorum gönderilemedi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentId ? "Yanıt yazın..." : "Satıcıya bir soru sorun veya yorum yapın..."}
          maxLength={MAX_COMMENT_LENGTH}
          rows={parentId ? 2 : 3}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none transition-all resize-none"
        />
        <span className="absolute bottom-2 right-3 text-[10px] text-muted-foreground/50 font-mono">
          {content.length}/{MAX_COMMENT_LENGTH}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || cooldown > 0 || !content.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-sm font-semibold rounded-full hover:from-pink-500 hover:to-purple-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-pink-600 disabled:hover:to-purple-600"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : cooldown > 0 ? (
              <Clock className="w-4 h-4" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {cooldown > 0 ? `${cooldown}s bekleyin` : parentId ? "Yanıtla" : "Yorum Yaz"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Vazgeç
            </button>
          )}
        </div>
        {!isProductOwner && (
          <span className="text-[10px] text-muted-foreground/50">
            {userCommentCount}/{MAX_COMMENTS_PER_USER} yorum hakkı
          </span>
        )}
      </div>
    </form>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Single Comment Item
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function CommentItem({
  comment,
  productId,
  ownerId,
  isOwnerComment,
  onReplySubmitted,
  userCommentCount,
  depth = 0,
}: {
  comment: Comment;
  productId: string;
  ownerId: string;
  isOwnerComment: boolean;
  onReplySubmitted: () => void;
  userCommentCount: number;
  depth?: number;
}) {
  const { user, role } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const hasReplies = comment.replies && comment.replies.length > 0;

  // Delete permission: comment author, product owner, or admin
  const canDelete = user && (
    user.id === comment.user_id ||
    user.id === ownerId ||
    role === 'admin'
  );

  const handleDelete = async () => {
    if (!supabase || !user) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('product_comments')
        .delete()
        .eq('id', comment.id);

      if (error) throw error;

      toast({
        title: "Yorum silindi",
        description: "Yorum başarıyla kaldırıldı.",
      });
      onReplySubmitted(); // Refresh comments
    } catch (err: any) {
      toast({
        title: "Hata",
        description: err.message || "Yorum silinemedi.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div
      className={`comment-enter ${depth > 0 ? "ml-4 sm:ml-10 pl-3 sm:pl-4 border-l-2 border-white/5" : ""}`}
    >
      <div className="py-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Link to={`/profile/${comment.user_id}`} className="block shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden hover:opacity-80 transition-opacity ring-2 ring-transparent hover:ring-primary/30">
              {comment.commenter?.avatar_url ? (
                <img
                  src={getOptimizedAvatarUrl(comment.commenter.avatar_url)}
                  alt={comment.commenter.username}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                comment.commenter?.username?.substring(0, 1).toUpperCase() || "?"
              )}
            </div>
          </Link>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={`/profile/${comment.user_id}`}
                className="text-sm font-semibold hover:text-primary transition-colors"
              >
                {comment.commenter?.username || "Anonim"}
              </Link>

              {/* Owner Badge */}
              {isOwnerComment && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <Crown className="w-3 h-3" />
                  İlan Sahibi
                </span>
              )}

              <span className="text-[10px] text-muted-foreground/60">
                {timeAgo(comment.created_at)}
              </span>
            </div>

            {/* Comment Body */}
            <p className="text-sm text-foreground/80 mt-1 leading-relaxed break-words whitespace-pre-wrap">
              {comment.content}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-2">
              {user && depth < 2 && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                >
                  <Reply className="w-3 h-3" />
                  Yanıtla
                </button>
              )}

              {hasReplies && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                >
                  {showReplies ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                  {comment.replies!.length} yanıt
                </button>
              )}

              {/* Delete */}
              {canDelete && !showDeleteConfirm && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground/40 hover:text-red-400 transition-colors p-1 -m-1 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}

              {showDeleteConfirm && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-red-400">Silinsin mi?</span>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-[11px] text-red-500 hover:text-red-400 font-semibold transition-colors disabled:opacity-50"
                  >
                    {deleting ? "..." : "Evet"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Hayır
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-3 ml-8 sm:ml-11">
            <CommentForm
              productId={productId}
              ownerId={ownerId}
              parentId={comment.id}
              parentCommentUserId={comment.user_id}
              replyingTo={comment.commenter?.username}
              onSubmitted={() => {
                setShowReplyForm(false);
                onReplySubmitted();
              }}
              onCancel={() => setShowReplyForm(false)}
              userCommentCount={userCommentCount}
            />
          </div>
        )}

        {/* Replies */}
        {hasReplies && showReplies && (
          <div className="mt-2">
            {comment.replies!.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                productId={productId}
                ownerId={ownerId}
                isOwnerComment={reply.user_id === ownerId}
                onReplySubmitted={onReplySubmitted}
                userCommentCount={userCommentCount}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Main ProductComments Component
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function ProductComments({
  productId,
  ownerId,
}: {
  productId: string;
  ownerId: string;
}) {
  const { user } = useAuth();
  const { isBlocked } = useBlock();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [userCommentCount, setUserCommentCount] = useState(0);
  const [visibleCount, setVisibleCount] = useState(COMMENTS_PER_PAGE);

  const fetchComments = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      // Fetch all comments for this product
      const { data: commentData, error } = await supabase
        .from("product_comments")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (!commentData || commentData.length === 0) {
        setComments([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }

      // Count user comments for spam protection (from UNFILTERED data — so blocking others doesn't give you extra comment slots)
      if (user) {
        const userCount = commentData.filter(
          (c) => c.user_id === user.id
        ).length;
        setUserCommentCount(userCount);
      }

      // Filter out blocked users' comments
      const filteredData = commentData.filter((c) => !isBlocked(c.user_id));

      // Count total (visible comments only)
      setTotalCount(filteredData.length);

      // Fetch commenter profiles
      const userIds = [...new Set(filteredData.map((c) => c.user_id))];
      let profiles: { id: string; username: string; avatar_url: string | null }[] = [];
      if (userIds.length > 0) {
        const { data } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", userIds);
        profiles = data || [];
      }

      const profileMap = new Map(
        profiles?.map((p) => [p.id, p]) || []
      );

      // Build comment tree
      const enriched: Comment[] = filteredData.map((c) => ({
        ...c,
        commenter: profileMap.get(c.user_id) || { username: "Anonim" },
        replies: [],
      }));

      // Organize into tree structure
      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      enriched.forEach((c) => commentMap.set(c.id, c));

      enriched.forEach((c) => {
        if (c.parent_id && commentMap.has(c.parent_id)) {
          commentMap.get(c.parent_id)!.replies!.push(c);
        } else if (!c.parent_id) {
          rootComments.push(c);
        } else {
          // Orphan reply — show as root
          rootComments.push(c);
        }
      });

      setComments(rootComments);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  }, [productId, user, isBlocked]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const visibleComments = comments.slice(0, visibleCount);
  const hasMore = comments.length > visibleCount;

  return (
    <div className="container mx-auto px-4 pb-8 max-w-6xl">
      <style>{commentStyles}</style>

      <div className="bg-card/30 border border-border/30 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border/20 bg-card/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                Yorumlar{" "}
                <span className="text-muted-foreground font-normal">
                  ({totalCount})
                </span>
              </h3>
              <p className="text-[11px] text-muted-foreground/60">
                Satıcıya soru sorun veya yorum yapın
              </p>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="px-5 py-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10">
              <MessageCircle className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground/60">
                Henüz yorum yapılmamış. İlk yorumu siz yapın!
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-border/10">
                {visibleComments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    productId={productId}
                    ownerId={ownerId}
                    isOwnerComment={comment.user_id === ownerId}
                    onReplySubmitted={fetchComments}
                    userCommentCount={userCommentCount}
                  />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center py-4">
                  <button
                    onClick={() =>
                      setVisibleCount((prev) => prev + COMMENTS_PER_PAGE)
                    }
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                    Daha fazla yorum göster ({comments.length - visibleCount} kalan)
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Comment Form */}
        <div className="px-5 py-4 border-t border-border/20 bg-card/50">
          <CommentForm
            productId={productId}
            ownerId={ownerId}
            onSubmitted={fetchComments}
            userCommentCount={userCommentCount}
          />
        </div>
      </div>
    </div>
  );
}
