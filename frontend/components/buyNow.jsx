import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  User,
  CreditCard,
  Truck,
  X,
  Minus,
  Plus,
  CheckCircle2,
  MapPin,
  Edit2,
  Phone,
  Mail,
} from "lucide-react";
import { useGlobalStore } from "@/globalStore";
import { genericPostApi } from "@/app/admin/api-helper-admin";
import { useToast } from "@/app/components/customToastProvider";
import { useRazorpay } from "@/app/(main)/payments/useRazorpay";
import Image from "next/image";

// Mock product data
const MOCK_PRODUCT = {
  name: "Bexor Black Unisex Straight Fit Baggy Pants",
  size: "Extra Small",
  image: "/png/dummy-product.png",
  price: 1445,
  originalPrice: 2699,
};

export default function BuyNow({
  open,
  onOpenChange,
  maxWidth = 440,
  showTrigger = false,
  className = "",
  product = null,
  variant = null,
  selectedVariantIndex = 0,
  quantity: initialQuantity = 1,
}) {
  const userDetails = useGlobalStore((state) => state.userDetails);
  const { initiatePayment } = useRazorpay();
  const { updateAddress, setUserDetails } = useGlobalStore();
  const { success, error } = useToast();

  // ---------------------##  Steps configuration  ##-----------------------
  const [activeStep, setActiveStep] = useState(0);
  const steps = useMemo(
    () => [
      { id: 0, label: "Cart", icon: User },
      { id: 1, label: "Address", icon: MapPin },
      { id: 2, label: "Payment", icon: CreditCard },
      { id: 3, label: "Confirmation", icon: Truck },
    ],
    []
  );

  const productData = product || MOCK_PRODUCT;
  const variantData = variant || productData;

  const variantPrice = variantData?.price || productData.price || 0;
  const discountPercent = variantData?.discountPercent || 0;
  const actualPrice =
    discountPercent > 0
      ? Math.round(variantPrice * (1 - discountPercent / 100))
      : variantPrice;

  //---------------------## Cart state ##-----------------------
  const [qty, setQty] = useState(1);
  const subtotal = (actualPrice * qty).toFixed(2);

  // Get product image
  const getProductImage = () => {
    if (variantData?.images && variantData.images.length > 0) {
      return variantData.images[0].url;
    }
    if (product?.images && product.images.length > 0) {
      return product.images[0].url;
    }
    return "/placeholder.png";
  };

  // Get variant details for display
  const getVariantLabel = () => {
    if (!variantData) return "";
    const parts = [
      variantData.size,
      variantData.color,
      variantData.flavour,
      variantData.weight,
    ].filter(Boolean);
    return parts.length ? parts.join(" / ") : variantData.sku || "Standard";
  };

  //---------------------## User info edit state ##-----------------------
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneError, setPhoneError] = useState("");

  //---------------------## Address state ##-----------------------
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    type: "Home",
    street: "",
    city: "",
    state: "",
    landMark: "",
    country: "",
    postalCode: "",
    isDefault: false,
  });
  const [addressErrors, setAddressErrors] = useState({});
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  //---------------------## Initialize with default address ##-----------------------
  useEffect(() => {
    if (open && userDetails?.addresses?.length > 0) {
      const defaultAddr = userDetails.addresses.find((addr) => addr.isDefault);
      const firstAddr = userDetails.addresses[0];
      setSelectedAddressId(defaultAddr?._id || firstAddr?._id);
    }
    if (open && userDetails?.phone) {
      setPhoneInput(userDetails.phone);
    }
  }, [open, userDetails]);

  //---------------------## Phone validation function ##-----------------------
  const validatePhone = (phone) => {
    if (!phone || phone.trim() === "") {
      return "Phone number is required";
    }
    if (phone.length < 10) {
      return "Phone number must be at least 10 digits";
    }
    if (!/^\d+$/.test(phone)) {
      return "Phone number must contain only digits";
    }
    return null;
  };

  //---------------------## Handle save phone ##-----------------------
  const handleSavePhone = async () => {
    const validationError = validatePhone(phoneInput);
    if (validationError) {
      setPhoneError(validationError);
      return;
    }

    try {
      const res = await genericPostApi("/api/user/updateUser", {
        userId: userDetails._id,
        phone: phoneInput,
      });

      if (res.success) {
        setUserDetails({ ...userDetails, phone: phoneInput });
        setIsEditingPhone(false);
        setPhoneError("");
        success("Phone number updated successfully!");
      } else {
        setPhoneError(res.message || "Failed to update phone number");
      }
    } catch (err) {
      console.error("Error saving phone:", err);
      setPhoneError("Failed to update phone number");
    }
  };

  //---------------------## Navigation handlers ##-----------------------
  const handleNext = useCallback(() => {
    // Validate phone and address on step 1
    if (
      activeStep === 1 &&
      !selectedAddressId &&
      !showAddressForm &&
      !userDetails?.phone
    ) {
      setIsEditingPhone(true);
      setPhoneError("Please add your phone number to continue");
      setShowAddressForm(true);
      return;
    }

    // Move to next step
    setActiveStep((s) => (s < steps.length - 1 ? s + 1 : s));
  }, [
    activeStep,
    selectedAddressId,
    showAddressForm,
    steps.length,
    userDetails?.phone,
  ]);

  
  const handlePrev = useCallback(() => {
    if (showAddressForm) {
      setShowAddressForm(false);
      setEditingAddressId(null);
      resetAddressForm();
      return;
    }
    setActiveStep((s) => (s > 0 ? s - 1 : s));
  }, [showAddressForm]);

  //---------------------## Address form handlers ##-----------------------
  const resetAddressForm = () => {
    setAddressForm({
      type: "Home",
      street: "",
      city: "",
      state: "",
      landMark: "",
      country: "",
      postalCode: "",
      isDefault: false,
    });
    setAddressErrors({});
  };

  const handleAddressChange = (field, value) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
    if (addressErrors[field]) {
      setAddressErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateAddress = () => {
    const errors = {};
    if (!addressForm.street || addressForm.street.length < 3)
      errors.street = "Street is required (min 3 chars)";
    if (!addressForm.city || addressForm.city.length < 2)
      errors.city = "City is required (min 2 chars)";
    if (!addressForm.state || addressForm.state.length < 2)
      errors.state = "State is required (min 2 chars)";
    if (!addressForm.country || addressForm.country.length < 2)
      errors.country = "Country is required";
    if (!addressForm.postalCode || !/^\d{6}$/.test(addressForm.postalCode)) {
      errors.postalCode = "Valid 6-digit postal code required";
    }
    return errors;
  };

  //---------------------## Handle save address ##-----------------------
  const handleSaveAddress = async () => {
    const errors = validateAddress();
    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      return;
    }

    const newAddress = {
      _id: editingAddressId || undefined,
      type: addressForm.type,
      street: addressForm.street,
      city: addressForm.city,
      state: addressForm.state,
      landMark: addressForm.landMark,
      country: addressForm.country,
      postalCode: Number(addressForm.postalCode),
      isDefault: addressForm.isDefault || false,
    };

    try {
      const payload = {
        userId: userDetails._id,
        address: newAddress,
        ...(addressForm.isDefault &&
          editingAddressId && { defaultAddressId: editingAddressId }),
      };

      const res = await genericPostApi("/api/user/updateUser", payload);

      if (res.success) {
        updateAddress(res.data.addresses);
        setSelectedAddressId(newAddress._id);
        setShowAddressForm(false);
        setEditingAddressId(null);
        resetAddressForm();
        success(
          editingAddressId
            ? "Address updated successfully!"
            : "Address added successfully!"
        );
      } else {
        setAddressErrors({ submit: res.message || "Failed to save address" });
      }
    } catch (err) {
      console.error("Error saving address:", err);
      setAddressErrors({ submit: "Failed to save address. Please try again." });
    }
  };

  //---------------------## Handle edit address ##-----------------------
  const handleEditAddress = (address) => {
    setEditingAddressId(address._id);
    setAddressForm({
      type: address.type,
      street: address.street,
      city: address.city,
      state: address.state,
      landMark: address.landMark || "",
      country: address.country,
      postalCode: address.postalCode.toString(),
      isDefault: address.isDefault || false,
    });
    setShowAddressForm(true);
  };

  //---------------------## Handle complete order with Razorpay ##-----------------------
  const handleCompleteOrder = async () => {
    try {
      setIsPaymentProcessing(true);
      const orderAmount = parseFloat(subtotal);
      const paymentResult = await initiatePayment(
        orderAmount,
        userDetails._id,
        null,
        true,
        {
          productId: product?._id,
          variantIndex: selectedVariantIndex,
          variant: variantData,
          quantity: qty,
        },
        (result) => {
          success("Payment successfull! Order placed.");
          handleNext();
        },
        (err) => {
          error(`Payment failed: ${err}`);
        }
      );
      console.log("Payment result:", paymentResult);
    } catch (err) {
      console.error("Payment error:", err);
      error("Payment failed. Please try again.");
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const maxW = typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth;
  const selectedAddress = userDetails?.addresses?.find(
    (a) => a._id === selectedAddressId
  );

  return (
    <div className="p-0 -z-50">
      {/* Drawer with dismiss on outside click enabled, no drag to close */}
      <Drawer
        direction="right"
        open={open}
        onOpenChange={onOpenChange}
        dismissible={false}
        modal={true}
        shouldScaleBackground={false}
      >
        <DrawerContent
          className={`h-screen mt-0 w-full rounded-none border-r border-gray-200 bg-white font-nunito ${className}`}
          style={{ maxWidth: maxW }}
          onPointerDown={(e) => {
            if (isPaymentProcessing) {
              e.stopPropagation();
            }
          }}
          onPointerDownOutside={(e) => {
            // Prevent closing during payment processing
            if (isPaymentProcessing) {
              e.preventDefault();
              return;
            }
            onOpenChange(false);
          }}
        >
          <div className="bg-white h-full flex flex-col min-w-0" tabIndex={0}>
            {/* Header */}
            <DrawerHeader className="border-b border-gray-200 flex-shrink-0 py-[1.6rem]">
              <div className="flex items-center justify-between">
                <DrawerTitle className="text-base font-bold tracking-wide">
                  {showAddressForm
                    ? editingAddressId
                      ? "Edit Address"
                      : "Add Address"
                    : "Checkout"}
                </DrawerTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="hover:bg-gray-100"
                >
                  <X size={18} />
                </Button>
              </div>
            </DrawerHeader>

            {/* Progress Steps */}
            {!showAddressForm && (
              <div className="px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0">
                <div className="flex flex-wrap items-center gap-3">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = activeStep >= step.id;
                    return (
                      <div key={step.id} className="flex items-center min-w-0">
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full border transition-colors ${
                            isActive
                              ? "bg-black border-black text-white"
                              : "bg-white border-gray-300 text-gray-400"
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <span
                          className={`ml-2 text-xs font-medium truncate ${
                            isActive ? "text-black" : "text-gray-500"
                          }`}
                          style={{ maxWidth: 90 }}
                        >
                          {step.label}
                        </span>
                        {index < steps.length - 1 && (
                          <div
                            className={`mx-3 w-8 h-0.5 hidden sm:block transition-colors ${
                              activeStep > step.id ? "bg-black" : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-white">
              {/* Step 0: Cart */}
              {activeStep === 0 && !showAddressForm && (
                <div className="space-y-4">
                  {/* Product Card */}
                  <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                    {product ? (
                      <Image
                        src={getProductImage()}
                        alt={productData.name || "Product"}
                        width={80}
                        height={80}
                        className="rounded overflow-hidden bg-gray-100 flex-shrink-0 object-cover"
                      />
                    ) : (
                      <div className="w-20 h-24 rounded overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <div className="text-4xl">👖</div>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-snug">
                        {productData.name || "Product"}
                      </p>
                      {variantData && (
                        <p className="text-xs text-gray-600 mt-1">
                          {getVariantLabel()}
                        </p>
                      )}
                      {discountPercent > 0 && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-medium mt-1 inline-block">
                          {discountPercent}% OFF
                        </span>
                      )}
                      {productData?.size && (
                        <p className="text-xs text-gray-600 mt-1">
                          Size: {productData.size}
                        </p>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                          <button
                            onClick={() => setQty((q) => Math.max(1, q - 1))}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50"
                            disabled={qty <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <div className="px-3 text-sm font-medium">{qty}</div>
                          <button
                            onClick={() => setQty((q) => q + 1)}
                            className="p-2 hover:bg-gray-100"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="text-right">
                          {discountPercent > 0 && (
                            <div className="text-xs text-gray-500 line-through">
                              Rs.{" "}
                              {Math.round(variantPrice * qty).toLocaleString()}
                            </div>
                          )}
                          <div className="text-sm font-bold">
                            Rs. {parseFloat(subtotal).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Subtotal</span>
                      <span className="font-bold">Rs. {subtotal}</span>
                    </div>
                    <Button
                      onClick={handleNext}
                      className="w-full h-11 bg-black text-white hover:bg-gray-900 font-semibold"
                    >
                      Proceed
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 1: Address Selection or Form */}
              {activeStep === 1 && (
                <>
                  {/* User Info Section */}
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3 my-4">
                    <h3 className="text-sm font-bold text-gray-700 mb-2">
                      Contact Information
                    </h3>

                    {/* Name */}
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-500" />
                      <span className="text-sm font-medium">
                        {userDetails?.name} {userDetails?.lastName}
                      </span>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {userDetails?.email}
                      </span>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-gray-500" />
                          {!isEditingPhone && userDetails?.phone ? (
                            <span className="text-sm text-gray-700">
                              {userDetails.phone}
                            </span>
                          ) : (
                            <span className="text-sm text-red-500">
                              {userDetails?.phone
                                ? userDetails.phone
                                : "No phone number"}
                            </span>
                          )}
                        </div>
                        {!isEditingPhone && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditingPhone(true)}
                            className="h-7 px-2 text-xs hover:bg-gray-200"
                          >
                            <Edit2 size={12} className="mr-1" />
                            {userDetails?.phone ? "Edit" : "Add"}
                          </Button>
                        )}
                      </div>

                      {isEditingPhone && (
                        <div className="space-y-2">
                          <Input
                            type="tel"
                            value={phoneInput}
                            onChange={(e) => {
                              setPhoneInput(e.target.value);
                              setPhoneError("");
                            }}
                            placeholder="Enter phone number"
                            className={`text-sm ${
                              phoneError ? "border-red-500" : ""
                            }`}
                          />
                          {phoneError && (
                            <p className="text-xs text-red-500">{phoneError}</p>
                          )}
                          <div className="flex gap-2">
                            <Button
                              onClick={handleSavePhone}
                              size="sm"
                              className="h-8 text-xs bg-black text-white hover:bg-gray-800"
                            >
                              Save
                            </Button>
                            <Button
                              onClick={() => {
                                setIsEditingPhone(false);
                                setPhoneInput(userDetails?.phone || "");
                                setPhoneError("");
                              }}
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {!userDetails?.phone && !isEditingPhone && (
                      <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                        ⚠️ Phone number is required to proceed with checkout
                      </p>
                    )}
                  </div>

                  {!showAddressForm ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold">
                          Select Delivery Address
                        </h3>
                        <Button
                          onClick={() => {
                            resetAddressForm();
                            setEditingAddressId(null);
                            setShowAddressForm(true);
                          }}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                        >
                          + Add New
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {userDetails?.addresses?.map((addr) => (
                          <div
                            key={addr._id}
                            onClick={() => setSelectedAddressId(addr._id)}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              selectedAddressId === addr._id
                                ? "border-black bg-gray-50"
                                : "border-gray-200 hover:border-gray-400"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-semibold px-2 py-0.5 bg-black text-white rounded">
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
                                  handleEditAddress(addr);
                                }}
                                className="h-8 w-8 hover:bg-gray-200"
                              >
                                <Edit2 size={14} />
                              </Button>
                            </div>
                          </div>
                        ))}

                        {(!userDetails?.addresses ||
                          userDetails.addresses.length === 0) && (
                          <div className="text-center py-8 text-gray-500">
                            <MapPin
                              size={48}
                              className="mx-auto mb-2 text-gray-300"
                            />
                            <p className="text-sm">No addresses saved</p>
                            <Button
                              onClick={() => setShowAddressForm(true)}
                              className="mt-3 bg-black text-white hover:bg-gray-900"
                              size="sm"
                            >
                              Add Your First Address
                            </Button>
                          </div>
                        )}
                      </div>

                      {selectedAddressId && (
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
                            disabled={!userDetails?.phone}
                            className="flex-1 bg-black text-white hover:bg-gray-900"
                          >
                            Continue to Payment
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Address Form
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="type" className="text-sm font-medium">
                            Address Type
                          </Label>
                          <Select
                            value={addressForm.type}
                            onValueChange={(value) =>
                              handleAddressChange("type", value)
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Home">Home</SelectItem>
                              <SelectItem value="Work">Work</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2 col-span-2">
                          <Label
                            htmlFor="street"
                            className="text-sm font-medium"
                          >
                            Street Address *
                          </Label>
                          <Input
                            id="street"
                            value={addressForm.street}
                            onChange={(e) =>
                              handleAddressChange("street", e.target.value)
                            }
                            placeholder="123 Main St"
                            className={
                              addressErrors.street ? "border-red-500" : ""
                            }
                          />
                          {addressErrors.street && (
                            <p className="text-xs text-red-500">
                              {addressErrors.street}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2 col-span-2">
                          <Label
                            htmlFor="landMark"
                            className="text-sm font-medium"
                          >
                            Landmark
                          </Label>
                          <Input
                            id="landMark"
                            value={addressForm.landMark}
                            onChange={(e) =>
                              handleAddressChange("landMark", e.target.value)
                            }
                            placeholder="Near park or mall"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-sm font-medium">
                            City *
                          </Label>
                          <Input
                            id="city"
                            value={addressForm.city}
                            onChange={(e) =>
                              handleAddressChange("city", e.target.value)
                            }
                            placeholder="Mumbai"
                            className={
                              addressErrors.city ? "border-red-500" : ""
                            }
                          />
                          {addressErrors.city && (
                            <p className="text-xs text-red-500">
                              {addressErrors.city}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="state"
                            className="text-sm font-medium"
                          >
                            State *
                          </Label>
                          <Input
                            id="state"
                            value={addressForm.state}
                            onChange={(e) =>
                              handleAddressChange("state", e.target.value)
                            }
                            placeholder="Maharashtra"
                            className={
                              addressErrors.state ? "border-red-500" : ""
                            }
                          />
                          {addressErrors.state && (
                            <p className="text-xs text-red-500">
                              {addressErrors.state}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="postalCode"
                            className="text-sm font-medium"
                          >
                            PIN Code *
                          </Label>
                          <Input
                            id="postalCode"
                            type="text"
                            maxLength={6}
                            value={addressForm.postalCode}
                            onChange={(e) =>
                              handleAddressChange("postalCode", e.target.value)
                            }
                            placeholder="400001"
                            className={
                              addressErrors.postalCode ? "border-red-500" : ""
                            }
                          />
                          {addressErrors.postalCode && (
                            <p className="text-xs text-red-500">
                              {addressErrors.postalCode}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="country"
                            className="text-sm font-medium"
                          >
                            Country *
                          </Label>
                          <Input
                            id="country"
                            value={addressForm.country}
                            onChange={(e) =>
                              handleAddressChange("country", e.target.value)
                            }
                            placeholder="India"
                            className={
                              addressErrors.country ? "border-red-500" : ""
                            }
                          />
                          {addressErrors.country && (
                            <p className="text-xs text-red-500">
                              {addressErrors.country}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                          id="isDefault"
                          checked={addressForm.isDefault}
                          onCheckedChange={(checked) =>
                            handleAddressChange("isDefault", checked)
                          }
                        />
                        <Label
                          htmlFor="isDefault"
                          className="cursor-pointer text-sm"
                        >
                          Set as default address
                        </Label>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <Button
                          onClick={handlePrev}
                          variant="outline"
                          className="flex-1 border-2 border-black hover:bg-black hover:text-white"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveAddress}
                          className="flex-1 bg-black text-white hover:bg-gray-900"
                        >
                          {editingAddressId ? "Update Address" : "Save Address"}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Step 2: Payment - Razorpay Gateway */}
              {activeStep === 2 && !showAddressForm && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold">Review & Pay</h3>

                  {/* Delivery Address Summary */}
                  {selectedAddress && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-xs font-semibold text-gray-600 mb-1">
                        Delivering to:
                      </p>
                      <p className="text-sm font-medium">
                        {selectedAddress.street}
                      </p>
                      <p className="text-xs text-gray-600">
                        {selectedAddress.city}, {selectedAddress.state}{" "}
                        {selectedAddress.postalCode}
                      </p>
                    </div>
                  )}

                  {/* Payment Information Box */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CreditCard className="text-blue-600 mt-0.5" size={20} />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-blue-900 mb-1">
                          Secure Payment via Razorpay
                        </h4>
                        <p className="text-xs text-blue-700 mb-2">
                          You'll be redirected to Razorpay's secure payment
                          gateway where you can choose from:
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>Rs. {subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivery</span>
                      <span className="text-green-600">FREE</span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-2 border-t">
                      <span>Total</span>
                      <span>Rs. {subtotal}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handlePrev}
                      variant="outline"
                      className="flex-1 border-2 border-black hover:bg-black hover:text-white"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleCompleteOrder}
                      className="flex-1 bg-black text-white hover:bg-gray-900 font-semibold"
                    >
                      Proceed to Pay
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Order Completed */}
              {activeStep === 3 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="text-green-600" size={40} />
                  </div>
                  <h3 className="text-xl font-bold">
                    Order Placed Successfully!
                  </h3>
                  <p className="text-sm text-gray-600 max-w-xs">
                    Thank you for your purchase. Your order has been received
                    and is being processed.
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg text-left w-full max-w-xs">
                    <p className="text-xs text-gray-600 mb-2">Order Summary</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Item:</span>
                        <span className="font-medium">
                          {productData.name?.slice(0, 20) || "Product"}...
                        </span>
                      </div>
                      {variantData && (
                        <div className="flex justify-between">
                          <span>Variant:</span>
                          <span className="font-medium">
                            {getVariantLabel()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Quantity:</span>
                        <span className="font-medium">{qty}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-bold">
                        <span>Total:</span>
                        <span>Rs. {subtotal}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      onOpenChange(false);
                      setActiveStep(0);
                      setQty(1);
                    }}
                    className="bg-black text-white hover:bg-gray-900 mt-4"
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
