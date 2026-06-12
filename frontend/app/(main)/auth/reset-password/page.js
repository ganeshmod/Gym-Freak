import React, { Suspense } from "react";
import ResetPassword from "./ResetPassword";

export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPassword />
    </Suspense>
  );
}
