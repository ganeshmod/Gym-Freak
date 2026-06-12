"use client";
import { Star, CheckCircle } from "lucide-react";
import ReviewCarousel from "./reviewsCarousel";

const Reviews = ({ reviews }) => {
  const avgRating = reviews?.statistics?.averageRating || 0;
  const totalReviews = reviews?.statistics?.totalReviews || 0;
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.25 && rating % 1 < 0.75;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-6 h-6 text-black fill-black" />
        ))}
        {hasHalf && (
          <div key="half" className="relative w-6 h-6">
            <Star className="absolute top-0 left-0 w-6 h-6 text-gray-300" />
            <Star
              className="absolute top-0 left-0 w-6 h-6 text-black fill-black"
              style={{
                clipPath: "inset(0 50% 0 0)",
              }}
            />
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-6 h-6 text-gray-300" />
        ))}
      </>
    );
  };

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold app-black-text mb-4">
            Let FREAKS' speak for us
          </h2>

          <div className="flex items-center justify-center gap-2 mb-2">
            {renderStars(avgRating)}
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <span>from {totalReviews} reviews</span>
            <CheckCircle className="w-4 h-4 text-gym-secondary" />
          </div>
        </div>

        <ReviewCarousel reviews={reviews?.reviews} />
      </div>
    </section>
  );
};

export default Reviews;
