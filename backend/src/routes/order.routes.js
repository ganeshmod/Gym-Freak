import express from "express";
import {
  getUserOrders,
  getOrderById,
  updateOrderStatus,
} from "../controller/order.controller.js";

const router = express.Router();

router.get("/user/:userId", getUserOrders);
router.get("/:orderId", getOrderById);
router.patch("/:orderId/status", updateOrderStatus);

export default router;
