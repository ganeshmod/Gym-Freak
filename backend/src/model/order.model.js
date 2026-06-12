import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const orderItemSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variant: {
    type: Object,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
});

const orderSchema = new Schema(
  {
    user: {
      type: String,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },

    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    shippingAddress: {
      type: {
        type: String,
        enum: ["Home", "Work"],
      },
      street: String,
      city: String,
      state: String,
      landMark: String,
      postalCode: Number,
      country: String,
    },

    trackingNumber: {
      type: String,
    },
    estimatedDelivery: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", function (next) {
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce(
      (total, item) => total + (item.subtotal || item.price * item.quantity),
      0
    );

    this.totalAmount = this.subtotal + (this.tax || 0) + (this.shipping || 0);
  }
  next();
});

const Order = models.Order || model("Order", orderSchema);

export default Order;
