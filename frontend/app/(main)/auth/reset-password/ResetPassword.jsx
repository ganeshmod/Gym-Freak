"use client"
import React, { useState } from 'react';
import { Eye, EyeOff, Lock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { genericPostApi } from '@/app/admin/api-helper-admin';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/app/components/customToastProvider';

const PasswordStrengthIndicator = ({ password }) => {
    const getStrength = () => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        return strength;
    };

    const strength = getStrength();
    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

    if (!password) return null;

    return (
        <div className="space-y-2 mt-2">
            <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${i < strength ? strengthColors[strength - 1] : 'bg-gray-200'
                            }`}
                    />
                ))}
            </div>
            <p className="text-xs text-gray-600">
                Strength: <span className="font-medium">{strengthLabels[strength - 1] || 'Very Weak'}</span>
            </p>
        </div>
    );
};


export default function ResetPassword() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const { success, error } = useToast()

    const validatePassword = (pwd) => {
        const errors = [];
        if (pwd.length < 8) errors.push('min');
        if (!/[a-z]/.test(pwd)) errors.push('lowercase');
        if (!/[A-Z]/.test(pwd)) errors.push('uppercase');
        if (!/[0-9]/.test(pwd)) errors.push('number');
        if (!/[^a-zA-Z0-9]/.test(pwd)) errors.push('special');
        return errors;
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);

        if (value) {
            const validationErrors = validatePassword(value);
            if (validationErrors.length > 0) {
                setErrors(prev => ({ ...prev, password: 'Password does not meet all requirements' }));
            } else {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.password;
                    return newErrors;
                });
            }
        } else {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.password;
                return newErrors;
            });
        }
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);

        if (value && value !== password) {
            setErrors(prev => ({ ...prev, confirmPassword: "Passwords don't match" }));
        } else {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.confirmPassword;
                return newErrors;
            });
        }
    };

    const handleSubmit = async () => {
        // Validate before submit
        const passwordErrors = validatePassword(password);
        const newErrors = {};

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (passwordErrors.length > 0) {
            newErrors.password = 'Password does not meet all requirements';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords don't match";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        // if (!token) {
        //     error("Invalid or Missing Token")
        //     setIsSubmitting(false);
        //     return
        // }

        const response = await genericPostApi(`/api/auth/reset-password/${token}`, { newPassword: confirmPassword });
        if (response.success) {
            router.push("/auth/reset-password")
            setSubmitSuccess(true);
        } else {
            error(response.message)
        }
        setIsSubmitting(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isSubmitting) {
            handleSubmit();
        }
    };

    if (submitSuccess) {
        return (
            <div className="min-h-screen app-bg flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl">Password Reset Successful!</CardTitle>
                        <CardDescription>
                            Your password has been successfully reset. You can now log in with your new password.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button className="w-full" onClick={() => router.push("/auth/login")}>
                            Go to Login
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen app-bg  flex items-center justify-center p-4">
            <Card className="w-full sm:max-w-md md:max-w-lg lg:max-w-2xl px-3">
                <CardHeader className="space-y-1 my-10">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                            <Lock className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center">Reset Your Password</CardTitle>
                    <CardDescription className="text-center">
                        Enter a new password for your account
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Password Field */}
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your new password"
                                className={errors.password ? 'border-red-500 bg-zinc-50' : ' bg-zinc-50'}
                                value={password}
                                onChange={handlePasswordChange}
                                onKeyPress={handleKeyPress}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-red-500">{errors.password}</p>
                        )}

                        <PasswordStrengthIndicator password={password} />
                    </div>

                    {/* Password Requirements */}
                    {/* {password && (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <p className="text-sm font-medium text-gray-700 mb-3">Password Requirements:</p>
                            {passwordRequirements.map((req, index) => (
                                <PasswordRequirement key={index} met={req.met} text={req.text} />
                            ))}
                        </div>
                    )} */}

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm your new password"
                                className={errors.confirmPassword ? 'border-red-500 bg-zinc-50' : ' bg-zinc-50'}
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                onKeyPress={handleKeyPress}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                        )}
                        {confirmPassword && password === confirmPassword && !errors.confirmPassword && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Passwords match</span>
                            </div>
                        )}
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-sm text-blue-800">
                            Make sure your password is strong and unique. Never share it with anyone.
                        </AlertDescription>
                    </Alert>
                </CardContent>

                <CardFooter className="flex flex-col gap-3">
                    <Button
                        onClick={handleSubmit}
                        className="w-full bg-black hover:bg-gray-800"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Resetting Password...
                            </span>
                        ) : (
                            'Reset Password'
                        )}
                    </Button>
                    <p className="text-center text-md text-gray-600">
                        Remembered your password?{" "}
                        <Link href="/auth/login" className="text-black hover:underline font-medium">
                            Back to Login
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}