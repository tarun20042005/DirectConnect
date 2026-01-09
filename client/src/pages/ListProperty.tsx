import { useState, useEffect } from "react";
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
import { Image as ImageIcon, X, MapPin, Check } from "lucide-react";
import livingRoomImage from "@assets/generated_images/living_room_property_listing.png";
import kitchenImage from "@assets/generated_images/modern_kitchen_interior.png";
import bedroomImage from "@assets/generated_images/bedroom_interior_photography.png";

const listingSchema = insertPropertySchema.extend({
  sqft: z.string().optional(),
});

type ListingForm = z.infer<typeof listingSchema>;

const supportedCities = ["Bangalore", "Chennai", "Coimbatore", "Tiruppur"];
const stateMap: Record<string, string> = {
  "Bangalore": "Karnataka",
  "Chennai": "Tamil Nadu",
  "Coimbatore": "Tamil Nadu",
  "Tiruppur": "Tamil Nadu",
};

const steps = [
  { number: 1, title: "Basic Info", description: "Property details" },
  { number: 2, title: "Location", description: "Find on map" },
  { number: 3, title: "Images & Amenities", description: "Photos & features" },
  { number: 4, title: "Review", description: "Publish listing" },
];

export default function ListProperty() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([livingRoomImage, kitchenImage, bedroomImage]);
  const user = getAuthUser();

  useEffect(() => {
    if (!user || !isOwner(user)) {
      setLocation("/auth");
    }
  }, [user, setLocation]);

  const form = useForm<ListingForm>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      ownerId: user?.id || "",
      title: "",
      description: "",
      propertyType: "apartment",
      price: "",
      bedrooms: 1,
      bathrooms: 1,
      sqft: "",
      address: "",
      city: supportedCities[0],
      state: stateMap[supportedCities[0]],
      zipCode: "",
      googleMapsEmbed: "",
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
      const filesArray = Array.from(files);
      for (const file of filesArray) {
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          if (event.target?.result) {
            newImages.push(event.target.result as string);
            if (newImages.length === filesArray.length) {
              const allImages = [...uploadedImages, ...newImages];
              setUploadedImages(allImages);
              form.setValue("images", allImages);
              toast({ title: "Success", description: `${filesArray.length} images uploaded` });
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
    "Parking", "WiFi", "Air Conditioning", "Furnished", "Water Supply",
    "Pet Friendly", "Balcony", "Security"
  ];

  const progress = (currentStep / 4) * 100;

  const handleFindLocation = async () => {
    // This function is now deprecated in favor of Google Maps Embed
    toast({ title: "Note", description: "Please use the Google Maps embed code below." });
  };

  const handleSubmit = async (data: ListingForm) => {
    setIsLoading(true);
    try {
      const propertyData = {
        ...data,
        price: data.price.toString(),
        sqft: data.sqft ? parseInt(data.sqft) : null,
        available: true,
      };

      await apiRequest<Property>("POST", "/api/properties", propertyData);
      
      await queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      if (user?.id) {
        await queryClient.invalidateQueries({ queryKey: ["/api/properties/owner", user.id] });
      }
      
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-2">List Your Property</h1>
          <p className="text-lg text-muted-foreground">Connect directly with tenants. No broker fees.</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex justify-between mb-8">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2 transition-all ${
                    currentStep >= step.number
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                </div>
                <p className="text-sm font-medium text-center">{step.title}</p>
                <p className="text-xs text-muted-foreground text-center">{step.description}</p>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Form Card */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold mb-6">Property Details</h3>
                      
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">Property Title</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Modern 2BHK Apartment in Downtown"
                                  className="h-11"
                                  data-testid="input-title"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>Give your property a catchy title</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe your property, its features, and what makes it special..."
                                  rows={5}
                                  data-testid="input-property-description"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>Help tenants understand your property better</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Grid for Property Type and Size */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="propertyType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">Property Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-11" data-testid="select-property-type">
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="apartment">Apartment</SelectItem>
                                    <SelectItem value="house">House</SelectItem>
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
                                <FormLabel className="text-base">Square Feet (Optional)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="1200"
                                    className="h-11"
                                    data-testid="input-sqft"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Grid for Rooms and Pricing */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <FormField
                            control={form.control}
                            name="bedrooms"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">Bedrooms</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    className="h-11"
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
                                <FormLabel className="text-base">Bathrooms</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    className="h-11"
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
                                <FormLabel className="text-base">Monthly Rent (₹)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="50000"
                                    className="h-11"
                                    data-testid="input-price"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Location */}
                {currentStep === 2 && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold mb-6">Property Location</h3>
                      
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">Street Address</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="123 Main Street, Apartment 4B"
                                  className="h-11"
                                  data-testid="input-address"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">City</FormLabel>
                                <Select value={field.value || ""} onValueChange={(value) => {
                                  field.onChange(value);
                                  form.setValue("state", stateMap[value] || "Tamil Nadu");
                                }}>
                                  <FormControl>
                                    <SelectTrigger className="h-11" data-testid="select-city">
                                      <SelectValue placeholder="Select City" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {supportedCities.map(city => (
                                      <SelectItem key={city} value={city}>{city}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">State</FormLabel>
                                <FormControl>
                                  <Input className="h-11 bg-muted" readOnly data-testid="input-state" {...field} />
                                </FormControl>
                                <FormDescription className="text-xs">Auto-selected</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">PIN Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="560001" className="h-11" data-testid="input-zipcode" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="googleMapsEmbed"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">Google Maps Embed Code</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder={'Paste the <iframe ...> code from Google Maps'}
                                  className="h-24 bg-white dark:bg-slate-950 font-mono text-xs"
                                  data-testid="input-google-maps-embed"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormDescription className="text-xs">
                                Go to Google Maps, find your location, click Share, select "Embed a map", and copy the HTML.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Images & Amenities */}
                {currentStep === 3 && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold mb-6">Photos & Amenities</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <FormLabel className="text-base mb-3 block">Property Images</FormLabel>
                          <div className="border-2 border-dashed border-muted-foreground rounded-lg p-8 text-center cursor-pointer hover:border-primary transition bg-muted/30">
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
                              <ImageIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                              <p className="font-semibold">Click to upload property images</p>
                              <p className="text-sm text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB each</p>
                            </label>
                          </div>

                          {uploadedImages.length > 0 && (
                            <div className="mt-6">
                              <p className="text-sm font-semibold mb-3">{uploadedImages.length} image(s) uploaded</p>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {uploadedImages.map((img, idx) => (
                                  <div key={idx} className="relative group">
                                    <img
                                      src={img}
                                      alt={`Property ${idx + 1}`}
                                      className="w-full h-40 object-cover rounded-lg"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeImage(idx)}
                                      className="absolute top-2 right-2 bg-destructive text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition"
                                      data-testid={`button-remove-image-${idx}`}
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="border-t pt-8">
                          <FormLabel className="text-base mb-4 block">Amenities</FormLabel>
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
                                            <FormLabel className="font-normal cursor-pointer text-sm">
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
                    </div>
                  </div>
                )}

                {/* Step 4: Review */}
                {currentStep === 4 && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Review & Publish</h3>
                      <p className="text-muted-foreground mb-6">Review your listing details before publishing. You can edit it anytime from your dashboard.</p>
                      
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Title</p>
                            <p className="font-semibold text-lg">{form.watch("title")}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Property Type</p>
                            <p className="font-semibold text-lg capitalize">{form.watch("propertyType")}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Location</p>
                            <p className="font-semibold">{form.watch("city")}, {form.watch("state")}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Monthly Rent</p>
                            <p className="font-semibold text-lg">₹{form.watch("price")}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Bedrooms & Bathrooms</p>
                            <p className="font-semibold">{form.watch("bedrooms")} BHK | {form.watch("bathrooms")} Baths</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Images</p>
                            <p className="font-semibold">{uploadedImages.length} uploaded</p>
                          </div>
                        </div>
                        
                        {form.watch("amenities") && form.watch("amenities").length > 0 && (
                          <div className="pt-4 border-t border-blue-300 dark:border-blue-700">
                            <p className="text-sm text-muted-foreground mb-2">Amenities</p>
                            <div className="flex flex-wrap gap-2">
                              {(form.watch("amenities") as string[] || []).map((amenity: string) => (
                                <span key={amenity} className="bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 px-3 py-1 rounded-full text-sm font-medium">
                                  {String(amenity)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between gap-4 pt-8 border-t">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="h-11 px-8"
                      data-testid="button-back"
                    >
                      Back
                    </Button>
                  )}
                  <div className="flex-1" />
                  {currentStep < 4 ? (
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="h-11 px-8 text-base"
                      data-testid="button-next"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="h-11 px-8 text-base"
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
    </div>
  );
}
