"use client";

import { genericGetApi, genericPostApi } from "@/app/admin/api-helper-admin";
import Image from "next/image";
import { useState } from "react";
import AnimatedButton from "./animatedButton";
import { useToast } from "@/app/components/customToastProvider";
import BuyNow from "@/components/buyNow";
import { Loader2 } from "lucide-react";
import { useGlobalStore } from "@/globalStore";
import { addToGuestCart } from "@/lib/guestCart";
import { useRouter } from "next/navigation";

const ProductDetailRightPanel = ({
  product,
  variants = [],
  selectedIndex = 0,
  onSelectVariant = () => {},
}) => {
  const userDetails = useGlobalStore((state) => state.userDetails);
  const router = useRouter();
  const incrementCartCount = useGlobalStore(
    (state) => state.incrementCartCount
  );
  const v = variants[selectedIndex];
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toastCooldown, setToastCooldown] = useState(false);
  const [openBuyNow, setOpenBuyNow] = useState(false);
  const name = product?.name || "";
  const description = product?.description || "";
  const variantPrice = Number(v?.price ?? 0);
  const discountPercent = Number(v?.discountPercent ?? 0);
  const basePrice =
    discountPercent > 0
      ? Math.round(variantPrice * (1 - discountPercent / 100))
      : variantPrice;

  const mrp = discountPercent > 0 ? variantPrice : null;
  const sizes = Array.isArray(v?.sizeInventory) ? v.sizeInventory : [];
  const [selectedSize, setSelectedSize] = useState(
    sizes.length === 1 ? sizes[0].label : null
  );
  const inStock = v?.inStock ?? true;

  const { success, info, error } = useToast();

  const makeVariantLabel = (vv) => {
    const parts = [vv?.size, vv?.color, vv?.flavour, vv?.weight].filter(
      Boolean
    );
    return parts.length ? parts.join(" / ") : vv?.sku || "Variant";
  };

  const decreaseQuantity = () => setQuantity((q) => Math.max(1, q - 1));
  const increaseQty = () => setQuantity((q) => q + 1);

  const handleAddToCart = async () => {
    if (loading || toastCooldown) return;
    if (!product?._id || selectedIndex === undefined) {
      error("Invalid product or variant");
      return;
    }
    if (sizes.length && !selectedSize) {
      error("Please select a size");
      return;
    }

    try {
      setLoading(true);
      const userId = userDetails?._id;
      if (userId) {
        const data = await genericPostApi("/api/cart/add", {
          productId: product?._id,
          variantIndex: selectedIndex,
          quantity,
          userId: userId,
          sizeLabel: selectedSize,
        });

        if (data?.success) {
          success("Added to cart successfully!");
          incrementCartCount(quantity);
        } else {
          error(data?.message || "Failed to add to cart");
        }
      } else {
        addToGuestCart(product?._id, selectedIndex, quantity, v, selectedSize);
        incrementCartCount(quantity);
        success("Added to cart successfully!");
      }
      setToastCooldown(true);
      setTimeout(() => setToastCooldown(false), 1000);
    } catch (err) {
      console.error("Error adding to cart:", err);
      error("Failed to add to cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full sticky top-10 self-start flex flex-col gap-4 overflow-hidden break-words max-w-full">
      <div className="gap-2 flex flex-col">
        <h1 className="text-2xl uppercase font-medium break-words leading-tight">
          {name}
        </h1>
        <h2 className=" text-sm text-gray-700 leading-6 break-words">
          {description}
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold">{`Rs. ${basePrice}`}</span>
        {mrp ? (
          <span className="line-through text-gray-500">{`Rs. ${mrp}`}</span>
        ) : null}
        {discountPercent > 0 ? (
          <span className="text-green-600 font-semibold">{`Save ${discountPercent}%`}</span>
        ) : null}
      </div>
      {variants.length > 1 ? (
        <div>
          <p className="font-medium mb-2">Variants:</p>
          <div className="flex gap-2 flex-wrap">
            {variants.map((vv, i) => {
              const thumb = vv?.images?.[0]?.url;
              return (
                <button
                  key={vv?.sku || i}
                  onClick={() => onSelectVariant(i)}
                  className={`px-2 py-2 border rounded-md text-sm flex flex-col items-center gap-2 ${
                    i === selectedIndex ? "border-black" : "border-gray-300"
                  }`}
                >
                  {thumb ? (
                    <span className="relative w-16 h-16 overflow-hidden rounded">
                      <Image
                        src={thumb}
                        alt={`variant-${i}`}
                        fill
                        className="object-cover"
                      />
                    </span>
                  ) : null}
                  <span>{makeVariantLabel(vv)}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      <div className="text-sm text-gray-700 grid grid-cols-1 gap-1">
        {product?.brand ? <span>{`Brand: ${product.brand}`}</span> : null}
        {v?.sku ? <span>{`SKU: ${v.sku}`}</span> : null}
        {sizes.length > 0 && (
          <div className="space-y-2">
            <p className="font-medium">Select size:</p>
            <div className="flex gap-2 flex-wrap">
              {sizes.map((entry) => {
                const available =
                  (Number(entry.availableQuantity) || 0) -
                  (Number(entry.soldQuantity) || 0);
                const disabled = !entry.inStock || available <= 0;
                return (
                  <button
                    key={entry.label}
                    onClick={() => !disabled && setSelectedSize(entry.label)}
                    disabled={disabled}
                    className={`px-3 py-2 rounded-md border ${
                      selectedSize === entry.label
                        ? "border-black bg-black text-white"
                        : "border-gray-300"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {entry.label}
                    {/* {available >= 0 ? ` (${available})` : ""} */}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {v?.color ? <span>{`Color: ${v.color}`}</span> : null}
        {v?.flavour ? <span>{`Flavour: ${v.flavour}`}</span> : null}
        {v?.weight ? <span>{`Weight: ${v.weight}`}</span> : null}
        <span className={inStock ? "text-green-700" : "text-red-600"}>
          {inStock ? "In stock" : "Out of stock"}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button
          className="px-3 py-2 rounded-md border cursor-pointer"
          onClick={decreaseQuantity}
        >
          -
        </button>
        <span>{quantity}</span>
        <button
          className="px-3 py-2 rounded-md border cursor-pointer"
          onClick={increaseQty}
        >
          +
        </button>
      </div>

      <div className="flex flex-col gap-5">
        <AnimatedButton
          className="w-full py-3 rounded-md disabled:opacity-50 flex items-center justify-center cursor-pointer"
          type="white"
          onClick={handleAddToCart}
          disabled={!inStock || loading || toastCooldown}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin items-center justify-center" />
          ) : (
            "ADD TO CART"
          )}
        </AnimatedButton>
        <AnimatedButton
          className="w-full py-3 rounded-md disabled:opacity-50 curs  or-pointer"
          disabled={!inStock}
          type="black"
          onClick={() => {
            if (!userDetails) {
              router.push("/auth/login");
              info("Please Login to buy");
              return;
            }
            setOpenBuyNow(true);
          }}
        >
          BUY IT NOW
        </AnimatedButton>
      </div>
      <BuyNow
        open={openBuyNow}
        onOpenChange={setOpenBuyNow}
        maxWidth={480}
        showTrigger={false}
        product={product}
        variant={v}
        selectedVariantIndex={selectedIndex}
        quantity={quantity}
      />
    </div>
  );
};

export default ProductDetailRightPanel;
