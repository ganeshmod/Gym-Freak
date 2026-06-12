import express from "express";
import {
  createOrder,
  getPaymentDetails,
  handleWebhook,
  recoverOrder,
  verifyPayment,
} from "../controller/payment.controller.js";

const router = express.Router();

router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);
router.post("/webhook", handleWebhook);
router.post("/recover", recoverOrder);
router.get("/details/:paymentId", getPaymentDetails);

export default router;
