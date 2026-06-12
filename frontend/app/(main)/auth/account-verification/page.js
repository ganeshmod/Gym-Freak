import React, { Suspense } from "react";
import EmailVerificationPopup from "./EmailVerificationPopup";

export default function page() {
  return (
    <Suspense fallback={<div>Loading verification...</div>}>
      <div className="h-screen"></div>
      <EmailVerificationPopup />
    </Suspense>
  );
}
