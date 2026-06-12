"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Package, Image as ImageIcon, Calendar } from "lucide-react";
import { genericGetApi } from "@/app/admin/api-helper-admin";
import { useGlobalStore } from "@/globalStore";

const orderStages = [
  { label: "Ordered", status: "confirmed" },
  { label: "Processing", status: "processing" },
  { label: "Shipped", status: "shipped" },
  { label: "Delivered", status: "delivered" },
];

const getStatusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case "delivered":
      return "default";
    case "processing":
      return "secondary";
    case "shipped":
      return "outline";
    case "confirmed":
      return "default";
    default:
      return "default";
  }
};

const getStatusLabel = (status) => {
  const statusMap = {
    confirmed: "Ordered",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    pending: "Pending",
    cancelled: "Cancelled",
  };
  return statusMap[status?.toLowerCase()] || status || "Pending";
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const OrderHistory = () => {
  const userDetails = useGlobalStore((state) => state.userDetails);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const getOrderHistory = async () => {
    if (!userDetails?._id) return;
    setLoading(true);
    try {
      const response = await genericGetApi(
        `/api/order/user/${userDetails?._id}`
      );
      if (response?.success) {
        setPurchaseHistory(response?.data || []);
      }
    } catch (error) {
      console.log("Error fetching order history", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrderHistory();
  }, [userDetails?._id]);

  const totalSpent = purchaseHistory.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0
  );

  const deliveredCount = purchaseHistory.filter(
    (order) => order.status?.toLowerCase() === "delivered"
  ).length;

  const pendingCount = purchaseHistory.length - deliveredCount;

  if (loading) {
    return (
      <div className="app-bg min-h-screen p-4 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg" />
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="app-bg min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-slate-50 to-slate-100">
          <CardHeader className="border-b bg-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Order Summary
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-lg transition-shadow">
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  Total Orders
                </p>
                <p className="text-4xl font-bold text-blue-600">
                  {purchaseHistory.length}
                </p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-lg transition-shadow">
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  Total Spent
                </p>
                <p className="text-4xl font-bold text-green-600">
                  ${totalSpent.toFixed(2)}
                </p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-lg transition-shadow">
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  Delivered
                </p>
                <p className="text-4xl font-bold text-purple-600">
                  {deliveredCount}
                </p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 hover:shadow-lg transition-shadow">
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  Pending
                </p>
                <p className="text-4xl font-bold text-orange-600">
                  {pendingCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="border-b bg-slate-50">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Purchase History
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {purchaseHistory.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No orders found</p>
              </div>
            ) : (
              purchaseHistory.map((order) => {
                const currentStatus = order.status?.toLowerCase() || "pending";
                const currentStageIndex = orderStages.findIndex(
                  (stage) => stage.status === currentStatus
                );
                const adjustedStageIndex =
                  currentStageIndex === -1 ? 0 : currentStageIndex;

                return (
                  <Card
                    key={order._id}
                    className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500"
                  >
                    <CardContent className="pt-6 space-y-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 pb-4 border-b">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-lg text-gray-800">
                              Order #{order._id.slice(-8).toUpperCase()}
                            </h3>
                            <Badge
                              variant={getStatusVariant(order.status)}
                              className="text-xs"
                            >
                              {getStatusLabel(order.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold app-black-text">
                            ${order.totalAmount?.toFixed(2) || "0.00"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.items?.length || 0} item(s)
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {order.items?.map((item, itemIndex) => {
                          const productName =
                            item.product?.name || "Unknown Product";
                          const variantImages =
                            item.variant?.images ||
                            item.product?.variants?.[0]?.images ||
                            [];
                          const productImage =
                            variantImages[0]?.url ||
                            "https://via.placeholder.com/150?text=No+Image";
                          const itemPrice = item.price || 0;
                          const itemQuantity = item.quantity || 1;
                          const itemSubtotal =
                            item.subtotal || itemPrice * itemQuantity;

                          return (
                            <div
                              key={itemIndex}
                              className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex-shrink-0">
                                <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 bg-white flex items-center justify-center">
                                  {variantImages.length > 0 ? (
                                    <img
                                      src={productImage}
                                      alt={productName}
                                      className="w-full h-full object-contain"
                                      onError={(e) => {
                                        e.target.src =
                                          "https://via.placeholder.com/150?text=No+Image";
                                      }}
                                    />
                                  ) : (
                                    <ImageIcon className="w-8 h-8 text-gray-400" />
                                  )}
                                </div>
                              </div>

                              <div className="flex-grow min-w-0">
                                <h4 className="font-semibold text-lg text-gray-800 mb-1 truncate">
                                  {productName}
                                </h4>
                                {item.variant && (
                                  <div className="flex flex-wrap gap-2 mb-2">
                                    {item.variant.color && (
                                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                        Color: {item.variant.color}
                                      </span>
                                    )}
                                    {item.variant.size && (
                                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                                        Size: {item.variant.size}
                                      </span>
                                    )}
                                    {item.variant.flavour && (
                                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                        {item.variant.flavour}
                                      </span>
                                    )}
                                  </div>
                                )}
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span>Qty: {itemQuantity}</span>
                                  <span className="text-gray-400">•</span>
                                  <span>${itemPrice.toFixed(2)} each</span>
                                  <span className="text-gray-400">•</span>
                                  <span className="font-semibold">
                                    Subtotal: ${itemSubtotal.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Order Status Timeline */}
                      <div className="relative pt-6 pb-2 bg-gradient-to-b from-gray-50 to-transparent rounded-lg px-4">
                        <div className="flex items-center justify-between mb-2">
                          {orderStages.map((stage, index) => {
                            const isActive = index <= adjustedStageIndex;
                            const isCurrent = index === adjustedStageIndex;

                            return (
                              <div
                                key={stage.status}
                                className="flex flex-col items-center relative z-10"
                                style={{ width: "25%" }}
                              >
                                <div
                                  className={`w-12 h-12 rounded-full flex items-center justify-center border-3 transition-all duration-300 ${
                                    isActive
                                      ? "bg-gradient-to-br from-green-500 to-green-600 border-green-500 text-white shadow-lg scale-110"
                                      : "bg-gray-200 border-gray-300 text-gray-400"
                                  }`}
                                >
                                  {index < adjustedStageIndex ? (
                                    <Check className="w-6 h-6" />
                                  ) : isCurrent ? (
                                    <div className="w-5 h-5 bg-white rounded-full animate-pulse" />
                                  ) : (
                                    <div className="w-4 h-4 bg-gray-400 rounded-full" />
                                  )}
                                </div>
                                <p
                                  className={`text-xs mt-2 font-semibold text-center ${
                                    isActive
                                      ? "text-green-600"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {stage.label}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                        {/* Progress Bar */}
                        <div
                          className="absolute top-14 left-0 right-0 h-2 bg-gray-200 rounded-full overflow-hidden"
                          style={{
                            marginLeft: "12.5%",
                            marginRight: "12.5%",
                            width: "75%",
                          }}
                        >
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500 ease-out"
                            style={{
                              width: `${(adjustedStageIndex / 3) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Order Footer */}
                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-sm text-gray-500">
                          <span>Items: {order.items?.length || 0}</span>
                          {order.trackingNumber && (
                            <>
                              <span className="mx-2">•</span>
                              <span>Tracking: {order.trackingNumber}</span>
                            </>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Order Total</p>
                          <p className="text-lg font-bold app-black-text">
                            ${order.totalAmount?.toFixed(2) || "0.00"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderHistory;
