import Order from "../model/order.model.js";

export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ user: userId })
      .populate({
        path: "items.product",
        select: "name brand variants", // Ensure we get name and variants
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error fetching orders",
      data: null,
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.query;

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).populate({
      path: "items.product",
      select: "name brand variants",
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error fetching order",
      data: null,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status,
        ...(trackingNumber && { trackingNumber }),
      },
      { new: true }
    ).populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error updating order",
      data: null,
    });
  }
};
