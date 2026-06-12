"use client"
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { genericPostApi } from "../api-helper-admin";
import { ToastContainer, toast } from "react-toastify";


export default function Login({ setPageToggle }) {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })

    async function handleSubmit(e) {
        e.preventDefault(); // prevent default refresh
        console.log("Submitting login");

        try {
            const response = await genericPostApi("/api/auth/login", {
                email: formData.email,
                password: formData.password,
            });
            if (response?.success) {
                const showSuccess = () => toast.success('User Logged in Successfully')
                showSuccess()
            }
            console.log("Login response:", response);
        } catch (error) {
            console.error("Login error:", error);
        }
    }

    return (
        <div className="w-full h-screen flex items-center justify-center bg-gray-50 px-4">
            <ToastContainer />
            <div className="w-full max-w-md bg-white p-6 py-10 rounded-lg shadow-md">
                <h4 className="text-2xl font-semibold text-center" style={{ fontFamily: '"Geist Fallback"' }}>
                    Login to Your Account
                </h4>
                <p className="text-center text-zinc-500 mt-1 text-sm">
                    Enter your email and password to continue
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center my-4 w-full">
                    <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            email: e.target.value
                        }))}
                        placeholder="Enter Your Email"
                        className="w-full my-2"
                        required
                    />
                    <Input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            password: e.target.value
                        }))}
                        placeholder="Enter Your Password"
                        className="w-full my-2"
                        required
                    />
                    <Button type="submit" className="w-full my-2">
                        Login
                    </Button>
                </form>

                <p className="text-center text-sm text-zinc-500 mt-4">
                    Don’t have an account?{" "}
                    <span className="text-blue-600 hover:underline" onClick={() => setPageToggle(1)}>Sign Up</span>
                </p>
            </div>
        </div>
    );
}
