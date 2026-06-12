import express from "express";

import {
  addToCart,
  updateCartItemQuantity,
  getCartItems,
  removeFromCart,
  mergeCart,
} from "../controller/cart.controller.js";
// import { authenticateToken } from "../utils/auth.middleware";

const router = express.Router();
//
// router.use(authenticateToken);

router.post("/add", addToCart);
router.get("/items", getCartItems);
router.post("/update-quantity", updateCartItemQuantity);
router.delete("/remove/:itemId", removeFromCart);
router.post("/merge", mergeCart);

export default router;
