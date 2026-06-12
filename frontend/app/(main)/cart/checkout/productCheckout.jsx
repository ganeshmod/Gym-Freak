"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  CreditCard,
  Truck,
  Minus,
  Plus,
  CheckCircle2,
  MapPin,
  Edit2,
  Phone,
  Mail,
  ShoppingCart,
} from "lucide-react";
import { useGlobalStore } from "@/globalStore";
import { useToast } from "@/app/components/customToastProvider";
import { useRazorpay } from "@/app/(main)/payments/useRazorpay";
import EditProfileDialog from "../../user-profile/EditBasicInfo";
import AddressDialog from "../../user-profile/EditAddress";
import { useRouter, useSearchParams } from "next/navigation";
import { genericGetApi } from "@/app/admin/api-helper-admin";
import { getGuestCart } from "@/lib/guestCart";
import { getVariantDetails } from "@/lib/helperfunc";
import Image from "next/image";

// Mock product data
const MOCK_PRODUCT = {
  name: "Bexor Black Unisex Straight Fit Baggy Pants",
  size: "Extra Small",
  image: "/png/dummy-product.png",
  price: 1445,
  originalPrice: 2699,
};

export default function CheckoutPage({
  product = null,
  isEmbedded = false,
  onComplete = null,
  buyNowItem = null,
}) {
  const userDetails = useGlobalStore((state) => state.userDetails);
  const { initiatePayment } = useRazorpay();
  const { success, error, warning } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const setCartCount = useGlobalStore((state) => state.setCartCount);

  // Steps configuration
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    { id: 0, label: "Cart", icon: User },
    { id: 1, label: "Address", icon: MapPin },
    { id: 2, label: "Payment", icon: CreditCard },
    { id: 3, label: "Confirmation", icon: Truck },
  ];

  // Cart state
  const [cartItems, setCartItems] = useState([]);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loadingCart, setLoadingCart] = useState(true);
  const [isBuyNowMode, setIsBuyNowMode] = useState(false);

  // Dialogs state
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Address state
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  // Fetch cart items on mount
  useEffect(() => {
    const fetchCartData = async () => {
      setLoadingCart(true);
      try {
        // Check if it's "Buy Now" mode from URL or prop
        const buyNowItemId =
          searchParams?.get("buyNow") || (buyNowItem ? buyNowItem._id : null);

        if (buyNowItemId || buyNowItem) {
          // Single item "Buy Now" mode
          setIsBuyNowMode(true);
          const item = buyNowItem || (await fetchCartItemById(buyNowItemId));
          if (item) {
            setCartItems([item]);
            setSelectedItemIds([item._id]);
            setQuantities({ [item._id]: item.quantity || 1 });
          }
        } else {
          // Regular checkout with selected items
          const storedSelectedIds = localStorage.getItem(
            "checkoutSelectedItems"
          );
          let itemsToCheckout = [];

          if (userDetails?._id) {
            const data = await genericGetApi(
              `/api/cart/items?userId=${userDetails._id}`
            );
            if (data && data.success && data.data?.items) {
              itemsToCheckout = data.data.items;
            }
          } else {
            const guestCart = getGuestCart();
            // Fetch full product details for guest cart
            itemsToCheckout = await Promise.all(
              guestCart.map(async (guestItem) => {
                try {
                  const productData = await genericGetApi(
                    "/api/product/getProduct",
                    {
                      id: guestItem.productId,
                    }
                  );
                  if (productData?.success && productData?.data) {
                    const product = Array.isArray(productData.data)
                      ? productData.data[0]
                      : productData.data;
                    return {
                      _id:
                        guestItem.guestItemId ||
                        `guest_${guestItem.productId}_${guestItem.variantIndex}`,
                      product: {
                        _id: product._id,
                        name: product.name,
                        slug: product.slug,
                        brand: product.brand,
                        images: product.images,
                      },
                      variant: guestItem.variant,
                      quantity: guestItem.quantity,
                      price: guestItem.variant.price,
                      isGuestItem: true,
                    };
                  }
                } catch (err) {
                  console.error("Error fetching product:", err);
                }
              })
            );
          }

          const handoffIdsRaw = localStorage.getItem("checkoutSelectedItems");
          const persistedIdsRaw = localStorage.getItem("cartSelectedItemIds");
          if (handoffIdsRaw) {
            const ids = JSON.parse(handoffIdsRaw);
            setSelectedItemIds(ids);
            localStorage.removeItem("checkoutSelectedItems");
          } else if (persistedIdsRaw) {
            setSelectedItemIds(JSON.parse(persistedIdsRaw));
          } else {
            setSelectedItemIds([]);
          }
          setCartItems(itemsToCheckout);
          const initialQuantities = {};
          itemsToCheckout.forEach((item) => {
            initialQuantities[item._id] = item.quantity || 1;
          });
          setQuantities(initialQuantities);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
        error("Failed to load cart items");
      } finally {
        setLoadingCart(false);
      }
    };

    fetchCartData();
  }, [userDetails, searchParams, buyNowItem]);

  const fetchCartItemById = async (itemId) => {
    try {
      if (userDetails?._id) {
        const data = await genericGetApi(
          `/api/cart/items?userId=${userDetails._id}`
        );
        if (data && data.success && data.data?.items) {
          return data.data.items.find((item) => item._id === itemId);
        }
      }
    } catch (error) {
      console.error("Error fetching cart item:", error);
    }
    return null;
  };

  // Calculate subtotal from selected items
  const calculateSubtotal = () => {
    return cartItems
      .filter((item) => selectedItemIds.includes(item._id))
      .reduce((total, item) => {
        const qty = quantities[item._id] || item.quantity || 1;
        return total + (item.variant?.price || item.price || 0) * qty;
      }, 0);
  };

  const subtotal = calculateSubtotal().toFixed(2);

  // Initialize with default address
  useEffect(() => {
    if (userDetails?.addresses?.length > 0) {
      const defaultAddr = userDetails.addresses.find((addr) => addr.isDefault);
      const firstAddr = userDetails.addresses[0];
      setSelectedAddressId(defaultAddr?._id || firstAddr?._id);
    }
  }, [userDetails]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    // Validate phone on step 1
    if (activeStep === 1 && !userDetails?.phone) {
      setIsProfileDialogOpen(true);
      warning("Please add your phone number to continue");
      return;
    }

    // Validate address on step 1
    if (activeStep === 1 && !selectedAddressId) {
      warning("Please select a delivery address");
      return;
    }
    if (
      activeStep === 0 &&
      (selectedItemIds.length === 0 || cartItems.length === 0)
    ) {
      warning("No items selected for checkout");
      return;
    }

    setActiveStep((s) => (s < steps.length - 1 ? s + 1 : s));
  }, [
    activeStep,
    selectedAddressId,
    steps.length,
    userDetails?.phone,
    error,
    selectedItemIds,
    cartItems,
    warning,
  ]);

  const handlePrev = useCallback(() => {
    setActiveStep((s) => (s > 0 ? s - 1 : s));
  }, []);

  // Handle complete order with Razorpay
  const handleCompleteOrder = async () => {
    try {
      setIsPaymentProcessing(true);

      const itemsToOrder = cartItems.filter((item) =>
        selectedItemIds.includes(item._id)
      );
      const orderAmount = parseFloat(subtotal);
      await initiatePayment(
        orderAmount,
        userDetails._id,
        selectedItemIds,
        false,
        null,
        (result) => {
          success("Payment successful! Order placed.");
          handleNext();

          const remainingCount = cartItems
            .filter((item) => !selectedItemIds.includes(item._id))
            .reduce(
              (total, item) =>
                total + (quantities[item._id] || item.quantity || 0),
              0
            );
          setCartCount(remainingCount);
          const persistedRaw = localStorage.getItem("cartSelectedItemIds");
          if (persistedRaw) {
            const persisted = new Set(JSON.parse(persistedRaw));
            selectedItemIds.forEach((id) => persisted.delete(id));
            localStorage.setItem(
              "cartSelectedItemIds",
              JSON.stringify(Array.from(persisted))
            );
          }
          if (onComplete) onComplete();
        },
        (err) => {
          error(`Payment failed: ${err}`);
        }
      );
    } catch (err) {
      console.error("Payment error:", err);
      error("Payment failed. Please try again.");
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  // Handle address dialog
  const openAddAddress = () => {
    setEditingAddress(null);
    setIsAddressDialogOpen(true);
  };

  const openEditAddress = (address) => {
    setEditingAddress(address);
    setIsAddressDialogOpen(true);
  };

  const selectedAddress = userDetails?.addresses?.find(
    (a) => a._id === selectedAddressId
  );

  const getProductImage = (item) => {
    if (item?.variant?.images && item.variant.images.length > 0) {
      return item.variant.images[0].url;
    }
    return item?.product?.images?.[0]?.url || "/placeholder.png";
  };

  const containerClass = isEmbedded ? "w-full" : "min-h-screen app-bg p-6";

  const contentClass = isEmbedded ? "w-full" : "max-w-4xl mx-auto";

  if (loadingCart) {
    return (
      <div className={containerClass}>
        <div className={contentClass}>
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <ShoppingCart
                  className="mx-auto mb-4 text-gray-400"
                  size={48}
                />
                <p className="text-gray-500">Loading cart...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className={containerClass}>
        <div className={contentClass}>
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <ShoppingCart
                  className="mx-auto mb-4 text-gray-400"
                  size={48}
                />
                <p className="text-gray-500 mb-4">No items to checkout</p>
                <Button onClick={() => router.push("/cart")} variant="outline">
                  Back to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        {/* Header */}
        {!isEmbedded && (
          <Card className="border-none shadow-lg mb-6">
            <CardHeader className="bg-gradient-to-r app-black-text rounded-t-lg">
              <CardTitle className="text-3xl font-bold">Checkout</CardTitle>
              <p className="text-zinc-500">
                {isBuyNowMode
                  ? "Complete your purchase"
                  : "Complete your purchase in a few simple steps"}
              </p>
            </CardHeader>
          </Card>
        )}

        {/* Progress Steps */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-3 justify-center">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = activeStep >= step.id;
                return (
                  <div key={step.id} className="flex items-center min-w-0">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                        isActive
                          ? "bg-black border-black text-white"
                          : "bg-white border-gray-300 text-gray-400"
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <span
                      className={`ml-2 text-sm font-medium truncate ${
                        isActive ? "text-black" : "text-gray-500"
                      }`}
                      style={{ maxWidth: 100 }}
                    >
                      {step.label}
                    </span>
                    {index < steps.length - 1 && (
                      <div
                        className={`mx-4 w-12 h-0.5 hidden sm:block transition-colors ${
                          activeStep > step.id ? "bg-black" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            {/* Step 0: Cart */}
            {activeStep === 0 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold">Review Your Cart</h3>

                {/* Product Card */}
                <div className="space-y-4">
                  {cartItems
                    ?.filter((item) => selectedItemIds.includes(item._id))
                    .map((item) => {
                      const qty = quantities[item._id] || item.quantity || 1;
                      const itemPrice = item.variant?.price || item.price || 0;
                      const itemTotal = itemPrice * qty;
                      const isSelected = true;

                      return (
                        <div
                          key={item._id}
                          className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
                        >
                          <Image
                            src={getProductImage(item)}
                            alt={item.product?.name || "Product"}
                            width={96}
                            height={96}
                            className="rounded overflow-hidden bg-gray-100 flex-shrink-0 object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-base font-semibold leading-snug">
                              {item.product?.name || "Product"}
                            </p>
                            <div className="mt-1 space-y-1">
                              {getVariantDetails(item.variant || {})
                                .split(", ")
                                .filter((detail) => detail.trim())
                                .map((detail, i) => (
                                  <span
                                    key={i}
                                    className="text-xs bg-zinc-200 text-gray-700 px-2 py-0.5 rounded mr-1"
                                  >
                                    {detail}
                                  </span>
                                ))}
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                              {!isBuyNowMode && (
                                <div className="flex items-center  rounded-md overflow-hidden">
                                  <p className="text-base">Quantity: </p>
                                  <button
                                    // onClick={() => {
                                    //   const newQty = Math.max(1, qty - 1);
                                    //   setQuantities((prev) => ({
                                    //     ...prev,
                                    //     [item._id]: newQty,
                                    //   }));
                                    // }}
                                    className=" hover:bg-gray-100 disabled:opacity-50"
                                    disabled={qty <= 1}
                                  >
                                    {/* <Minus size={16} /> */}
                                  </button>
                                  <div className="px-4 text-base font-medium">
                                    {qty}
                                  </div>
                                  <button
                                    // onClick={() => {
                                    //   const newQty = qty + 1;
                                    //   setQuantities((prev) => ({
                                    //     ...prev,
                                    //     [item._id]: newQty,
                                    //   }));
                                    // }}
                                    className="p-2 hover:bg-gray-100"
                                  >
                                    {/* <Plus size={16} /> */}
                                  </button>
                                </div>
                              )}
                              {isBuyNowMode && (
                                <div className="text-sm text-gray-600">
                                  Qty: {qty}
                                </div>
                              )}

                              <div className="text-right">
                                {item.variant?.discountPercent > 0 && (
                                  <div className="text-sm text-gray-500 line-through">
                                    Rs.{" "}
                                    {Math.round(
                                      (itemPrice /
                                        (1 -
                                          item.variant.discountPercent / 100)) *
                                        qty
                                    ).toLocaleString()}
                                  </div>
                                )}
                                <div className="text-base font-bold">
                                  Rs. {itemTotal.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex items-center justify-between text-base">
                    <span className="text-gray-700">Subtotal</span>
                    <span className="font-bold">Rs. {subtotal}</span>
                  </div>
                  {selectedItemIds.length > 0 && (
                    <p className="text-xs text-gray-500">
                      {selectedItemIds.length} item(s) selected
                    </p>
                  )}
                  <Button
                    onClick={handleNext}
                    className="w-full h-12 bg-black text-white hover:bg-gray-900 font-semibold"
                  >
                    Proceed to Address
                  </Button>
                </div>
              </div>
            )}

            {/* Step 1: Address Selection */}
            {activeStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold">Delivery Information</h3>

                {/* User Info Section */}
                <Card className="bg-gray-50">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-base font-bold text-gray-700">
                        Contact Information
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsProfileDialogOpen(true)}
                        className="gap-2"
                      >
                        <Edit2 size={14} />
                        Edit
                      </Button>
                    </div>

                    <div className="grid gap-3">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-500" />
                        <span className="text-sm font-medium">
                          {userDetails?.name} {userDetails?.lastName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {userDetails?.email}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-500" />
                        <span
                          className={`text-sm ${
                            userDetails?.phone
                              ? "text-gray-700"
                              : "text-red-500"
                          }`}
                        >
                          {userDetails?.phone || "No phone number added"}
                        </span>
                      </div>
                    </div>

                    {!userDetails?.phone && (
                      <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
                        ⚠️ Phone number is required to proceed with checkout
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Address Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold">
                      Select Delivery Address
                    </h4>
                    <Button
                      onClick={openAddAddress}
                      size="sm"
                      variant="outline"
                      className="gap-2"
                    >
                      <MapPin size={14} />
                      Add New
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {userDetails?.addresses?.map((addr) => (
                      <Card
                        key={addr._id}
                        onClick={() => setSelectedAddressId(addr._id)}
                        className={`cursor-pointer transition-all ${
                          selectedAddressId === addr._id
                            ? "border-2 border-black bg-gray-50"
                            : "border-2 border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold px-2 py-1 bg-black text-white rounded">
                                  {addr.type}
                                </span>
                                {addr.isDefault && (
                                  <span className="text-xs text-gray-600 italic">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-medium">
                                {addr.street}
                              </p>
                              {addr.landMark && (
                                <p className="text-xs text-gray-600">
                                  Near {addr.landMark}
                                </p>
                              )}
                              <p className="text-xs text-gray-600 mt-1">
                                {addr.city}, {addr.state} {addr.postalCode}
                              </p>
                              <p className="text-xs text-gray-600">
                                {addr.country}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditAddress(addr);
                              }}
                              className="h-8 w-8 hover:bg-gray-200"
                            >
                              <Edit2 size={14} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {(!userDetails?.addresses ||
                      userDetails.addresses.length === 0) && (
                      <div className="text-center py-12 text-gray-500">
                        <MapPin
                          size={48}
                          className="mx-auto mb-3 text-gray-300"
                        />
                        <p className="text-sm mb-4">No addresses saved</p>
                        <Button
                          onClick={openAddAddress}
                          className="bg-black text-white hover:bg-gray-900"
                          size="sm"
                        >
                          Add Your First Address
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button
                      onClick={handlePrev}
                      variant="outline"
                      className="flex-1 border-2 border-black hover:bg-black hover:text-white"
                    >
                      Back to Cart
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={!userDetails?.phone || !selectedAddressId}
                      className="flex-1 bg-black text-white hover:bg-gray-900"
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {activeStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold">Review & Pay</h3>

                {/* Delivery Address Summary */}
                {selectedAddress && (
                  <Card className="bg-gray-50">
                    <CardContent className="pt-6">
                      <p className="text-xs font-semibold text-gray-600 mb-2">
                        Delivering to:
                      </p>
                      <p className="text-sm font-medium">
                        {selectedAddress.street}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedAddress.city}, {selectedAddress.state}{" "}
                        {selectedAddress.postalCode}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Payment Information */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <CreditCard className="text-blue-600 mt-0.5" size={24} />
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-blue-900 mb-2">
                          Secure Payment via Razorpay
                        </h4>
                        <p className="text-sm text-blue-700">
                          You'll be redirected to Razorpay's secure payment
                          gateway to complete your purchase.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Summary */}
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-base">
                    <span>Subtotal</span>
                    <span>Rs. {subtotal}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span>Delivery</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-3 border-t">
                    <span>Total</span>
                    <span>Rs. {subtotal}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handlePrev}
                    variant="outline"
                    className="flex-1 border-2 border-black hover:bg-black hover:text-white"
                    disabled={isPaymentProcessing}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCompleteOrder}
                    disabled={isPaymentProcessing}
                    className="flex-1 bg-black text-white hover:bg-gray-900 font-semibold"
                  >
                    {isPaymentProcessing ? "Processing..." : "Proceed to Pay"}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Order Completed */}
            {activeStep === 3 && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="text-green-600" size={48} />
                </div>
                <h3 className="text-2xl font-bold">
                  Order Placed Successfully!
                </h3>
                <p className="text-base text-gray-600 max-w-md">
                  Thank you for your purchase. Your order has been received and
                  is being processed.
                </p>
                <Card className="bg-gray-50 w-full max-w-md">
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-600 mb-3 font-semibold">
                      Order Summary
                    </p>
                    <div className="space-y-2 text-base">
                      {cartItems
                        .filter((item) => selectedItemIds.includes(item._id))
                        .map((item, index) => {
                          const qty =
                            quantities[item._id] || item.quantity || 1;
                          return (
                            <div key={item._id || index}>
                              <div className="flex justify-between">
                                <span>Item {index + 1}:</span>
                                <span className="font-medium">
                                  {item.product?.name?.slice(0, 25) ||
                                    "Product"}
                                  ...
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Quantity:</span>
                                <span className="font-medium">{qty}</span>
                              </div>
                            </div>
                          );
                        })}
                      <div className="flex justify-between pt-3 border-t font-bold text-lg">
                        <span>Total:</span>
                        <span>Rs. {parseFloat(subtotal).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Button
                  onClick={() => {
                    setActiveStep(0);
                    if (onComplete) onComplete();
                    router.push("/");
                  }}
                  className="bg-black text-white hover:bg-gray-900 mt-4 px-8"
                >
                  Continue Shopping
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <EditProfileDialog
        userDetails={userDetails}
        open={isProfileDialogOpen}
        onClose={() => setIsProfileDialogOpen(false)}
      />

      <AddressDialog
        userId={userDetails?._id}
        addressData={editingAddress}
        open={isAddressDialogOpen}
        onClose={() => {
          setIsAddressDialogOpen(false);
          setEditingAddress(null);
        }}
      />
    </div>
  );
}
