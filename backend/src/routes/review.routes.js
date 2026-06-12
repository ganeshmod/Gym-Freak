import express from "express";
import {
  addReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getAllReviews,
} from "../controller/review.controller.js";
import { authenticateToken } from "../utils/auth.middleware.js";

const router = express.Router();

router.post("/add", addReview);

router.get("/product/:productId", getProductReviews);

router.get("/allReviews", getAllReviews);

router.put("/:reviewId", updateReview);

router.delete("/:reviewId", deleteReview);

export default router;
