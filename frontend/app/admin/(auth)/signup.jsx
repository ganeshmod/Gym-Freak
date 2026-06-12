"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { genericPostApi } from "../api-helper-admin";
import { ToastContainer, toast } from "react-toastify";

export default function Signup({ setPageToggle }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  async function handleSubmit(e) {
    e.preventDefault(); // prevent default refresh
    console.log("Submitting login");

    try {
      const response = await genericPostApi("/api/auth/signup", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      if (response?.success) {
        const showSuccess = () => toast.success("User Signup Successfully");
        showSuccess();
      }
      console.log("Login response:", response);
    } catch (error) {
      console.error("Login error:", error);
    }
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50 px-4">
      <ToastContainer />
      {/* Signup card */}
      <div className="w-full max-w-md bg-white p-6 py-10 rounded-lg shadow-md">
        {/* Heading */}
        <h4
          className="text-2xl font-semibold text-center"
          style={{ fontFamily: '"Geist Fallback"' }}
        >
          Create New Account
        </h4>
        <p className="text-center text-zinc-500 mt-1 text-sm">
          Enter your details below to create your account
        </p>

        {/* Signup form */}
        <form onSubmit={handleSubmit} method="POST">
          <div className="flex flex-col items-center justify-center my-4">
            <Input
              type="text"
              placeholder="Enter Your Name"
              className="w-full my-2"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
            <Input
              type="email"
              placeholder="Enter Your Email"
              className="w-full my-2"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
            />
            <Input
              type="password"
              placeholder="Enter Your Password"
              className="w-full my-2"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
            />
            <Button className="w-full my-2">Sign Up with Email</Button>
          </div>
        </form>

        {/* Already have account */}
        <p className="text-center text-sm text-zinc-500 mt-4">
          Already have an account?{" "}
          <span
            onClick={() => setPageToggle(0)}
            className="text-blue-600 hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
