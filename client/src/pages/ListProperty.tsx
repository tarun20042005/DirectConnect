import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPropertySchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { getAuthUser, isOwner } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Property } from "@shared/schema";
import { Image as ImageIcon, X } from "lucide-react";
import livingRoomImage from "@assets/generated_images/living_room_property_listing.png";
import kitchenImage from "@assets/generated_images/modern_kitchen_interior.png";
import bedroomImage from "@assets/generated_images/bedroom_interior_photography.png";

const listingSchema = insertPropertySchema.extend({
  deposit: z.string().optional(),
  sqft: z.string().optional(),
});

type ListingForm = z.infer<typeof listingSchema>;

const indianStates = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"];

export default function ListProperty() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([livingRoomImage, kitchenImage, bedroomImage]);
  const user = getAuthUser();

  if (!user || !isOwner(user)) {
    setLocation("/auth");
    return null;
  }

  const form = useForm<ListingForm>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      ownerId: user.id,
      title: "",
      description: "",
      propertyType: "apartment",
      price: "",
      deposit: "",
      bedrooms: 1,
      bathrooms: 1,
      sqft: "",
      address: "",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "",
      latitude: "12.9716",
      longitude: "77.5946",
      images: uploadedImages,
      amenities: [],
      virtualTourUrl: "",
      available: true,
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      const newImages: string[] = [];
      for (const file of Array.from(files)) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newImages.push(event.target.result as string);
            if (newImages.length === files.length) {
              const allImages = [...uploadedImages, ...newImages];
              setUploadedImages(allImages);
              form.setValue("images", allImages);
              toast({ title: "Success", description: `${files.length} images uploaded` });
            }
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to upload images", variant: "destructive" });
    }
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    form.setValue("images", newImages);
  };

  const amenitiesOptions = [
    "Parking", "WiFi", "Air Conditioning", "Heating", "Washer/Dryer",
    "Dishwasher", "Pet Friendly", "Gym", "Pool", "Balcony"
  ];

  const progress = (currentStep / 4) * 100;

  const handleSubmit = async (data: ListingForm) => {
    setIsLoading(true);
    try {
      const propertyData = {
        ...data,
        price: data.price.toString(),
        deposit: data.deposit ? data.deposit.toString() : null,
        sqft: data.sqft ? parseInt(data.sqft) : null,
        latitude: data.latitude || "40.7128",
        longitude: data.longitude || "-74.0060",
      };

      await apiRequest<Property>("POST", "/api/properties", propertyData);
      
      // Invalidate property queries to refresh listings
      await queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/properties/owner", user.id] });
      
      toast({ title: "Success!", description: "Your property has been listed." });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create listing",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">List Your Property</CardTitle>
          <CardDescription>Fill in the details to create your listing</CardDescription>
          <Progress value={progress} className="mt-4" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>Step {currentStep} of 4</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Property Details</h3>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Modern 2-bedroom apartment in downtown"
                            data-testid="input-property-title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your property, its features, and what makes it special..."
                            rows={6}
                            data-testid="input-property-description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="propertyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-property-type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="apartment">Apartment</SelectItem>
                              <SelectItem value="house">House</SelectItem>
                              <SelectItem value="condo">Condo</SelectItem>
                              <SelectItem value="studio">Studio</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sqft"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Square Feet (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="1200"
                              data-testid="input-sqft"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              data-testid="input-bedrooms"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bathrooms</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              data-testid="input-bathrooms"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Rent (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="50000"
                              data-testid="input-price"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deposit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deposit (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="100000"
                              data-testid="input-deposit"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Location</h3>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123 Main Street"
                            data-testid="input-address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Bangalore, Mumbai, Delhi" data-testid="input-city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <Select value={field.value || ""} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger data-testid="select-state">
                                <SelectValue placeholder="Select State" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {indianStates.map(state => (
                                <SelectItem key={state} value={state}>{state}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PIN Code</FormLabel>
                          <FormControl>
                            <Input placeholder="560001" data-testid="input-zipcode" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="12.9716" data-testid="input-latitude" {...field} />
                          </FormControl>
                          <FormDescription>Will use Bangalore coordinates if not provided</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="77.5946" data-testid="input-longitude" {...field} />
                          </FormControl>
                          <FormDescription>Will use Bangalore coordinates if not provided</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">Property Images</h3>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-muted-foreground rounded-lg p-6 text-center cursor-pointer hover:border-primary transition">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        data-testid="input-image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer block">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="font-semibold">Click to upload property images</p>
                        <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 10MB each</p>
                      </label>
                    </div>

                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {uploadedImages.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={img}
                              alt={`Property ${idx + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 bg-destructive text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                              data-testid={`button-remove-image-${idx}`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-xl font-semibold">Amenities</h3>

                  <FormField
                    control={form.control}
                    name="amenities"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {amenitiesOptions.map((amenity) => (
                            <FormField
                              key={amenity}
                              control={form.control}
                              name="amenities"
                              render={({ field }) => {
                                return (
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(amenity)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, amenity])
                                            : field.onChange(
                                                field.value?.filter((value) => value !== amenity)
                                              );
                                        }}
                                        data-testid={`checkbox-amenity-${amenity.toLowerCase().replace(/\s+/g, '-')}`}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      {amenity}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Review & Publish</h3>
                  <p className="text-muted-foreground">
                    Review your listing details before publishing. You can edit it anytime from your dashboard.
                  </p>

                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <p><strong>Title:</strong> {form.watch("title")}</p>
                    <p><strong>Type:</strong> {form.watch("propertyType")}</p>
                    <p><strong>Location:</strong> {form.watch("city")}, {form.watch("state")}</p>
                    <p><strong>Rent:</strong> ₹{form.watch("price")}/month</p>
                    <p><strong>Bedrooms:</strong> {form.watch("bedrooms")} | <strong>Bathrooms:</strong> {form.watch("bathrooms")}</p>
                    <p><strong>Images:</strong> {uploadedImages.length} uploaded</p>
                    {form.watch("amenities") && form.watch("amenities").length > 0 && (
                      <p><strong>Amenities:</strong> {form.watch("amenities").join(", ")}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    data-testid="button-back"
                  >
                    Back
                  </Button>
                )}

                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className={currentStep === 1 ? "ml-auto" : ""}
                    data-testid="button-next"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="ml-auto"
                    data-testid="button-publish"
                  >
                    {isLoading ? "Publishing..." : "Publish Listing"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
