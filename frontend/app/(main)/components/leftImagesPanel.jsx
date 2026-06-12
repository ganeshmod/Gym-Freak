"use client";

import Image from "next/image";
import React, { useRef, useState } from "react";

const LeftImagesPanel = ({ images }) => {
  const imageRefs = useRef([]);
  const scrollContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScrollTo = (index) => {
    const target = imageRefs.current[index];
    console.log("target", target);
    const scrollContainer = scrollContainerRef.current;
    console.log(scrollContainerRef.current);
    if (target && scrollContainer) {
      const offsetTop = target.offsetTop - scrollContainer.offsetTop;
      const offset =
        window.innerWidth >= 1280 ? 100 : window.innerWidth >= 1024 ? 80 : 0;

      scrollContainer.scrollTo({
        top: offsetTop - offset,
        behavior: "smooth",
      });

      setActiveIndex(index);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full">
      <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:sticky lg:top-10 self-start max-h-[calc(100vh-2.5rem)]">
        {images?.map((item, index) => (
          <button
            key={index}
            onClick={() => handleScrollTo(index)}
            className={`flex-shrink-0 cursor-pointer p-1 rounded-md border transition-all ${
              activeIndex === index ? "border-gray-700" : "border-gray-300"
            }`}
          >
            <div className="relative w-16 h-16 lg:w-16 lg:h-20 rounded-md overflow-hidden">
              <Image
                src={item}
                alt={`thumb-${index}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 80px, 100px"
              />
            </div>
          </button>
        ))}
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 scroll-smooth overflow-y-auto snap-y snap-mandatory space-y-4 lg:space-y-6 xl:space-y-8 px-2 sm:px-0 max-h-[calc(100vh-2.5rem)]"
        style={{
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {images?.map((item, index) => (
          <div
            key={index}
            ref={(el) => (imageRefs.current[index] = el)}
            className="relative flex items-center justify-center snap-start"
          >
            <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[500px] xl:h-[550px]">
              <Image
                src={item}
                alt={`main-${index}`}
                fill
                className="object-contain p-4"
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeftImagesPanel;
