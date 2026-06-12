"use client";
import { useGsapButtonHover } from "@/app/hooks/useGsapButtonHover";
import React, { useRef } from "react";

const AnimatedButton = ({
  children,
  type = "white",
  className = "",
  ...props
}) => {
  const btnRef = useRef(null);
  useGsapButtonHover(btnRef, type);

  return (
    <button ref={btnRef} {...props} className={className}>
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default AnimatedButton;
