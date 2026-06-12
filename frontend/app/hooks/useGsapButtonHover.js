"use client";
import { useEffect } from "react";
import { gsap } from "gsap";

export const useGsapButtonHover = (ref, type = "white") => {
  useEffect(() => {
    if (!ref?.current) return;

    const btn = ref.current;
    const tl = gsap.timeline({ paused: true });

    const overlay = document.createElement("span");
    overlay.className = "gsap-btn-overlay";
    btn.appendChild(overlay);

    const appBg = getComputedStyle(document.documentElement)
      .getPropertyValue("--app-background")
      .trim();

    const getColor = (isOverlay = false) => {
      if (type === "white") return isOverlay ? "black" : appBg;
      return isOverlay ? appBg : "black";
    };

    Object.assign(overlay.style, {
      position: "absolute",
      left: "0",
      top: "0",
      width: "0%",
      height: "100%",
      transition: "none",
      zIndex: "0",
      backgroundColor: getColor(true),
      borderRadius: "inherit",
    });

    Object.assign(btn.style, {
      position: "relative",
      overflow: "hidden",
      zIndex: "1",
      border: "0.5px solid black",
      color: type === "white" ? "black" : appBg,
      backgroundColor: getColor(false),
      transition: "color 0.3s ease, border-color 0.3s ease",
    });

    tl.to(overlay, {
      width: "100%",
      duration: 0.5,
      ease: "power2.out",
    });

    const handleEnter = () => {
      tl.play();
      btn.style.color = type === "white" ? appBg : "black";
      btn.style.borderColor = type === "white" ? appBg : "black";
    };

    const handleLeave = () => {
      tl.reverse();
      btn.style.color = type === "white" ? "black" : appBg;
      btn.style.borderColor = type === "white" ? "black" : appBg;
    };

    btn.addEventListener("mouseenter", handleEnter);
    btn.addEventListener("mouseleave", handleLeave);

    return () => {
      btn.removeEventListener("mouseenter", handleEnter);
      btn.removeEventListener("mouseleave", handleLeave);
      overlay.remove();
    };
  }, [ref, type]);
};
