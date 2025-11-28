import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Send, ArrowLeft, AlertCircle } from "lucide-react";
import { getAuthUser, isOwner } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { Property, User, Message } from "@shared/schema";

export default function ChatPage() {
  const { propertyId } = useParams();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const user = getAuthUser();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Extract chatId from URL query params for owners
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlChatId = params.get('chatId');
    if (urlChatId) {
      setChatId(urlChatId);
    }
  }, []);

  if (!user) {
    setLocation("/auth");
    return null;
  }

  const { data: property } = useQuery<Property>({
    queryKey: ["/api/properties", propertyId],
  });

  const { data: owner } = useQuery<User>({
    queryKey: ["/api/users", property?.ownerId],
    enabled: !!property?.ownerId,
  });

  useEffect(() => {
    if (!propertyId || !user.token) return;
    
    // Construct WebSocket URL using the same protocol and host as current page
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host; // This includes port if present
    const wsUrl = `${protocol}//${host}/ws`;
    
    // Safety check: ensure we have a valid URL
    if (!wsUrl || wsUrl.includes("undefined")) {
      console.error("Invalid WebSocket URL:", wsUrl);
      return;
    }
    
    console.log("Connecting to WebSocket:", wsUrl);
    
    try {
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("WebSocket connected");
        socket.send(JSON.stringify({ 
          type: "join", 
          propertyId, 
          userId: user.id,
          token: user.token,
          chatId: chatId 
        }));
      };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "message") {
        setMessages((prev) => [...prev, data.message]);
      } else if (data.type === "history") {
        setMessages(data.messages || []);
        if (data.chatId && !chatId) {
          setChatId(data.chatId);
        }
      } else if (data.type === "error") {
        toast({ title: "Chat error", description: data.message, variant: "destructive" });
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
  }, [propertyId, user.id, user.token]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !chatId) return;

    const newMessage = {
      type: "message",
      chatId,
      content: message.trim(),
    };

    wsRef.current.send(JSON.stringify(newMessage));
    setMessage("");
  };

  const ownerInitials = owner?.fullName
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase() || "O";

  // Check if owner is trying to access chat without chatId
  const isPropertyOwner = isOwner(user);
  const showOwnerError = isPropertyOwner && !chatId;

  if (showOwnerError) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-2xl">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-amber-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Chat from Messages</h3>
            <p className="text-muted-foreground text-center mb-4">
              As a property owner, please access tenant messages from your Dashboard Messages tab to start chatting.
            </p>
            <Button onClick={() => setLocation("/dashboard")} data-testid="button-go-to-dashboard">
              Go to Dashboard
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col h-[600px]">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={owner?.avatarUrl || undefined} />
                <AvatarFallback>{ownerInitials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{owner?.fullName || "Property Owner"}</CardTitle>
                <p className="text-sm text-muted-foreground">Usually responds within an hour</p>
              </div>
            </div>
          </CardHeader>

          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isOwn = msg.senderId === user.id;
                  return (
                    <div
                      key={index}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      data-testid={`message-${index}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          <form onSubmit={handleSendMessage} className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                data-testid="input-message"
              />
              <Button type="submit" disabled={!message.trim()} data-testid="button-send-message">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>

        {property && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {property.images && property.images[0] && (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full aspect-video object-cover rounded-lg"
                />
              )}
              <div>
                <h3 className="font-semibold">{property.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {property.address}, {property.city}, {property.state}
                </p>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Monthly Rent</span>
                <span className="font-semibold text-lg">₹{property.price}</span>
              </div>
              <Button
                className="w-full"
                onClick={() => setLocation(`/schedule/${propertyId}`)}
                data-testid="button-schedule-viewing"
              >
                Schedule Viewing
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
