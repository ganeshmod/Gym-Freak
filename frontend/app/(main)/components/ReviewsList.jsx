"use client";

import IndividualReviewCard from "./IndividualReviewCard";

const ReviewsList = ({ reviews = [], loading = false }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="app-bg animate-pulse">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="flex justify-between items-center">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="pl-10">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mt-2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          No reviews yet. Be the first to review this product!
        </p>
      </div>
    );
  }

  return (
    <div className="app-bg rounded-lg overflow-hidden">
      <div className="text-center items-center border-black border-b-2 my-3 max-w-fit">
        <h2 className="text-3xl font-semibold px-2 my-3">
          {`Product Reviews (${reviews?.length})`}
        </h2>
      </div>
      {reviews.map((review, index) => (
        <IndividualReviewCard key={review._id || index} review={review} />
      ))}
    </div>
  );
};

export default ReviewsList;
