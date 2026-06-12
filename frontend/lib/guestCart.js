const GUEST_CART_KEY = "guestCart";

export const getGuestCart = () => {
  if (typeof window === "undefined") return [];
  try {
    const cart = localStorage.getItem(GUEST_CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.log("Error reading guest cart", error);
    return [];
  }
};

export const saveGuestCart = (items) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Error saving guest cart:", error);
  }
};

export const clearGuestCart = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch (error) {
    console.error("Error clearing guest cart:", error);
  }
};

export const addToGuestCart = (
  productId,
  variantIndex,
  quantity,
  variant,
  sizeLabel
) => {
  const cart = getGuestCart();
  const signature = JSON.stringify({
    sku: variant.sku,
    sizeLabel: sizeLabel || null,
  });
  const existingItemIndex = cart.findIndex(
    (item) =>
      item.productId === productId &&
      item.variantIndex === variantIndex &&
      item.signature === signature
  );

  if (existingItemIndex !== -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({
      guestItemId: `guest_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      productId,
      variantIndex,
      quantity,
      variant,
      sizeLabel: sizeLabel || null,
      signature,
    });
  }

  saveGuestCart(cart);
  return cart;
};

export const updateGuestCartQuantity = (itemIndex, quantity) => {
  const cart = getGuestCart();
  if (itemIndex >= 0 && itemIndex < cart.length) {
    if (quantity <= 0) {
      cart.splice(itemIndex, 1);
    } else {
      cart[itemIndex].quantity = quantity;
    }
    saveGuestCart(cart);
  }
  return cart;
};

export const removeFromGuestCart = (itemIndex) => {
  const cart = getGuestCart();
  if (itemIndex >= 0 && itemIndex < cart.length) {
    cart.splice(itemIndex, 1);
    saveGuestCart(cart);
  }
  return cart;
};

export const updateGuestCartItemById = (guestItemId, quantity) => {
  const cart = getGuestCart();
  const itemIndex = cart.findIndex((item) => item.guestItemId === guestItemId);
  if (itemIndex !== -1) {
    if (quantity <= 0) {
      cart.splice(itemIndex, 1);
    } else {
      cart[itemIndex].quantity = quantity;
    }
    saveGuestCart(cart);
  }
  return cart;
};

export const removeGuestCartItemById = (guestItemId) => {
  const cart = getGuestCart();
  const itemIndex = cart.findIndex((item) => item.guestItemId === guestItemId);
  if (itemIndex !== -1) {
    cart.splice(itemIndex, 1);
    saveGuestCart(cart);
  }
  return cart;
};
