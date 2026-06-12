import mongoose from "mongoose";
const { model, models, Schema } = mongoose;
import slugify from "slugify";

const sizeInventorySchema = new Schema({
  label: { type: String, trim: true, required: true },
  availableQuantity: { type: Number, default: 0, min: 0 },
  soldQuantity: { type: Number, default: 0, min: 0 },
  inStock: { type: Boolean, default: true },
});

const variantSchema = new Schema({
  flavour: { type: String, trim: true },
  servingSize: { type: String, trim: true },
  serving: { type: String, trim: true },
  ingredients: { type: String, trim: true },
  expiry: { type: String, trim: true },

  material: { type: String, trim: true },
  dimensions: { type: String, trim: true },
  warranty: { type: String, trim: true },

  color: { type: String, trim: true },
  sizeInventory: {
    type: [sizeInventorySchema],
    default: [],
  },
  fit: { type: String, trim: true },
  gender: { type: String, trim: true },

  weight: { type: String, trim: true },

  price: {
    type: Number,
    required: [true, "Variant price is required"],
  },

  discountPercent: {
    type: Number,
    default: 0,
  },

  sku: {
    type: String,
    sparse: true,
    trim: true,
  },
  availableQuantity: {
    type: Number,
    default: 0,
    min: 0,
  },

  soldQuantity: {
    type: Number,
    default: 0,
    min: 0,
  },
  inStock: {
    type: Boolean,
    default: true,
  },

  images: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
  ],
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    // category: {
    //   type: Number,
    //   required: [true, "Category is required"],
    // },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Sub category is required"],
    },

    brand: {
      type: String,
      required: [true, "Brand is required"],
    },

    description: { type: String },

    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },

    metaTitle: String,
    metaDescription: String,

    variants: {
      type: [variantSchema],
      validate: [(val) => val.length > 0, "At least one variant is required"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const stopWords = [
  "kg",
  "g",
  "gram",
  "grams",
  "mg",
  "ml",
  "ltr",
  "litre",
  "liter",
  "pack",
  "pcs",
  "piece",
  "pieces",
  "set",
  "x",
  "size",
  "percent",
  "percentage",
  "%",
];

const normalizeVariantInventory = (variant) => {
  const entries =
    Array.isArray(variant.sizeInventory) && variant.sizeInventory.length
      ? variant.sizeInventory
      : [];

  if (!entries.length) {
    const available = Math.max(0, Number(variant.availableQuantity) || 0);
    const sold = Math.max(0, Number(variant.soldQuantity) || 0);
    return {
      ...variant,
      sizeInventory: [],
      availableQuantity: available,
      soldQuantity: sold,
      inStock: available > 0 && sold < available,
    };
  }

  const sanitized = entries
    .filter((entry) => entry && entry.label && entry.label.trim())
    .map((entry) => {
      const available = Math.max(0, Number(entry.availableQuantity) || 0);
      const sold = Math.max(0, Number(entry.soldQuantity) || 0);
      return {
        label: entry.label.trim(),
        availableQuantity: available,
        soldQuantity: sold,
        inStock: available > sold,
      };
    });

  const totals = sanitized.reduce(
    (acc, entry) => {
      acc.available += entry.availableQuantity;
      acc.sold += entry.soldQuantity;
      return acc;
    },
    { available: 0, sold: 0 }
  );

  return {
    ...variant,
    sizeInventory: sanitized,
    availableQuantity: totals.available,
    soldQuantity: totals.sold,
    inStock: totals.available > totals.sold,
  };
};

productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    let cleanName = this.name.replace(/[0-9]+/g, "").toLowerCase();

    stopWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      cleanName = cleanName.replace(regex, "");
    });

    cleanName = cleanName.replace(/\s+/g, " ").trim();

    this.slug = slugify(cleanName, { lower: true, strict: true });
  }
  next();
});

// Minimum price across variants
productSchema.virtual("minPrice").get(function () {
  if (!this.variants || this.variants.length === 0) return null;
  return Math.min(...this.variants.map((v) => v.price));
});

// Maximum price across variants
productSchema.virtual("maxPrice").get(function () {
  if (!this.variants || this.variants.length === 0) return null;
  return Math.max(...this.variants.map((v) => v.price));
});

// Total stock across all variants
productSchema.virtual("totalStock").get(function () {
  if (!this.variants || this.variants.length === 0) return 0;
  return this.variants.reduce((acc, variant) => {
    if (Array.isArray(variant.sizeInventory) && variant.sizeInventory.length) {
      const totalForVariant = variant.sizeInventory.reduce((sum, entry) => {
        const available = Number(entry.availableQuantity) || 0;
        const sold = Number(entry.soldQuantity) || 0;
        return sum + Math.max(0, available - sold);
      }, 0);
      return acc + totalForVariant;
    }
    const available = Number(variant.availableQuantity) || 0;
    const sold = Number(variant.soldQuantity) || 0;
    return acc + Math.max(0, available - sold);
  }, 0);
});

variantSchema.pre("save", function (next) {
  const normalized = normalizeVariantInventory(this.toObject());
  this.sizeInventory = normalized.sizeInventory;
  this.availableQuantity = normalized.availableQuantity;
  this.soldQuantity = normalized.soldQuantity;
  this.inStock = normalized.inStock;
  next();
});

variantSchema.methods.isInStock = function (sizeLabel) {
  if (Array.isArray(this.sizeInventory) && this.sizeInventory.length) {
    if (!sizeLabel) {
      return this.sizeInventory.some((entry) => entry.inStock);
    }
    const entry = this.sizeInventory.find((item) => item.label === sizeLabel);
    if (!entry) return false;
    const available = Number(entry.availableQuantity) || 0;
    const sold = Number(entry.soldQuantity) || 0;
    return entry.inStock && available > sold;
  }

  const available = Number(this.availableQuantity) || 0;
  const sold = Number(this.soldQuantity) || 0;
  return available > 0 && sold < available;
};

variantSchema.methods.getRemainingQuantity = function (sizeLabel) {
  if (Array.isArray(this.sizeInventory) && this.sizeInventory.length) {
    if (!sizeLabel) {
      return this.sizeInventory.reduce((acc, entry) => {
        const available = Number(entry.availableQuantity) || 0;
        const sold = Number(entry.soldQuantity) || 0;
        return acc + Math.max(0, available - sold);
      }, 0);
    }
    const entry = this.sizeInventory.find((item) => item.label === sizeLabel);
    if (!entry) return 0;
    const available = Number(entry.availableQuantity) || 0;
    const sold = Number(entry.soldQuantity) || 0;
    return Math.max(0, available - sold);
  }

  const available = Number(this.availableQuantity) || 0;
  const sold = Number(this.soldQuantity) || 0;
  return Math.max(0, available - sold);
};
const Product = models.Product || model("Product", productSchema);

export { normalizeVariantInventory };
export default Product;
