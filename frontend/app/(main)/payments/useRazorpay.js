"use client";

import { genericPostApi } from "@/app/admin/api-helper-admin";
import { useState } from "react";

export const useRazorpay = () => {
  const [loading, setLoading] = useState(false);

  const createOrder = async (
    amount,
    userId,
    selectedItemIds = null,
    isDirectOrder = false,
    directOrderData = null
  ) => {
    try {
      setLoading(true);
      const response = await genericPostApi("/api/payment/create-order", {
        amount,
        currency: "INR",
        userId: userId,
        selectedItemIds: selectedItemIds,
        isDirectOrder: isDirectOrder,
        directOrderData: directOrderData,
      });

      if (response.success) {
        return response.data;
      } else {
        console.log(response?.message || "Error creating order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (
    orderId,
    paymentId,
    signature,
    userId,
    selectedItemIds = null,
    isDirectOrder = false,
    directOrderData = null
  ) => {
    try {
      setLoading(true);
      const response = await genericPostApi("/api/payment/verify", {
        orderId,
        paymentId,
        signature,
        userId,
        selectedItemIds: selectedItemIds,
        isDirectOrder: isDirectOrder,
        directOrderData: directOrderData,
      });
      if (response.success) {
        return response.data;
      } else {
        console.log(response?.message || "Error verifying payment");
        return null;
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async (
    amount,
    userId,
    selectedItemIds = null,
    isDirectOrder = false,
    directOrderData = null,
    onSuccess,
    onError
  ) => {
    try {
      const orderData = await createOrder(
        amount,
        userId,
        selectedItemIds,
        isDirectOrder,
        directOrderData
      );
      console.log("Order ID from create:", orderData?.orderId);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const options = {
          key: orderData.key,
          amount: orderData.amount,
          currency: orderData?.currency,
          name: "Gym Freak",
          description: "Payment for your order",
          order_id: orderData?.orderId,
          handler: async (response) => {
            try {
              const verificationResult = await verifyPayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature,
                userId,
                selectedItemIds,
                isDirectOrder,
                directOrderData
              );
              if (
                verificationResult &&
                verificationResult.status == "completed"
              ) {
                onSuccess(verificationResult);
                return;
              }
              await handleRecovery(response, userId, onSuccess, onError);
            } catch (error) {
              console.error("Payment verification error:", error);

              await handleRecovery(response, userId, onSuccess, onError);
            }
          },
          theme: {
            color: "#000000",
            hide_topbar: false,
          },
          modal: {
            ondismiss: function () {
              onError("Payment cancelled by user");
            },
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (error) {
      onError(error.message);
    }
  };

  const handleRecovery = async (response, userId, onSuccess, onError) => {
    try {
      console.error("Attempting recovery...", {
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id,
      });

      const recoveryResponse = await genericPostApi("/api/payment/recover", {
        paymentId: response.razorpay_payment_id,
        userId,
      });

      if (recoveryResponse.success) {
        onSuccess(recoveryResponse.data);
      } else {
        onError({
          message: `Payment succeeded but order creation failed. Payment ID: ${response.razorpay_payment_id}. Please contact support.`,
          paymentId: response.razorpay_payment_id,
          needsRecovery: true,
        });
      }
    } catch (recoveryError) {
      console.error("Payment recovery error:", recoveryError);
      onError({
        message: `Payment succeeded but verification failed. Payment ID: ${response.razorpay_payment_id}. Please contact support.`,
        paymentId: response.razorpay_payment_id,
        needsRecovery: true,
      });
    }
  };
  return {
    loading,
    initiatePayment,
    createOrder,
    verifyPayment,
  };
};
