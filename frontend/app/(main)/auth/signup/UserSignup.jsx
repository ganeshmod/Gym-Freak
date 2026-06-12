"use client"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { genericPostApi } from "../../../../app/admin/api-helper-admin";
import { toast } from "react-toastify"
import { Eye, EyeOff, Mail, Shield } from "lucide-react"
import "react-toastify/dist/ReactToastify.css"
import Link from "next/link"

// Step 1: Account Information Schema
const accountInfoSchema = z
    .object({
        firstName: z.string().min(2, "First name must be at least 2 characters"),
        lastName: z.string().min(2, "Last name must be at least 2 characters"),
        email: z.string().email("Please enter a valid email address"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                "Password must contain at least one uppercase letter, one lowercase letter, and one number"
            ),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    })

// Step 2: Email Verification Schema
const emailVerificationSchema = z.object({
    emailVerified: z.boolean().refine((val) => val === true, {
        message: "You must verify your email address",
    }),
})

// Combined Schema
// const signupSchema = accountInfoSchema.merge(emailVerificationSchema)

const signupSchema = z
  .object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
    emailVerified: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.emailVerified === true, {
    message: "You must verify your email address",
    path: ["emailVerified"],
  });
export default function UserSignup({ setShowPage }) {
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)
    const [countdown, setCountdown] = useState(0)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const form = useForm({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
            emailVerified: false,
        },
    })

    const handleSubmit = async () => {
        try {
            const values = form.getValues()
            const payload = {
                name: values.firstName,
                lastName: values.lastName,
                email: values.email,
                role: "user",
                password: values.password,
                emailVerified: false,
            }

            const response = await genericPostApi("/api/auth/signup", payload)

            if (response.success) {
                toast.success(
                    "Registration successful! A verification email has been sent to your inbox."
                )
                setCountdown(30)
                const timer = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev <= 1) {
                            clearInterval(timer)
                            return 0
                        }
                        return prev - 1
                    })
                }, 1000)
                return true
            } else {
                toast.error(response.message || "Something went wrong while registering.")
                return false
            }
        } catch (error) {
            toast.error("An error occurred during registration. Please try again.")
            return false
        }
    }

    const resendVerificationEmail = async () => {
        const email = form.getValues("email")
        setIsVerifying(true)
        try {
            const response = await genericPostApi("/api/auth/resend-verification", { email })

            if (response.success) {
                toast.success(`Verification email resent to ${email}. Please check your inbox.`)
                setCountdown(30)
                const timer = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev <= 1) {
                            clearInterval(timer)
                            return 0
                        }
                        return prev - 1
                    })
                }, 1000)
            } else {
                toast.error(response.message || "Failed to resend verification email.")
            }
        } catch (error) {
            console.error("Error resending verification email:", error)
            toast.error("Failed to resend verification email. Please try again.")
        } finally {
            setIsVerifying(false)
        }
    }

    const nextStep = async () => {
        let isValid = false
        if (step === 1) {

            isValid = await form.trigger([
                "firstName",
                "lastName",
                "email",
                "password",
                "confirmPassword",
            ])
            if (isValid) {
                try {
                    setIsLoading(true)
                    const signupSuccess = await handleSubmit()
                    if (signupSuccess) setStep(2)
                } catch (err) {
                    console.error(err)
                } finally {
                    setIsLoading(false)
                }
            }
            const values = form.getValues()

            // Manual password confirmation check
            if (values.password !== values.confirmPassword) {
                form.setError('confirmPassword', {
                    message: 'Passwords don\'t match'
                })
                return
            }
        } else if (step === 2) {
            isValid = await form.trigger(["emailVerified"])
            if (isValid) await completeSignup()
            else toast.error("Please verify your email before completing registration.")
        }
    }

    const completeSignup = async () => {
        setIsLoading(true)
        try {
            const values = form.getValues()
            const finalPayload = {
                name: values.firstName,
                lastName: values.lastName,
                email: values.email,
                role: "user",
                password: values.password,
                emailVerified: true,
            }
            const response = await genericPostApi("/api/auth/complete-signup", finalPayload)
            if (response.success) toast.success("Account created successfully! Welcome!")
            else toast.error(response.message || "Failed to complete registration.")
        } catch (error) {
            console.error("Signup error:", error)
            toast.error("An error occurred during registration. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const prevStep = () => setStep(step - 1)
    const progress = (step / 2) * 100

    const stepConfig = [
        { icon: Shield, label: "Account Information", description: "Create your account credentials" },
        { icon: Mail, label: "Email Verification", description: "Verify your email address" },
    ]

    return (
        <Card className="w-full bg-white px-2 my-5 sm:px-4 py-4 border-0 shadow-lg sm:mx-auto sm:rounded-2xl sm:max-w-md md:max-w-lg lg:max-w-2xl">
            <CardHeader className="space-y-4 bg-white rounded-t-lg p-4 sm:p-6">
                <div className="text-center">
                    <CardTitle className="text-xl sm:text-2xl font-bold text-black mb-1">
                        Create Your Account
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-xs sm:text-sm">
                        {stepConfig[step - 1].description}
                    </CardDescription>
                </div>

                <div className="space-y-2">
                    <Progress value={progress} className="h-1 bg-gray-300" />
                </div>

                {/* Steps: horizontally scrollable on small screens */}
                <div className="flex justify-between items-start gap-3 px-1  scrollbar-hide">
                    {stepConfig.map((config, index) => {
                        const stepNumber = index + 1
                        const Icon = config.icon
                        const isActive = stepNumber === step
                        const isCompleted = stepNumber < step

                        return (
                            <div
                                key={stepNumber}
                                className={`flex flex-col items-center flex-1 min-w-[80px] sm:min-w-0 transition-all duration-300 ${isActive
                                        ? "text-black scale-105"
                                        : isCompleted
                                            ? "text-green-500"
                                            : "text-gray-400"
                                    }`}
                            >
                                <div
                                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${isActive
                                            ? "bg-gray-200 shadow-md border border-black"
                                            : isCompleted
                                                ? "bg-green-100 border border-green-400"
                                                : "bg-gray-100 border border-gray-300"
                                        }`}
                                >
                                    {isCompleted ? (
                                        <div className="text-green-500 text-lg font-bold">✓</div>
                                    ) : (
                                        <Icon
                                            className={`w-5 h-5 ${isActive ? "text-black" : "text-gray-400"
                                                }`}
                                        />
                                    )}
                                </div>
                                <div className="text-center">
                                    <div
                                        className={`text-xs sm:text-sm font-semibold ${isActive ? "text-black" : ""
                                            }`}
                                    >
                                        {config.label}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardHeader>

            <CardContent className="bg-white rounded-b-lg p-4 sm:p-6">
                <Form {...form}>
                    <form className="space-y-4">
                        {/* STEP 1 */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <FormField
                                        control={form.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-black text-sm">
                                                    First Name
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="John"
                                                        className="bg-zinc-50 text-black"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-500 text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="lastName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-black text-sm">
                                                    Last Name
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Doe"
                                                        className="bg-zinc-50 text-black"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-500 text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-black text-sm">Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    className="bg-zinc-50 text-black"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs" />
                                        </FormItem>
                                    )}
                                />

                                <Separator className="bg-gray-300 my-4" />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-black text-sm">Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        {...field}
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Create a strong password"
                                                        className="bg-zinc-50 text-black pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-700"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye  className="w-5 h-5"/>}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-black text-sm">
                                                Confirm Password
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        {...field}
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        placeholder="Re-enter password"
                                                        className="bg-zinc-50 text-black pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-700"
                                                        onClick={() =>
                                                            setShowConfirmPassword(!showConfirmPassword)
                                                        }
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <div className="space-y-5 text-center">
                                <div className="bg-gray-100 border border-gray-300 rounded-xl p-4 sm:p-6">
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-300">
                                        <Mail className="w-7 h-7 sm:w-8 sm:h-8 text-black" />
                                    </div>
                                    <h3 className="text-black text-base sm:text-lg font-semibold mb-2">
                                        Verify Your Email
                                    </h3>
                                    <p className="text-gray-600 text-xs sm:text-sm mb-4">
                                        We've sent a verification link to
                                    </p>
                                    <div className="text-black bg-gray-200 px-4 py-2 rounded-lg inline-block mb-4 sm:mb-5 break-all">
                                        {form.getValues("email")}
                                    </div>
                                    <p className="text-gray-600 text-xs sm:text-sm">
                                        Click the link in your email to verify your account.
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resendVerificationEmail}
                                    disabled={isVerifying || countdown > 0}
                                    className="border-gray-400 bg-white text-black hover:bg-gray-100 w-full sm:w-auto"
                                >
                                    {isVerifying ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black border-r-transparent" />
                                            Sending...
                                        </>
                                    ) : countdown > 0 ? (
                                        `Resend in ${countdown}s`
                                    ) : (
                                        "Resend Verification Email"
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                                disabled={step === 1}
                                className="border-gray-400 text-black bg-white hover:bg-gray-100 w-full sm:w-auto"
                            >
                                Back
                            </Button>

                            {step < 2 ? (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={isLoading}
                                    className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Continue"
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="bg-gray-900 text-white w-full sm:w-auto"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                                            Creating Account...
                                        </>
                                    ) : (
                                        "Complete Registration"
                                    )}
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>

                <div className="mt-4 text-center text-gray-600 text-sm sm:text-base">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="text-black hover:underline font-medium">
                        Sign in
                    </Link>
                </div>
            </CardContent>
        </Card>

    )
}
