"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { genericPostApi, genericGetApi } from "@/app/admin/api-helper-admin"
import { Check, XCircle, Loader2, Mail } from "lucide-react" 
export default function EmailVerificationPopup() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [email, setEmail] = useState(searchParams.get("email") || "")
    const [isOpen, setIsOpen] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [status, setStatus] = useState("verifying")
    const [message, setMessage] = useState("")
    const [resend, setResend] = useState(false)

    useEffect(() => {
        if (token) handleTokenVerification(token)
    }, [token])

    const handleTokenVerification = async (verificationToken) => {
        setIsLoading(true)
        setStatus("verifying")
        setMessage("Verifying your email...")

        try {
            const response = await genericGetApi(`/api/auth/verifyAccount/${verificationToken}`)
            if (response?.success) {
                setStatus("success")
                setMessage("Email verified successfully!")
                setTimeout(() => {
                    setIsOpen(false)
                    window.location.href = "/"
                }, 3000)
            } else {
                setStatus("error")
                setMessage(response?.message || "Verification failed. The link may be expired or invalid.")

                // If API returns email on failure, set it
                if (response?.data?.email) setEmail(response?.data.email)
            }
        } catch (error) {
            console.log("Error", error)
            setStatus("error")
            setMessage("Network error. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendVerification = async () => {
        if (!email) return
        setIsLoading(true)
        setResend(true)
        setStatus("verifying")
        setMessage("Sending new verification email...")

        try {
            const response = await genericPostApi("/api/auth/resend-verification", { email })

            if (response?.success) {
                setStatus("success")
                setMessage("New verification email sent! Check your inbox.")

            } else {
                setStatus("error")
                setMessage(response?.message || "Failed to resend verification email.")

                if (response?.data?.email) setEmail(response?.data.email)
            }
        } catch (error) {
            setStatus("error")
            setMessage("Network error. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <Dialog open={isOpen} onOpenChange={() => { }} modal>
            <DialogContent className="sm:max-w-xl [&>button]:hidden">
                <DialogHeader className="relative">
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <Mail className="h-5 w-5" /> Email Verification
                    </DialogTitle>
                    <DialogDescription>
                        {email ? `Verifying ${email}` : "Processing your verification"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 text-center py-4">
                    {status === "verifying" && (
                        <div className="flex flex-col items-center space-y-3">
                            <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                            <p className="text-sm text-muted-foreground">{message}</p>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="flex flex-col items-center space-y-3">
                            <Check className="h-12 w-12 text-green-500" />
                            <p className="text-sm text-green-600 font-medium">{message}</p>
                            {!resend && <p className="text-xs text-muted-foreground">Redirecting to home...</p>}
                        </div>
                    )}

                    {status === "error" && (
                        <div className="flex flex-col items-center space-y-4">
                            <XCircle className="h-12 w-12 text-red-500" />
                            <p className="text-sm text-red-600 font-medium">{message}</p>

                            {email && (
                                <div className="space-y-3 w-full">
                                    <Button
                                        onClick={handleResendVerification}
                                        disabled={isLoading}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                        Resend Verification Email
                                    </Button>
                                </div>
                            )}
                            <Alert className="bg-blue-50 border-blue-200">
                                <AlertDescription className="text-blue-800 text-sm">
                                    Check your spam folder or request a new verification email if the link has expired.
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
