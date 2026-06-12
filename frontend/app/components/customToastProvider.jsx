"use client";
import React, { createContext, useContext } from "react";
import { useCustomToast } from "./useCustomToast";



const ToastContext = createContext();

export const ModernToastProvider = ({ children }) => {
    const toast = useCustomToast();

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <toast.ToastRenderer />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ModernToastProvider");
    }
    return context;
};