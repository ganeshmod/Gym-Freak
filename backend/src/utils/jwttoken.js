import jwt from "jsonwebtoken";

export const generateToken = async (userId, res) => {
  if (!userId) return null;
  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const isProd = process.env.NODE_ENV === "production";
    const domain = isProd ? ".gymfreak.store" : undefined;

    // --## Setting Cookie ##--
    res.cookie("authUser", token, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      path: "/",
      domain
    });

    console.log("Token Generated Successfully");
    return token;
  } catch (error) {
    console.log("Getting Error in token generation ", error);
    return null;
  }
};
