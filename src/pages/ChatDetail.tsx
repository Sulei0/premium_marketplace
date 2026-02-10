import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ROUTE_PATHS, formatCurrency, cn } from "@/lib/index";
import { ArrowLeft, Send, Image as ImageIcon, Check, CheckCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!user || !id) return;

        async function fetchChatData() {
            // 1. Fetch chat basic info
            const { data: chatData, error: chatError } = await supabase!
                .from('chats')
                .select('id, buyer_id, seller_id, product_id')
                .eq('id', id)
                .single();

            if (chatError || !chatData) {
                console.error('Error fetching chat:', chatError);
                toast({ title: "Hata", description: "Sohbet yüklenemedi.", variant: "destructive" });
                navigate(ROUTE_PATHS.CHATS);
                return;
            }

            // 2. Fetch product
            const { data: productData, error: productError } = await supabase!
                .from('products')
                .select('id, title, price, image_url')
                .eq('id', chatData.product_id)
                .single();

            if (productError || !productData) {
                console.error('Error fetching product:', productError);
                toast({ title: "Hata", description: "Ürün bilgisi yüklenemedi.", variant: "destructive" });
                navigate(ROUTE_PATHS.CHATS);
                return;
            }

            // 3. Determine other user
            const isBuyer = chatData.buyer_id === user!.id;
            const otherUserId = isBuyer ? chatData.seller_id : chatData.buyer_id;

            // 4. Fetch other user's profile
            const { data: otherUserData, error: userError } = await supabase!
                .from('profiles')
                .select('id, username, avatar_url')
                .eq('id', otherUserId)
                .single();

            if (userError || !otherUserData) {
                console.error('Error fetching user profile:', userError);
                // Fallback to a minimal user object
                setChat({
                    id: chatData.id,
                    product: productData,
                    other_user: {
                        id: otherUserId,
                        username: 'Kullanıcı',
                        avatar_url: null
                    }
                });
            } else {
                setChat({
                    id: chatData.id,
                    product: productData,
                    other_user: otherUserData
                });
            }

            // 5. Fetch messages
            const { data: messagesData, error: messagesError } = await supabase!
                .from('messages')
                .select('*')
                .eq('chat_id', id)
                .order('created_at', { ascending: true });

            if (!messagesError && messagesData) {
                setMessages(messagesData);
            }

            setLoading(false);
        }

        fetchChatData();

        // Realtime subscription for new messages
        const channel = supabase!.channel(`chat:${id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `chat_id=eq.${id}`
            }, (payload) => {
                setMessages(prev => [...prev, payload.new as Message]);
            })
            .subscribe();

        return () => {
            supabase!.removeChannel(channel);
        };

    }, [id, user, navigate]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !id) return;

        const messageContent = newMessage.trim();
        setNewMessage(""); // Clear immediately for better UX

        // Create optimistic message
        const optimisticMessage: Message = {
            id: `temp-${Date.now()}`,
            sender_id: user.id,
            content: messageContent,
            is_offer: false,
            offer_details: null,
            created_at: new Date().toISOString(),
            read_at: null
        };

        // Add to UI immediately
        setMessages(prev => [...prev, optimisticMessage]);

        const { error } = await supabase!
            .from('messages')
            .insert({
                chat_id: id,
                sender_id: user.id,
                content: messageContent,
            });

        if (error) {
            console.error('Error sending message:', error);
            toast({ title: "Hata", description: "Mesaj gönderilemedi. Tekrar deneyin.", variant: "destructive" });
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
            // Restore message text
            setNewMessage(messageContent);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto max-w-2xl h-[calc(100vh-80px)] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b flex items-center gap-4 bg-background z-10 sticky top-0">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>

                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="w-10 h-10 border">
                            <AvatarImage src={chat?.other_user.avatar_url || ""} />
                            <AvatarFallback>{chat?.other_user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="truncate">
                            <h2 className="font-bold text-sm truncate">{chat?.other_user.username}</h2>
                            <Link to={`/product/${chat?.product.id}`} className="text-xs text-muted-foreground truncate hover:text-primary transition-colors">
                                {chat?.product.title}
                            </Link>
                        </div>
                    </div>

                    <Link to={`/product/${chat?.product.id}`} className="w-10 h-10 rounded overflow-hidden border shrink-0 hover:border-primary transition-colors">
                        <img src={chat?.product.image_url || "/images/placeholder.webp"} className="w-full h-full object-cover" />
                    </Link>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, index) => {
                        const isMe = msg.sender_id === user?.id;
                        const showTime = index === 0 || new Date(msg.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 5 * 60 * 1000;

                        return (
                            <div key={msg.id} className="space-y-2">
                                {showTime && (
                                    <div className="text-center text-[10px] text-muted-foreground py-2">
                                        {format(new Date(msg.created_at), "d MMMM HH:mm", { locale: tr })}
                                    </div>
                                )}

                                {msg.is_offer ? (
                                    <div className="mx-auto max-w-[85%] bg-gradient-to-br from-pink-500/5 to-purple-600/5 border border-primary/20 rounded-2xl p-4 space-y-3">
                                        <p className="text-center font-bold text-sm text-primary uppercase tracking-widest">✨ Özel Teklif</p>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Süre:</span>
                                                <span className="font-mono font-semibold">{msg.offer_details?.duration || '?'} Gün</span>
                                            </div>
                                            {msg.offer_details?.extras && msg.offer_details.extras.length > 0 && (
                                                <div>
                                                    <span className="text-muted-foreground text-xs">Ekstralar:</span>
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                        {msg.offer_details.extras.map((extra: any, i: number) => (
                                                            <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-full border border-primary/20">
                                                                {extra.label} (+{formatCurrency(extra.price)})
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="pt-2 border-t border-primary/10 mt-2 flex justify-between font-bold text-base">
                                                <span>Toplam:</span>
                                                <span className="text-primary font-mono">{formatCurrency(msg.offer_details?.totalPrice || 0)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                                        <div className={cn(
                                            "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                                            isMe ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none"
                                        )}>
                                            {msg.content}
                                        </div>
                                        {isMe && (
                                            <div className="flex items-end ml-1 mb-1">
                                                {msg.read_at ? <CheckCheck className="w-3 h-3 text-primary" /> : <Check className="w-3 h-3 text-muted-foreground" />}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 border-t bg-background flex gap-2">
                    <Button type="button" variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
                        <ImageIcon className="w-5 h-5" />
                    </Button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Bir şeyler fısılda..."
                        className="flex-1 bg-muted/50 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <Button type="submit" size="icon" className="shrink-0 rounded-full" disabled={!newMessage.trim()}>
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </Layout>
    );
}
