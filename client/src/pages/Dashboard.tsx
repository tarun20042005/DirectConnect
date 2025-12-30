import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, MessageSquare, Calendar, Heart, Plus, Eye, Edit, Trash2, Search, AlertCircle } from "lucide-react";
import { PropertyCard } from "@/components/PropertyCard";
import { getAuthUser, isOwner } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Property, Appointment, Chat, User } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const user = getAuthUser();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLocation("/auth");
    }
  }, [user, setLocation]);

  const isPropertyOwner = isOwner(user) || false;

  const deletePropertyMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      await apiRequest("DELETE", `/api/properties/${propertyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties/owner", user?.id] });
      toast({ title: "Success", description: "Property deleted successfully" });
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete property",
        variant: "destructive"
      });
    },
  });

  const { data: properties, isLoading: loadingProperties } = useQuery<Property[]>({
    queryKey: isPropertyOwner ? ["/api/properties/owner", user?.id] : ["/api/properties/saved", user?.id],
    enabled: !!user,
  });

  const { data: allProperties, isLoading: loadingAllProperties } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    enabled: !isPropertyOwner,
  });

  const { data: savedProperties } = useQuery<Property[]>({
    queryKey: ["/api/properties/saved", user?.id],
    enabled: !!user && !isPropertyOwner,
  });

  const { data: chats, isLoading: loadingChats } = useQuery<Chat[]>({
    queryKey: ["/api/chats/owner", user?.id],
    enabled: isPropertyOwner && !!user,
  });

  const { data: chatUsers } = useQuery<Record<string, User>>({
    queryKey: ["/api/chats/users"],
    enabled: !!user,
  });

  const { data: appointments, isLoading: loadingAppointments } = useQuery<Appointment[]>({
    queryKey: isPropertyOwner ? ["/api/appointments/owner", user?.id] : ["/api/appointments", user?.id],
    enabled: !!user,
  });

  const savePropertyMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      await apiRequest("POST", `/api/saved-properties`, { propertyId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties/saved", user?.id] });
      toast({ title: "Property saved!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to save property", variant: "destructive" });
    },
  });

  const appointmentStatusMutation = useMutation({
    mutationFn: async ({ appointmentId, status }: { appointmentId: string; status: "approved" | "rejected" }) => {
      return await apiRequest("PATCH", `/api/appointments/${appointmentId}`, { status });
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/owner", user?.id] });
      toast({ title: "Success", description: `Appointment ${status}!` });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update appointment", variant: "destructive" });
    },
  });

  const stats = isPropertyOwner ? [
    {
      title: "Active Listings",
      value: properties?.length || 0,
      icon: Home,
      color: "text-blue-500",
    },
    {
      title: "Inquiries Received",
      value: chats?.length || 0,
      icon: MessageSquare,
      color: "text-green-500",
    },
  ] : [
    {
      title: "Saved Properties",
      value: properties?.length || 0,
      icon: Heart,
      color: "text-red-500",
    },
    {
      title: "Scheduled Appointments",
      value: appointments?.length || 0,
      icon: Calendar,
      color: "text-orange-500",
    },
  ];

  return (
    <>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Property?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this property listing? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => propertyToDelete && deletePropertyMutation.mutate(propertyToDelete)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Welcome back, {user?.fullName}
        </h1>
        <p className="text-muted-foreground">
          {isPropertyOwner ? "Manage your property listings and connect with tenants" : "Find your perfect home"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} data-testid={`card-stat-${stat.title.replace(/\s+/g, '-').toLowerCase()}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue={isPropertyOwner ? "listings" : "saved"} className="space-y-6" data-testid="tabs-dashboard">
        <TabsList data-testid="tabs-list-dashboard">
          {isPropertyOwner && <TabsTrigger value="listings" data-testid="tab-listings">My Listings</TabsTrigger>}
          {isPropertyOwner && <TabsTrigger value="messages" data-testid="tab-messages">Messages</TabsTrigger>}
          {!isPropertyOwner && <TabsTrigger value="saved" data-testid="tab-saved-properties">Saved Properties</TabsTrigger>}
          {!isPropertyOwner && <TabsTrigger value="available" data-testid="tab-browse-properties">Browse Properties</TabsTrigger>}
          <TabsTrigger value="appointments" data-testid="tab-appointments">Appointments</TabsTrigger>
        </TabsList>

        {isPropertyOwner && (
          <TabsContent value="listings" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Your Properties</h2>
              <Button onClick={() => setLocation("/list-property")} data-testid="button-create-listing">
                <Plus className="h-4 w-4 mr-2" />
                New Listing
              </Button>
            </div>

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
                    No listings yet
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Start by creating your first property listing
                  </p>
                  <Button onClick={() => setLocation("/list-property")}>
                    Create Listing
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
                            setPropertyToDelete(property.id);
                            setDeleteDialogOpen(true);
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
        )}

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
                  const tenant = chatUsers?.[chat.tenantId];
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
          <TabsContent value="saved" className="mt-6">
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
                  <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No saved properties
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Start browsing and save your favorite properties
                  </p>
                  <Button onClick={() => setLocation("/search")}>
                    Browse Properties
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
                  </div>
                ))}
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
                    isSaved={savedProperties?.some(p => p.id === property.id)}
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
                <Card key={appointment.id} className="hover-elevate cursor-pointer" onClick={() => setLocation(`/property/${appointment.propertyId}`)} data-testid={`card-appointment-${appointment.id}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1 flex-1">
                        <p className="font-semibold">Property Viewing</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(appointment.scheduledDate).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-xs text-muted-foreground">Status:</p>
                          <Badge
                            variant="secondary"
                            className={`text-xs capitalize ${
                              appointment.status === "approved"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : appointment.status === "rejected"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            }`}
                            data-testid={`status-badge-${appointment.id}`}
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                        {appointment.message && (
                          <p className="text-sm text-muted-foreground mt-2 italic">"{appointment.message}"</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {isPropertyOwner && appointment.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                appointmentStatusMutation.mutate({ appointmentId: appointment.id, status: "approved" });
                              }}
                              disabled={appointmentStatusMutation.isPending}
                              data-testid={`button-approve-${appointment.id}`}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                appointmentStatusMutation.mutate({ appointmentId: appointment.id, status: "rejected" });
                              }}
                              disabled={appointmentStatusMutation.isPending}
                              data-testid={`button-reject-${appointment.id}`}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {!isPropertyOwner && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLocation(`/property/${appointment.propertyId}`);
                            }}
                            data-testid={`button-view-appointment-${appointment.id}`}
                          >
                            View Details
                          </Button>
                        )}
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
    </>
  );
}
