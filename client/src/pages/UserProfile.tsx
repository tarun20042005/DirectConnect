import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Home, ArrowLeft, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { VerificationBadge } from "@/components/VerificationBadge";
import type { User, Property } from "@shared/schema";

type UserProfile = User;
type PropertyListing = Property;

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const [, setLocation] = useLocation();

  const { data: user, isLoading: userLoading } = useQuery<UserProfile>({
    queryKey: ["/api/users", userId],
  });

  const { data: properties, isLoading: propertiesLoading } = useQuery<PropertyListing[]>({
    queryKey: ["/api/properties/owner", userId],
    enabled: !!userId && user?.role === "owner",
  });

  if (userLoading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
        <Button onClick={() => setLocation("/search")}>Back to Search</Button>
      </div>
    );
  }

  const userInitials = user.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  const isOwner = user.role === "owner";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation(-1)}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.avatarUrl || ""} alt={user.fullName} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold" data-testid="text-username">
                        {user.fullName}
                      </h1>
                      <VerificationBadge verified={user.verified} />
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline" data-testid="badge-role">
                        {isOwner ? "Property Owner" : "Tenant"}
                      </Badge>
                      {user.verified && (
                        <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          ID Verified
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Member since {new Date(user.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <Separator />

              <CardContent className="pt-6 space-y-6">
                {/* Contact Information */}
                <div>
                  <h2 className="font-semibold mb-4 text-lg">Contact Information</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium" data-testid="text-email">{user.email}</p>
                      </div>
                    </div>

                    {user.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Phone</p>
                          <p className="font-medium" data-testid="text-phone">{user.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification Status */}
                <div>
                  <h2 className="font-semibold mb-4 text-lg">Verification Status</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        user.verified ? 'bg-green-100 dark:bg-green-950' : 'bg-yellow-100 dark:bg-yellow-950'
                      }`}>
                        {user.verified ? (
                          <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <MapPin className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold" data-testid="text-verification-status">
                          {user.verified ? "ID Verified" : "Pending Verification"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.verified
                            ? "This user has completed identity verification"
                            : "User identity verification in progress"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Info Card */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Account Type</p>
                  <p className="font-semibold" data-testid="text-account-type">
                    {isOwner ? "Property Owner" : "Tenant Seeker"}
                  </p>
                </div>

                {isOwner && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Properties Listed</p>
                    <p className="font-semibold text-lg" data-testid="text-properties-count">
                      {propertiesLoading ? "-" : properties?.length || 0}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Member Since</p>
                  <p className="font-semibold" data-testid="text-member-since">
                    {new Date(user.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>

                {user.verified && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded-md">
                      <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        Verified Member
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Properties Preview for Owners */}
            {isOwner && properties && properties.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Recent Properties
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {properties.slice(0, 3).map((property) => (
                    <a
                      key={property.id}
                      href={`/property/${property.id}`}
                      className="block p-2 rounded hover-elevate transition-colors"
                      data-testid={`link-property-${property.id}`}
                    >
                      <p className="font-medium text-sm truncate">{property.title}</p>
                      <p className="text-xs text-muted-foreground">₹{property.price}/month</p>
                    </a>
                  ))}
                  {properties.length > 3 && (
                    <p className="text-xs text-muted-foreground pt-2">
                      +{properties.length - 3} more properties
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
