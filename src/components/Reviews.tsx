import { useState, useEffect } from "react";
import { Star, Send, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface Review {
    id: string;
    reviewer_id: string;
    seller_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    reviewer?: { username: string };
}

/** Star Rating component */
function StarRating({ rating, onChange, interactive = false, size = "w-5 h-5" }: {
    rating: number;
    onChange?: (r: number) => void;
    interactive?: boolean;
    size?: string;
}) {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={!interactive}
                    onClick={() => onChange?.(star)}
                    onMouseEnter={() => interactive && setHover(star)}
                    onMouseLeave={() => interactive && setHover(0)}
                    className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
                >
                    <Star
                        className={`${size} transition-colors ${star <= (hover || rating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-600'
                            }`}
                    />
                </button>
            ))}
        </div>
    );
}

/** Review Form — for submitting a review of a seller */
export function ReviewForm({ sellerId, onReviewSubmitted }: { sellerId: string; onReviewSubmitted?: () => void }) {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [existingReview, setExistingReview] = useState<Review | null>(null);

    // Check for existing review
    useEffect(() => {
        if (!user || !supabase) return;

        async function checkExisting() {
            const { data } = await supabase!
                .from("reviews")
                .select("*")
                .eq("reviewer_id", user!.id)
                .eq("seller_id", sellerId)
                .maybeSingle();

            if (data) {
                setExistingReview(data as Review);
                setRating(data.rating);
                setComment(data.comment || "");
            }
        }
        checkExisting();
    }, [user, sellerId]);

    if (!user || user.id === sellerId) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError("Lütfen bir puan verin.");
            return;
        }
        if (!supabase) return;

        setLoading(true);
        setError(null);

        try {
            if (existingReview) {
                // Update existing
                const { error: updateErr } = await supabase
                    .from("reviews")
                    .update({ rating, comment: comment.trim() || null })
                    .eq("id", existingReview.id);
                if (updateErr) throw updateErr;
            } else {
                // Insert new
                const { error: insertErr } = await supabase
                    .from("reviews")
                    .insert({
                        reviewer_id: user.id,
                        seller_id: sellerId,
                        rating,
                        comment: comment.trim() || null,
                    });
                if (insertErr) throw insertErr;
            }

            setSuccess(true);
            onReviewSubmitted?.();
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || "Bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card/50 border border-border/50 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-pink-400 mb-4">
                {existingReview ? "✏️ Değerlendirmeni Güncelle" : "⭐ Satıcıyı Değerlendir"}
            </h3>

            {success ? (
                <div className="text-center py-4">
                    <p className="text-green-400 font-medium">✅ Değerlendirmeniz kaydedildi!</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    )}

                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Puanınız:</span>
                        <StarRating rating={rating} onChange={setRating} interactive size="w-7 h-7" />
                        {rating > 0 && (
                            <span className="text-sm font-mono text-yellow-400">{rating}/5</span>
                        )}
                    </div>

                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Satıcı hakkında bir yorum bırakın (isteğe bağlı)..."
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-foreground focus:border-pink-500 focus:outline-none transition-colors resize-none"
                    />

                    <button
                        type="submit"
                        disabled={loading || rating === 0}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-sm font-semibold rounded-full hover:from-pink-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {existingReview ? "Güncelle" : "Gönder"}
                    </button>
                </form>
            )}
        </div>
    );
}

/** Review List — displays all reviews for a seller */
export function ReviewList({ sellerId }: { sellerId: string }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [avgRating, setAvgRating] = useState(0);

    const fetchReviews = async () => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        try {
            // Using a subquery approach — fetch reviews then fetch reviewer profiles
            const { data: reviewData } = await supabase
                .from("reviews")
                .select("*")
                .eq("seller_id", sellerId)
                .order("created_at", { ascending: false });

            if (reviewData && reviewData.length > 0) {
                // Fetch reviewer profiles
                const reviewerIds = [...new Set(reviewData.map(r => r.reviewer_id))];
                const { data: profiles } = await supabase
                    .from("profiles")
                    .select("id, username")
                    .in("id", reviewerIds);

                const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

                const enriched = reviewData.map(r => ({
                    ...r,
                    reviewer: profileMap.get(r.reviewer_id) || { username: "Anonim" },
                })) as Review[];

                setReviews(enriched);
                const avg = enriched.reduce((s, r) => s + r.rating, 0) / enriched.length;
                setAvgRating(Math.round(avg * 10) / 10);
            }
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [sellerId]);

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Summary */}
            {reviews.length > 0 && (
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        <span className="text-lg font-bold">{avgRating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">({reviews.length} değerlendirme)</span>
                </div>
            )}

            {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                    Henüz değerlendirme yapılmamış.
                </p>
            ) : (
                <div className="space-y-3">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-card/30 border border-border/30 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                        {review.reviewer?.username?.substring(0, 1).toUpperCase() || "?"}
                                    </div>
                                    <span className="text-sm font-medium">{review.reviewer?.username || "Anonim"}</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                    {new Date(review.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
                                </span>
                            </div>
                            <StarRating rating={review.rating} size="w-4 h-4" />
                            {review.comment && (
                                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{review.comment}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
