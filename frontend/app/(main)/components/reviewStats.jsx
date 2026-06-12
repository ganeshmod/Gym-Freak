"use client";

import { Star, Check } from "lucide-react";

const ReviewStats = ({
  isReviewFormOpen,
  averageRating = 4.81,
  totalReviews = 2053,
  ratingDistribution = { 5: 1672, 4: 379, 3: 1, 2: 0, 1: 1 },
  onWriteReview,
  onClose,
}) => {
  const getStarPercentage = (rating) => {
    return totalReviews > 0
      ? (ratingDistribution[rating] / totalReviews) * 100
      : 0;
  };

  const renderStars = (filled, total = 5) => {
    return Array.from({ length: total }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < filled ? "fill-black text-white" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="p-6 border-b-1 border-gray-300">
      <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
        <div className="">
          <div className="flex items-center gap-1 mb-2">{renderStars(5)}</div>
          <div className="text-lg font-bold text-gray-900">
            {averageRating.toFixed(2)} out of 5
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Based on {totalReviews.toLocaleString()} reviews</span>
            <Check className="w-4 h-4 text-teal-500" />
          </div>
        </div>

        <div className="flex-1 max-w-1/3">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {renderStars(rating)}
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-black h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getStarPercentage(rating)}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 w-12 text-right">
                  {ratingDistribution[rating] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <button
            onClick={isReviewFormOpen ? onClose : onWriteReview}
            className="app-black text-white px-6 py-3 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors font-medium min-w-40"
          >
            {isReviewFormOpen ? "Cancel Review" : "Write a Review"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewStats;
