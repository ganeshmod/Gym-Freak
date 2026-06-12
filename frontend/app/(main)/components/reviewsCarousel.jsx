"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ReviewCard from "./reviewCard";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

const ReviewCarousel = ({ reviews }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setVisibleCards(1);
      else if (window.innerWidth < 1024) setVisibleCards(2);
      else setVisibleCards(3);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollToIndex = (index) => {
    if (!scrollContainerRef.current) return;

    const cardWidth =
      scrollContainerRef.current.querySelector(".review-card")?.offsetWidth ||
      240;
    const gap = 16;
    const scrollPosition = index * (cardWidth + gap);

    gsap.to(scrollContainerRef.current, {
      scrollTo: { x: scrollPosition },
      duration: 0.6,
      ease: "power2.out",
    });
  };

  const nextSlide = () => {
    const maxIndex = Math.max(0, reviews.length - visibleCards);
    const newIndex = Math.min(currentIndex + 1, maxIndex);
    setCurrentIndex(newIndex);
    scrollToIndex(newIndex);
  };

  const prevSlide = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIndex);
    scrollToIndex(newIndex);
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-hidden w-full sm:w-[96%] lg:w-[85%] px-2"
      >
        {reviews?.map((review) => (
          <div
            key={review?._id}
            className="review-card flex-shrink-0 w-[85vw] sm:w-[45vw] lg:w-[260px]"
          >
            <ReviewCard review={review} />
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center -mt-4">
        <button
          onClick={prevSlide}
          disabled={currentIndex === 0}
          className="rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-12 h-12 text-slate-100" />
        </button>

        <button
          onClick={nextSlide}
          disabled={currentIndex >= Math.max(0, reviews?.length - visibleCards)}
          className="rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-12 h-12 text-slate-100" />
        </button>
      </div>
    </div>
  );
};

export default ReviewCarousel;
