import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { getAuthUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Property, Appointment } from "@shared/schema";

const appointmentSchema = z.object({
  date: z.date(),
  time: z.string().min(1, "Please select a time"),
  message: z.string().optional(),
});

type AppointmentForm = z.infer<typeof appointmentSchema>;

export default function ScheduleViewing() {
  const { propertyId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const user = getAuthUser();

  if (!user) {
    setLocation("/auth");
    return null;
  }

  const { data: property } = useQuery<Property>({
    queryKey: ["/api/properties", propertyId],
  });

  const form = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      date: new Date(),
      time: "",
      message: "",
    },
  });

  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
    "05:00 PM", "06:00 PM"
  ];

  const handleSubmit = async (data: AppointmentForm) => {
    if (!property) return;

    setIsLoading(true);
    try {
      const [hours, minutes] = data.time.split(":");
      const isPM = data.time.includes("PM");
      let hour = parseInt(hours);
      if (isPM && hour !== 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;

      const scheduledDate = new Date(data.date);
      scheduledDate.setHours(hour, parseInt(minutes) || 0, 0, 0);

      await apiRequest<Appointment>("POST", "/api/appointments", {
        propertyId: property.id,
        tenantId: user.id,
        ownerId: property.ownerId,
        scheduledDate: scheduledDate.toISOString(),
        status: "pending",
        message: data.message || null,
      });

      toast({ title: "Viewing Requested", description: "The owner will be notified of your request." });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule viewing",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-3xl">
      <Button
        variant="ghost"
        onClick={() => setLocation(`/property/${propertyId}`)}
        className="mb-6"
        data-testid="button-back-to-property"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Property
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Schedule a Viewing</CardTitle>
          <CardDescription>
            {property ? `for ${property.title}` : "Select a date and time to view the property"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Select Date</FormLabel>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      className="rounded-md border w-fit"
                      data-testid="calendar-viewing-date"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Time</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-viewing-time">
                          <SelectValue placeholder="Choose a time slot" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message to Owner (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Let the owner know any special requirements or questions..."
                        rows={4}
                        data-testid="input-viewing-message"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation(`/property/${propertyId}`)}
                  className="flex-1"
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                  data-testid="button-request-viewing"
                >
                  {isLoading ? "Requesting..." : "Request Viewing"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
