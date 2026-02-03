import { useState, useEffect, useRef } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Send, ArrowLeft, AlertCircle, Calendar, CheckCircle, Shield } from "lucide-react";
import { getAuthUser, isOwner } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { Property, User, Message, Chat } from "@shared/schema";

export default function ChatPage() {
  const { propertyId } = useParams();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const user = getAuthUser();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('chatId');
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  if (!user) {
    setLocation("/auth");
    return null;
  }

  const { data: property } = useQuery<Property>({
    queryKey: ["/api/properties", propertyId],
  });

  const { data: chatDetails } = useQuery<Chat>({
    queryKey: ["/api/chats", chatId],
    enabled: !!chatId,
  });

  const otherUserId = isOwner(user) ? chatDetails?.tenantId : property?.ownerId;

  const { data: otherUser } = useQuery<User>({
    queryKey: ["/api/users", otherUserId],
    enabled: !!otherUserId,
  });

  const { data: messagesHistory } = useQuery<Message[]>({
    queryKey: ["/api/messages", chatId],
    enabled: !!chatId,
  });

  useEffect(() => {
    if (messagesHistory) {
      setMessages(messagesHistory);
    }
  }, [messagesHistory]);

  useEffect(() => {
    if (!propertyId || !user.token) return;
    
    // For owners, wait until chatId is available from URL or elsewhere
    if (isOwner(user) && !chatId) return;

    // Construct WebSocket URL using the same protocol and host as current page
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host; 
    const wsUrl = `${protocol}//${host}/ws`;
    
    if (!wsUrl || wsUrl.includes("undefined")) {
      console.error("Invalid WebSocket URL:", wsUrl);
      return;
    }
    
    console.log(`Connecting to WebSocket for ${user.role}:`, wsUrl);
    
    try {
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("WebSocket connected, joining room...");
        socket.send(JSON.stringify({ 
          type: "join", 
          propertyId, 
          userId: user.id,
          token: user.token,
          chatId: chatId 
        }));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "message") {
            setMessages((prev) => {
              if (prev.some(m => m.id === data.message.id)) return prev;
              return [...prev, data.message];
            });
          } else if (data.type === "history") {
            setMessages(data.messages || []);
            if (data.chatId && !chatId) {
              setChatId(data.chatId);
            }
          } else if (data.type === "error") {
            toast({ title: "Chat error", description: data.message, variant: "destructive" });
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast({ title: "Connection error", description: "Failed to connect to chat", variant: "destructive" });
      };

      wsRef.current = socket;

      return () => {
        socket.close();
      };
    } catch (error) {
      console.error("WebSocket setup error:", error);
      toast({ title: "Connection error", description: "Failed to setup WebSocket", variant: "destructive" });
    }
  }, [propertyId, user.id, user.token, user.role, chatId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const newMessage = {
      type: "message",
      chatId, 
      content: message.trim(),
    };

    wsRef.current.send(JSON.stringify(newMessage));
    setMessage("");
  };

  const otherInitials = otherUser?.fullName
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase() || (isOwner(user) ? "T" : "O");

  // Check if owner is trying to access chat without chatId
  const isPropertyOwner = isOwner(user) && property?.ownerId === user.id;
  const showOwnerError = isPropertyOwner && !chatId;

  if (showOwnerError) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-2xl">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-amber-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Chat from Messages</h3>
            <p className="text-muted-foreground text-center mb-6">
              As the owner of this property, you can view all your conversations in your dashboard messages tab.
            </p>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-5xl">
      <Button
        variant="ghost"
        onClick={() => setLocation(`/property/${propertyId}`)}
        className="mb-4"
        data-testid="button-back-to-property"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Property
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 flex flex-col h-[700px] border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden rounded-3xl">
          <CardHeader className="border-b bg-background/80 backdrop-blur-md px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary/10">
                  <AvatarImage src={otherUser?.avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary/5 text-primary font-bold">
                    {otherInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight">
                    {otherUser?.fullName || (isOwner(user) ? "Tenant" : "Property Owner")}
                  </CardTitle>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    <p className="text-xs font-medium text-muted-foreground">Active now</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="rounded-full h-10 w-10 hover:bg-primary/5">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <ScrollArea className="flex-1 px-6 py-4" ref={scrollRef}>
            <div className="space-y-6 pb-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[500px] text-center">
                  <div className="bg-muted/30 p-8 rounded-full mb-4">
                    <Send className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">Start your journey</h3>
                  <p className="text-muted-foreground max-w-[240px]">
                    Message the owner to inquire about this beautiful property.
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isOwn = msg.senderId === user.id;
                  const showAvatar = !isOwn && (index === 0 || messages[index - 1].senderId !== msg.senderId);
                  const isLastInSequence = index === messages.length - 1 || messages[index + 1].senderId !== msg.senderId;
                  
                  return (
                    <div
                      key={msg.id || index}
                      className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                      <div className={`flex items-end gap-3 max-w-[85%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isOwn && (
                          <div className="w-8 flex-shrink-0">
                            {showAvatar && (
                              <Avatar className="h-8 w-8 ring-2 ring-background shadow-sm">
                                <AvatarImage src={otherUser?.avatarUrl || undefined} />
                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
                                  {otherInitials}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        )}
                        <div className="flex flex-col gap-1">
                          <div
                            className={`relative px-4 py-3 shadow-md transition-all duration-200 ${
                              isOwn
                                ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-2xl rounded-tr-sm'
                                : 'bg-background border border-border/50 text-card-foreground rounded-2xl rounded-tl-sm'
                            }`}
                          >
                            <p className="text-sm leading-relaxed font-medium">{msg.content}</p>
                          </div>
                          {isLastInSequence && (
                            <div className={`flex items-center gap-1.5 mt-1 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                                {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              {isOwn && (
                                <div className="flex items-center gap-1">
                                  {msg.read ? (
                                    <span className="text-[10px] font-bold text-primary flex items-center gap-0.5">
                                      <CheckCircle className="h-3 w-3" /> Seen
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-medium text-muted-foreground/40 italic">Delivered</span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          <div className="p-6 pt-2 bg-gradient-to-t from-background to-transparent">
            <form 
              onSubmit={handleSendMessage} 
              className="flex items-center gap-3 bg-background border-2 border-muted focus-within:border-primary/30 p-2 pl-5 rounded-2xl shadow-lg transition-all"
            >
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a message..."
                className="flex-1 border-none bg-transparent focus-visible:ring-0 text-base py-6 shadow-none"
                data-testid="input-message"
              />
              <Button 
                type="submit" 
                disabled={!message.trim()} 
                size="icon" 
                className="h-12 w-12 rounded-xl shadow-lg shadow-primary/20 hover-elevate transition-transform active:scale-95 shrink-0"
                data-testid="button-send-message"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </Card>

        {property && (
          <div className="space-y-6">
            <Card className="border-none shadow-lg overflow-hidden rounded-3xl">
              <div className="relative aspect-[4/3]">
                {property.images && property.images[0] && (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold leading-tight">{property.title}</h3>
                </div>
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">
                    {property.propertyType}
                  </div>
                  <span>•</span>
                  <span>{property.city}</span>
                </div>
                <Separator className="opacity-50" />
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Rent</p>
                    <p className="font-black text-xl text-primary">₹{property.price}</p>
                  </div>
                  <Button
                    size="sm"
                    className="rounded-xl font-bold px-4"
                    onClick={() => setLocation(`/property/${propertyId}`)}
                  >
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg rounded-3xl overflow-hidden bg-primary/5">
              <CardContent className="p-5 space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-widest text-primary/70">Next Steps</h4>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 rounded-xl border-primary/20 hover:bg-primary/10 transition-colors"
                    onClick={() => setLocation(`/schedule/${propertyId}`)}
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-bold">Book Visit</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 rounded-xl border-primary/20 hover:bg-primary/10 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-bold">Request Docs</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
