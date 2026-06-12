import Review from "../model/review.model.js";
import Product from "../model/product.model.js";
import User from "../model/user.model.js";

export const addReview = async (req, res) => {
  try {
    const { title, description, rating, productId, userId } = req.body;

    if (!title || !description || !rating || !productId || !userId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        data: null,
      });
    }
    console.log("productId", productId);
    console.log("userId", userId);

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
        data: null,
      });
    }

    const [product, user] = await Promise.all([
      Product.findById(productId),
      User.findById(userId).select("_id name email"),
    ]);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    const existingReview = await Review.findOne({
      user: userId,
      product: productId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
        data: null,
      });
    }

    const review = new Review({
      title,
      description,
      rating,
      product: productId,
      user: userId,
    });

    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate("user", "name email")
      .populate("product", "name brand");

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: populatedReview,
    });
  } catch (error) {
    console.error("Error in addReview:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error adding review",
      data: null,
    });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      page = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
        data: null,
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    const sortObj = {};
    sortObj[sortBy] = sortOrder === "desc" ? -1 : 1;

    const skip = (page - 1) * pageSize;

    const reviews = await Review.find({ product: productId })
      .populate("user", "name email")
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(pageSize));

    const totalReviews = await Review.countDocuments({ product: productId });

    const averageRatingResult = await Review.aggregate([
      { $match: { product: productId } },
      { $group: { _id: null, averageRating: { $avg: "$rating" } } },
    ]);

    const averageRating =
      averageRatingResult.length > 0
        ? Math.round(averageRatingResult[0].averageRating * 10) / 10
        : 0;

    const ratingDistribution = await Review.aggregate([
      { $match: { product: productId } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data: {
        reviews,
        pagination: {
          total: totalReviews,
          page: parseInt(page),
          pages: Math.ceil(totalReviews / pageSize),
          pageSize: parseInt(pageSize),
        },
        averageRating,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Error in getProductReviews:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error fetching reviews",
      data: null,
    });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
      rating,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (rating) {
      query.rating = parseInt(rating);
    }

    const sortObj = {};
    sortObj[sortBy] = sortOrder == "desc" ? -1 : 1;

    const skip = (page - 1) * pageSize;

    const reviews = await Review.find(query)
      .populate("user", "name email")
      .populate({
        path: "product",
        select: "name brand variants images",
        populate: {
          path: "variants",
          select: "price images",
        },
      })
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(pageSize));

    const totalReviews = await Review.countDocuments(query);

    const stats = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: "$rating",
          },
        },
      },
    ]);
    const ratingDistribution =
      stats.length > 0
        ? stats[0].ratingDistribution.reduce((acc, rating) => {
            acc[rating] = (acc[rating] || 0) + 1;
            return acc;
          }, {})
        : {};

    res.status(200).json({
      success: true,
      message: "All reviews fetched successfully",
      data: {
        reviews,
        pagination: {
          total: totalReviews,
          page: parseInt(page),
          pages: Math.ceil(totalReviews / pageSize),
          pageSize: parseInt(pageSize),
        },
        statistics: {
          averageRating:
            stats.length > 0 ? Math.round(stats[0].averageRating * 10) / 10 : 0,
          totalReviews: stats.length > 0 ? stats[0].totalReviews : 0,
          ratingDistribution,
        },
      },
    });
  } catch (error) {
    console.error("Error in getAllReviews:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error fetching all reviews",
      data: null,
    });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { title, description, rating, userId } = req.body;

    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "UserId is required",
        data: null,
      });
    }

    const review = await Review.findOne({ _id: reviewId, user: userId });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you don't have permission to update it",
        data: null,
      });
    }

    if (title) review.title = title;
    if (description) review.description = description;
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
          data: null,
        });
      }
      review.rating = rating;
    }

    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate("user", "name email")
      .populate("product", "name brand");

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: updatedReview,
    });
  } catch (error) {
    console.error("Error in updateReview:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error updating review",
      data: null,
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "UserId is required",
        data: null,
      });
    }

    const review = await Review.findOne({ _id: reviewId, user: userId });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you don't have permission to delete it",
        data: null,
      });
    }

    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error in deleteReview:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error deleting review",
      data: null,
    });
  }
};
