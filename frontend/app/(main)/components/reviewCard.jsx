"use client";

import { Star } from "lucide-react";
import Image from "next/image";

const ReviewCard = ({ review }) => {
  const { rating, title, description, user, product, verified = true } = review;

  const productImage = () => {
    return product?.variants?.[0]?.images?.[0]?.url;
  };

  const imageUrl = productImage();

  return (
    <div className="rounded-lg p-4 mx-auto text-center flex flex-col items-center justify-between h-full min-h-[260px] transition hover:scale-[1.02]">
      <div className="flex items-center justify-center mb-3 w-full py-1 rounded-md">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-4 h-4 ${
              index < rating ? "text-black fill-black" : "text-gray-300"
            }`}
          />
        ))}
      </div>

      <div className="mb-3">
        <h4 className="font-semibold text-sm app-black-text mb-1 line-clamp-2 h-10">
          {title}
        </h4>
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="text-sm font-medium app-black-text">{user?.name}</span>
        {imageUrl && (
          <div className="w-12 h-16 relative rounded-md overflow-hidden">
            <Image
              src={imageUrl}
              alt={product?.name || "Product"}
              fill
              className="object-cover"
              sizes="(max-width: 240px) 100vw, 220px"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;
