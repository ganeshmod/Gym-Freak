"use client";
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

const toastTypes = {
    success: {
        icon: CheckCircle,
        className: "bg-green-50 border-green-200 text-green-800",
        iconClassName: "text-green-500",
    },
    error: {
        icon: XCircle,
        className: "bg-red-50 border-red-200 text-red-800",
        iconClassName: "text-red-500",
    },
    warning: {
        icon: AlertCircle,
        className: "bg-yellow-50 border-yellow-200 text-yellow-800",
        iconClassName: "text-yellow-500",
    },
    info: {
        icon: Info,
        className: "bg-blue-50 border-blue-200 text-blue-800",
        iconClassName: "text-blue-500",
    },
};

const Toast = ({
    id,
    type = "info",
    message,
    duration = 4000,
    onClose,
    position = "top-right"
}) => {
    const toastRef = useRef(null);
    const progressRef = useRef(null);
    const [isVisible, setIsVisible] = useState(true);
    const toastConfig = toastTypes[type];
    const Icon = toastConfig.icon;

    useEffect(() => {
        const ctx = gsap.context(() => {

            gsap.fromTo(
                toastRef.current,
                {
                    x: position.includes("right") ? 300 : -300,
                    y: position.includes("top") ? -50 : 50,
                    scale: 0.8,
                    opacity: 0,
                    rotation: position.includes("right") ? 5 : -5,
                },
                {
                    x: 0,
                    y: 0,
                    scale: 1,
                    opacity: 1,
                    rotation: 0,
                    duration: 0.6,
                    ease: "back.out(1.7)",
                    onComplete: () => {
                        if (progressRef.current) {
                            gsap.fromTo(
                                progressRef.current,
                                { scaleX: 1 },
                                {
                                    scaleX: 0,
                                    duration: duration / 1000,
                                    ease: "none",
                                }
                            );
                        }
                    },
                }
            );


            const timer = setTimeout(() => {
                handleClose();
            }, duration);

            return () => clearTimeout(timer);
        }, toastRef);

        return () => ctx.revert();
    }, [duration, position]);

    const handleClose = () => {
        setIsVisible(false);

        gsap.to(toastRef.current, {
            x: position.includes("right") ? 300 : -300,
            y: position.includes("top") ? -50 : 50,
            scale: 0.8,
            opacity: 0,
            rotation: position.includes("right") ? 5 : -5,
            duration: 0.4,
            ease: "back.in(1.7)",
            onComplete: () => {
                onClose(id);
            },
        });
    };

    const handleMouseEnter = () => {
        gsap.to(toastRef.current, {
            scale: 1.02,
            duration: 0.2,
            ease: "power2.out",
        });


        if (progressRef.current) {
            gsap.to(progressRef.current, { scaleX: "pause" });
        }
    };

    const handleMouseLeave = () => {
        gsap.to(toastRef.current, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out",
        });


        if (progressRef.current) {
            gsap.to(progressRef.current, { scaleX: "resume" });
        }
    };

    if (!isVisible) return null;

    return (
        <div
            ref={toastRef}
            className={cn(
                "relative overflow-hidden rounded-xl border-2 shadow-lg backdrop-blur-sm",
                "transform-gpu will-change-transform",
                toastConfig.className
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >

            <div className="absolute top-0 left-0 h-1 w-full bg-current opacity-20">
                <div
                    ref={progressRef}
                    className="h-full w-full origin-left bg-current opacity-60"
                    style={{ transform: "scaleX(1)" }}
                />
            </div>


            <div className="flex items-start gap-3 p-4 pr-8">
                <Icon className={cn("h-5 w-5 flex-shrink-0", toastConfig.iconClassName)} />
                <div className="flex-1">
                    <p className="text-sm font-medium leading-relaxed">{message}</p>
                </div>
                <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 rounded-full p-1 transition-colors hover:bg-black/10"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};


const ToastContainer = ({ position = "top-right" }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {

            gsap.fromTo(
                containerRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.3, ease: "power2.out" }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const positionClasses = {
        "top-right": "top-4 right-4",
        "top-left": "top-4 left-4",
        "top-center": "top-4 left-1/2 transform -translate-x-1/2",
        "bottom-right": "bottom-4 right-4",
        "bottom-left": "bottom-4 left-4",
        "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2",
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                "fixed z-50 flex flex-col gap-3 max-w-sm",
                positionClasses[position]
            )}
            style={{ pointerEvents: "none" }}
        >
            <div style={{ pointerEvents: "auto" }} />
        </div>
    );
};

export { Toast, ToastContainer };