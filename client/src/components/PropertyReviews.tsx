import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getAuthUser } from "@/lib/auth";
import type { Review } from "@shared/schema";

interface PropertyReviewsProps {
  propertyId: string;
}

export function PropertyReviews({ propertyId }: PropertyReviewsProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const user = getAuthUser();

  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews", propertyId],
  });

  const createReviewMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/reviews", {
        propertyId,
        rating,
        comment: comment.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", propertyId] });
      setComment("");
      setRating(5);
    },
  });

  const avgRating = reviews?.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Reviews & Ratings</h2>

        {/* Rating Summary */}
        {reviews && reviews.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-4xl font-bold">{avgRating}</p>
                  <div className="flex gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.round(parseFloat(String(avgRating))) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Write Review */}
        {user && user.role === "tenant" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Share Your Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="hover-elevate transition-colors"
                      data-testid={`button-rating-${star}`}
                    >
                      <Star className={`h-6 w-6 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="comment" className="text-sm font-medium mb-2 block">
                  Your Review (optional)
                </label>
                <Textarea
                  id="comment"
                  placeholder="Share your experience with this property..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="resize-none"
                  data-testid="input-review-comment"
                />
              </div>

              <Button
                onClick={() => createReviewMutation.mutate()}
                disabled={createReviewMutation.isPending}
                className="w-full"
                data-testid="button-submit-review"
              >
                {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Reviews List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarFallback>T</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                          ))}
                        </div>
                        <span className="text-sm font-semibold">{review.rating}/5</span>
                      </div>
                      {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(review.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No reviews yet. Be the first to review this property!
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
