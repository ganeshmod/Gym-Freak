import mongoose, { mongo } from "mongoose";
import slugify from "slugify";

const { Schema, models, model } = mongoose;

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    value: {
      type: Number,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null
    }
  },
  { timestamps: true }
);

categorySchema.index({ name: 1, parent: 1 }, { unique: true });
categorySchema.index({ slug: 1, parent: 1 }, { unique: true });

categorySchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
    this.value = await mongoose.models.Category.countDocuments() + 1
  };
  next();
});

const Category = models.Category || model("Category", categorySchema);

export default Category;
