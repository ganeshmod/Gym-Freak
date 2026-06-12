import Cart from "../model/cart.model.js";
import Product from "../model/product.model.js";
import User from "../model/user.model.js";

export const addToCart = async (req, res) => {
  try {
    const {
      productId,
      variantIndex,
      quantity = 1,
      userId,
      sizeLabel,
    } = req.body;

    // const userId = req.userId;

    const tempUserId = userId || "689e2b7e9714e06e3575fc95";

    if (!productId || variantIndex == undefined) {
      return res.status(400).json({
        success: false,
        message: "Product ID and variant index are required",
        data: null,
      });
    }

    // const user = await User.findById(userId);
    // if (!user) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "User not found",
    //     data: null,
    //   });
    // }

    const product = await Product.findById(productId).populate(
      "category",
      "name"
    );
    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    if (!product.variants || !product.variants[variantIndex]) {
      return res.status(400).json({
        success: false,
        message: "Invalid variant selected",
        data: null,
      });
    }

    const selectedVariant = product.variants[variantIndex];
    let remainingQty;
    let sizeEntry = null;
    const availableQty = selectedVariant.availableQuantity || 0;
    const soldQty = selectedVariant.soldQuantity || 0;
    const isInStock = availableQty > 0 && soldQty < availableQty;

    if (
      Array.isArray(selectedVariant.sizeInventory) &&
      selectedVariant.sizeInventory.length
    ) {
      if (!sizeLabel) {
        return res.status(400).json({
          success: false,
          message: "Please select a size",
          data: null,
        });
      }

      sizeEntry = selectedVariant.sizeInventory.find(
        (entry) => entry.label === sizeLabel
      );

      if (!sizeEntry) {
        return res.status(400).json({
          success: false,
          message: "Invalid size selection",
          data: null,
        });
      }

      const availableQty = Number(sizeEntry.availableQuantity) || 0;
      const soldQty = Number(sizeEntry.soldQuantity) || 0;

      if (!sizeEntry.inStock || availableQty <= soldQty) {
        return res.status(400).json({
          success: false,
          message: "Selected size is out of stock",
          data: null,
        });
      }

      remainingQty = availableQty - soldQty;
    } else {
      const availableQty = Number(selectedVariant.availableQuantity) || 0;
      const soldQty = Number(selectedVariant.soldQuantity) || 0;
      const isInStock = availableQty > 0 && soldQty < availableQty;

      if (!isInStock || selectedVariant.inStock === false) {
        return res.status(400).json({
          success: false,
          message: "Selected variant is out of stock",
          data: null,
        });
      }

      remainingQty = availableQty - soldQty;
    }

    if (quantity > remainingQty) {
      return res.status(400).json({
        success: false,
        message: `Only ${remainingQty} item(s) available in stock`,
        data: null,
      });
    }

    let cart = await Cart.findOne({ user: tempUserId });
    if (!cart) {
      cart = new Cart({ user: tempUserId, items: [] });
    }
    const serializedVariant = selectedVariant.toObject
      ? selectedVariant.toObject()
      : { ...selectedVariant };

    const variantForCart = {
      ...serializedVariant,
      selectedSize: sizeEntry ? sizeEntry.label : null,
    };

    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        JSON.stringify(item.variant) === JSON.stringify(variantForCart)
    );

    if (existingItemIndex !== -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        variant: variantForCart,
        quantity: quantity,
        price: selectedVariant.price,
      });
    }

    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "name slug brand images",
      populate: {
        path: "category",
        select: "name",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      data: cart,
    });
  } catch (error) {
    console.log("Error in addToCart:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error adding product to cart",
      data: null,
    });
  }
};

export const getCartItems = async (req, res) => {
  try {
    const { userId } = req.query;
    // const userId = req.userId;

    const tempUserId = userId || "689e2b7e9714e06e3575fc95";

    // const user = await User.findById(userId);
    // if (!user) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "User not found",
    //     data: null,
    //   });
    // }

    const cart = await Cart.findOne({ user: tempUserId }).populate({
      path: "items.product",
      select: "name slug brand images",
      populate: {
        path: "category",
        select: "name",
      },
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        data: {
          items: [],
          totalAmount: 0,
          totalItems: 0,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cart items fetched successfully",
      data: cart,
    });
  } catch (error) {
    console.log("Error in getCartItems:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error fetching cart items",
      data: null,
    });
  }
};

export const updateCartItemQuantity = async (req, res) => {
  try {
    const { itemId, quantity, userId } = req.body;
    // const userId = req.userId;

    const tempUserId = userId || "689e2b7e9714e06e3575fc95";

    if (!itemId || quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Item ID and valid quantity are required",
        data: null,
      });
    }

    const cart = await Cart.findOne({ user: tempUserId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
        data: null,
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
        data: null,
      });
    }

    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "name slug brand images",
      populate: {
        path: "category",
        select: "name",
      },
    });

    return res.status(200).json({
      success: true,
      message:
        quantity === 0
          ? "Item removed from cart"
          : "Cart item updated successfully",
      data: cart,
    });
  } catch (error) {
    console.log("Error in updateCartItemQuantity:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error updating cart item",
      data: null,
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { userId } = req.query;

    const tempUserId = userId || "689e2b7e9714e06e3575fc95";

    const cart = await Cart.findOne({ user: tempUserId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
        data: null,
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
        data: null,
      });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "name slug brand images",
      populate: {
        path: "category",
        select: "name",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      data: cart,
    });
  } catch (error) {
    console.log("Error in removeFromCart:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error removing item from cart",
      data: null,
    });
  }
};

export const mergeCart = async (req, res) => {
  try {
    const { userId, guestCartItems } = req.body;

    if (!userId || !guestCartItems || !Array.isArray(guestCartItems)) {
      return res.status(400).json({
        success: false,
        message: "User ID and guest cart items are required",
        data: null,
      });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    for (const guestItem of guestCartItems) {
      const product = await Product.findById(guestItem?.productId);
      if (
        !product ||
        !product.variants ||
        !product.variants[guestItem.variantIndex]
      ) {
        continue;
      }

      const selectedVariant = product.variants[guestItem.variantIndex];

      const existingItemIndex = cart.items.findIndex(
        (item) =>
          item?.product?.toString() === guestItem?.productId &&
          JSON.stringify(item?.variant) === JSON.stringify(selectedVariant)
      );

      if (existingItemIndex !== -1) {
        cart.items[existingItemIndex].quantity += guestItem.quantity;
      } else {
        cart.items.push({
          product: guestItem.productId,
          variant: selectedVariant,
          quantity: guestItem.quantity,
          price: selectedVariant.price,
        });
      }
    }

    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "name slug brand images",
      populate: {
        path: "category",
        select: "name",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Cart merged successfully",
      data: cart,
    });
  } catch (error) {
    console.log("Error in mergeCart:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error merging cart",
      data: null,
    });
  }
};
