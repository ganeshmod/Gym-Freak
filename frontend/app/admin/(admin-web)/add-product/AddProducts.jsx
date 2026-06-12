"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Upload } from "lucide-react";
import { genericGetApi, genericPostApi } from "../../api-helper-admin";
import SelectCategoryDropdown from "@/components/dropdowns/SelectCategoryDrodown";
import AdminGlobal from "../../admin-store";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import "react-photo-view/dist/react-photo-view.css";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { useToast } from "@/app/components/customToastProvider";
import CategoryModal from "../dashboard/components/categoryModal";

const initialProduct = {
  name: "",
  brand: "",
  description: "",
  category: "",
  subcategory: "",
  status: "draft",
  images: [],
};

const initialVariant = {
  flavour: "",
  serving: "",
  ingredients: "",
  expiry: "",
  material: "",
  dimensions: "",
  warranty: "",
  color: "",
  size: "",
  fit: "",
  gender: "",
  price: "",
  discountPercent: "",
  sku: "",
  barcode: "",
  sizeInventory: [{ label: "", availableQuantity: 0 }],
  availableQuantity: 0,
  inStock: true,
  imageFiles: [],
};

export default function AddProducts() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catLoading, setCatLoading] = useState(false);
  const [catModalMode, setCatModalMode] = useState("category");
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);
  const [productData, setProductData] = useState(initialProduct);
  const [variant, setVariant] = useState(initialVariant);
  const [variants, setVariants] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [variantFields, setVariantFields] = useState({});
  const { CategoryDropdown, setCategoryDropdown } = AdminGlobal();
  const emptySizeRow = { label: "", availableQuantity: 0 };
  const [errors, setErrors] = useState({});
  const searchParams = useSearchParams();
  const router = useRouter();

  const { success, error } = useToast();

  const selectedCategory = CategoryDropdown.find(
    (cat) => cat._id === productData.category
  );
  const isClothingCategory = selectedCategory?.name === "Clothing";
  const sizeInventorySignature = JSON.stringify(
    (variant.sizeInventory || []).map(({ label, availableQuantity }) => ({
      label,
      availableQuantity,
    }))
  );

  useEffect(() => {
    if (!isClothingCategory) return;
    setVariant((prev) => {
      const total = (prev.sizeInventory || []).reduce(
        (sum, row) => sum + (Number(row.availableQuantity) || 0),
        0
      );
      if (prev.availableQuantity === total) {
        return prev;
      }
      return { ...prev, availableQuantity: total };
    });
  }, [isClothingCategory, sizeInventorySignature]);

  const validateProduct = (productData, variant, variantFields) => {
    const newErrors = {};

    // Product fields
    if (!productData.name.trim()) newErrors.name = "Product name is required";
    if (!productData.brand.trim()) newErrors.brand = "Brand is required";
    if (!productData.description.trim())
      newErrors.description = "Description is required";
    if (!productData.category) newErrors.category = "Category is required";
    if (!productData.subcategory)
      newErrors.subcategory = "Subcategory is required";

    // Variant fields (for current variant being added)
    const formatFieldName = (field) => {
      return field
        .split(/(?=[A-Z])/)
        .join(" ")
        .replace(/^\w/, (c) => c.toUpperCase());
    };

    const requiredFields = variantFields[productData.category] || [];
    requiredFields.forEach((field) => {
      if (!variant[field] || variant[field].toString().trim() === "") {
        newErrors[field] = `${formatFieldName(field)} is required`;
      }
    });

    if (!variant.price || Number(variant.price) <= 0) {
      newErrors.price = "Price is required and must be greater than 0";
    }
    if (!variant.discountPercent) {
      newErrors.discountPercent = "Discount % is required";
    } else if (Number(variant.discountPercent) > 100) {
      newErrors.discountPercent = "Discount % cannot be more than 100";
    }
    if (
      variant.availableQuantity === undefined ||
      variant.availableQuantity === null ||
      Number(variant.availableQuantity) < 0
    ) {
      newErrors.availableQuantity =
        "Available quantity is required and must be 0 or greater";
    }
    const hasExistingImages =
      Array.isArray(variant.existingImages) &&
      variant.existingImages.length > 0;
    if (!hasExistingImages && variant.imageFiles.length === 0) {
      newErrors.imageFiles = "At least one image is required";
    }

    return newErrors;
  };

  const cleanSizeInventory = (rows) =>
    rows
      .filter(
        (row) =>
          row.label && row.label.trim() && Number(row.availableQuantity) > 0
      )
      .map((row) => ({
        label: row.label.trim(),
        availableQuantity: Number(row.availableQuantity) || 0,
        soldQuantity: Number(row.soldQuantity) || 0,
        inStock:
          (Number(row.availableQuantity) || 0) >
          (Number(row.soldQuantity) || 0),
      }));

  const handleSizeChange = (index, field, value) => {
    setVariant((prev) => {
      const nextRows = [...(prev.sizeInventory || [])];
      const sanitizedValue =
        field === "availableQuantity" ? Math.max(0, Number(value) || 0) : value;
      nextRows[index] = {
        ...nextRows[index],
        [field]: sanitizedValue,
      };
      return { ...prev, sizeInventory: nextRows };
    });

    if (errors.sizeInventory) {
      setErrors(({ sizeInventory, ...rest }) => rest);
    }
  };

  const addSizeRow = () => {
    const rows = variant.sizeInventory || [];
    const hasIncompleteRow = rows.some(
      (row) => !row.label?.trim() || Number(row.availableQuantity) <= 0
    );

    if (hasIncompleteRow) {
      setErrors((prev) => ({
        ...prev,
        sizeInventory: "Fill current sizes before adding another.",
      }));
      return;
    }

    setErrors(({ sizeInventory, ...rest }) => rest);
    setVariant((prev) => ({
      ...prev,
      sizeInventory: [...(prev.sizeInventory || []), { ...emptySizeRow }],
    }));
  };

  const removeSizeRow = (index) => {
    setVariant((prev) => ({
      ...prev,
      sizeInventory: (prev.sizeInventory || []).filter((_, i) => i !== index),
    }));
  };

  const refreshCategories = async () => {
    try {
      const response = await genericGetApi("/api/product/getCategories");
      if (response?.success) {
        setCategories(response.data);
        setCategoryDropdown(response.data);
      }
    } catch {}
  };

  const handleSaveCommonModal = async ({ name, parentId }) => {
    if (!name?.trim()) {
      error("Name is required");
      return;
    }
    setCatLoading(true);
    try {
      if (catModalMode === "category") {
        const res = await genericPostApi("/api/product/addCategories", {
          name: name.trim(),
        });
        if (res?.success) {
          success(res?.message || "Category added");
          await refreshCategories();
        } else {
          error(res?.message || "Failed to add category");
          return;
        }
      } else {
        if (!parentId) {
          error("Select a parent category");
          return;
        }
        const res = await genericPostApi("/api/product/addSubCategories", {
          name: name.trim(),
          parentId,
        });
        if (res?.success) {
          success(res?.message || "Subcategory added");
          if (productData.category)
            await fetchSubCategories(productData.category);
        } else {
          error(res?.message || "Failed to add subcategory");
          return;
        }
      }
      setIsCatModalOpen(false);
    } catch (e) {
      error("Request failed");
    } finally {
      setCatLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await genericGetApi("/api/product/getCategories");
        if (response?.success) {
          setCategories(response.data);
          setCategoryDropdown(response.data);
        }
      } catch (error) {
        console.log("Error fetching categories", error);
        error("Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (productData.category) {
      fetchSubCategories(productData.category);
    } else if (!searchParams.get("pId")) {
      setSubcategories([]);
      setProductData((prev) => ({ ...prev, subcategory: "" }));
    }
  }, [productData.category]);

  const fetchSubCategories = async (categoryId) => {
    setSubcategoriesLoading(true);
    try {
      const response = await genericGetApi(
        `/api/product/subcategories/${categoryId}`
      );
      if (response?.success) {
        setSubcategories(response.data);
      }
    } catch (error) {
      console.log("Error fetching subcategories", error);
      setSubcategories([]);
    } finally {
      setSubcategoriesLoading(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      const id = searchParams.get("pId");
      if (id) {
        try {
          const res = await genericGetApi("/api/product/getProduct", { id });
          if (res.success && res.data) {
            setProductData({
              name: res.data.name || "",
              brand: res.data.brand || "",
              description: res.data.description || "",
              category: res.data.category?._id || "",
              subcategory: res.data.subcategory || "",
              status: res.data.status || "draft",
            });

            const formattedVariants =
              res.data.variants?.map((v) => ({
                ...v,
                availableQuantity: v.availableQuantity ?? 0,
                imageFiles: [],
                existingImages: v.images || [],
                imagesToDelete: [],
              })) || [];

            setVariants(formattedVariants);

            setVariants(formattedVariants);
          } else {
            error("Product not found");
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          error("Error loading product");
        }
      }
    };

    fetchProduct();
  }, [searchParams]);

  useEffect(() => {
    if (CategoryDropdown.length === 0) return;

    const fieldsObj = {};
    CategoryDropdown.forEach((cat) => {
      switch (cat.name) {
        case "Supplements & Nutrition":
          fieldsObj[cat._id] = [
            "flavour",
            "servingSize",
            "serving",
            "ingredients",
            "expiry",
            "weight",
          ];
          break;
        case "Equipment":
          fieldsObj[cat._id] = ["material", "dimensions", "weight"];
          break;
        case "Clothing":
          fieldsObj[cat._id] = ["color", "material", "fit"];
          break;
        default:
          fieldsObj[cat._id] = [];
      }
    });

    setVariantFields(fieldsObj);
    initialProduct.category = CategoryDropdown?.[0]._id;
  }, [CategoryDropdown]);

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVariantChange = (e) => {
    const { name, value } = e.target;

    if (name === "availableQuantity") {
      if (isClothingCategory) return;
      const safeValue = Math.max(0, Number(value) || 0);
      setVariant((prev) => ({ ...prev, [name]: safeValue }));
      setErrors(({ [name]: _omit, ...rest }) => rest);
      return;
    }

    setVariant((prev) => ({ ...prev, [name]: value }));
    setErrors(({ [name]: _omit, ...rest }) => rest);
  };

  const generateSku = (name) => {
    const prefix = name ? name.slice(0, 3).toUpperCase() : "SKU";
    return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const handleAddVariant = () => {
    const validationErrors = validateProduct(
      productData,
      variant,
      variantFields
    );

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    const isClothingCategory =
      productData.category &&
      (variantFields[productData.category] || []).length === 3 &&
      CategoryDropdown.find((cat) => cat._id === productData.category)?.name ===
        "Clothing";

    const cleanedSizes = cleanSizeInventory(variant.sizeInventory || []);
    if (isClothingCategory) {
      if (!cleanedSizes.length) {
        setErrors({ sizeInventory: "Add at least one size with stock" });
        return;
      }
    }

    const newVariant = {
      ...variant,
      sku: variant.sku || generateSku(productData.name),
      sizeInventory: cleanedSizes,
    };
    newVariant.availableQuantity = cleanedSizes.length
      ? cleanedSizes.reduce(
          (sum, entry) => sum + Number(entry.availableQuantity || 0),
          0
        )
      : Number(variant.availableQuantity) || 0;
    setVariants((prev) => [...prev, newVariant]);
    setVariant(initialVariant);
    setEditingIndex(false);
  };

  const handleRemoveVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditVariant = (index) => {
    setVariant(variants[index]);
    setVariants((prev) => prev.filter((_, i) => i !== index));
    setEditingIndex(true);
  };

  const handleDiscard = () => {
    setProductData(initialProduct);
    setVariants([]);
    setVariant(initialVariant);
    router.push("/admin/add-product");
  };

  const handleRemoveImage = (index) => {
    setVariant((prev) => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
    }));
  };
  ``;
  const handleRemoveExistingImage = (index) => {
    setVariant((prev) => {
      const imgToRemove = prev.existingImages[index];
      return {
        ...prev,
        existingImages: prev.existingImages.filter((_, i) => i !== index),
        imagesToDelete: [
          ...(prev.imagesToDelete || []),
          { public_id: imgToRemove.public_id },
        ],
      };
    });
  };

  const handleSubmit = async () => {
    // const validationErrors = validateProduct(productData, variant, variantFields);

    // if (Object.keys(validationErrors).length > 0) {
    //   setErrors(validationErrors);
    //   return;
    // }

    setLoading(true);

    try {
      const formData = new FormData();
      const id = searchParams.get("pId");
      formData.append("name", productData.name);
      formData.append("brand", productData.brand);
      formData.append("description", productData.description);
      formData.append("category", productData.category);
      formData.append("subcategory", productData.subcategory);
      formData.append("status", productData.status);
      if (id) {
        formData.append("id", id);
      }

      const variantsWithoutFiles = variants.map(
        ({ imageFiles, ...rest }) => rest
      );
      formData.append("variants", JSON.stringify(variantsWithoutFiles));

      variants.forEach((variant, index) => {
        if (variant.imageFiles && variant.imageFiles.length > 0) {
          Array.from(variant.imageFiles).forEach((file) => {
            formData.append(`variant_${index}_images`, file);
          });
        }
      });

      // send request
      const res = await genericPostApi("/api/product/addProduct", formData);

      if (res.success) {
        success(res?.message);
        !id ? handleDiscard() : "";
      } else {
        error(res?.message);
      }
    } catch (err) {
      console.error("Error submitting product:", err);
      error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl px-2  font-bold">Add Product</h1>
        <div className="space-x-2">
          <Button variant="outline" className={"w-40"} onClick={handleDiscard}>
            Discard
          </Button>
          <Button
            // variant="cancel"
            type="submit"
            disabled={loading}
            className={"w-40"}
            onClick={() => handleSubmit("active")}
          >
            {loading ? "Saving..." : "Save Product"}
          </Button>

          <Button variant="cancel" className={"w-40"} onClick={handleDiscard}>
            Add New Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left: Product + Variants */}
        <div className="md:col-span-3 space-y-6">
          {/* Product Info */}
          <div className="bg-white rounded-2xl shadow p-6 space-y-6">
            <h2 className="font-semibold text-xl">Product Details</h2>

            {/* Product Name */}
            <div className="flex flex-col">
              <Label className="text-gray-700 font-medium mb-1">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Enter product name"
                name="name"
                value={productData.name}
                onChange={handleProductChange}
                className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md"
              />
              {errors.name && (
                <span className="text-sm font-medium text-red-500">
                  {errors.name}
                </span>
              )}
            </div>

            {/* Category & Brand */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col w-full">
                <Label className="text-gray-700 font-medium mb-1">
                  Category <span className="text-red-500">*</span>
                </Label>
                <SelectCategoryDropdown
                  name="category"
                  categories={categories}
                  loading={categoriesLoading}
                  value={productData.category}
                  onChange={(cat) => {
                    setProductData((prev) => ({
                      ...prev,
                      category: cat,
                      subcategory: "",
                    }));
                  }}
                />
              </div>
              <div className="flex flex-col w-full">
                <Label className="text-gray-700 font-medium mb-1">
                  Sub Category <span className="text-red-500">*</span>
                </Label>
                <SelectCategoryDropdown
                  name="subcategory"
                  categories={subcategories}
                  value={productData.subcategory}
                  placeholder={
                    productData.category
                      ? "Choose a subcategory"
                      : "Select category first"
                  }
                  loading={subcategoriesLoading}
                  onChange={(subcat) => {
                    setProductData((prev) => ({
                      ...prev,
                      subcategory: subcat,
                    }));
                  }}
                />
              </div>

              <div className="">
                <Button
                  variant="cancel"
                  type="button"
                  onClick={() => {
                    setCatModalMode("category");
                    setIsCatModalOpen(true);
                  }}
                  className="h-9 cursor-pointer"
                >
                  + Add Category
                </Button>
              </div>
              <div className="">
                <Button
                  variant="cancel"
                  type="button"
                  onClick={() => {
                    setCatModalMode("subcategory");
                    setIsCatModalOpen(true);
                  }}
                  className="h-9 cursor-pointer"
                >
                  + Add Sub Category
                </Button>
              </div>

              <div className="flex flex-col">
                <Label className="text-gray-700 font-medium mb-1">
                  Brand <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Brand"
                  name="brand"
                  value={productData.brand}
                  onChange={handleProductChange}
                  className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md"
                />
                {errors.brand && (
                  <span className="text-sm font-medium text-red-500">
                    {errors.brand}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col">
              <Label className="text-gray-700 font-medium mb-1">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="Enter description"
                name="description"
                value={productData.description}
                onChange={handleProductChange}
                className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md"
              />
              {errors.description && (
                <span className="text-sm  font-medium text-red-500">
                  {errors.description}
                </span>
              )}
            </div>
          </div>

          {/* Variant Form */}
          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            {variants.length > 0 && (
              <h2 className="font-semibold text-lg">Add Variant</h2>
            )}

            {/* Upload Images */}
            <Label className="border-2 border-dashed border-gray-300 rounded-xl mt-2 p-5 flex flex-col justify-center items-center cursor-pointer bg-gray-50 hover:bg-gray-100">
              <Input
                id="variantImages"
                type="file"
                multiple
                hidden
                onChange={(e) => {
                  setVariant((prev) => ({
                    ...prev,
                    imageFiles: [
                      ...(prev.imageFiles || []),
                      ...Array.from(e.target.files),
                    ],
                  }));
                  e.target.value = "";
                }}
              />
              <Label
                htmlFor="variantImages"
                className="flex flex-col items-center justify-center text-gray-600"
              >
                <Upload className="w-10 h-10 mb-2 text-gray-400" />
                <span className="text-sm font-medium">
                  Drop your image here or click to upload{" "}
                  <span className="text-red-500">*</span>
                </span>
              </Label>
            </Label>

            <div className="flex">
              {/* Preview Existing Images */}
              {variant.existingImages && variant.existingImages.length > 0 && (
                <PhotoProvider>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {variant.existingImages.map((img, index) => (
                      <div key={index} className="w-24 h-24 relative">
                        <PhotoView src={img.url}>
                          <img
                            src={img.url}
                            alt={`existing-${index}`}
                            className="w-full h-full object-cover rounded-lg border cursor-pointer"
                          />
                        </PhotoView>
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(index)}
                          className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </PhotoProvider>
              )}

              {/* Preview Images */}
              {variant.imageFiles && variant.imageFiles.length > 0 && (
                <PhotoProvider>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {variant.imageFiles.map((file, index) => (
                      <div key={index} className="w-20 h-20 relative">
                        <PhotoView src={URL.createObjectURL(file)}>
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`preview-${index}`}
                            className="w-full h-full object-cover rounded-lg border cursor-pointer"
                          />
                        </PhotoView>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </PhotoProvider>
              )}
            </div>

            {errors.imageFiles && (
              <span className="text-sm font-medium text-red-500">
                {errors.imageFiles}
              </span>
            )}

            {/* Variant Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {(variantFields[productData.category] || []).map((field) => {
                const formattedField = field
                  .split(/(?=[A-Z])/)
                  .join(" ")
                  .replace(/^\w/, (c) => c.toUpperCase());

                return (
                  <div key={field} className="flex flex-col">
                    <Label className="text-gray-700 font-medium mb-1">
                      {formattedField} <span className="text-red-500">*</span>
                    </Label>
                    {field.toLowerCase().includes("expiry") ? (
                      <Input
                        type="date"
                        name={field}
                        value={variant[field] || ""}
                        onChange={handleVariantChange}
                        className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md"
                      />
                    ) : (
                      <Input
                        placeholder={`Enter ${formattedField}`}
                        name={field}
                        value={variant[field] || ""}
                        onChange={handleVariantChange}
                        className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md"
                      />
                    )}
                    {errors[field] && (
                      <span className="text-sm font-medium text-red-500">
                        {errors[field]}
                      </span>
                    )}
                  </div>
                );
              })}

              <div className="flex flex-col">
                <Label className="text-gray-700 font-medium mb-1">
                  Price <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Price"
                  name="price"
                  type="number"
                  value={variant.price}
                  onChange={handleVariantChange}
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-", "."].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onInput={(e) => {
                    if (e.target.value > 100000000000) {
                      e.target.value = 100000000000;
                    }
                    if (e.target.value < 0) {
                      e.target.value = 0;
                    }
                  }}
                  min={0}
                  max={100}
                  className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md"
                />
                {errors.price && (
                  <span className="text-sm font-medium text-red-500">
                    {errors.price}
                  </span>
                )}
              </div>

              {isClothingCategory && (
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-gray-700 font-medium">Sizes</Label>
                    <Button type="button" size="sm" onClick={addSizeRow}>
                      + Add Size
                    </Button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {(variant.sizeInventory || []).map((row, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                      >
                        <Input
                          className="md:col-span-5"
                          placeholder="Size label (e.g. S, M, L)"
                          value={row.label}
                          onChange={(e) =>
                            handleSizeChange(idx, "label", e.target.value)
                          }
                        />
                        <Input
                          className="md:col-span-4"
                          type="number"
                          min={0}
                          placeholder="Available quantity"
                          value={row.availableQuantity}
                          onChange={(e) =>
                            handleSizeChange(
                              idx,
                              "availableQuantity",
                              e.target.value
                            )
                          }
                        />
                        <div className="md:col-span-3 flex md:justify-end">
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => removeSizeRow(idx)}
                            disabled={
                              (variant.sizeInventory || []).length === 1
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.sizeInventory && (
                    <span className="text-sm font-medium text-red-500">
                      {errors.sizeInventory}
                    </span>
                  )}
                </div>
              )}

              <div className="flex flex-col">
                <Label className="text-gray-700 font-medium mb-1">
                  Discount % <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Discount %"
                  name="discountPercent"
                  type="number"
                  value={variant.discountPercent}
                  onChange={handleVariantChange}
                  onKeyDown={(e) => {
                    // Prevent typing e, +, - , .
                    if (["e", "E", "+", "-", "."].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onInput={(e) => {
                    if (e.target.value > 100) {
                      e.target.value = 100;
                    }
                    if (e.target.value < 0) {
                      e.target.value = 0;
                    }
                  }}
                  min={0}
                  max={100}
                  className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md"
                />
                {errors.discountPercent && (
                  <span className="text-sm font-medium text-red-500">
                    {errors.discountPercent}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <Label className="text-gray-700 font-medium mb-1">
                  Available Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Available Quantity"
                  name="availableQuantity"
                  type="number"
                  value={variant.availableQuantity ?? 0}
                  disabled={isClothingCategory}
                  onChange={handleVariantChange}
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-", "."].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onInput={(e) => {
                    if (e.target.value < 0) {
                      e.target.value = 0;
                    }
                  }}
                  min={0}
                  className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md disabled:opacity-100 disabled:bg-gray-100"
                />
                {isClothingCategory && (
                  <span className="text-xs text-gray-500">
                    Calculated from the total of all sizes.
                  </span>
                )}
                {errors.availableQuantity && (
                  <span className="text-sm font-medium text-red-500">
                    {errors.availableQuantity}
                  </span>
                )}
              </div>
            </div>

            {/* In Stock */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={variant.inStock}
                onCheckedChange={(val) =>
                  setVariant((prev) => ({ ...prev, inStock: val }))
                }
              />
              <span className="text-gray-700 font-medium">
                In Stock <span className="text-red-500">*</span>
              </span>
            </div>

            {/* Buttons */}
            <div className="flex space-x-2">
              <Button onClick={handleAddVariant}>Add Variant</Button>
              <Button
                variant="outline"
                onClick={() => setVariant(initialVariant)}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Variants list + Status */}
        <div className="md:col-span-2 space-y-6">
          {/* Status */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold text-lg mb-2">Status</h2>
            <Label className="text-gray-700 font-medium mb-1">
              Select status <span className="text-red-500">*</span>
            </Label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              name="status"
              value={productData.status}
              onChange={handleProductChange}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Disabled</option>
            </select>
          </div>

          {/* Variant List */}
          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="font-semibold text-lg">Variants</h2>
            {variants.length === 0 && (
              <p className="text-gray-500 text-sm">No variants added</p>
            )}
            {variants.map((v, i) => (
              <div
                key={i}
                className="p-2 border rounded-lg flex flex-col md:flex-row md:justify-between md:items-center gap-2"
              >
                <div>
                  <p className="font-medium">
                    {v.sku} - ₹{v.price}
                  </p>
                  <p className="text-sm text-gray-600">
                    {v.flavour && `Flavour: ${v.flavour}, `}
                    {v.color && `Color: ${v.color} `}
                    {v.size && `  Size: ${v.size} `}
                    {v.material && `  Material: ${v.material} `}
                    {v.discountPercent && `  Discount: ${v.discountPercent}% `}
                    {v.availableQuantity !== undefined &&
                      `  Qty: ${v.availableQuantity} `}
                  </p>
                </div>

                <div className="space-x-2">
                  <Button
                    size="sm"
                    disabled={editingIndex}
                    onClick={() => handleEditVariant(i)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveVariant(i)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {isCatModalOpen && (
        <CategoryModal
          open={isCatModalOpen}
          mode={catModalMode}
          categories={categories}
          selectedParentId={productData.category}
          onChangeParent={(id) =>
            setProductData((prev) => ({
              ...prev,
              category: id,
              subcategory: "",
            }))
          }
          onClose={() => setIsCatModalOpen(false)}
          onSave={handleSaveCommonModal}
          saving={catLoading}
        />
      )}
    </div>
  );
}
