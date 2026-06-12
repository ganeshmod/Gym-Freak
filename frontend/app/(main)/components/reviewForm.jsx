import { useToast } from "@/app/components/customToastProvider";
import { Loader2, Star, X } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

const ReviewForm = ({ isOpen, onClose, productId, userId, onSubmit }) => {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      rating: 0,
    },
  });
  const rating = watch("rating");
  const title = watch("title");
  const description = watch("description");

  const { success, error } = useToast()

  const handleStarHover = (rating) => {
    setHoveredStar(rating);
  };

  const handleStarLeave = () => {
    setHoveredStar(0);
  };

  const handleStarClick = (star) => {
    setValue("rating", star);
  };

  const onFormSubmit = async (data) => {
    if (data.rating == 0) {
      error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onSubmit({
        ...data,
        productId,
        userId,
      });

      if (res?.success) {
        reset();
        onClose();
      } else {
        setError("api", { message: res?.message });
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      error("Failed to submit review. Please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="flex items-center justify-center z-50 p-4">
      <div className="app-bg rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-2">
          <div className="flex justify-center items-center mb-6 ">
            <h2 className="text-3xl font-bold app-black-text">
              Write a Review
            </h2>
            {/* <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button> */}
          </div>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium app-black-text mb-2">
                Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5]?.map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => handleStarHover(star)}
                    onMouseLeave={handleStarLeave}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${star <= (hoveredStar || rating)
                        ? "fill-black text-black"
                        : "bg-app-text"
                        } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              {errors.rating && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.rating.message}
                </p>
              )}
            </div>
            <div className="relative">
              <label className="block text-sm font-medium app-black-text mb-2 text-center">
                Review Title *
              </label>
              <input
                {...register("title", {
                  required: "Title is required",
                  maxLength: { value: 100, message: "Max 100 characters" },
                })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500"
                placeholder="Summarize your experience"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1 -bottom-6 left-0">
                  {errors.title.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {title.length}/100 characters
              </p>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium app-black-text mb-2 text-center">
                Review Description *
              </label>
              <textarea
                {...register("description", {
                  required: "Description is required",
                  maxLength: { value: 1000, message: "Max 1000 characters" },
                })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 h-32 resize-none"
                placeholder="Tell us about your experience with this product..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1 absolute -bottom-6 left-0">
                  {errors.description.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {description.length}/1000 characters
              </p>
            </div>
            <div className="flex gap-3 pt-4 relative">
              {errors.api && (
                <p className="text-red-500 text-sm mt-2 absolute -top-7 left-0">
                  {errors.api.message}
                </p>
              )}
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="flex-1 px-4 py-2 app-black text-white rounded-md hover:app-black disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;
