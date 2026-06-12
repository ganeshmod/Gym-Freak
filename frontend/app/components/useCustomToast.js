"use client";
import { useState, useCallback, useRef } from "react";
import { Toast } from "./customToast";

let toastId = 0;

export const useCustomToast = () => {
    const [toasts, setToasts] = useState([]);
    const containerRef = useRef(null);

    const addToast = useCallback(({ type, message, duration = 4000, position = "top-right" }) => {
        const id = ++toastId;
        const newToast = {
            id,
            type,
            message,
            duration,
            position,
        };

        setToasts(prev => [...prev, newToast]);

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const success = useCallback((message, options = {}) => {
        return addToast({ type: "success", message, ...options });
    }, [addToast]);

    const error = useCallback((message, options = {}) => {
        return addToast({ type: "error", message, ...options });
    }, [addToast]);

    const warning = useCallback((message, options = {}) => {
        return addToast({ type: "warning", message, ...options });
    }, [addToast]);

    const info = useCallback((message, options = {}) => {
        return addToast({ type: "info", message, ...options });
    }, [addToast]);

    const ToastRenderer = () => (
        <div className="fixed z-50 top-24 right-2 flex flex-col gap-3 max-w-sm">
            {toasts?.map(toast => (
                <Toast
                    key={toast.id}
                    {...toast}
                    onClose={removeToast}
                />
            ))}
        </div>
    );

    return {
        success,
        error,
        warning,
        info,
        ToastRenderer,
    };
};