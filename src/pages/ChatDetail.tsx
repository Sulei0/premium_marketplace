import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ROUTE_PATHS, formatCurrency, cn } from "@/lib/index";
import { ArrowLeft, Send, Check, CheckCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { usePageMeta } from "@/hooks/usePageMeta";

interface Message {
    id: string;
    sender_id: string;
    content: string;
    is_offer: boolean;
    offer_details: any;
    created_at: string;
    read_at: string | null;
}

interface ChatDetails {
    id: string;
    buyer_id: string;
    seller_id: string;
    product: {
        id: string;
        title: string;
        price: number;
        image_url: string | null;
    };
    other_user: {
        id: string;
        username: string;
        avatar_url: string | null;
    };
}

export default function ChatDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [chat, setChat] = useState<ChatDetails | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const isInitialLoad = useRef(true);

    usePageMeta(
        chat ? `${chat.other_user.username} ile Sohbet` : "Sohbet",
        "Giyenden mesajlaşma"
    );

    // ------ Scroll to bottom ------
    const scrollToBottom = useCallback((instant = false) => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: instant ? "instant" as ScrollBehavior : "smooth",
            });
        }
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom(isInitialLoad.current);
            isInitialLoad.current = false;
        }
    }, [messages, scrollToBottom]);

    // ------ Mark messages as read ------
    const markMessagesAsRead = useCallback(async () => {
        if (!user || !id || !supabase) return;

        // Find unread messages from the other user
        const unreadIds = messages
            .filter((m) => m.sender_id !== user.id && !m.read_at)
            .map((m) => m.id);

        if (unreadIds.length === 0) return;

        // Optimistic update locally
        setMessages((prev) =>
            prev.map((m) =>
                unreadIds.includes(m.id) ? { ...m, read_at: new Date().toISOString() } : m
            )
        );

        // Update in DB
        await supabase
            .from("messages")
            .update({ read_at: new Date().toISOString() })
            .in("id", unreadIds);
    }, [user, id, messages]);

    // Mark as read when chat opens and when new messages arrive
    useEffect(() => {
        if (!loading && messages.length > 0) {
            markMessagesAsRead();
        }
    }, [loading, messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

    // ------ Fetch chat data ------
    useEffect(() => {
        if (!user || !id) return;

        async function fetchChatData() {
            // 1. Fetch chat
            const { data: chatData, error: chatError } = await supabase!
                .from("chats")
                .select("id, buyer_id, seller_id, product_id")
                .eq("id", id)
                .single();

            if (chatError || !chatData) {
                toast({
                    title: "Hata",
                    description: "Sohbet yüklenemedi.",
                    variant: "destructive",
                });
                navigate(ROUTE_PATHS.CHATS);
                return;
            }

            // 2. Fetch product
            const { data: productData } = await supabase!
                .from("products")
                .select("id, title, price, image_url")
                .eq("id", chatData.product_id)
                .single();

            if (!productData) {
                toast({
                    title: "Hata",
                    description: "Ürün bilgisi yüklenemedi.",
                    variant: "destructive",
                });
                navigate(ROUTE_PATHS.CHATS);
                return;
            }

            // 3. Determine other user
            const isBuyer = chatData.buyer_id === user!.id;
            const otherUserId = isBuyer ? chatData.seller_id : chatData.buyer_id;

            // 4. Fetch other user's profile
            const { data: otherUserData } = await supabase!
                .from("profiles")
                .select("id, username, avatar_url")
                .eq("id", otherUserId)
                .single();

            setChat({
                id: chatData.id,
                buyer_id: chatData.buyer_id,
                seller_id: chatData.seller_id,
                product: productData,
                other_user: otherUserData || {
                    id: otherUserId,
                    username: "Kullanıcı",
                    avatar_url: null,
                },
            });

            // 5. Fetch messages
            const { data: messagesData } = await supabase!
                .from("messages")
                .select("*")
                .eq("chat_id", id)
                .order("created_at", { ascending: true });

            if (messagesData) {
                setMessages(messagesData);
            }

            setLoading(false);
        }

        fetchChatData();

    }, [id, user, navigate]);

    // ------ Realtime: Single Channel for Messages & Presence ------
    const channelRef = useRef<any>(null);

    useEffect(() => {
        if (!id || !user || !supabase) return;

        // Use a single channel for the chat room
        const channel = supabase.channel(`room:${id}`, {
            config: {
                presence: {
                    key: user.id,
                },
            },
        });

        channelRef.current = channel;

        channel
            // Listen for new messages
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `chat_id=eq.${id}`,
                },
                (payload) => {
                    const newMsg = payload.new as Message;
                    if (newMsg.sender_id === user.id) return; // Skip own messages (handled optimistically)

                    setMessages((prev) => {
                        if (prev.some((m) => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });
                }
            )
            // Listen for read receipts
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "messages",
                    filter: `chat_id=eq.${id}`,
                },
                (payload) => {
                    const updated = payload.new as Message;
                    setMessages((prev) =>
                        prev.map((m) => (m.id === updated.id ? { ...m, read_at: updated.read_at } : m))
                    );
                }
            )
            // Listen for presence (typing)
            .on("presence", { event: "sync" }, () => {
                const state = channel.presenceState();
                const othersTyping = Object.entries(state).some(
                    ([key, presences]: [string, any]) =>
                        key !== user.id && presences.some((p: any) => p.typing === true)
                );
                setIsTyping(othersTyping);
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    // console.log('Connected to chat room');
                }
            });

        return () => {
            supabase.removeChannel(channel);
            channelRef.current = null;
        };
    }, [id, user]);

    // ------ Typing broadcast ------
    const broadcastTyping = useCallback(
        async (typing: boolean) => {
            if (!channelRef.current || !user) return;
            try {
                await channelRef.current.track({ typing });
            } catch (error) {
                console.error("Typing broadcast error:", error);
            }
        },
        [user]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);

        // Broadcast typing
        broadcastTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            broadcastTyping(false);
        }, 2000);
    };

    // ------ Send message ------
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !id || sending) return;

        const messageContent = newMessage.trim();
        setNewMessage("");
        setSending(true);

        // Stop typing broadcast
        broadcastTyping(false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        // Optimistic message
        const optimisticMessage: Message = {
            id: `temp-${Date.now()}`,
            sender_id: user.id,
            content: messageContent,
            is_offer: false,
            offer_details: null,
            created_at: new Date().toISOString(),
            read_at: null,
        };

        setMessages((prev) => [...prev, optimisticMessage]);

        const { data: inserted, error } = await supabase!
            .from("messages")
            .insert({
                chat_id: id,
                sender_id: user.id,
                content: messageContent,
            })
            .select()
            .single();

        if (error) {
            toast({
                title: "Hata",
                description: "Mesaj gönderilemedi. Tekrar deneyin.",
                variant: "destructive",
            });
            // Remove optimistic message and restore text
            setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
            setNewMessage(messageContent);
        } else if (inserted) {
            // Replace optimistic message with real one (has real ID and server timestamp)
            setMessages((prev) =>
                prev.map((m) => (m.id === optimisticMessage.id ? (inserted as Message) : m))
            );
        }

        setSending(false);
        inputRef.current?.focus();
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto max-w-2xl h-[calc(100vh-80px)] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b flex items-center gap-4 bg-background z-10 sticky top-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(ROUTE_PATHS.CHATS)}
                        className="shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>

                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="w-10 h-10 border">
                            <AvatarImage src={chat?.other_user.avatar_url || ""} />
                            <AvatarFallback>
                                {chat?.other_user.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="truncate">
                            <h2 className="font-bold text-sm truncate">
                                {chat?.other_user.username}
                            </h2>
                            {isTyping ? (
                                <span className="text-xs text-primary animate-pulse">
                                    Yazıyor...
                                </span>
                            ) : (
                                <Link
                                    to={`/product/${chat?.product.id}`}
                                    className="text-xs text-muted-foreground truncate hover:text-primary transition-colors block"
                                >
                                    {chat?.product.title}
                                </Link>
                            )}
                        </div>
                    </div>

                    <Link
                        to={`/product/${chat?.product.id}`}
                        className="w-10 h-10 rounded overflow-hidden border shrink-0 hover:border-primary transition-colors"
                    >
                        <img
                            src={chat?.product.image_url || "/images/placeholder.webp"}
                            className="w-full h-full object-cover"
                            alt=""
                        />
                    </Link>
                </div>

                {/* Messages Area */}
                <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                    {messages.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground text-sm">
                            <p>Henüz mesaj yok.</p>
                            <p className="text-xs mt-1">İlk mesajınızı aşağıdan gönderin!</p>
                        </div>
                    )}

                    {messages.map((msg, index) => {
                        const isMe = msg.sender_id === user?.id;
                        const showTime =
                            index === 0 ||
                            new Date(msg.created_at).getTime() -
                            new Date(messages[index - 1].created_at).getTime() >
                            5 * 60 * 1000;

                        return (
                            <div key={msg.id} className="space-y-2">
                                {showTime && (
                                    <div className="text-center text-[10px] text-muted-foreground py-2">
                                        {format(new Date(msg.created_at), "d MMMM HH:mm", {
                                            locale: tr,
                                        })}
                                    </div>
                                )}

                                {msg.is_offer ? (
                                    <div className="mx-auto max-w-[85%] bg-gradient-to-br from-pink-500/5 to-purple-600/5 border border-primary/20 rounded-2xl p-4 space-y-3">
                                        <p className="text-center font-bold text-sm text-primary uppercase tracking-widest">
                                            ✨ Özel Teklif
                                        </p>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Süre:</span>
                                                <span className="font-mono font-semibold">
                                                    {msg.offer_details?.duration || "?"} Gün
                                                </span>
                                            </div>
                                            {msg.offer_details?.extras &&
                                                msg.offer_details.extras.length > 0 && (
                                                    <div>
                                                        <span className="text-muted-foreground text-xs">
                                                            Ekstralar:
                                                        </span>
                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                            {msg.offer_details.extras.map(
                                                                (extra: any, i: number) => (
                                                                    <span
                                                                        key={i}
                                                                        className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-full border border-primary/20"
                                                                    >
                                                                        {extra.label} (+{formatCurrency(extra.price)}
                                                                        )
                                                                    </span>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            <div className="pt-2 border-t border-primary/10 mt-2 flex justify-between font-bold text-base">
                                                <span>Toplam:</span>
                                                <span className="text-primary font-mono">
                                                    {formatCurrency(msg.offer_details?.totalPrice || 0)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className={cn(
                                            "flex items-end gap-1",
                                            isMe ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                                                isMe
                                                    ? "bg-primary text-primary-foreground rounded-br-sm"
                                                    : "bg-muted rounded-bl-sm"
                                            )}
                                        >
                                            {msg.content}
                                        </div>
                                        {isMe && (
                                            <div className="flex items-end mb-1 shrink-0">
                                                {msg.read_at ? (
                                                    <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                                                ) : (
                                                    <Check className="w-3.5 h-3.5 text-muted-foreground/50" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Typing indicator bubble */}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form
                    onSubmit={handleSendMessage}
                    className="p-4 border-t bg-background flex gap-2"
                >
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={handleInputChange}
                        placeholder="Bir şeyler fısılda..."
                        className="flex-1 bg-muted/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
                        autoComplete="off"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="shrink-0 rounded-full"
                        disabled={!newMessage.trim() || sending}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </Layout>
    );
}
