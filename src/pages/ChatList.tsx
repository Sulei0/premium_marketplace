import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/Layout";
import { ROUTE_PATHS, cn } from "@/lib/index";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { MessageSquare, Clock, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePageMeta } from "@/hooks/usePageMeta";

interface ChatPreview {
  id: string;
  product: {
    title: string;
    image_url: string | null;
  };
  other_user: {
    username: string;
    avatar_url: string | null;
  };
  last_message: {
    content: string;
    created_at: string;
    is_offer: boolean;
  } | null;
  unread_count: number;
}

export default function ChatList() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  usePageMeta("Fısıltılarım", "Sohbetleriniz ve teklifleriniz");

  useEffect(() => {
    if (!user) return;

    async function fetchChats() {
      // Step 1: Fetch chats with products and messages (NO profile join — FK points to auth.users, not profiles)
      const { data: chatsData, error } = await supabase!
        .from('chats')
        .select(`
          id,
          created_at,
          updated_at,
          buyer_id,
          seller_id,
          product_id,
          products(title, image_url),
          messages(content, created_at, is_offer, read_at, sender_id)
        `)
        .or(`buyer_id.eq.${user!.id},seller_id.eq.${user!.id}`)
        .order('updated_at', { ascending: false });

      if (error) {
        setLoading(false);
        return;
      }

      if (!chatsData || chatsData.length === 0) {
        setChats([]);
        setLoading(false);
        return;
      }

      // Step 2: Collect all unique user IDs we need profiles for
      const otherUserIds = new Set<string>();
      chatsData.forEach((chat: any) => {
        const otherId = chat.buyer_id === user!.id ? chat.seller_id : chat.buyer_id;
        otherUserIds.add(otherId);
      });

      // Step 3: Batch-fetch all profiles at once
      const { data: profilesData } = await supabase!
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', Array.from(otherUserIds));

      // Build a lookup map: id -> profile
      const profileMap = new Map<string, { username: string; avatar_url: string | null }>();
      (profilesData || []).forEach((p: any) => {
        profileMap.set(p.id, { username: p.username, avatar_url: p.avatar_url });
      });

      // Step 4: Process chats
      const processedChats: ChatPreview[] = chatsData.map((chat: any) => {
        const isBuyer = chat.buyer_id === user!.id;
        const otherUserId = isBuyer ? chat.seller_id : chat.buyer_id;
        const otherUserProfile = profileMap.get(otherUserId) || { username: 'Kullanıcı', avatar_url: null };

        // Get last message
        const sortedMessages = chat.messages?.sort((a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ) || [];
        const lastMessage = sortedMessages[0] || null;

        // Count unread messages from other user
        const unreadCount = chat.messages?.filter((m: any) =>
          m.sender_id !== user!.id && !m.read_at
        ).length || 0;

        return {
          id: chat.id,
          product: chat.products || { title: 'Ürün', image_url: null },
          other_user: otherUserProfile,
          last_message: lastMessage,
          unread_count: unreadCount,
        };
      });

      setChats(processedChats);
      setLoading(false);
    }

    fetchChats();

    // Subscribe to chat and message changes for real-time updates
    const channel = supabase!.channel(`user-chats-${user!.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, () => {
        fetchChats();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchChats();
      })
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };

  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center  min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" />
          Fısıltılarım
        </h1>

        <div className="space-y-3">
          {chats.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-muted-foreground/20">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Henüz hiç fısıltınız yok.</p>
              <Link to={ROUTE_PATHS.HOME} className="text-primary hover:underline mt-2 inline-block text-sm">
                Vitrine Göz At
              </Link>
            </div>
          ) : (
            chats.map((chat) => (
              <Link
                key={chat.id}
                to={`/messages/${chat.id}`}
                className="block bg-card hover:bg-accent/5 transition-colors border rounded-xl p-4 group"
              >
                <div className="flex items-start gap-4">
                  {/* Product Image */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={chat.product.image_url || "/images/placeholder.webp"}
                      alt={chat.product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-sm truncate pr-2">
                        {chat.other_user.username}
                      </h3>
                      {chat.last_message && (
                        <span className="text-[10px] text-muted-foreground flex-shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(chat.last_message.created_at), { addSuffix: true, locale: tr })}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mb-1">
                      {chat.product.title}
                    </p>

                    <div className="flex justify-between items-center">
                      <p className={cn(
                        "text-sm truncate pr-4",
                        chat.unread_count > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                      )}>
                        {chat.last_message?.is_offer
                          ? "✨ Yeni bir teklif!"
                          : chat.last_message?.content || "Sohbet başlatıldı..."}
                      </p>

                      {chat.unread_count > 0 && (
                        <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                          {chat.unread_count}
                        </span>
                      )}
                    </div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity self-center" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
