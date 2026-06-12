"use client";

import React, { useEffect, useRef, useState } from "react";
import ReviewStats from "./reviewStats";
import { genericGetApi, genericPostApi } from "@/app/admin/api-helper-admin";
import ReviewForm from "./reviewForm";
import ReviewsList from "./ReviewsList";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useToast } from "@/app/components/customToastProvider";

gsap.registerPlugin(ScrollToPlugin);

const ProductReviews = ({ productId, userId }) => {
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  const { success } = useToast()

  const formRef = useRef(null);
  const containerRef = useRef(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await genericGetApi("/api/review/allReviews");
      if (response?.success) {
        setReviews(response?.data?.reviews);
        setStats(response?.data?.statistics);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = () => {
    setScrollPosition(window.scrollY);
    setIsReviewFormOpen(true);

    setTimeout(() => {
      if (formRef.current) {
        gsap.to(window, {
          duration: 0.8,
          scrollTo: {
            y: formRef.current.offsetTop - 200,
            autoKill: false,
          },
          ease: "power2.out",
        });
      }
    }, 100);
  };

  const handleCloseForm = () => {
    setIsReviewFormOpen(false);

    gsap.to(window, {
      duration: 0.8,
      scrollTo: {
        y: scrollPosition,
        autoKill: false,
      },
      ease: "power2.out",
    });
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      const response = await genericPostApi("/api/review/add", reviewData);

      if (response && response?.success) {
        success(response?.message);

        await fetchReviews();
      }
      return response;
    } catch (error) {
      console.log("Error adding review");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  return (
    <div className="space-y-6" ref={containerRef}>
      <ReviewStats
        averageRating={stats.averageRating}
        totalReviews={stats.totalReviews}
        ratingDistribution={stats.ratingDistribution}
        isReviewFormOpen={isReviewFormOpen}
        onWriteReview={handleOpenForm}
        onClose={handleCloseForm}
      />

      <div ref={formRef}>
        <ReviewForm
          isOpen={isReviewFormOpen}
          productId={productId}
          userId={userId}
          onSubmit={handleSubmitReview}
          onClose={handleCloseForm}
        />
      </div>

      <ReviewsList reviews={reviews} loading={loading} />
    </div>
  );
};

export default ProductReviews;
