import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, MessageSquare, Calendar, Heart, Plus, Eye, Edit, Trash2, Search } from "lucide-react";
import { PropertyCard } from "@/components/PropertyCard";
import { getAuthUser, isOwner } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Property, Appointment, Chat, User } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const user = getAuthUser();

  useEffect(() => {
    if (!user) {
      setLocation("/auth");
    }
  }, [user, setLocation]);

  const isPropertyOwner = isOwner(user) || false;

  const { data: properties, isLoading: loadingProperties } = useQuery<Property[]>({
    queryKey: isPropertyOwner ? ["/api/properties/owner", user?.id] : ["/api/properties/saved", user?.id],
    enabled: !!user,
  });

  const { data: savedProperties = [], isLoading: loadingSavedProperties } = useQuery<Property[]>({
    queryKey: ["/api/properties/saved", user?.id],
    enabled: !isPropertyOwner && !!user,
  });

  const { data: allProperties, isLoading: loadingAllProperties } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    enabled: !isPropertyOwner && !!user,
  });

  const { data: appointments, isLoading: loadingAppointments } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments", user?.id],
    enabled: !!user,
  });

  const { data: chats = [], isLoading: loadingChats } = useQuery<Chat[]>({
    queryKey: ["/api/chats/owner", user?.id],
    enabled: isPropertyOwner && !!user,
  });

  // Fetch tenant details for chats
  const chatTenantIds = chats.map(c => c.tenantId);
  const { data: chatUsers = {} } = useQuery({
    queryKey: ["/api/chat-users", chatTenantIds],
    queryFn: async () => {
      const users: { [key: string]: User } = {};
      for (const tenantId of chatTenantIds) {
        const resp = await fetch(`/api/users/${tenantId}`);
        if (resp.ok) {
          users[tenantId] = await resp.json();
        }
      }
      return users;
    },
    enabled: chatTenantIds.length > 0,
  });

  const savePropertyMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      if (!user) throw new Error("Not logged in");
      const isSaved = savedProperties.some(p => p.id === propertyId);
      if (isSaved) {
        await apiRequest("DELETE", `/api/saved-properties/${user.id}/${propertyId}`);
      } else {
        await apiRequest("POST", "/api/saved-properties", { userId: user.id, propertyId });
      }
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["/api/properties/saved"] });
      }
      toast({ title: "Success", description: "Property saved successfully" });
    },
    onError: (error: any) => {
      console.error("Save error:", error);
      toast({ title: "Error", description: error.message || "Failed to save property", variant: "destructive" });
    },
  });

  const stats = [
    {
      title: isPropertyOwner ? "Total Listings" : "Saved Properties",
      value: properties?.length || 0,
      icon: Home,
      color: "text-blue-500",
    },
    {
      title: isPropertyOwner ? "Active Inquiries" : "Messages",
      value: isPropertyOwner ? chats.length : 0,
      icon: MessageSquare,
      color: "text-green-500",
    },
    {
      title: "Scheduled Viewings",
      value: appointments?.filter(a => a.status === "pending" || a.status === "confirmed").length || 0,
      icon: Calendar,
      color: "text-purple-500",
    },
    {
      title: isPropertyOwner ? "Total Views" : "Recent Searches",
      value: isPropertyOwner ? properties?.reduce((sum, p) => sum + (p.views || 0), 0) || 0 : 0,
      icon: Eye,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Welcome back, {user.fullName}
        </h1>
        <p className="text-muted-foreground">
          {isPropertyOwner ? "Manage your properties and viewings" : "Manage your saved properties and appointments"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} data-testid={`card-stat-${index}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isPropertyOwner && (
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold">My Listings</h2>
          <Button onClick={() => setLocation("/list-property")} data-testid="button-add-listing">
            <Plus className="h-4 w-4 mr-2" />
            Add New Listing
          </Button>
        </div>
      )}

      {!isPropertyOwner && allProperties && allProperties.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Featured Properties</h2>
          {loadingAllProperties ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-video w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allProperties.slice(0, 6).map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onClick={() => setLocation(`/property/${property.id}`)}
                  isSaved={savedProperties.some(p => p.id === property.id)}
                  onSave={() => savePropertyMutation.mutate(property.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <Tabs defaultValue="properties" className="w-full">
        <TabsList>
          <TabsTrigger value="properties" data-testid="tab-properties">
            {isPropertyOwner ? "My Listings" : "Saved Properties"}
          </TabsTrigger>
          {!isPropertyOwner && (
            <TabsTrigger value="available" data-testid="tab-available">
              <Search className="h-4 w-4 mr-2" />
              Browse Properties
            </TabsTrigger>
          )}
          {isPropertyOwner && (
            <TabsTrigger value="messages" data-testid="tab-messages">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
          )}
          <TabsTrigger value="appointments" data-testid="tab-appointments">
            Appointments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="mt-6">
          {loadingProperties ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-video w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : !properties || properties.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Home className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {isPropertyOwner ? "No listings yet" : "No saved properties"}
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  {isPropertyOwner 
                    ? "Start by creating your first property listing" 
                    : "Start browsing and save your favorite properties"}
                </p>
                <Button onClick={() => setLocation(isPropertyOwner ? "/list-property" : "/search")}>
                  {isPropertyOwner ? "Create Listing" : "Browse Properties"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div key={property.id} className="relative">
                  <PropertyCard
                    property={property}
                    onClick={() => setLocation(`/property/${property.id}`)}
                  />
                  {isPropertyOwner && (
                    <div className="absolute top-3 left-3 flex gap-2 z-10">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/edit-property/${property.id}`);
                        }}
                        data-testid={`button-edit-${property.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8 shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        data-testid={`button-delete-${property.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {isPropertyOwner && (
          <TabsContent value="messages" className="mt-6">
            {loadingChats ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : !chats || chats.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                  <p className="text-muted-foreground text-center">Tenants will start conversations here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {chats.map((chat) => {
                  const tenant = chatUsers[chat.tenantId];
                  return (
                    <Card key={chat.id} className="hover-elevate cursor-pointer" onClick={() => setLocation(`/chat/${chat.propertyId}?chatId=${chat.id}`)} data-testid={`card-chat-${chat.id}`}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1 flex-1">
                            <p className="font-semibold">{tenant?.fullName || "Unknown Tenant"}</p>
                            <p className="text-sm text-muted-foreground">{tenant?.phone || "No phone"}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Started {chat.createdAt ? new Date(chat.createdAt).toLocaleDateString() : 'Recently'}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setLocation(`/chat/${chat.propertyId}?chatId=${chat.id}`); }} data-testid={`button-view-chat-${chat.id}`}>
                            View Chat
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        )}

        {!isPropertyOwner && (
          <TabsContent value="available" className="mt-6">
            {loadingAllProperties ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-video w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : !allProperties || allProperties.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Home className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No properties available</h3>
                  <p className="text-muted-foreground text-center">Check back soon for new listings from owners</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onClick={() => setLocation(`/property/${property.id}`)}
                    isSaved={savedProperties.some(p => p.id === property.id)}
                    onSave={() => savePropertyMutation.mutate(property.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        )}

        <TabsContent value="appointments" className="mt-6">
          {loadingAppointments ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : !appointments || appointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No appointments scheduled</h3>
                <p className="text-muted-foreground text-center">
                  {isPropertyOwner ? "You'll see viewing requests here" : "Schedule a viewing to get started"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="hover-elevate" data-testid={`card-appointment-${appointment.id}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-semibold">Property Viewing</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(appointment.scheduledDate).toLocaleString()}
                        </p>
                        {appointment.message && (
                          <p className="text-sm text-muted-foreground mt-2">{appointment.message}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" data-testid={`button-view-appointment-${appointment.id}`}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
