import razorpay from "../utils/razorpay.config.js";
import Cart from "../model/cart.model.js";
import User from "../model/user.model.js";
import crypto from "crypto";
import Order from "../model/order.model.js";
import Product from "../model/product.model.js";

export const createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", userId, selectedItemIds } = req.body;
    if (!amount || amount < 1) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
        data: null,
      });
    }

    const options = {
      amount: amount * 100,
      currency: currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: userId || "689e2b7e9714e06e3575fc95",
        selectedItemIds: selectedItemIds
          ? JSON.stringify(selectedItemIds)
          : null,
      },
    };

    const order = await razorpay.orders.create(options);
    return res.status(200).json({
      success: true,
      message: "Order created successfully",
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.log("Error creating order:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error creating order",
      data: null,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      orderId,
      paymentId,
      signature,
      userId,
      selectedItemIds,
      isDirectOrder = false,
      directOrderData = null,
    } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: "Order ID, Payment ID, and Signature are required",
        data: null,
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    console.log("Signature comparison:", {
      received: signature,
      expected: expectedSignature,
      match: expectedSignature === signature,
    });

    if (expectedSignature !== signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
        data: null,
      });
    }

    const existingOrder = await Order.findOne({
      razorpayPaymentId: paymentId,
    });

    if (existingOrder) {
      console.log("Order already exists for payment:", paymentId);
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        data: {
          paymentId,
          orderId,
          orderNumber: existingOrder._id,
          status: "completed",
          alreadyExisted: true,
        },
      });
    }

    let razorpayPayment;
    try {
      razorpayPayment = await razorpay.payments.fetch(paymentId);

      if (razorpayPayment.status !== "captured") {
        console.error(
          "Payment not captured:",
          paymentId,
          razorpayPayment.status
        );

        return res.status(400).json({
          success: false,
          message: `Payment status is ${razorpayPayment.status}, not captured`,
          data: {
            paymentId,
            status: razorpayPayment.status,
          },
        });
      }
    } catch (razorpayError) {
      console.error("Error fetching payment from Razorpay:", razorpayError);
    }

    const tempUserId = userId || "689e2b7e9714e06e3575fc95";

    let orderItems = [];
    let subtotal = 0;
    let cart = null; // Declare cart outside if/else

    if (isDirectOrder && directOrderData) {
      // Handle direct order (Buy Now) - create order directly without cart
      const { productId, variant, quantity, variantIndex } = directOrderData;

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: "Product not found",
          data: { paymentId },
        });
      }

      const selectedVariant = product.variants[variantIndex] || variant;
      if (!selectedVariant) {
        return res.status(400).json({
          success: false,
          message: "Variant not found",
          data: { paymentId },
        });
      }

      orderItems = [
        {
          product: productId,
          variant: selectedVariant,
          quantity: quantity,
          price: selectedVariant.price,
          subtotal: selectedVariant.price * quantity,
        },
      ];

      subtotal = selectedVariant.price * quantity;
    } else {
      // Handle cart-based order
      cart = await Cart.findOne({ user: tempUserId }).populate("items.product");

      if (!cart || cart.items.length === 0) {
        console.error("CRITICAL: Payment verified but cart is empty", {
          paymentId,
          orderId,
          userId: tempUserId,
        });

        return res.status(400).json({
          success: false,
          message: "Cart is empty",
          data: { paymentId, needsRecovery: true },
        });
      }

      let itemsToProcess = cart.items;
      if (
        selectedItemIds &&
        Array.isArray(selectedItemIds) &&
        selectedItemIds.length > 0
      ) {
        itemsToProcess = cart.items.filter((item) =>
          selectedItemIds.includes(item._id.toString())
        );

        if (itemsToProcess.length === 0) {
          return res.status(400).json({
            success: false,
            message: "No selected items found in cart",
            data: { paymentId },
          });
        }
      }

      orderItems = itemsToProcess.map((item) => ({
        product: item.product._id,
        variant: item.variant,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      }));

      subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    }

    let order;

    try {
      order = await Order.create({
        user: tempUserId,
        items: orderItems,
        subtotal: subtotal, // Use calculated subtotal instead of cart.totalAmount
        totalAmount: subtotal, // Use calculated subtotal instead of cart.totalAmount
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        paymentStatus: "completed",
        status: "confirmed",
      });

      // Update sold quantities for all order items
      for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (product && product.variants) {
          const variantIndex = product.variants.findIndex((v) => {
            if (item.variant.sku && v.sku === item.variant.sku) {
              return true;
            }

            const keysToMatch = ["color", "size", "flavour", "weight"];
            return keysToMatch.some(
              (key) => item.variant[key] && v[key] === item.variant[key]
            );
          });

          if (variantIndex !== -1) {
            const variant = product.variants[variantIndex];
            if (
              Array.isArray(variant.sizeInventory) &&
              variant.sizeInventory.length &&
              item.variant.selectedSize
            ) {
              const sizeEntryIndex = variant.sizeInventory.findIndex(
                (entry) => entry.label === item.variant.selectedSize
              );

              if (sizeEntryIndex !== -1) {
                variant.sizeInventory[sizeEntryIndex].soldQuantity =
                  (variant.sizeInventory[sizeEntryIndex].soldQuantity || 0) +
                  item.quantity;
                const available =
                  Number(
                    variant.sizeInventory[sizeEntryIndex].availableQuantity
                  ) || 0;
                const sold =
                  Number(variant.sizeInventory[sizeEntryIndex].soldQuantity) ||
                  0;
                variant.sizeInventory[sizeEntryIndex].inStock =
                  available > sold;
              }
            } else {
              variant.soldQuantity =
                (variant.soldQuantity || 0) + item.quantity;
            }

            variant.availableQuantity = variant.sizeInventory.length
              ? variant.sizeInventory.reduce(
                  (sum, entry) =>
                    sum +
                    Math.max(
                      0,
                      (Number(entry.availableQuantity) || 0) -
                        (Number(entry.soldQuantity) || 0)
                    ),
                  0
                )
              : variant.availableQuantity;

            variant.inStock = variant.sizeInventory.length
              ? variant.sizeInventory.some((entry) => entry.inStock)
              : variant.availableQuantity > variant.soldQuantity;

            await product.save();
          }
        }
      }
    } catch (orderError) {
      console.error(
        "CRITICAL ERROR: Payment succeeded but order creation failed:",
        {
          paymentId,
          orderId,
          userId: tempUserId,
          error: orderError.message,
          stack: orderError.stack,
        }
      );

      return res.status(500).json({
        success: false,
        message:
          "Payment succeeded but order creation failed. Please contact support with payment ID.",
        data: {
          paymentId,
          orderId,
          needsRecovery: true,
          error: orderError.message,
        },
      });
    }

    // Only clear cart if it was a cart-based order (not direct order)
    if (!isDirectOrder && cart) {
      try {
        if (
          selectedItemIds &&
          Array.isArray(selectedItemIds) &&
          selectedItemIds.length > 0
        ) {
          cart.items = cart.items.filter(
            (item) => !selectedItemIds.includes(item._id.toString())
          );
        } else {
          cart.items = [];
        }
        await cart.save();
      } catch (cartError) {
        console.error(
          "Warning: Order created but cart clearing failed:",
          cartError
        );
      }
    }

    console.log("Order created successfully:", order._id);

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: {
        paymentId,
        orderId,
        orderNumber: order._id,
        status: "completed",
      },
    });
  } catch (error) {
    console.error("CRITICAL ERROR in verifyPayment:", {
      error: error.message,
      stack: error.stack,
      paymentId: req.body.paymentId,
      orderId: req.body.orderId,
    });

    return res.status(500).json({
      success: false,
      message:
        "Payment verification failed. Please contact support with payment ID.",
      data: {
        paymentId: req.body.paymentId,
        orderId: req.body.orderId,
        needsRecovery: true,
        error: error.message,
      },
    });
  }
};
export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await razorpay.payments.fetch(paymentId);

    return res.status(200).json({
      success: true,
      message: "Payment details fetched successfully",
      data: payment,
    });
  } catch (error) {
    console.log("Error fetching payment details:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error fetching payment details",
      data: null,
    });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    console.log("=== WEBHOOK RECEIVED ===");

    const webhookSignature =
      req.headers["x-razorpay-signature"] ||
      req.headers["X-Razorpay-Signature"] ||
      req.headers["X-RAZORPAY-SIGNATURE"];

    const isTestWebhook =
      req.headers["x-razorpay-event-id"] && !webhookSignature;

    console.log("Signature header exists:", !!webhookSignature);
    console.log("Is test webhook:", isTestWebhook);

    const webhookBody = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : typeof req.body === "string"
      ? req.body
      : JSON.stringify(req.body);

    let webhookData;
    try {
      webhookData =
        typeof webhookBody === "string" ? JSON.parse(webhookBody) : webhookBody;
    } catch (parseError) {
      console.error("Error parsing webhook body:", parseError);
      return res.status(400).json({
        success: false,
        message: "Invalid webhook body",
      });
    }

    const event = webhookData.event;
    const payment = webhookData.payload?.payment?.entity;

    console.log("Webhook received:", event, payment?.id);

    if (webhookSignature) {
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(webhookBody)
        .digest("hex");

      console.log("Signature comparison:", {
        received: webhookSignature?.substring(0, 20) + "...",
        expected: expectedSignature?.substring(0, 20) + "...",
        match: webhookSignature === expectedSignature,
      });

      if (webhookSignature !== expectedSignature) {
        console.error("Invalid webhook signature");
        return res.status(400).json({
          success: false,
          message: "Invalid webhook signature",
        });
      }
    } else {
      if (isTestWebhook) {
        console.warn(
          "⚠️ WARNING: Test webhook without signature (from Razorpay dashboard)"
        );

        const isProduction = process.env.NODE_ENV === "production";
        const isLocalhost =
          req.headers.host?.includes("localhost") ||
          req.headers.host?.includes("ngrok-free.dev") ||
          req.headers.host?.includes("127.0.0.1");

        if (isProduction && !isLocalhost) {
          console.error("❌ REJECTING: Production webhook without signature");
          return res.status(400).json({
            success: false,
            message: "Webhook signature required in production",
          });
        }

        console.log(
          "✅ Allowing test webhook without signature (Development/Test mode)"
        );
      } else {
        console.error(
          "❌ REJECTING: Webhook without signature (not a test webhook)"
        );
        return res.status(400).json({
          success: false,
          message: "Webhook signature required",
        });
      }
    }

    if (event === "payment.captured" && payment) {
      const paymentId = payment.id;
      const orderId = payment.order_id;

      const existingOrder = await Order.findOne({
        razorpayPaymentId: paymentId,
      });

      if (existingOrder) {
        console.log("Order already exists for webhook payment:", paymentId);
        return res.status(200).json({
          success: true,
          message: "Order already exists",
        });
      }

      let userId;
      try {
        const razorpayOrder = await razorpay.orders.fetch(orderId);
        userId = razorpayOrder.notes?.userId;
      } catch (err) {
        console.error("Error fetching Razorpay order in webhook:", err);
      }

      if (!userId) {
        console.error("No userId found in webhook for payment:", paymentId);
        return res.status(200).json({
          success: true,
          message: "No userId found, order will be created manually",
        });
      }

      const cart = await Cart.findOne({ user: userId }).populate(
        "items.product"
      );

      if (!cart || cart.items.length === 0) {
        console.error("Cart is empty for webhook payment:", paymentId);
        return res.status(200).json({
          success: true,
          message: "Cart empty, needs manual recovery",
        });
      }

      const orderItems = cart.items.map((item) => ({
        product: item.product._id || item.product,
        variant: item.variant,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      }));

      try {
        const order = await Order.create({
          user: userId,
          items: orderItems,
          subtotal: cart.totalAmount,
          totalAmount: cart.totalAmount,
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          paymentStatus: "completed",
          status: "confirmed",
        });

        for (const item of orderItems) {
          const product = await Product.findById(item.product);
          if (product && product.variants) {
            const variantIndex = product.variants.findIndex((v) => {
              if (item.variant.sku && v.sku === item.variant.sku) {
                return true;
              }
              const keysToMatch = ["color", "size", "flavour", "weight"];
              return keysToMatch.some(
                (key) => item.variant[key] && v[key] === item.variant[key]
              );
            });

            if (variantIndex !== -1) {
              const variant = product.variants[variantIndex];
              if (
                Array.isArray(variant.sizeInventory) &&
                variant.sizeInventory.length &&
                item.variant.selectedSize
              ) {
                const sizeEntryIndex = variant.sizeInventory.findIndex(
                  (entry) => entry.label === item.variant.selectedSize
                );

                if (sizeEntryIndex !== -1) {
                  variant.sizeInventory[sizeEntryIndex].soldQuantity =
                    (variant.sizeInventory[sizeEntryIndex].soldQuantity || 0) +
                    item.quantity;
                  const available =
                    Number(
                      variant.sizeInventory[sizeEntryIndex].availableQuantity
                    ) || 0;
                  const sold =
                    Number(
                      variant.sizeInventory[sizeEntryIndex].soldQuantity
                    ) || 0;
                  variant.sizeInventory[sizeEntryIndex].inStock =
                    available > sold;
                }
              } else {
                variant.soldQuantity =
                  (variant.soldQuantity || 0) + item.quantity;
              }

              variant.availableQuantity = variant.sizeInventory.length
                ? variant.sizeInventory.reduce(
                    (sum, entry) =>
                      sum +
                      Math.max(
                        0,
                        (Number(entry.availableQuantity) || 0) -
                          (Number(entry.soldQuantity) || 0)
                      ),
                    0
                  )
                : variant.availableQuantity;

              variant.inStock = variant.sizeInventory.length
                ? variant.sizeInventory.some((entry) => entry.inStock)
                : variant.availableQuantity > variant.soldQuantity;

              await product.save();
            }
          }
        }

        cart.items = [];
        await cart.save();

        console.log("✅ Order created via webhook:", order._id);
      } catch (orderError) {
        console.error("Failed to create order via webhook:", orderError);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const recoverOrder = async (req, res) => {
  try {
    const { paymentId, userId } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required",
        data: null,
      });
    }

    const existingOrder = await Order.findOne({
      razorpayPaymentId: paymentId,
    });

    if (existingOrder) {
      return res.status(200).json({
        success: true,
        message: "Order already exists",
        data: existingOrder,
      });
    }

    const payment = await razorpay.payments.fetch(paymentId);

    if (payment.status !== "captured") {
      return res.status(400).json({
        success: false,
        message: `Payment status is ${payment.status}, not captured`,
        data: {
          paymentId,
          status: payment.status,
        },
      });
    }

    const razorpayOrder = await razorpay.orders.fetch(payment.order_id);
    const orderUserId = userId || razorpayOrder.notes?.userId;

    if (!orderUserId) {
      return res.status(400).json({
        success: false,
        message: "User ID not found. Cannot recover order.",
        data: {
          paymentId,
          amount: payment.amount / 100,
        },
      });
    }

    const cart = await Cart.findOne({ user: orderUserId }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty. Cannot recover order. Please contact support.",
        data: {
          paymentId,
          amount: payment.amount / 100,
          userId: orderUserId,
        },
      });
    }

    const orderItems = cart.items.map((item) => ({
      product: item.product._id || item.product,
      variant: item.variant,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity,
    }));

    const order = await Order.create({
      user: orderUserId,
      items: orderItems,
      subtotal: cart.totalAmount,
      totalAmount: cart.totalAmount,
      razorpayOrderId: payment.order_id,
      razorpayPaymentId: paymentId,
      paymentStatus: "completed",
      status: "confirmed",
    });

    cart.items = [];
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Order recovered successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error recovering order:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error recovering order",
      data: null,
    });
  }
};
