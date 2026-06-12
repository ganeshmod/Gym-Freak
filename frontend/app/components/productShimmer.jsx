"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const Skeleton = ({ className = "" }) => (
  <div
    className={cn(
      "rounded-md bg-size-[200%_100%]",
      "bg-[linear-gradient(110deg,#b0b0b0,45%,#c2c2c2,55%,#b0b0b0)]",
      "dark:bg-[linear-gradient(110deg,#3e3e3e,45%,#505050,55%,#3e3e3e)]",
      "animate-[shimmer_1.5s_ease-in-out_infinite]",
      className
    )}
  ></div>
);

const ProductShimmer = ({ count = 1, className = "" }) => {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="relative rounded-xl flex flex-col overflow-hidden"
        >
          <div className="absolute top-3 left-3 z-10">
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>

          <div className="w-full h-80 relative flex items-center justify-center overflow-hidden bg-[#ababab]">
            <Skeleton className="w-full h-full rounded-none" />
          </div>

          <div className="p-4 flex-1 flex flex-col text-center space-y-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
            </div>

            <div className="flex items-center justify-center gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>

            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const SingleProductShimmer = ({ className = "" }) => {
  return (
    <div
      className={`relative rounded-xl flex flex-col overflow-hidden ${className}`}
    >
      <div className="absolute top-3 left-3 z-50">
        <Skeleton className="h-6 w-16 rounded-md" />
      </div>

      <div className="w-full h-80 relative flex items-center justify-center overflow-hidden bg-[#ababab]">
        <Skeleton className="w-full h-full rounded-none" />
      </div>

      <div className="p-4 flex-1 flex flex-col text-center space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </div>

        <div className="flex items-center justify-center gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>

        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
};

export const ProductSliderShimmer = ({ count = 4, className = "" }) => {
  return (
    <div className={`flex gap-4 overflow-hidden ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4"
        >
          <SingleProductShimmer />
        </div>
      ))}
    </div>
  );
};

export const ProductDetailShimmer = () => {
  return (
    <div className="p-10 app-bg">
      <div className="m-10 flex gap-10">
        <div className="w-2/3">
          <div className="flex gap-6 h-screen">
            <div className="flex flex-col gap-4 sticky top-10 self-start max-h-[calc(100vh-2.5rem)] overflow-y-auto">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="w-16 h-20 rounded-md" />
              ))}
            </div>

            <div className="flex-1 h-screen">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
          </div>
        </div>

        <div className="w-1/3 sticky top-10 self-start flex flex-col gap-4">
          <div className="gap-2 flex flex-col">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div>
            <Skeleton className="h-6 w-20 mb-2" />
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="w-20 h-20 rounded-md" />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-6 w-8" />
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const CartItemShimmer = ({ count = 3 }) => {
  return (
    <div className="space-y-4 container mx-auto">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-1 md:grid-cols-[1fr_150px_100px] items-center gap-6 border-b pb-6"
        >
          <div className="flex gap-6 items-center">
            <Skeleton className="w-30 h-30 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-6 w-8" />
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
          <Skeleton className="h-6 w-20 ml-auto" />
        </div>
      ))}
    </div>
  );
};

export const FashionCategoriesSkeleton = () => {
  const skeletonItems = [1, 2, 3, 4];

  return (
    <div className="flex flex-wrap items-stretch justify-center gap-6 space-y-10">
      {skeletonItems.map((item) => (
        <div key={item} className="w-72 h-[420px] app-bg rounded-lg p-2 relative overflow-hidden">

          {/* Shimmer layer */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)] bg-size-[200%_100%] animate-[shimmer_1.5s_linear_infinite]" />

          <div className="w-full h-[300px] bg-[#ababab] rounded-md mb-4"></div>
          <div className="h-6 w-3/4 bg-[#ababab] rounded mb-2"></div>
          <div className="h-4 w-1/2 bg-[#ababab] rounded"></div>
        </div>
      ))}
    </div>
  );
};


export default ProductShimmer;
