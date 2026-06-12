import Category from "../model/category.model.js";
import Product, { normalizeVariantInventory } from "../model/product.model.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// ------## Add Categories of product ##-----
export const addCategories = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
        data: null,
      });
    }

    const category = new Category({ name });
    await category.save();

    res.status(201).json({
      success: true,
      message: "Category added successfully",
      data: category,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
        data: null,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

// ------## Get All Categories of product ##-----
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      $or: [{ parent: { $exists: false } }, { parent: null }],
    }).sort({ value: 1 });

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching categories",
      data: null,
    });
  }
};

export const createSubCategories = async (req, res) => {
  try {
    const { name, parentId } = req.body;
    console.log("name, parentId", name, parentId);
    if (!name || !parentId) {
      return res.status(400).json({
        success: false,
        message: "Name and parent category ID are required",
      });
    }

    const parentCategory = await Category.findById(parentId);
    console.log("parentCategory", parentCategory);
    if (!parentCategory) {
      return res.status(404).json({
        success: false,
        message: "Parent category not found",
      });
    }

    const subCategory = await Category.create({
      name,
      parent: parentCategory._id,
    });
    res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
      data: subCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating subcategory",
      error: error.message,
    });
  }
};

export const getSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.params;

    let query = {};

    if (categoryId) {
      query.parent = categoryId;
    } else {
      query.parent = { $exists: true, $ne: null };
    }

    const subcategories = await Category.find(query).sort({
      name: 1,
    });

    res.status(200).json({
      success: true,
      message: "Subcategories fetched successfully",
      data: subcategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching subcategories",
      error: error.message,
    });
  }
};

// -------##### 🟢🔵🟡 Add or Edit Product and its related information 🟢🔵🟡 #####-------
export const addOrUpdateProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      subcategory,
      brand,
      description,
      status,
      metaTitle,
      metaDescription,
      variants,
      id,
    } = req.body;

    // ----------------------------------------------------
    // 🟡 PARSE VARIANTS JSON
    // ----------------------------------------------------
    let parsedVariants = [];
    if (variants) {
      try {
        parsedVariants =
          typeof variants === "string" ? JSON.parse(variants) : variants;
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format in variants",
          data: null,
        });
      }
    }

    // ----------------------------------------------------
    // 🟢 ADD MODE: Validate at least one variant
    // ----------------------------------------------------
    if (!id && (!parsedVariants || parsedVariants.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "At least one variant is required",
        data: null,
      });
    }

    // ----------------------------------------------------
    // 🟢🔵 ADD/EDIT MODE: Generate SKU for each variant if missing
    // ----------------------------------------------------
    parsedVariants = parsedVariants.map((v, index) => {
      if (!v.sku || v.sku === "null") {
        v.sku = `SKU-${Date.now()}-${index}-${Math.floor(
          Math.random() * 1000
        )}`;
      }
      return normalizeVariantInventory(v);
    });

    let product = null;

    // ----------------------------------------------------
    // 🔵 EDIT MODE: Fetch product if ID exists
    // ----------------------------------------------------
    if (id) {
      product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
          data: null,
        });
      }
    }

    // ----------------------------------------------------
    // 🔵 EDIT MODE: Update product fields & merge/add variants (without images yet)
    // ----------------------------------------------------
    if (id) {
      product.name = name ?? product.name;
      product.category = category ?? product.category;
      product.subcategory = subcategory ?? product.subcategory;
      product.brand = brand ?? product.brand;
      product.description = description ?? product.description;
      product.status = status ?? product.status;
      product.metaTitle = metaTitle ?? product.metaTitle;
      product.metaDescription = metaDescription ?? product.metaDescription;

      const requestSKUs = parsedVariants.map((v) => v.sku);

      // 🟡 Identify variants to delete
      const variantsToDelete = product.variants.filter(
        (v) => !requestSKUs.includes(v.sku)
      );

      // 🔵 Delete images of removed variants
      for (const v of variantsToDelete) {
        if (Array.isArray(v.images)) {
          for (const img of v.images) {
            try {
              await cloudinary.uploader.destroy(img.public_id);
            } catch (err) {
              console.log(
                `⚠️ Failed to delete image ${img.public_id}: ${err.message}`
              );
            }
          }
        }
      }

      // 🟡 Keep only variants that exist in request
      product.variants = product.variants.filter((v) =>
        requestSKUs.includes(v.sku)
      );

      // 🟢🔵 Update existing or add new variants (images handled later)
      for (const v of parsedVariants) {
        const existingIndex = product.variants.findIndex(
          (ev) => ev.sku === v.sku
        );

        if (existingIndex !== -1) {
          const mergedVariant = {
            ...product.variants[existingIndex].toObject(),
            ...v,
            images: product.variants[existingIndex].images || [],
          };
          product.variants[existingIndex] =
            normalizeVariantInventory(mergedVariant);
        } else {
          const newVariant = normalizeVariantInventory({
            ...v,
            images: [],
          });
          product.variants.push(newVariant);
        }
      }
    }

    // ----------------------------------------------------
    // 🟢 ADD MODE: Create new product (images handled later)
    // ----------------------------------------------------
    else {
      product = new Product({
        name,
        category,
        subcategory,
        brand,
        description,
        status,
        metaTitle,
        metaDescription,
        variants: parsedVariants.map((v) =>
          normalizeVariantInventory({ ...v, images: [] })
        ),
      });
    }

    // ----------------------------------------------------
    // 🟢🔵 ADD/EDIT MODE: Handle variant images after validation
    // ----------------------------------------------------
    for (let i = 0; i < parsedVariants.length; i++) {
      const fieldName = `variant_${i}_images`;
      const variantFiles = req.files.filter((f) => f.fieldname === fieldName);

      if (variantFiles.length > 5) {
        for (const f of variantFiles) fs.unlinkSync(f.path);
        return res.status(400).json({
          success: false,
          message: `Variant ${i} exceeds the max of 5 images`,
        });
      }

      let uploadedUrls = [];
      if (variantFiles.length > 0) {
        try {
          const uploadResults = await Promise.all(
            variantFiles.map((file) =>
              cloudinary.uploader.upload(file.path, { folder: "products" })
            )
          );
          uploadedUrls = uploadResults.map((r) => ({
            url: r.secure_url,
            public_id: r.public_id,
          }));
        } finally {
          variantFiles.forEach((file) => fs.unlinkSync(file.path));
        }
      }

      // 🔵 Merge uploaded images & handle deletion for edit mode
      const existingVariantIndex = product.variants.findIndex(
        (v) => v.sku === parsedVariants[i].sku
      );

      if (existingVariantIndex !== -1) {
        let updatedImages = [
          ...(product.variants[existingVariantIndex].images || []),
        ];

        if (Array.isArray(parsedVariants[i].imagesToDelete)) {
          for (const img of parsedVariants[i].imagesToDelete) {
            try {
              await cloudinary.uploader.destroy(img.public_id);
            } catch (err) {
              console.log(
                `⚠️ Failed to delete ${img.public_id}: ${err.message}`
              );
            }
            updatedImages = updatedImages.filter(
              (im) => im.public_id !== img.public_id
            );
          }
        }

        if (uploadedUrls.length > 0) updatedImages.push(...uploadedUrls);

        product.variants[existingVariantIndex].images = updatedImages;
      } else {
        // 🟢 ADD MODE: Assign uploaded images
        product.variants[i].images = uploadedUrls;
      }
    }

    // ----------------------------------------------------
    // 🟢🔵 Save product in DB
    // ----------------------------------------------------
    await product.save();

    return res.status(id ? 200 : 201).json({
      success: true,
      message: id
        ? "Product updated successfully"
        : "Product added successfully",
      data: product,
    });
  } catch (error) {
    console.log("🔥 Error in addOrUpdateProduct:", error);

    // 🟡 Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} must be unique. '${error.keyValue[field]}' already exists.`,
        data: null,
      });
    }

    // 🟡 Delete any uploaded files on error (rollback)
    if (req.files && req.files.length > 0) {
      for (const f of req.files) {
        try {
          fs.unlinkSync(f.path);
        } catch {}
      }
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Error adding/updating product",
      data: null,
    });
  }
};

// -------## Get Products (All or By ID via Query) ##-------

export const getProducts = async (req, res) => {
  try {
    const {
      id,
      slug,
      page = 1,
      pageSize = 10,
      search,
      category,
      subcategory,
      status,
    } = req.query;

    if (id || slug) {
      // ------- Get single product -------
      let product;
      if (id) {
        product = await Product.findById(id).populate("category", "name slug");
      } else if (slug) {
        product = await Product.find({ slug }).populate(
          "category",
          "name slug"
        );
      }

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
          data: null,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Product fetched successfully",
        data: product,
      });
    } else {
      // ------- Get all products -------
      const query = {};

      if (search) {
        const searchRegex = new RegExp(search.trim(), "i");

        const matchingCategories = await Category.find({
          name: { $regex: searchRegex },
          $or: [{ parent: { $exists: false } }, { parent: null }],
        }).select("_id");

        const matchingSubcategories = await Category.find({
          name: { $regex: searchRegex },
          parent: { $exists: true, $ne: null },
        }).select("_id");

        const categoryIds = matchingCategories.map((cat) => cat._id);
        const subcategoryIds = matchingSubcategories.map((sub) => sub._id);

        query.$or = [{ name: { $regex: searchRegex } }];

        if (categoryIds.length > 0) {
          query.$or.push({ category: { $in: categoryIds } });
        }

        if (subcategoryIds.length > 0) {
          query.$or.push({ subcategory: { $in: subcategoryIds } });
        }

        if (
          query.$or.length === 1 &&
          categoryIds.length === 0 &&
          subcategoryIds.length === 0
        ) {
        }
      }

      if (category) {
        query.category = category;
      }
      if (subcategory) {
        query.subcategory = subcategory;
      }
      if (status) {
        query.status = status;
      }

      const products = await Product.find(query)
        .populate("category", "name slug")
        .populate("subcategory", "name slug")
        .skip((page - 1) * pageSize)
        .limit(parseInt(pageSize));

      const total = await Product.countDocuments(query);

      return res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        data: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / pageSize),
          products,
        },
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `${error}`,
      data: null,
    });
  }
};
