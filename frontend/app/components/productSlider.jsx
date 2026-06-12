"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import ProductCard from "./productCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductSliderShimmer } from "./productShimmer";

const ProductSlider = ({ heading, products, loading = false }) => {
  if (loading) {
    return (
      <div>
        {heading && (
          <h1 className="text-gray-800 font-medium italic text-5xl uppercase text-center py-10">
            {heading}
          </h1>
        )}
        <ProductSliderShimmer count={4} className="px-10" />
      </div>
    );
  }
  return (
    <div>
      {heading && (
        <h1 className="text-gray-800 font-medium italic text-5xl uppercase text-center py-10">
          {heading}
        </h1>
      )}
      <Carousel opts={{ align: "start" }} className="width-full px-10">
        <CarouselContent className="-ml-4">
          {products?.map((product) => (
            <CarouselItem
              key={product?._id}
              className="pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <div className="pl-1">
                <ProductCard product={product} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-1 top-1/2 -translate-y-1/2 cursor-pointer" />
        <CarouselNext className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer" />
      </Carousel>
    </div>
  );
};

export default ProductSlider;
