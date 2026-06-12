"use client";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { genericGetApi, genericPostApi } from "@/app/admin/api-helper-admin";
import { useRazorpay } from "../payments/useRazorpay";
import { useToast } from "@/app/components/customToastProvider";
import { CartItemShimmer } from "@/app/components/productShimmer";
import { useGlobalStore } from "@/globalStore";
import {
  getGuestCart,
  removeFromGuestCart,
  updateGuestCartQuantity,
} from "@/lib/guestCart";
import BASE_API_URL from "@/api-config";
import { useRouter } from "next/navigation";
import { getVariantDetails } from "@/lib/helperfunc";
import { Checkbox } from "@/components/ui/checkbox";

export default function CartComponent() {
  const router = useRouter();
  const userDetails = useGlobalStore((state) => state.userDetails);
  const setCartCount = useGlobalStore((state) => state.setCartCount);
  const [cartProducts, setCartProducts] = useState([]);
  const [loadingState, setLoadingState] = useState({
    productsLoading: true,
    paymentLoading: false,
  });
  const [quantities, setQuantities] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const { success, error, warning } = useToast();
  const debounceTimerRef = useRef(null);

  const { initiatePayment } = useRazorpay();

  const getUserId = () => {
    return userDetails?._id || null;
  };

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoadingState((prev) => ({ ...prev, productsLoading: true }));
        const userId = getUserId();

        if (userId) {
          const data = await genericGetApi(`/api/cart/items?userId=${userId}`);

          if (data && data.success) {
            let persisted = JSON.parse(
              localStorage.getItem("cartSelectedItemIds") || "[]"
            );
            if (persisted.length === 0 && data?.data?.items?.length > 0) {
              persisted = data?.data?.items.map((item) => item._id);
              localStorage.setItem(
                "cartSelectedItemIds",
                JSON.stringify(persisted)
              );
            }
            const filteredItem = data?.data?.items.map((prev) => ({
              ...prev,
              selected: persisted.includes(prev._id),
            }));
            setCartProducts(filteredItem || []);
            setTotalAmount(data?.data?.totalAmount || 0);

            const count =
              data?.data?.items?.reduce(
                (total, item) => total + (item.quantity || 0),
                0
              ) || 0;
            setCartCount(count);

            const initialQuantities = {};
            data?.data?.items?.forEach((item) => {
              initialQuantities[item._id] = item.quantity;
            });
            setQuantities(initialQuantities);
          } else {
            setCartProducts([]);
            setTotalAmount(0);
          }
        } else {
          const guestCart = getGuestCart();

          if (guestCart?.length > 0) {
            const items = [];
            let total = 0;

            for (const guestItem of guestCart) {
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

                  const variant = guestItem.variant;
                  const itemQuantity = guestItem.quantity || 1;
                  const itemTotal = variant.price * itemQuantity;
                  total += itemTotal;

                  items.push({
                    _id:
                      guestItem.guestItemId ||
                      `guest_${guestItem.productId}_${guestItem.variantIndex}`,
                    guestItemId: guestItem.guestItemId,
                    product: {
                      _id: product._id,
                      name: product.name,
                      slug: product.slug,
                      brand: product.brand,
                      images: product.images,
                    },
                    variant: variant,
                    quantity: itemQuantity,
                    price: variant.price,
                    isGuestItem: true,
                  });
                }
              } catch (err) {
                console.error(
                  `Error fetching product ${guestItem.productId}:`,
                  err
                );
              }
            }

            if (items.length > 0) {
              const persisted = JSON.parse(
                localStorage.getItem("cartSelectedItemIds") || "[]"
              );
              if (persisted.length === 0) {
                const allIds = items.map((item) => item._id);
                localStorage.setItem(
                  "cartSelectedItemIds",
                  JSON.stringify(allIds)
                );
                setCartProducts(
                  items.map((item) => ({ ...item, selected: true }))
                );
              } else {
                setCartProducts(
                  items.map((item) => ({
                    ...item,
                    selected: persisted.includes(item._id),
                  }))
                );
              }
            } else {
              setCartProducts(items);
            }
            setTotalAmount(total);
            const count = items.reduce(
              (total, item) => total + (item.quantity || 0),
              0
            );
            setCartCount(count);

            const initialQuantities = {};
            items.forEach((item) => {
              initialQuantities[item._id] = item.quantity;
            });
            setQuantities(initialQuantities);
          } else {
            setCartProducts([]);
            setTotalAmount(0);
          }
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
        error("Failed to fetch cart items");
        setCartProducts([]);
        setTotalAmount(0);
      } finally {
        setTimeout(
          () =>
            setLoadingState((prev) => ({ ...prev, productsLoading: false })),
          300
        );
      }
    };

    fetchCartItems();
  }, [userDetails]);

  // Update subtotal based on selected items and quantities
  useEffect(() => {
    if (!cartProducts || cartProducts.length === 0) {
      setTotalAmount(0);
      return;
    }

    const selectedTotal = cartProducts.reduce((sum, item) => {
      if (item.selected) {
        const quantity = quantities[item._id] || item.quantity || 1;
        const price = item.variant?.price || 0;
        sum += price * quantity;
      }
      return sum;
    }, 0);

    setTotalAmount(selectedTotal);
  }, [cartProducts, quantities]);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    const userId = getUserId();

    try {
      if (userId) {
        const data = await genericPostApi("/api/cart/update-quantity", {
          itemId: itemId,
          quantity: newQuantity,
          userId: userId,
        });

        if (data && data.success) {
          setQuantities((prev) => ({ ...prev, [itemId]: newQuantity }));
          setTotalAmount(data.data.totalAmount);
          const count = data.data.items.reduce(
            (total, item) => total + (item.quantity || 0),
            0
          );
          setCartCount(count);
        } else {
          warning("Could not update quantity");
        }
      } else {
        const guestCart = getGuestCart();
        const itemIndex = guestCart.findIndex(
          (item) =>
            item.guestItemId === itemId ||
            `guest_${item.productId}_${item.variantIndex}` === itemId
        );

        if (itemIndex !== -1) {
          updateGuestCartQuantity(itemIndex, newQuantity);

          const updatedCart = getGuestCart();
          const count = updatedCart.reduce(
            (total, item) => total + (item.quantity || 0),
            0
          );
          setCartCount(count);
          const items = [];
          let total = 0;

          for (const guestItem of updatedCart) {
            const existingItem = cartProducts.find(
              (item) =>
                item.guestItemId === guestItem.guestItemId ||
                (item.isGuestItem && item.product._id === guestItem.productId)
            );

            if (existingItem) {
              const updatedItem = { ...existingItem };
              updatedItem.quantity = guestItem.quantity;
              items.push(updatedItem);
              total += guestItem.variant.price * guestItem.quantity;
            }
          }

          setCartProducts(items);
          setTotalAmount(total);
          setQuantities((prev) => ({ ...prev, [itemId]: newQuantity }));
        }
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      error("Error updating item quantity");
    }
  };

  const debounceQuantity = (itemId, newQuantity) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setQuantities((prev) => ({ ...prev, [itemId]: newQuantity }));

    debounceTimerRef.current = setTimeout(() => {
      updateQuantity(itemId, newQuantity);
    }, 500);
  };

  const removeItem = async (itemId) => {
    const userId = getUserId();
    try {
      if (userId) {
        const response = await fetch(
          `${
            BASE_API_URL || "http://localhost:8080"
          }/api/cart/remove/${itemId}?userId=${userId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (data.success) {
          setCartProducts((prev) => prev.filter((item) => item._id !== itemId));
          setTotalAmount(data.data.totalAmount);
          setQuantities((prev) => {
            const newQuantities = { ...prev };
            delete newQuantities[itemId];
            return newQuantities;
          });
          const count = data.data.items.reduce(
            (total, item) => total + (item.quantity || 0),
            0
          );
          setCartCount(count);
        } else {
          warning("Failed to remove item");
        }
      } else {
        const guestCart = getGuestCart();
        const itemIndex = guestCart.findIndex(
          (item) =>
            item.guestItemId === itemId ||
            `guest_${item.productId}_${item.variantIndex}` === itemId
        );

        if (itemIndex !== -1) {
          removeFromGuestCart(itemIndex);

          const updatedItems = cartProducts.filter(
            (item) => item._id !== itemId
          );
          setCartProducts(updatedItems);

          const total = updatedItems.reduce((sum, item) => {
            return sum + item.variant.price * item.quantity;
          }, 0);
          setTotalAmount(total);
          const count = updatedItems.reduce(
            (total, item) => total + (item.quantity || 0),
            0
          );
          setCartCount(count);

          setQuantities((prev) => {
            const newQuantities = { ...prev };
            delete newQuantities[itemId];
            return newQuantities;
          });
        }
      }
    } catch (error) {
      console.error("Error removing item:", error);
      error("Error removing item");
    }
  };

  const handleCheckout = async () => {
    if (totalAmount <= 0) {
      warning("No items found in your cart");
      return;
    }

    const userId = getUserId();

    if (!userId) {
      warning("Please login to checkout");
      router.push("/auth/login");
      return;
    }

    setLoadingState((prev) => ({ ...prev, paymentLoading: true }));

    try {
      await initiatePayment(
        totalAmount,
        userId,
        (result) => {
          success("Payment successfull! Order placed.");
          setCartProducts([]);
          setTotalAmount(0);
          setQuantities({});
          setLoadingState((prev) => ({ ...prev, paymentLoading: false }));
        },
        (err) => {
          error(`Payment failed: ${err}`);
          setLoadingState((prev) => ({ ...prev, paymentLoading: false }));
        }
      );
    } catch (error) {
      error(`Error: ${error.message}`);
      setLoadingState((prev) => ({ ...prev, paymentLoading: false }));
    }
  };

  const getProductImage = (product) => {
    if (product.variant?.images && product.variant.images.length > 0) {
      return product.variant.images[0].url;
    }
  };

  if (loadingState.productsLoading) {
    return (
      <div className="min-h-screen app-bg flex flex-col items-center px-4 py-10">
        <h1 className="font-instrument text-4xl sm:text-4xl font-normal uppercase text-gray-800 mb-10">
          My Cart
        </h1>
        <div className="w-full">
          <CartItemShimmer count={3} />
        </div>
      </div>
    );
  }
  if (cartProducts.length == 0 && !loadingState.productsLoading) {
    return (
      <div className="h-[70vh] sm:h-[50vh] md:h-[75vh] lg:h-[80vh] app-bg flex flex-col items-center px-4 py-10">
        <h1 className="font-instrument text-4xl sm:text-4xl font-normal uppercase text-gray-800 mb-10">
          My Cart
        </h1>
        <div className="relative w-40 h-40 sm:w-52 md:w-64 md:h-64">
          <Image
            src="/svg/emptyCart.svg"
            alt="Empty Cart"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 30vw, 20vw"
          />
        </div>
        <p className="text-gray-600 text-base sm:text-lg md:text-xl font-medium text-center">
          Your cart is empty
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg flex flex-col items-center px-4 py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gray-900 text-white p-2 rounded-full">
          <ShoppingCart className="h-5 w-5" />
        </div>
        <h1 className="font-instrument text-4xl sm:text-4xl font-normal uppercase text-gray-800">
          My Cart
        </h1>
      </div>

      <div className="w-full container shadow-none border-none  rounded-xl">
        {cartProducts?.map((item) => {
          const product = item.product;
          const variant = item.variant;
          const quantity = quantities[item._id] || item.quantity;
          const itemTotal = variant.price * quantity;

          return (
            <Card
              key={item._id}
              className="w-full container shadow-none border-none bg-transparent"
            >
              <CardContent className="p-4 md:p-6 space-y-6">
                <div className="border-b pb-6">
                  <div className="flex gap-4 items-start relative">
                    <Checkbox
                      className="bg-white w-5 h-5"
                      checked={item.selected}
                      onCheckedChange={(checked) => {
                        setCartProducts((prev) =>
                          prev.map((cartItem) =>
                            cartItem._id === item._id
                              ? { ...cartItem, selected: checked }
                              : cartItem
                          )
                        );
                        const prevIds = JSON.parse(
                          localStorage.getItem("cartSelectedItemIds") || "[]"
                        );
                        const nextIds = new Set(prevIds);
                        if (checked) nextIds.add(item._id);
                        else nextIds.delete(item._id);
                        localStorage.setItem(
                          "cartSelectedItemIds",
                          JSON.stringify(Array.from(nextIds))
                        );
                      }}
                    ></Checkbox>
                    <Image
                      src={getProductImage(item)}
                      alt={product.name}
                      width={100}
                      height={100}
                      className="rounded-md object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm font-medium tracking-wide uppercase">
                        {product.name}
                      </h2>

                      {/* Price with discount */}
                      <div className="flex items-start flex-col gap-2 mt-1 space-x-1 my-2">
                        {variant.discountPercent > 0 ? (
                          <>
                            <p className="text-sm font-semibold">
                              Rs. {variant.price.toLocaleString()}.00
                            </p>
                            <div className="flex gap-5">
                              <p className="text-gray-500 text-xs line-through">
                                Rs.{" "}
                                {Math.round(
                                  variant.price /
                                    (1 - variant.discountPercent / 100)
                                ).toLocaleString()}
                                .00
                              </p>
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-medium">
                                {variant.discountPercent}% OFF
                              </span>
                            </div>
                          </>
                        ) : (
                          <p className="text-gray-600 text-sm">
                            Rs. {variant.price.toLocaleString()}.00
                          </p>
                        )}
                      </div>

                      {/* Stock status */}
                      {variant.inStock !== undefined && (
                        <p
                          className={`text-xs mt-1 font-medium ${
                            variant.inStock ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {variant.inStock ? "In Stock" : "Out of Stock"}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {getVariantDetails(variant)
                          .split(", ")
                          .filter((detail) => detail.trim())
                          .map((detail, i) => (
                            <span
                              key={i}
                              className="text-xs bg-zinc-200 text-gray-700 px-2 py-1 rounded whitespace-nowrap"
                            >
                              {detail}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Mobile: Quantity and Price row */}
                  <div className="mt-4 flex items-center justify-between gap-4 ml-8 md:mx-8">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 border rounded-md">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-none"
                          onClick={() =>
                            debounceQuantity(item._id, quantity - 1)
                          }
                          disabled={quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-none"
                          onClick={() =>
                            debounceQuantity(item._id, quantity + 1)
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-gray-600 hover:text-red-600 hover:bg-transparent items-center gap-1"
                        onClick={() => removeItem(item._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden md:block">Delete</span>
                      </Button>
                    </div>

                    <div className="text-right">
                      {variant.discountPercent > 0 ? (
                        <div className="space-y-0.5">
                          <p className="text-sm text-gray-500 line-through">
                            Rs.{" "}
                            {Math.round(
                              (variant.price /
                                (1 - variant.discountPercent / 100)) *
                                quantity
                            ).toLocaleString()}
                            .00
                          </p>
                          <p className="font-semibold text-lg ">
                            Rs. {itemTotal.toLocaleString()}.00
                          </p>
                          <p className="text-xs text-green-600 font-medium">
                            You save Rs.{" "}
                            {Math.round(
                              (variant.price /
                                (1 - variant.discountPercent / 100) -
                                variant.price) *
                                quantity
                            ).toLocaleString()}
                            .00
                          </p>
                        </div>
                      ) : (
                        <p className="font-semibold text-base">
                          Rs. {itemTotal.toLocaleString()}.00
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-10 w-full max-w-6xl space-y-8">
        <div className="grid md:grid-cols-2 gap-6 border-b pb-6">
          <div>
            <p className="text-sm font-medium mb-2">Add order note</p>
            <Textarea
              placeholder="How can we help you?"
              className="resize-none"
            />
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Discount code</p>
            <Input placeholder="Enter discount code" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end">
          <p className="text-gray-500 text-sm">Weight: 0.49 kg</p>
          <div className="text-right">
            <p className="text-lg font-medium">
              Total: Rs. {totalAmount.toLocaleString()}.00
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Tax included. Shipping calculated at checkout.
            </p>
            <Button
              className="mt-4 w-48 bg-black text-white hover:bg-gray-800"
              // onClick={handleCheckout}
              onClick={() => {
                if (!userDetails) {
                  if (totalAmount <= 0) {
                    warning("No items found in your cart");
                    return;
                  }
                  const userId = getUserId();
                  if (!userId) {
                    warning("Please login to checkout");
                    router.push("/auth/login");
                    return;
                  }
                } else {
                  const selectedItems = cartProducts.filter(
                    (item) => item.selected === true
                  );

                  if (selectedItems.length === 0) {
                    warning("Please select at least one item to checkout");
                    return;
                  }
                  const selectedItemIds = selectedItems.map((item) => item._id);
                  localStorage.setItem(
                    "checkoutSelectedItems",
                    JSON.stringify(selectedItemIds)
                  );
                  router.push("/cart/checkout");
                }
              }}
              disabled={loadingState.paymentLoading}
            >
              {loadingState.paymentLoading ? "Processing..." : "Checkout"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
