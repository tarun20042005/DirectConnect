import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, MapPin, Home, ArrowLeft, ShieldCheck, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { VerificationBadge } from "@/components/VerificationBadge";
import { OTPVerification } from "@/components/OTPVerification";
import { formatIndianPhone } from "@/lib/phone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { User, Property } from "@shared/schema";

function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [, setLocation] = useLocation();

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
  });

  const { data: properties, isLoading: propsLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties/owner", userId],
    enabled: !!userId,
  });

  if (userLoading) {
    return (
      <div className="container py-8">
        <Button variant="ghost" onClick={() => setLocation(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Skeleton className="h-48 mt-8" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-8 text-center">
        <p className="text-muted-foreground">User not found</p>
        <Button onClick={() => setLocation("/")} className="mt-4">
          Return Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => setLocation(-1)}
        data-testid="button-back"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="mt-8 space-y-8">
        {/* User Info */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold" data-testid="text-username">
                  {user.fullName}
                </h1>
                {user.verified && <VerificationBadge />}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span data-testid="text-email">{user.email}</span>
                </div>

                {user.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span data-testid="text-phone">
                      {formatIndianPhone(user.phone)}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Home className="h-4 w-4" />
                  <span className="capitalize" data-testid="text-role">
                    {user.role === "owner" ? "Property Owner" : "Tenant"}
                  </span>
                </div>

                {user.createdAt && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span data-testid="text-member-since">
                      Member since {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Verification Status */}
        <Card className="p-6">
          <h2 className="font-semibold mb-4 text-lg">Verification Status</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  user.verified
                    ? "bg-green-100 dark:bg-green-950"
                    : "bg-yellow-100 dark:bg-yellow-950"
                }`}
              >
                {user.verified ? (
                  <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <MapPin className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                )}
              </div>
              <div>
                <p
                  className="font-semibold"
                  data-testid="text-verification-status"
                >
                  {user.verified ? "Phone Verified" : "Pending Verification"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user.verified
                    ? "Your phone number has been verified"
                    : "Verify your phone number to increase account security"}
                </p>
              </div>
            </div>

            {!user.verified && user.phone && (
              <div className="mt-4">
                <OTPVerification
                  phone={user.phone}
                  onVerified={() => {
                    window.location.reload();
                  }}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Properties (if owner) */}
        {user.role === "owner" && (
          <Card className="p-6">
            <h2 className="font-semibold mb-4 text-lg flex items-center gap-2">
              <Home className="h-5 w-5" />
              Listed Properties ({properties?.length || 0})
            </h2>
            {propsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            ) : properties && properties.length > 0 ? (
              <div className="grid gap-4">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className="p-4 border rounded-lg hover-elevate cursor-pointer"
                    onClick={() => setLocation(`/properties/${property.id}`)}
                    data-testid={`card-property-${property.id}`}
                  >
                    <h3 className="font-semibold" data-testid="text-property-title">
                      {property.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {property.bedrooms} bed • {property.bathrooms} bath •{" "}
                      {property.city}
                    </p>
                    <p className="text-sm font-semibold text-primary mt-2">
                      ₹{Number(property.price).toLocaleString("en-IN")}/month
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No properties listed yet
              </p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

export default UserProfilePage;
