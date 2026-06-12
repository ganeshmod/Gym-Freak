"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, ArrowRight, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { genericPostApi } from "../../../../app/admin/api-helper-admin";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { useToast } from "@/app/components/customToastProvider";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/globalStore";
import { clearGuestCart, getGuestCart } from "@/lib/guestCart";

// Validation Schemas
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function UserLogin() {
  const setUserDetails = useGlobalStore((state) => state.setUserDetails);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const { success, error, warning } = useToast();

  const form = useForm({
    resolver: zodResolver(
      isForgotPassword ? forgotPasswordSchema : loginSchema
    ),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Clear errors and reset password when switching modes
  useEffect(() => {
    form.clearErrors();
    if (isForgotPassword) {
      form.setValue("password", "");
    }
  }, [isForgotPassword, form]);

  const handleLogin = async (values) => {
    try {
      setIsLoading(true);
      const response = await genericPostApi("/api/auth/login", values);

      if (response.success) {
        success("Login successful!");
        if (response.data) {
          const guestCart = getGuestCart();

          if (guestCart?.length > 0 && response.data._id) {
            try {
              const setCartCount = useGlobalStore.getState().setCartCount;
              const mergeResponse = await genericPostApi("/api/cart/merge", {
                userId: response.data._id,
                guestCartItems: guestCart,
              });

              if (mergeResponse?.success) {
                clearGuestCart();
                const mergedItems = mergeResponse?.data?.items || [];
                const count = mergedItems.reduce(
                  (total, item) => total + (item.quantity || 0),
                  0
                );
                setCartCount(count);
              }
            } catch (mergeError) {
              console.error("Error merging cart:", mergeError);
            }
          }
        }
        setShowVerification(false);
        setTimeout(() => (window.location.href = "/"), 300);
      } else {
        if (response?.data?.verified == false) {
          setShowVerification(true);
          warning("Please verify your email address to continue.");
        } else {
          error(response.message || "Invalid credentials.");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    const email = form.getValues("email");
    if (!email) {
      error("Please enter your email address.");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await genericPostApi("/api/auth/resend-verification", {
        email,
      });
      if (response.success) {
        success(
          `Verification email resent to ${email}. Please check your inbox.`
        );
        setCountdown(30);
      } else {
        error(response.message || "Failed to resend verification email.");
      }
    } catch (error) {
      console.error("Error resending verification email:", error);
      error("Failed to resend verification email. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleForgetPassword = async (values) => {
    const email = values.email || form.getValues("email");
    if (!email) {
      error("Please enter your email address.");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await genericPostApi("/api/auth/forget-password", {
        email,
      });
      if (response.success) {
        success(
          `Password reset link sent to ${email}. Please check your inbox.`
        );
        setCountdown(30);
      } else {
        error(response.message || "Failed to send reset link.");
      }
    } catch (error) {
      console.error("Error sending reset email:", error);
      error("Failed to send reset link. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <div className="w-full min-h-max px-4 py-4 sm:py-10 flex items-center sm:items-center justify-center font-nunito">
      <Card className="w-full border-0 shadow-lg max-w-md sm:max-w-lg md:max-w-2xl">
        <CardHeader className="space-y-3 pt-6 px-6 sm:px-8 bg-gradient-to-br from-white to-slate-50">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 mb-2 shadow-lg">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-slate-900 tracking-tight">
              {isForgotPassword ? "Reset Password" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-slate-600 text-base">
              {isForgotPassword
                ? "Enter your email to receive a password reset link"
                : "Sign in to continue to your account"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="rounded-b-lg bg-white p-4 sm:p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(
                isForgotPassword ? handleForgetPassword : handleLogin
              )}
              className="space-y-5 sm:space-y-6 px-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black text-sm flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Email Address *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                        className="bg-zinc-50 text-black placeholder-gray-500 focus-visible:ring-black"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />

              {!isForgotPassword && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between mb-2">
                        <FormLabel className="text-black text-sm flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Password *
                        </FormLabel>
                        <button
                          type="button"
                          onClick={() => setIsForgotPassword(true)}
                          className="text-sm text-slate-600 hover:text-black hover:underline transition-colors"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            className="bg-zinc-50 text-black placeholder-gray-500 pr-10 focus-visible:ring-black"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-black"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />
              )}

              {showVerification && !isForgotPassword && (
                <Alert className="mb-2 bg-red-600/10 border-red-600/30">
                  <Mail className="h-4 w-4 text-red-600" />
                  <AlertDescription className="ml-2">
                    <div className="flex flex-col gap-2">
                      <p className="font-medium text-red-700">
                        Email Verification Required
                      </p>
                      <p className="text-sm text-gray-700">
                        Your account is not verified. Please check your email
                        for the verification link.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={resendVerificationEmail}
                        disabled={isVerifying || countdown > 0}
                        className="bg-white border-red-500 text-red-700 hover:bg-red-50 w-full sm:w-fit"
                      >
                        {isVerifying ? (
                          <>
                            <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-red-700 border-r-transparent" />
                            Sending...
                          </>
                        ) : countdown > 0 ? (
                          `Resend in ${countdown}s`
                        ) : (
                          "Resend Verification Email"
                        )}
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    isVerifying ||
                    (isForgotPassword && countdown > 0)
                  }
                  className="bg-black hover:bg-gray-900 text-white w-full sm:w-auto"
                >
                  {isLoading || isVerifying ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                      {isForgotPassword ? "Sending..." : "Signing In..."}
                    </>
                  ) : isForgotPassword ? (
                    countdown > 0 ? (
                      `Resend in ${countdown}s`
                    ) : (
                      "Send Reset Link"
                    )
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>

              {isForgotPassword && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setCountdown(0);
                      form.clearErrors();
                    }}
                    className="text-sm text-slate-600 hover:text-black hover:underline transition-colors"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              )}
            </form>
          </Form>

          {!isForgotPassword && (
            <div className="mt-6">
              <Separator className="my-4 bg-gray-200" />
              <div className="text-center text-md text-gray-700">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="text-black hover:underline font-bold"
                >
                  Sign up
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
