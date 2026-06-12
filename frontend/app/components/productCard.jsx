"use client";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { useRouter } from "next/navigation";

const ProductCard = ({ product, themeColor = null, onClick }) => {
  const router = useRouter();
  const image1Ref = useRef(null);
  const image2Ref = useRef(null);
  const imageContainerRef = useRef(null);
  const { name, minPrice, maxPrice, variants = [], category, slug } = product;

  useEffect(() => {
    if (image1Ref.current && image2Ref.current && image2) {
      gsap.set(image2Ref.current, { autoAlpha: 0, scale: 1.05 });

      const tl = gsap.timeline({ paused: true });

      tl.to(image1Ref.current, { autoAlpha: 0, duration: 0.3 }, 0).to(
        image2Ref.current,
        { autoAlpha: 1, scale: 1, duration: 0.3, ease: "power2.out" },
        0
      );

      const containerElement = imageContainerRef.current;
      if (containerElement) {
        const handleMouseEnter = () => tl.play();
        const handleMouseLeave = () => tl.reverse();

        containerElement.addEventListener("mouseenter", handleMouseEnter);
        containerElement.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          containerElement.removeEventListener("mouseenter", handleMouseEnter);
          containerElement.removeEventListener("mouseleave", handleMouseLeave);
        };
      }
    }
  });

  const calculatePricing = () => {
    if (!variants || variants.length === 0) {
      return { displayPrice: 0, originalPrice: null, discount: null };
    }
    const variantWithMaxDiscount = variants.reduce((max, current) =>
      (current.discountPercent || 0) > (max.discountPercent || 0)
        ? current
        : max
    );
    const displayPrice = variantWithMaxDiscount.price;
    const discountPercent = variantWithMaxDiscount.discountPercent || 0;

    const originalPrice =
      discountPercent > 0
        ? Math.round(displayPrice / (1 - discountPercent / 100))
        : null;

    return {
      displayPrice,
      originalPrice,
      discount: discountPercent > 0 ? discountPercent : null,
    };
  };

  const { displayPrice, originalPrice, discount } = calculatePricing();

  const isOutOfStock = !variants.some((v) => {
    const availableQty = v.availableQuantity || 0;
    const soldQty = v.soldQuantity || 0;
    return availableQty > 0 && soldQty < availableQty && v.inStock !== false;
  });

  const image1 = variants[0]?.images?.[0]?.url || "/png/dummyProduct.jpg";
  const image2 = variants[0]?.images?.[1]?.url ?? variants[1]?.images?.[0]?.url;

  return (
    <div
      className="relative rounded-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer font-instrument"
      onClick={() => {
        if (typeof onClick === "function") onClick();
        router.push(`/products/${slug}`);
      }}
    >
      {isOutOfStock && (
        <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md z-10 shadow-sm">
          OUT OF STOCK
        </span>
      )}
      {discount && !isOutOfStock && (
        <span className="absolute top-3 left-3 app-black text-white text-xs font-semibold px-2 py-1 rounded-md z-10 shadow-sm">
          SAVE {discount}%
        </span>
      )}
      <div
        ref={imageContainerRef}
        className="w-full h-80 relative flex items-center justify-center overflow-hidden"
      >
        <Image
          ref={image1Ref}
          src={image1}
          alt={`${name}-frontView`}
          fill
          className="object-contain transition-transform duration-300"
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {image2 && (
          <Image
            ref={image2Ref}
            src={image2}
            alt={`${name} - Alternate view`}
            fill
            className="object-contain absolute top-0 left-0 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col text-center">
        <h3
          className={`text-sm font-medium uppercase tracking-wide h-12 leading-tight line-clamp-2 overflow-hidden ${
            themeColor === "white" ? "text-white" : "text-app-black-text"
          }`}
        >
          {name}
        </h3>

        <div className="mt-3 flex items-center justify-center gap-2">
          <span
            className={`text-lg font-semibold ${
              themeColor === "white" ? "text-white" : "text-app-black-text"
            }`}
          >
            Rs. {displayPrice}
          </span>
          {originalPrice && originalPrice > displayPrice && (
            <span className="text-sm line-through text-gray-400">
              Rs. {originalPrice}
            </span>
          )}
        </div>

        {/* <button
          className={`mt-3 w-full py-2 px-4 rounded-lg text-sm font-medium transition-opacity duration-300 ${
            isOutOfStock
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "gym-accent text-green-500 hover:bg-opacity-90 opacity-0 group-hover:opacity-100"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (isOutOfStock) {
              e.preventDefault();
            }
          }}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button> */}
      </div>
    </div>
  );
};

export default ProductCard;
