"use client";

import { Star, Check } from "lucide-react";

const IndividualReviewCard = ({ review }) => {
  const {
    rating,
    title,
    description,
    user,
    product,
    createdAt,
    verified = true,
  } = review;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-black text-black" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="app-bg py-6 border-b border-gray-300">
      <div className="flex flex-col space-y-3">
        <div className="text-sm font-medium text-gray-900">
          {product?.name || "Product"}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">{renderStars(rating)}</div>
          <div className="text-sm text-gray-500">{formatDate(createdAt)}</div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user?.name?.charAt(0) || "U"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                {user?.name || "Anonymous"}
              </span>
              {verified && (
                <div className="flex items-center px-1 py-1 bg-black">
                  <span className="text-xs text-white font-medium">
                    Verified
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="pl-10">
            <p className="text-sm text-gray-700 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualReviewCard;
