import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, MessageSquare, Calendar, Heart, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { PropertyCard } from "@/components/PropertyCard";
import { getAuthUser, isOwner } from "@/lib/auth";
import type { Property, Appointment } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const user = getAuthUser();

  if (!user) {
    setLocation("/auth");
    return null;
  }

  const isPropertyOwner = isOwner(user);

  const { data: properties, isLoading: loadingProperties } = useQuery<Property[]>({
    queryKey: isPropertyOwner ? ["/api/properties/owner", user.id] : ["/api/properties/saved", user.id],
  });

  const { data: appointments, isLoading: loadingAppointments } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments", user.id],
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
      value: 0,
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

      <Tabs defaultValue="properties" className="w-full">
        <TabsList>
          <TabsTrigger value="properties" data-testid="tab-properties">
            {isPropertyOwner ? "My Listings" : "Saved Properties"}
          </TabsTrigger>
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
