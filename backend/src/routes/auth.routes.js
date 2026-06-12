import express from "express";
import { login, signup, verifyAccount, resendVerificationEmail, forgetPassword, resetPassword, logout } from "../controller/auth.controller.js";


const router = express.Router()


router.post("/login", login)
router.post("/signup", signup)
router.get("/verifyAccount/:token", verifyAccount)
router.post("/resend-verification", resendVerificationEmail);
router.post("/forget-password", forgetPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/logout", logout);

export default router;