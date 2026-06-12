import jwt from "jsonwebtoken";
import User from "../model/user.model.js";

export const authenticateToken = async (req, res, next) => {
  try {
    // console.log('All Cookies:', req.cookies); // Debug log
    // console.log('Auth Cookie:', req.cookies.authUser); // Debug log
    const token = req.cookies.authUser;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
        data: null,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    console.log("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      data: null,
    });
  }
};
