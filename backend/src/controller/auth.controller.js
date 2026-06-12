import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwttoken.js";
import { sendEmail } from "../utils/email.config.js";
import { generateRandomString } from "../helperFunctions/helperFunc.js";

// ---------##------Login Function --------##--------
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
      data: null,
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Generic message to avoid leaking email existence
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
        data: null,
      });
    }

    // Check password first
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        data: null,
      });
    }

    // Check if account is verified
    if (!user.verified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
        data: {
          verified: false,
          email: user.email,
        },
      });
    }

    // Generate token
    const tokenResponse = await generateToken(user._id, res);
    if (!tokenResponse) throw new Error("Token generation failed");

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
      data: null,
    });
  }
};

// ---------##------Signup Function --------##--------
export const signup = async (req, res) => {
  try {
    const { name, lastName, email, password, role, address, phone } = req.body;

    // --- Validation ---
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
        data: null,
      });
    }

    // --- Check if user already exists ---
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
        data: null,
      });
    }

    // --- Hash password ---
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- Generate verification token ---
    const verificationToken = generateRandomString(20);

    // --- Create new user ---
    const newUser = await User.create({
      name,
      lastName,
      email,
      password: hashedPassword,
      verificationToken,
      role: role || "user",
      address,
      phone,
      verified: false,
    });

    // --- Try sending verification email ---
    const emailResponse = await sendEmail({
      name: newUser.name,
      email: newUser.email,
      verificationToken: newUser.verificationToken,
      type: "verify"
    });

    if (!emailResponse.success) {
      console.error("⚠️ Verification email failed:", emailResponse.message);

      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again later.",
        data: null,
      });
    }

    // --- Email sent successfully ---
    return res.status(201).json({
      success: true,
      message:
        "User registered successfully! A verification email has been sent to your address. Please verify to activate your account.",
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        verified: newUser.verified,
      },
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error during signup.",
      error: error.message,
    });
  }
};

// ---------##------Account Verification Function --------##--------
export const verifyAccount = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is missing.",
        data: null,
      });
    }

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired verification link.",
        data: null,
      });
    }

    if (!user.tokenExpiry || user.tokenExpiry < new Date()) {
      return res.status(410).json({
        success: false,
        message: "Verification link has expired. Please request a new one.",
        data: {
          email: user.email
        },
      });
    }

    if (user.verified) {
      return res.status(200).json({
        success: true,
        message: "Your account is already verified.",
        data: {
          email: user.email,
          verified: true,
        },
      });
    }

    user.verified = true;
    user.verificationToken = null;
    user.tokenExpiry = null;

    await user.save();

    const tokenResponse = await generateToken(user._id, res);
    if (!tokenResponse) throw new Error("Token generation failed");

    return res.status(200).json({
      success: true,
      message: "Your account has been successfully verified!",
      data: {
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (error) {
    console.error("Account Verification Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error during account verification.",
      error: error.message,
    });
  }
};

// ---------##------Resend Verification Mail Function --------##--------
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
        data: null,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    if (user.verified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
        data: null,
      });
    }

    const newVerificationToken = generateRandomString(20);

    user.verificationToken = newVerificationToken;
    await user.save();

    const emailResponse = await sendEmail({
      name: user.name,
      email: user.email,
      verificationToken: newVerificationToken,
    });

    if (!emailResponse.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Verification email has been resent",
      data: {
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Resend verification email error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while resending verification email",
      error: error.message,
    });
  }
};

// ---------##------Forget Password Mail Send Function --------##--------
export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
        data: null,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
        data: null,
      });
    }

    // Generate reset token
    const resetToken = generateRandomString(30);
    const tokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    user.forgetToken = resetToken;
    user.forgetExpiry = tokenExpiry;
    await user.save();

    console.log("Rste", resetToken)
    // Send email with reset link
    const emailResponse = await sendEmail({
      name: user.name,
      email: user.email,
      verificationToken: resetToken,
      type: "reset"
    });

    if (!emailResponse.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email. Try again later.",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset email sent successfully.",
      data: {
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Forget password error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while sending reset email.",
      error: error.message,
    });
  }
};

// ---------##------Reset Password & Mail Verification Function --------##--------
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
        data: null,
      });
    }

    const user = await User.findOne({ forgetToken: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
        data: null,
      });
    }

    if (!user.forgetExpiry || user.forgetExpiry < new Date()) {
      return res.status(410).json({
        success: false,
        message: "Reset link expired. Please request a new one.",
        data: {
          email: user.email,
        },
      });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.forgetToken = null;
    user.forgetExpiry = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully.",
      data: {
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Reset password error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error during password reset.",
      error: error.message,
    });
  }
};

// ---------##------Logout Function --------##--------
export const logout = async (req, res) => {
  try {
    const isProd = process.env.NODE_ENV === "production";
    const domain = isProd ? ".gymfreak.store" : undefined;
    res.clearCookie("authUser", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      domain,
    });

    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
      data: null,
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during logout",
      data: null,
    });
  }
};
