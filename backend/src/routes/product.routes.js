import express from "express";
import {
  addCategories,
  getCategories,
  getProducts,
  createSubCategories,
  // getProductById,
  // getAllProducts,
  addOrUpdateProduct,
  getSubCategories,
} from "../controller/product.controller.js";
import upload from "../utils/cloud.config.js";

const router = express.Router();

router.post("/addCategories", addCategories);
router.get("/getCategories", getCategories);

router.post("/addSubCategories", createSubCategories);
router.get("/subcategories", getSubCategories);
router.get("/subcategories/:categoryId", getSubCategories);

// Product routes
router.post("/addProduct", upload.any(), addOrUpdateProduct);
router.post("/updateProduct/:id", upload.any(), addOrUpdateProduct);
router.get("/getProduct", getProducts);
// router.get("/allProducts", getAllProducts);
// router.get("/product/:id", getProductById);

export default router;
